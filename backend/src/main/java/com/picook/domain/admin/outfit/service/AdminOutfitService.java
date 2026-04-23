package com.picook.domain.admin.outfit.service;

import com.picook.domain.outfit.dto.AdminOutfitRequest;
import com.picook.domain.outfit.dto.OutfitResponse;
import com.picook.domain.outfit.entity.Outfit;
import com.picook.domain.outfit.repository.OutfitRepository;
import com.picook.global.exception.BusinessException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;

@Service
@Transactional(readOnly = true)
public class AdminOutfitService {

    private static final Set<String> VALID_SLOTS = Set.of(
            "head", "top", "bottom", "shoes", "leftHand", "rightHand"
    );

    private final OutfitRepository outfitRepository;

    public AdminOutfitService(OutfitRepository outfitRepository) {
        this.outfitRepository = outfitRepository;
    }

    public List<OutfitResponse> list() {
        return outfitRepository.findAll().stream()
                .sorted((a, b) -> Integer.compare(a.getSortOrder(), b.getSortOrder()))
                .map(OutfitResponse::ofCatalog)
                .toList();
    }

    @Transactional
    public OutfitResponse create(AdminOutfitRequest request) {
        validateSlot(request.slot());
        Outfit outfit = new Outfit(request.slot(), request.name(), request.imageUrl(),
                request.pricePoints(), request.unlockLevel(), request.isDefault());
        outfit.setDescription(request.description());
        if (request.isActive() != null) outfit.setIsActive(request.isActive());
        if (request.sortOrder() != null) outfit.setSortOrder(request.sortOrder());
        outfitRepository.save(outfit);
        return OutfitResponse.ofCatalog(outfit);
    }

    @Transactional
    public OutfitResponse update(Long id, AdminOutfitRequest request) {
        validateSlot(request.slot());
        Outfit outfit = outfitRepository.findById(id)
                .orElseThrow(() -> new BusinessException("OUTFIT_NOT_FOUND",
                        "의상을 찾을 수 없습니다", HttpStatus.NOT_FOUND));
        outfit.setSlot(request.slot());
        outfit.setName(request.name());
        outfit.setDescription(request.description());
        outfit.setImageUrl(request.imageUrl());
        outfit.setPricePoints(request.pricePoints());
        outfit.setUnlockLevel(request.unlockLevel());
        if (request.isDefault() != null) outfit.setIsDefault(request.isDefault());
        if (request.isActive() != null) outfit.setIsActive(request.isActive());
        if (request.sortOrder() != null) outfit.setSortOrder(request.sortOrder());
        return OutfitResponse.ofCatalog(outfit);
    }

    @Transactional
    public void delete(Long id) {
        Outfit outfit = outfitRepository.findById(id)
                .orElseThrow(() -> new BusinessException("OUTFIT_NOT_FOUND",
                        "의상을 찾을 수 없습니다", HttpStatus.NOT_FOUND));
        outfitRepository.delete(outfit);
    }

    private void validateSlot(String slot) {
        if (!VALID_SLOTS.contains(slot)) {
            throw new BusinessException("INVALID_SLOT",
                    "유효하지 않은 슬롯입니다: " + slot, HttpStatus.BAD_REQUEST);
        }
    }
}
