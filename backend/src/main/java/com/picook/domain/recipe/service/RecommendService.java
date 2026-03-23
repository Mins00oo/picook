package com.picook.domain.recipe.service;

import com.picook.domain.recipe.dto.RecommendRequest;
import com.picook.domain.recipe.dto.RecommendResponse;
import com.picook.domain.recipe.dto.RecommendResponse.MissingIngredient;
import com.picook.domain.recipe.entity.RecipeIngredient;
import com.picook.domain.recipe.repository.RecipeIngredientRepository;
import io.micrometer.core.annotation.Timed;
import io.micrometer.core.instrument.MeterRegistry;
import jakarta.persistence.EntityManager;
import jakarta.persistence.Query;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class RecommendService {

    private final EntityManager entityManager;
    private final RecipeIngredientRepository recipeIngredientRepository;
    private final MeterRegistry meterRegistry;

    public RecommendService(EntityManager entityManager,
                            RecipeIngredientRepository recipeIngredientRepository,
                            MeterRegistry meterRegistry) {
        this.entityManager = entityManager;
        this.recipeIngredientRepository = recipeIngredientRepository;
        this.meterRegistry = meterRegistry;
    }

    @Timed("picook.recommend.time")
    public List<RecommendResponse> recommend(RecommendRequest request) {
        meterRegistry.counter("picook.recommend.requests").increment();
        List<Integer> ingredientIds = request.ingredientIds();

        StringBuilder sql = new StringBuilder();
        sql.append("SELECT r.id, r.title, r.category, r.difficulty, r.cooking_time_minutes, ");
        sql.append("r.servings, r.image_url, r.thumbnail_url, ");
        sql.append("COUNT(DISTINCT ri_match.id) AS matched_count, ");
        sql.append("COUNT(DISTINCT ri_req.id) AS total_required ");
        sql.append("FROM recipes r ");
        sql.append("JOIN recipe_ingredients ri_req ON ri_req.recipe_id = r.id AND ri_req.is_required = true ");
        sql.append("LEFT JOIN recipe_ingredients ri_match ON ri_match.recipe_id = r.id ");
        sql.append("AND ri_match.is_required = true ");
        sql.append("AND ri_match.ingredient_id IN (:ingredientIds) ");
        sql.append("WHERE r.status = 'published' AND r.is_deleted = false ");

        if (request.maxTime() != null) {
            sql.append("AND r.cooking_time_minutes <= :maxTime ");
        }
        if (request.difficulty() != null) {
            sql.append("AND r.difficulty = :difficulty ");
        }
        if (request.servings() != null) {
            sql.append("AND r.servings = :servings ");
        }

        sql.append("GROUP BY r.id, r.title, r.category, r.difficulty, r.cooking_time_minutes, ");
        sql.append("r.servings, r.image_url, r.thumbnail_url ");
        sql.append("HAVING COUNT(DISTINCT ri_match.id)::float / NULLIF(COUNT(DISTINCT ri_req.id), 0) >= 0.3 ");
        sql.append("ORDER BY COUNT(DISTINCT ri_match.id)::float / COUNT(DISTINCT ri_req.id) DESC ");
        sql.append("LIMIT 10");

        Query query = entityManager.createNativeQuery(sql.toString());
        query.setParameter("ingredientIds", ingredientIds);

        if (request.maxTime() != null) {
            query.setParameter("maxTime", request.maxTime());
        }
        if (request.difficulty() != null) {
            query.setParameter("difficulty", request.difficulty().toLowerCase());
        }
        if (request.servings() != null) {
            query.setParameter("servings", request.servings());
        }

        @SuppressWarnings("unchecked")
        List<Object[]> results = query.getResultList();

        Set<Integer> userIngredientSet = new HashSet<>(ingredientIds);

        // 전체 레시피의 필수 재료를 1회 쿼리로 배치 로드 (N+1 방지)
        List<Integer> recipeIds = results.stream()
                .map(row -> (Integer) row[0])
                .toList();
        Map<Integer, List<RecipeIngredient>> requiredByRecipe = recipeIds.isEmpty()
                ? Map.of()
                : recipeIngredientRepository.findRequiredByRecipeIds(recipeIds).stream()
                        .collect(Collectors.groupingBy(ri -> ri.getRecipe().getId()));

        List<RecommendResponse> responses = new ArrayList<>();
        for (Object[] row : results) {
            Integer recipeId = (Integer) row[0];
            String title = (String) row[1];
            String category = (String) row[2];
            String difficulty = (String) row[3];
            int cookingTime = (Integer) row[4];
            int servings = (Integer) row[5];
            String imageUrl = (String) row[6];
            String thumbnailUrl = (String) row[7];
            long matchedCount = ((Number) row[8]).longValue();
            long totalRequired = ((Number) row[9]).longValue();
            double matchingRate = totalRequired > 0 ? (double) matchedCount / totalRequired * 100 : 0;

            List<RecipeIngredient> requiredIngredients = requiredByRecipe.getOrDefault(recipeId, List.of());

            List<MissingIngredient> missing = requiredIngredients.stream()
                    .filter(ri -> !userIngredientSet.contains(ri.getIngredient().getId()))
                    .map(ri -> new MissingIngredient(ri.getIngredient().getId(), ri.getIngredient().getName()))
                    .toList();

            responses.add(new RecommendResponse(
                    recipeId, title, category, difficulty, cookingTime, servings,
                    imageUrl, thumbnailUrl,
                    Math.round(matchingRate * 10.0) / 10.0,
                    missing
            ));
        }

        if (responses.isEmpty()) {
            meterRegistry.counter("picook.recommend.empty_results").increment();
        }

        return responses;
    }
}
