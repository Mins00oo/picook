package com.picook.domain.outfit.service;

import com.picook.domain.outfit.dto.OutfitResponse;
import com.picook.domain.outfit.dto.PurchaseOutfitRequest;
import com.picook.domain.outfit.entity.Outfit;
import com.picook.domain.outfit.entity.UserOwnedOutfit;
import com.picook.domain.outfit.repository.OutfitRepository;
import com.picook.domain.outfit.repository.UserOwnedOutfitRepository;
import com.picook.domain.point.entity.PointReason;
import com.picook.domain.point.service.PointService;
import com.picook.global.exception.BusinessException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class ShopService {

    private final OutfitRepository outfitRepository;
    private final UserOwnedOutfitRepository ownedRepository;
    private final PointService pointService;

    public ShopService(OutfitRepository outfitRepository,
                       UserOwnedOutfitRepository ownedRepository,
                       PointService pointService) {
        this.outfitRepository = outfitRepository;
        this.ownedRepository = ownedRepository;
        this.pointService = pointService;
    }

    /**
     * 포인트로 의상 구매. 트랜잭션 내에서 포인트 차감 + 인벤토리 추가.
     */
    @Transactional
    public PurchaseResult purchase(UUID userId, PurchaseOutfitRequest request) {
        Outfit outfit = outfitRepository.findById(request.outfitId())
                .orElseThrow(() -> new BusinessException("OUTFIT_NOT_FOUND",
                        "의상을 찾을 수 없습니다", HttpStatus.NOT_FOUND));

        if (!Boolean.TRUE.equals(outfit.getIsActive())) {
            throw new BusinessException("OUTFIT_INACTIVE",
                    "판매 중지된 의상입니다", HttpStatus.BAD_REQUEST);
        }
        if (outfit.getPricePoints() == null || outfit.getPricePoints() <= 0) {
            throw new BusinessException("OUTFIT_NOT_FOR_SALE",
                    "상점에서 판매하지 않는 의상입니다", HttpStatus.BAD_REQUEST);
        }
        if (ownedRepository.existsByUserIdAndOutfitId(userId, outfit.getId())) {
            throw new BusinessException("OUTFIT_ALREADY_OWNED",
                    "이미 보유한 의상입니다", HttpStatus.CONFLICT);
        }

        Integer newBalance = pointService.award(userId, -outfit.getPricePoints(),
                PointReason.SHOP_PURCHASE, "OUTFIT", outfit.getId());

        ownedRepository.save(new UserOwnedOutfit(userId, outfit.getId(), "SHOP"));

        return new PurchaseResult(OutfitResponse.ofWithOwnership(outfit, true, false), newBalance);
    }

    public record PurchaseResult(OutfitResponse outfit, Integer pointBalance) {}
}
