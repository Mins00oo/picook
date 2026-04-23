package com.picook.domain.outfit.service;

import com.picook.domain.outfit.dto.EquipOutfitRequest;
import com.picook.domain.outfit.dto.MyOutfitsResponse;
import com.picook.domain.outfit.dto.OutfitResponse;
import com.picook.domain.outfit.entity.Outfit;
import com.picook.domain.outfit.entity.UserEquippedOutfit;
import com.picook.domain.outfit.entity.UserOwnedOutfit;
import com.picook.domain.outfit.repository.OutfitRepository;
import com.picook.domain.outfit.repository.UserEquippedOutfitRepository;
import com.picook.domain.outfit.repository.UserOwnedOutfitRepository;
import com.picook.global.exception.BusinessException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

@Service
@Transactional(readOnly = true)
public class OutfitService {

    private static final Set<String> VALID_SLOTS = Set.of(
            "head", "top", "bottom", "shoes", "leftHand", "rightHand"
    );

    private final OutfitRepository outfitRepository;
    private final UserOwnedOutfitRepository ownedRepository;
    private final UserEquippedOutfitRepository equippedRepository;

    public OutfitService(OutfitRepository outfitRepository,
                         UserOwnedOutfitRepository ownedRepository,
                         UserEquippedOutfitRepository equippedRepository) {
        this.outfitRepository = outfitRepository;
        this.equippedRepository = equippedRepository;
        this.ownedRepository = ownedRepository;
    }

    public List<OutfitResponse> getCatalog(UUID userId) {
        List<Outfit> outfits = outfitRepository.findAllByIsActiveTrueOrderBySortOrderAsc();
        Set<Long> ownedIds = new HashSet<>();
        Set<Long> equippedIds = new HashSet<>();
        for (UserOwnedOutfit owned : ownedRepository.findAllByUserId(userId)) {
            ownedIds.add(owned.getOutfitId());
        }
        for (UserEquippedOutfit eq : equippedRepository.findAllByUserId(userId)) {
            if (eq.getOutfitId() != null) equippedIds.add(eq.getOutfitId());
        }
        return outfits.stream()
                .map(o -> OutfitResponse.ofWithOwnership(
                        o,
                        ownedIds.contains(o.getId()),
                        equippedIds.contains(o.getId())
                ))
                .toList();
    }

    public MyOutfitsResponse getMyOutfits(UUID userId) {
        List<UserOwnedOutfit> owned = ownedRepository.findAllByUserId(userId);
        Map<Long, Outfit> outfitById = new HashMap<>();
        for (UserOwnedOutfit item : owned) {
            outfitRepository.findById(item.getOutfitId()).ifPresent(o -> outfitById.put(o.getId(), o));
        }
        Map<String, Long> equippedMap = new LinkedHashMap<>();
        for (String slot : VALID_SLOTS) equippedMap.put(slot, null);
        for (UserEquippedOutfit eq : equippedRepository.findAllByUserId(userId)) {
            equippedMap.put(eq.getSlot(), eq.getOutfitId());
        }
        Set<Long> equippedIds = new HashSet<>();
        for (Long id : equippedMap.values()) if (id != null) equippedIds.add(id);

        List<OutfitResponse> ownedDtos = outfitById.values().stream()
                .sorted((a, b) -> Integer.compare(a.getSortOrder(), b.getSortOrder()))
                .map(o -> OutfitResponse.ofWithOwnership(o, true, equippedIds.contains(o.getId())))
                .toList();

        return new MyOutfitsResponse(ownedDtos, equippedMap);
    }

    @Transactional
    public MyOutfitsResponse equip(UUID userId, EquipOutfitRequest request) {
        if (!VALID_SLOTS.contains(request.slot())) {
            throw new BusinessException("INVALID_SLOT",
                    "유효하지 않은 슬롯입니다: " + request.slot(), HttpStatus.BAD_REQUEST);
        }
        Long outfitId = request.outfitId();
        if (outfitId != null) {
            Outfit outfit = outfitRepository.findById(outfitId)
                    .orElseThrow(() -> new BusinessException("OUTFIT_NOT_FOUND",
                            "의상을 찾을 수 없습니다", HttpStatus.NOT_FOUND));
            if (!outfit.getSlot().equals(request.slot())) {
                throw new BusinessException("SLOT_MISMATCH",
                        "의상 슬롯과 요청 슬롯이 일치하지 않습니다", HttpStatus.BAD_REQUEST);
            }
            if (!ownedRepository.existsByUserIdAndOutfitId(userId, outfitId)) {
                throw new BusinessException("OUTFIT_NOT_OWNED",
                        "보유하지 않은 의상입니다", HttpStatus.FORBIDDEN);
            }
        }

        equippedRepository.findByUserIdAndSlot(userId, request.slot()).ifPresentOrElse(
                current -> current.setOutfitId(outfitId),
                () -> equippedRepository.save(new UserEquippedOutfit(userId, request.slot(), outfitId))
        );

        return getMyOutfits(userId);
    }
}
