package com.picook.domain.admin.account.service;

import com.picook.domain.admin.account.dto.AdminAccountCreateRequest;
import com.picook.domain.admin.account.dto.AdminAccountListResponse;
import com.picook.domain.admin.account.dto.AdminAccountUpdateRequest;
import com.picook.domain.admin.auth.entity.AdminRole;
import com.picook.domain.admin.auth.entity.AdminUser;
import com.picook.domain.admin.auth.repository.AdminUserRepository;
import com.picook.global.exception.BusinessException;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(readOnly = true)
public class AdminAccountService {

    private final AdminUserRepository adminUserRepository;
    private final PasswordEncoder passwordEncoder;

    public AdminAccountService(AdminUserRepository adminUserRepository,
                               PasswordEncoder passwordEncoder) {
        this.adminUserRepository = adminUserRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public List<AdminAccountListResponse> getAccounts() {
        return adminUserRepository.findAll().stream()
                .map(AdminAccountListResponse::of)
                .toList();
    }

    @Transactional
    public AdminAccountListResponse createAccount(AdminAccountCreateRequest request) {
        if (adminUserRepository.existsByEmail(request.email())) {
            throw new BusinessException("DUPLICATE_EMAIL", "이미 사용 중인 이메일입니다", HttpStatus.BAD_REQUEST);
        }

        AdminRole role;
        try {
            role = AdminRole.valueOf(request.role().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new BusinessException("INVALID_ROLE", "유효하지 않은 역할입니다: " + request.role(), HttpStatus.BAD_REQUEST);
        }

        AdminUser adminUser = new AdminUser(
                request.email(),
                passwordEncoder.encode(request.password()),
                role
        );
        adminUserRepository.save(adminUser);
        return AdminAccountListResponse.of(adminUser);
    }

    @Transactional
    public AdminAccountListResponse updateAccount(Long id, AdminAccountUpdateRequest request) {
        AdminUser adminUser = findOrThrow(id);

        AdminRole role;
        try {
            role = AdminRole.valueOf(request.role().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new BusinessException("INVALID_ROLE", "유효하지 않은 역할입니다: " + request.role(), HttpStatus.BAD_REQUEST);
        }

        adminUser.setRole(role);
        return AdminAccountListResponse.of(adminUser);
    }

    @Transactional
    public void deleteAccount(Long id, Long currentAdminId) {
        if (id.equals(currentAdminId)) {
            throw new BusinessException("SELF_DELETE", "자기 자신을 삭제할 수 없습니다", HttpStatus.BAD_REQUEST);
        }
        AdminUser adminUser = findOrThrow(id);
        adminUserRepository.delete(adminUser);
    }

    @Transactional
    public AdminAccountListResponse unlockAccount(Long id) {
        AdminUser adminUser = findOrThrow(id);
        adminUser.resetFailedLogin();
        return AdminAccountListResponse.of(adminUser);
    }

    private AdminUser findOrThrow(Long id) {
        return adminUserRepository.findById(id)
                .orElseThrow(() -> new BusinessException("ADMIN_NOT_FOUND", "관리자를 찾을 수 없습니다", HttpStatus.NOT_FOUND));
    }
}
