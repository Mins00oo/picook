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

/**
 * 재료 기반 레시피 추천.
 *
 * 매칭률 정의 (V24 이후):
 *   매칭률 = 보유한 메인재료 / 레시피 전체 메인재료 × 100
 *   - 메인재료 = ingredients.is_seasoning = false
 *   - 양념(소금/간장/설탕/식초/마늘 등)은 매칭률 계산 제외
 *   - 사용자가 양념을 가졌든 안 가졌든 추천에는 영향 없음. 다만 부족 양념 정보는 응답에 포함.
 *   - 30% 이상 컷오프 → 매칭률 DESC 정렬 → TOP 10
 *
 * 상향 매칭 (V26 이후):
 *   사용자 보유 자식(예: 삼겹살) → 레시피 부모(돼지고기) 매칭 OK
 *   사용자 보유 자식(삼겹살) → 레시피 sibling(앞다리살) 매칭 X (다른 부위)
 *   ingredients.parent_id 활용. 1-level chain (육류 부위만 사용 중).
 */
@Service
@Transactional(readOnly = true)
public class RecommendService {

    private static final double MIN_MATCH_RATE = 0.3;
    private static final int RESULT_LIMIT = 10;

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
        List<Integer> userIngredientIds = request.ingredientIds();

        // 상향 매칭: 사용자 보유의 부모 ID 추가 (V26 parent_id 활용)
        // 예: 사용자 [삼겹살] → expanded [삼겹살, 돼지고기]
        //     레시피 "돼지고기" 들어간 경우도 매칭 OK
        List<Integer> ingredientIds = expandWithParents(userIngredientIds);

        // 메인재료 기반 매칭률 계산 + 컷오프 + 정렬을 한 SQL로
        StringBuilder sql = new StringBuilder();
        sql.append("SELECT r.id, r.title, r.category, r.difficulty, r.cooking_time_minutes, ");
        sql.append("r.servings, r.image_url, r.thumbnail_url, ");
        // 매칭된 메인재료 수 (사용자 보유)
        sql.append("COUNT(DISTINCT CASE WHEN i.is_seasoning = false AND ri.ingredient_id IN (:ingredientIds) THEN ri.id END) AS matched_main, ");
        // 전체 메인재료 수
        sql.append("COUNT(DISTINCT CASE WHEN i.is_seasoning = false THEN ri.id END) AS total_main ");
        sql.append("FROM recipes r ");
        sql.append("JOIN recipe_ingredients ri ON ri.recipe_id = r.id ");
        sql.append("JOIN ingredients i ON i.id = ri.ingredient_id ");
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
        // 메인재료 0개인 레시피는 의미 없으므로 NULLIF로 0 나누기 방지하면서 0이면 제외
        sql.append("HAVING COUNT(DISTINCT CASE WHEN i.is_seasoning = false THEN ri.id END) > 0 ");
        sql.append("AND COUNT(DISTINCT CASE WHEN i.is_seasoning = false AND ri.ingredient_id IN (:ingredientIds) THEN ri.id END)::float ");
        sql.append("    / COUNT(DISTINCT CASE WHEN i.is_seasoning = false THEN ri.id END) >= :minRate ");
        sql.append("ORDER BY COUNT(DISTINCT CASE WHEN i.is_seasoning = false AND ri.ingredient_id IN (:ingredientIds) THEN ri.id END)::float ");
        sql.append("    / COUNT(DISTINCT CASE WHEN i.is_seasoning = false THEN ri.id END) DESC ");
        sql.append("LIMIT :limit");

        Query query = entityManager.createNativeQuery(sql.toString());
        query.setParameter("ingredientIds", ingredientIds);
        query.setParameter("minRate", MIN_MATCH_RATE);
        query.setParameter("limit", RESULT_LIMIT);

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

        // missing 계산용: expanded ID 사용 (사용자가 자식 보유 시 부모도 "보유"로 간주 — 화면 missing 표시 정확)
        Set<Integer> userIngredientSet = new HashSet<>(ingredientIds);

        // 부족 재료 표시용 — 후보 레시피의 모든 재료를 1회 쿼리로 fetch
        List<Integer> recipeIds = results.stream()
                .map(row -> (Integer) row[0])
                .toList();
        Map<Integer, List<RecipeIngredient>> allByRecipe = recipeIds.isEmpty()
                ? Map.of()
                : recipeIngredientRepository.findAllByRecipeIds(recipeIds).stream()
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
            long matchedMain = ((Number) row[8]).longValue();
            long totalMain = ((Number) row[9]).longValue();
            double matchingRate = totalMain > 0 ? (double) matchedMain / totalMain * 100 : 0;

            List<RecipeIngredient> all = allByRecipe.getOrDefault(recipeId, List.of());

            // 메인재료 중 사용자 미보유
            List<MissingIngredient> missingMain = all.stream()
                    .filter(ri -> !Boolean.TRUE.equals(ri.getIngredient().getIsSeasoning()))
                    .filter(ri -> !userIngredientSet.contains(ri.getIngredient().getId()))
                    .map(ri -> new MissingIngredient(ri.getIngredient().getId(), ri.getIngredient().getName()))
                    .toList();

            // 양념 중 사용자 미보유 (별도 표시)
            List<MissingIngredient> missingSeasonings = all.stream()
                    .filter(ri -> Boolean.TRUE.equals(ri.getIngredient().getIsSeasoning()))
                    .filter(ri -> !userIngredientSet.contains(ri.getIngredient().getId()))
                    .map(ri -> new MissingIngredient(ri.getIngredient().getId(), ri.getIngredient().getName()))
                    .toList();

            responses.add(new RecommendResponse(
                    recipeId, title, category, difficulty, cookingTime, servings,
                    imageUrl, thumbnailUrl,
                    Math.round(matchingRate * 10.0) / 10.0,
                    missingMain,
                    missingSeasonings
            ));
        }

        if (responses.isEmpty()) {
            meterRegistry.counter("picook.recommend.empty_results").increment();
        }

        return responses;
    }

    /**
     * 사용자 보유 ID 목록 + 그 부모(parent_id) ID들로 확장.
     * 상향 매칭용 (V26): 자식 보유 → 부모 매칭 OK, 다른 자식(sibling)은 X.
     */
    @SuppressWarnings("unchecked")
    private List<Integer> expandWithParents(List<Integer> userIds) {
        if (userIds == null || userIds.isEmpty()) {
            return userIds == null ? List.of() : userIds;
        }
        Query q = entityManager.createNativeQuery(
                "SELECT DISTINCT parent_id FROM ingredients " +
                        "WHERE id IN (:ids) AND parent_id IS NOT NULL"
        );
        q.setParameter("ids", userIds);
        List<Integer> parents = q.getResultList();
        if (parents.isEmpty()) {
            return userIds;
        }
        List<Integer> expanded = new ArrayList<>(userIds);
        for (Integer p : parents) {
            if (!expanded.contains(p)) expanded.add(p);
        }
        return expanded;
    }
}
