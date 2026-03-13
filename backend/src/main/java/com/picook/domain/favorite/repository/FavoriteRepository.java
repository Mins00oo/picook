package com.picook.domain.favorite.repository;

import com.picook.domain.favorite.entity.Favorite;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface FavoriteRepository extends JpaRepository<Favorite, Integer> {

    List<Favorite> findByUserIdOrderByCreatedAtDesc(UUID userId);

    Optional<Favorite> findByIdAndUserId(Integer id, UUID userId);

    boolean existsByUserIdAndRecipeId(UUID userId, Integer recipeId);

    int countByUserId(UUID userId);

    Page<Favorite> findByUserId(UUID userId, Pageable pageable);
}
