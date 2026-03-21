package com.picook.domain.monitoring.dto;

public record MonitoringShortsDto(
        double successRate,
        long avgConversionTimeMs,
        double cacheHitRate,
        long totalCacheEntries
) {}
