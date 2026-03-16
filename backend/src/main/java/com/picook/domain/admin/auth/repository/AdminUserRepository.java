package com.picook.domain.admin.auth.repository;

import com.picook.domain.admin.auth.entity.AdminUser;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AdminUserRepository extends JpaRepository<AdminUser, Integer> {

    Optional<AdminUser> findByEmail(String email);

    boolean existsByEmail(String email);
}
