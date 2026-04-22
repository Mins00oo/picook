package com.picook.domain.point.controller;

import com.picook.domain.point.dto.PointBalanceResponse;
import com.picook.domain.point.dto.PointHistoryItem;
import com.picook.domain.point.repository.PointLedgerRepository;
import com.picook.domain.point.service.PointService;
import com.picook.global.response.ApiResponse;
import com.picook.global.util.PageResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@Tag(name = "포인트", description = "계란 포인트 잔액/내역")
@RestController
@RequestMapping("/api/v1/points")
public class PointController {

    private final PointService pointService;
    private final PointLedgerRepository ledgerRepository;

    public PointController(PointService pointService, PointLedgerRepository ledgerRepository) {
        this.pointService = pointService;
        this.ledgerRepository = ledgerRepository;
    }

    @GetMapping("/balance")
    public ResponseEntity<ApiResponse<PointBalanceResponse>> getBalance() {
        Integer balance = pointService.getBalance(getCurrentUserId());
        return ResponseEntity.ok(ApiResponse.success(new PointBalanceResponse(balance)));
    }

    @GetMapping("/history")
    public ResponseEntity<ApiResponse<PageResponse<PointHistoryItem>>> getHistory(Pageable pageable) {
        Page<PointHistoryItem> page = ledgerRepository
                .findByUserIdOrderByCreatedAtDesc(getCurrentUserId(), pageable)
                .map(PointHistoryItem::of);
        return ResponseEntity.ok(ApiResponse.success(PageResponse.from(page)));
    }

    private UUID getCurrentUserId() {
        String principal = (String) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return UUID.fromString(principal);
    }
}
