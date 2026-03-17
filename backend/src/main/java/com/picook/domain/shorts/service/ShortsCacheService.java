package com.picook.domain.shorts.service;

import com.picook.domain.shorts.entity.ShortsCache;
import com.picook.domain.shorts.repository.ShortsCacheRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@Transactional(readOnly = true)
public class ShortsCacheService {

    private final ShortsCacheRepository shortsCacheRepository;

    public ShortsCacheService(ShortsCacheRepository shortsCacheRepository) {
        this.shortsCacheRepository = shortsCacheRepository;
    }

    public Optional<ShortsCache> findByUrlHashAndModelVersion(String urlHash, String aiModelVersion) {
        return shortsCacheRepository.findByUrlHashAndAiModelVersion(urlHash, aiModelVersion);
    }

    public Optional<ShortsCache> findById(Integer id) {
        return shortsCacheRepository.findById(id);
    }

    @Transactional
    public ShortsCache save(ShortsCache cache) {
        return shortsCacheRepository.save(cache);
    }

    @Transactional
    public void delete(ShortsCache cache) {
        shortsCacheRepository.delete(cache);
    }
}
