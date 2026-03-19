package com.picook.global.aop;

import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

@Aspect
@Component
public class PerformanceLoggingAspect {

    private static final Logger log = LoggerFactory.getLogger(PerformanceLoggingAspect.class);

    private static final long SLOW_THRESHOLD_MS = 1000;

    @Around("execution(* com.picook.domain..service..*(..))")
    public Object logPerformance(ProceedingJoinPoint joinPoint) throws Throwable {
        long start = System.nanoTime();
        try {
            return joinPoint.proceed();
        } finally {
            long elapsedMs = (System.nanoTime() - start) / 1_000_000;
            String className = joinPoint.getTarget().getClass().getSimpleName();
            String methodName = joinPoint.getSignature().getName();

            if (elapsedMs >= SLOW_THRESHOLD_MS) {
                log.warn("[PERF] {}.{}() - {}ms [SLOW]", className, methodName, elapsedMs);
            } else {
                log.info("[PERF] {}.{}() - {}ms", className, methodName, elapsedMs);
            }
        }
    }
}
