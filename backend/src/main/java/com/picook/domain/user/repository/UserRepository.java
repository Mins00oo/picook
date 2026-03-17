package com.picook.domain.user.repository;

import com.picook.domain.user.entity.LoginType;
import com.picook.domain.user.entity.User;
import com.picook.domain.user.entity.UserStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<User, UUID> {

    Optional<User> findByKakaoId(String kakaoId);

    Optional<User> findByAppleId(String appleId);

    long countByStatus(UserStatus status);

    long countByLoginType(LoginType loginType);

    long countByCreatedAtBetween(Instant start, Instant end);

    @Query("SELECT u.completedCookingCount, COUNT(u) FROM User u GROUP BY u.completedCookingCount ORDER BY u.completedCookingCount")
    java.util.List<Object[]> findCookingCountDistribution();

    @Query(value = "SELECT u FROM User u " +
            "WHERE (:status IS NULL OR u.status = :status) " +
            "AND (:loginType IS NULL OR u.loginType = :loginType) " +
            "AND (:keyword IS NULL OR LOWER(u.email) LIKE LOWER(CONCAT('%', CAST(:keyword AS text), '%')) " +
            "     OR LOWER(u.displayName) LIKE LOWER(CONCAT('%', CAST(:keyword AS text), '%')))",
            countQuery = "SELECT COUNT(u) FROM User u " +
                    "WHERE (:status IS NULL OR u.status = :status) " +
                    "AND (:loginType IS NULL OR u.loginType = :loginType) " +
                    "AND (:keyword IS NULL OR LOWER(u.email) LIKE LOWER(CONCAT('%', CAST(:keyword AS text), '%')) " +
                    "     OR LOWER(u.displayName) LIKE LOWER(CONCAT('%', CAST(:keyword AS text), '%')))")
    Page<User> searchUsers(@Param("status") UserStatus status,
                           @Param("loginType") LoginType loginType,
                           @Param("keyword") String keyword,
                           Pageable pageable);

    long countByLastLoginAtAfter(Instant since);

    @Query(value = "SELECT CAST(created_at AS DATE) AS day, COUNT(*) FROM users WHERE created_at BETWEEN :start AND :end GROUP BY day ORDER BY day",
            nativeQuery = true)
    java.util.List<Object[]> countDailySignups(@Param("start") Instant start, @Param("end") Instant end);
}
