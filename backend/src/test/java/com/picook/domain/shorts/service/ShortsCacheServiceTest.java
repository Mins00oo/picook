package com.picook.domain.shorts.service;

import com.picook.domain.shorts.entity.ShortsCache;
import com.picook.domain.shorts.repository.ShortsCacheRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ShortsCacheServiceTest {

    @Mock
    private ShortsCacheRepository shortsCacheRepository;

    private ShortsCacheService shortsCacheService;

    @BeforeEach
    void setUp() {
        shortsCacheService = new ShortsCacheService(shortsCacheRepository);
    }

    @Test
    void 캐시_조회_히트() {
        ShortsCache cache = new ShortsCache("url", "hash", "v1", "title", null, "{}");
        when(shortsCacheRepository.findByUrlHashAndAiModelVersion("hash", "v1"))
                .thenReturn(Optional.of(cache));

        Optional<ShortsCache> result = shortsCacheService.findByUrlHashAndModelVersion("hash", "v1");

        assertThat(result).isPresent();
        assertThat(result.get().getTitle()).isEqualTo("title");
    }

    @Test
    void 캐시_조회_미스() {
        when(shortsCacheRepository.findByUrlHashAndAiModelVersion("hash", "v2"))
                .thenReturn(Optional.empty());

        Optional<ShortsCache> result = shortsCacheService.findByUrlHashAndModelVersion("hash", "v2");

        assertThat(result).isEmpty();
    }

    @Test
    void 캐시_저장() {
        ShortsCache cache = new ShortsCache("url", "hash", "v1", "title", null, "{}");
        when(shortsCacheRepository.save(any(ShortsCache.class))).thenReturn(cache);

        ShortsCache saved = shortsCacheService.save(cache);

        assertThat(saved.getTitle()).isEqualTo("title");
        verify(shortsCacheRepository).save(cache);
    }
}
