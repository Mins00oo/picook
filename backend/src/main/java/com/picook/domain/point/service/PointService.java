package com.picook.domain.point.service;

import com.picook.domain.point.entity.PointLedger;
import com.picook.domain.point.entity.PointReason;
import com.picook.domain.point.repository.PointLedgerRepository;
import com.picook.domain.user.entity.User;
import com.picook.domain.user.repository.UserRepository;
import com.picook.global.exception.BusinessException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class PointService {

    private final UserRepository userRepository;
    private final PointLedgerRepository ledgerRepository;

    public PointService(UserRepository userRepository, PointLedgerRepository ledgerRepository) {
        this.userRepository = userRepository;
        this.ledgerRepository = ledgerRepository;
    }

    /**
     * 포인트 적립/사용을 한 트랜잭션으로 처리.
     * amount 양수: 적립, 음수: 사용.
     * 동일 트랜잭션 내에서 balance 갱신 + ledger 기록.
     *
     * @return 적용 후 잔액
     */
    @Transactional
    public Integer award(UUID userId, int amount, PointReason reason, String refType, Long refId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException("USER_NOT_FOUND", "사용자를 찾을 수 없습니다", HttpStatus.NOT_FOUND));

        int newBalance = (user.getPointBalance() == null ? 0 : user.getPointBalance()) + amount;
        if (newBalance < 0) {
            throw new BusinessException("POINT_INSUFFICIENT", "포인트가 부족합니다", HttpStatus.BAD_REQUEST);
        }
        user.setPointBalance(newBalance);
        userRepository.save(user);

        PointLedger entry = new PointLedger(userId, amount, reason, refType, refId, newBalance);
        ledgerRepository.save(entry);

        return newBalance;
    }

    @Transactional(readOnly = true)
    public Integer getBalance(UUID userId) {
        return userRepository.findById(userId)
                .map(u -> u.getPointBalance() == null ? 0 : u.getPointBalance())
                .orElseThrow(() -> new BusinessException("USER_NOT_FOUND", "사용자를 찾을 수 없습니다", HttpStatus.NOT_FOUND));
    }
}
