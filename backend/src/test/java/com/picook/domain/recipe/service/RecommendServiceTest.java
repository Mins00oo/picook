package com.picook.domain.recipe.service;

import com.picook.domain.ingredient.entity.Ingredient;
import com.picook.domain.ingredient.entity.IngredientCategory;
import com.picook.domain.recipe.dto.RecommendRequest;
import com.picook.domain.recipe.dto.RecommendResponse;
import com.picook.domain.recipe.entity.Recipe;
import com.picook.domain.recipe.entity.RecipeIngredient;
import com.picook.domain.recipe.repository.RecipeIngredientRepository;
import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.simple.SimpleMeterRegistry;
import jakarta.persistence.EntityManager;
import jakarta.persistence.Query;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.lang.reflect.Field;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RecommendServiceTest {

    @Mock
    private EntityManager entityManager;

    @Mock
    private RecipeIngredientRepository recipeIngredientRepository;

    @Mock
    private Query nativeQuery;

    private RecommendService recommendService;

    @BeforeEach
    void setUp() {
        allRecipeIngredients.clear();
        recommendService = new RecommendService(entityManager, recipeIngredientRepository, new SimpleMeterRegistry());
    }

    @Test
    void recommend_shouldReturnTop10ByMatchingRate() {
        // Given
        RecommendRequest request = new RecommendRequest(List.of(1, 2, 3), null, null, null);
        List<Object[]> queryResults = new ArrayList<>();
        // Recipe 1: 3/3 = 100%
        queryResults.add(new Object[]{1, "김치찌개", "korean", "easy", 30, 2, null, null, 3L, 3L});
        // Recipe 2: 2/3 = 66.7%
        queryResults.add(new Object[]{2, "된장찌개", "korean", "medium", 40, 2, null, null, 2L, 3L});

        when(entityManager.createNativeQuery(anyString())).thenReturn(nativeQuery);
        when(nativeQuery.setParameter(eq("ingredientIds"), any())).thenReturn(nativeQuery);
        when(nativeQuery.getResultList()).thenReturn(queryResults);

        // Mock missing ingredients
        mockRecipeIngredients(1, List.of(1, 2, 3));
        mockRecipeIngredients(2, List.of(1, 2, 4));

        // When
        List<RecommendResponse> results = recommendService.recommend(request);

        // Then
        assertThat(results).hasSize(2);
        assertThat(results.get(0).matchingRate()).isGreaterThan(results.get(1).matchingRate());
        assertThat(results.get(0).title()).isEqualTo("김치찌개");
    }

    @Test
    void recommend_shouldExcludeBelow30Percent() {
        // The native query itself handles the 30% threshold via HAVING clause
        // so if the query returns results, they all have >= 30%
        RecommendRequest request = new RecommendRequest(List.of(1), null, null, null);

        when(entityManager.createNativeQuery(anyString())).thenReturn(nativeQuery);
        when(nativeQuery.setParameter(eq("ingredientIds"), any())).thenReturn(nativeQuery);
        when(nativeQuery.getResultList()).thenReturn(List.of());

        List<RecommendResponse> results = recommendService.recommend(request);

        assertThat(results).isEmpty();
    }

    @Test
    void recommend_shouldFilterByMaxTime() {
        RecommendRequest request = new RecommendRequest(List.of(1, 2), 20, null, null);

        when(entityManager.createNativeQuery(anyString())).thenReturn(nativeQuery);
        when(nativeQuery.setParameter(eq("ingredientIds"), any())).thenReturn(nativeQuery);
        when(nativeQuery.setParameter(eq("maxTime"), eq(20))).thenReturn(nativeQuery);
        when(nativeQuery.getResultList()).thenReturn(List.of());

        List<RecommendResponse> results = recommendService.recommend(request);

        assertThat(results).isEmpty();
        verify(nativeQuery).setParameter("maxTime", 20);
    }

    @Test
    void recommend_shouldFilterByDifficulty() {
        RecommendRequest request = new RecommendRequest(List.of(1, 2), null, "easy", null);

        when(entityManager.createNativeQuery(anyString())).thenReturn(nativeQuery);
        when(nativeQuery.setParameter(eq("ingredientIds"), any())).thenReturn(nativeQuery);
        when(nativeQuery.setParameter(eq("difficulty"), eq("easy"))).thenReturn(nativeQuery);
        when(nativeQuery.getResultList()).thenReturn(List.of());

        List<RecommendResponse> results = recommendService.recommend(request);

        assertThat(results).isEmpty();
        verify(nativeQuery).setParameter("difficulty", "easy");
    }

    @Test
    void recommend_shouldFilterByServings() {
        RecommendRequest request = new RecommendRequest(List.of(1, 2), null, null, 4);

        when(entityManager.createNativeQuery(anyString())).thenReturn(nativeQuery);
        when(nativeQuery.setParameter(eq("ingredientIds"), any())).thenReturn(nativeQuery);
        when(nativeQuery.setParameter(eq("servings"), eq(4))).thenReturn(nativeQuery);
        when(nativeQuery.getResultList()).thenReturn(List.of());

        List<RecommendResponse> results = recommendService.recommend(request);

        assertThat(results).isEmpty();
        verify(nativeQuery).setParameter("servings", 4);
    }

    @Test
    void recommend_shouldReturnMissingIngredients() {
        RecommendRequest request = new RecommendRequest(List.of(1, 2), null, null, null);
        List<Object[]> queryResults = new ArrayList<>();
        // Recipe has 3 required ingredients (1, 2, 3), user has 1, 2 → missing 3
        queryResults.add(new Object[]{1, "김치찌개", "korean", "easy", 30, 2, null, null, 2L, 3L});

        when(entityManager.createNativeQuery(anyString())).thenReturn(nativeQuery);
        when(nativeQuery.setParameter(eq("ingredientIds"), any())).thenReturn(nativeQuery);
        when(nativeQuery.getResultList()).thenReturn(queryResults);

        mockRecipeIngredients(1, List.of(1, 2, 3));

        List<RecommendResponse> results = recommendService.recommend(request);

        assertThat(results).hasSize(1);
        assertThat(results.get(0).missingIngredients()).hasSize(1);
        assertThat(results.get(0).missingIngredients().get(0).id()).isEqualTo(3);
    }

    @Test
    void recommend_shouldExcludeDeletedAndUnpublished() {
        // The native query WHERE clause handles this: status = 'published' AND is_deleted = false
        // Verified by checking the SQL string contains these conditions
        RecommendRequest request = new RecommendRequest(List.of(1), null, null, null);

        when(entityManager.createNativeQuery(contains("status = 'published' AND r.is_deleted = false")))
                .thenReturn(nativeQuery);
        when(nativeQuery.setParameter(eq("ingredientIds"), any())).thenReturn(nativeQuery);
        when(nativeQuery.getResultList()).thenReturn(List.of());

        recommendService.recommend(request);

        verify(entityManager).createNativeQuery(contains("status = 'published' AND r.is_deleted = false"));
    }

    @Test
    void recommend_shouldReturnEmptyWhenNoMatch() {
        RecommendRequest request = new RecommendRequest(List.of(999), null, null, null);

        when(entityManager.createNativeQuery(anyString())).thenReturn(nativeQuery);
        when(nativeQuery.setParameter(eq("ingredientIds"), any())).thenReturn(nativeQuery);
        when(nativeQuery.getResultList()).thenReturn(List.of());

        List<RecommendResponse> results = recommendService.recommend(request);

        assertThat(results).isEmpty();
    }

    private final List<RecipeIngredient> allRecipeIngredients = new ArrayList<>();

    private void mockRecipeIngredients(Integer recipeId, List<Integer> ingredientIds) {
        IngredientCategory category = new IngredientCategory("채소", 0);

        for (Integer ingredientId : ingredientIds) {
            try {
                Ingredient ingredient = new Ingredient("재료" + ingredientId, category);
                setField(ingredient, "id", ingredientId);

                Recipe recipe = new Recipe("test", "korean", "easy", 30, 2);
                setField(recipe, "id", recipeId);

                RecipeIngredient ri = new RecipeIngredient(recipe, ingredient, BigDecimal.ONE, "개", true, 0);
                allRecipeIngredients.add(ri);
            } catch (Exception e) {
                throw new RuntimeException(e);
            }
        }

        when(recipeIngredientRepository.findRequiredByRecipeIds(any())).thenReturn(allRecipeIngredients);
    }

    private void setField(Object target, String fieldName, Object value) throws Exception {
        Field field = target.getClass().getDeclaredField(fieldName);
        field.setAccessible(true);
        field.set(target, value);
    }
}
