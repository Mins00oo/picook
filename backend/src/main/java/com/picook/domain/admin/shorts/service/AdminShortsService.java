package com.picook.domain.admin.shorts.service;

import com.picook.domain.admin.shorts.dto.AdminShortsCacheDetailResponse;
import com.picook.domain.admin.shorts.dto.AdminShortsCacheListResponse;
import com.picook.domain.admin.shorts.dto.AdminShortsStatsResponse;
import com.picook.domain.shorts.entity.ShortsCache;
import com.picook.domain.shorts.repository.ShortsCacheRepository;
import com.picook.domain.shorts.repository.ShortsConversionHistoryRepository;
import com.picook.domain.shorts.service.ShortsConvertService;
import com.picook.global.exception.BusinessException;
import com.picook.global.util.PageResponse;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class AdminShortsService {

    private final ShortsCacheRepository shortsCacheRepository;
    private final ShortsConversionHistoryRepository historyRepository;
    private final ShortsConvertService shortsConvertService;

    public AdminShortsService(ShortsCacheRepository shortsCacheRepository,
                              ShortsConversionHistoryRepository historyRepository,
                              ShortsConvertService shortsConvertService) {
        this.shortsCacheRepository = shortsCacheRepository;
        this.historyRepository = historyRepository;
        this.shortsConvertService = shortsConvertService;
    }

    public PageResponse<AdminShortsCacheListResponse> getCacheList(String keyword, String modelVersion,
                                                                     int page, int size) {
        var pageRequest = PageRequest.of(page, size, Sort.by("createdAt").descending());
        var cachePage = shortsCacheRepository.searchCache(keyword, modelVersion, pageRequest);
        var responsePage = cachePage.map(AdminShortsCacheListResponse::of);
        return PageResponse.from(responsePage);
    }

    public AdminShortsCacheDetailResponse getCacheDetail(Integer id) {
        ShortsCache cache = findOrThrow(id);
        return AdminShortsCacheDetailResponse.of(cache);
    }

    @Transactional
    public void deleteCache(Integer id) {
        ShortsCache cache = findOrThrow(id);
        shortsCacheRepository.delete(cache);
    }

    @Transactional
    public void clearAllCache() {
        shortsCacheRepository.deleteAll();
    }

    @Transactional
    public AdminShortsCacheDetailResponse reconvert(Integer id) {
        ShortsCache existing = findOrThrow(id);
        ShortsCache reconverted = shortsConvertService.reconvertFromCache(existing);
        return AdminShortsCacheDetailResponse.of(reconverted);
    }

    public AdminShortsStatsResponse getStats() {
        long totalCache = shortsCacheRepository.count();
        long totalConversions = historyRepository.count();

        // Model version distribution
        List<ShortsCache> allCaches = shortsCacheRepository.findAll();
        Map<String, Long> modelVersionDistribution = allCaches.stream()
                .collect(Collectors.groupingBy(ShortsCache::getAiModelVersion, Collectors.counting()));

        return new AdminShortsStatsResponse(totalCache, totalConversions, modelVersionDistribution);
    }

    private ShortsCache findOrThrow(Integer id) {
        return shortsCacheRepository.findById(id)
                .orElseThrow(() -> new BusinessException("CACHE_NOT_FOUND", "캐시를 찾을 수 없습니다", HttpStatus.NOT_FOUND));
    }
}
