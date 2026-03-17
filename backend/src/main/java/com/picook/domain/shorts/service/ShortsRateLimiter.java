package com.picook.domain.shorts.service;

import com.picook.domain.shorts.repository.ShortsConversionLogRepository;
import com.picook.global.exception.BusinessException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.UUID;
import java.util.concurrent.Semaphore;

@Component
public class ShortsRateLimiter {

    private static final int MAX_CONCURRENT = 10;
    private static final int PER_USER_PER_MINUTE = 5;
    private static final int PER_USER_PER_DAY = 50;

    private final Semaphore concurrentSlots = new Semaphore(MAX_CONCURRENT);
    private final ShortsConversionLogRepository logRepository;

    public ShortsRateLimiter(ShortsConversionLogRepository logRepository) {
        this.logRepository = logRepository;
    }

    public void checkUserLimit(UUID userId) {
        Instant oneMinuteAgo = Instant.now().minus(1, ChronoUnit.MINUTES);
        long recentCount = logRepository.countByUserIdAndCreatedAtAfter(userId, oneMinuteAgo);
        if (recentCount >= PER_USER_PER_MINUTE) {
            throw new BusinessException("RATE_LIMIT_EXCEEDED",
                    "요청이 너무 많습니다. 잠시 후 다시 시도해주세요.", HttpStatus.TOO_MANY_REQUESTS);
        }

        Instant oneDayAgo = Instant.now().minus(1, ChronoUnit.DAYS);
        long dailyCount = logRepository.countByUserIdAndCreatedAtAfter(userId, oneDayAgo);
        if (dailyCount >= PER_USER_PER_DAY) {
            throw new BusinessException("RATE_LIMIT_EXCEEDED",
                    "일일 변환 횟수를 초과했습니다.", HttpStatus.TOO_MANY_REQUESTS);
        }
    }

    public void acquireConcurrentSlot() {
        if (!concurrentSlots.tryAcquire()) {
            throw new BusinessException("SERVER_BUSY",
                    "서버가 바쁩니다. 잠시 후 다시 시도해주세요.", HttpStatus.SERVICE_UNAVAILABLE);
        }
    }

    public void releaseConcurrentSlot() {
        concurrentSlots.release();
    }
}
