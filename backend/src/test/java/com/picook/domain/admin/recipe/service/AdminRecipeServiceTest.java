package com.picook.domain.admin.recipe.service;

import com.picook.domain.admin.recipe.dto.AdminRecipeRequest;
import com.picook.domain.admin.recipe.dto.AdminRecipeResponse;
import com.picook.domain.admin.recipe.dto.RecipeStatusRequest;
import com.picook.domain.ingredient.entity.Ingredient;
import com.picook.domain.ingredient.entity.IngredientCategory;
import com.picook.domain.ingredient.repository.IngredientRepository;
import com.picook.domain.recipe.entity.Recipe;
import com.picook.domain.recipe.repository.RecipeRepository;
import com.picook.global.exception.BusinessException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.lang.reflect.Field;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AdminRecipeServiceTest {

    @Mock
    private RecipeRepository recipeRepository;

    @Mock
    private IngredientRepository ingredientRepository;

    private AdminRecipeService adminRecipeService;

    @BeforeEach
    void setUp() {
        adminRecipeService = new AdminRecipeService(recipeRepository, ingredientRepository);
    }

    @Test
    void createRecipe_shouldCreateSuccessfully() throws Exception {
        Ingredient ingredient = createIngredient(1, "양파");
        when(ingredientRepository.findById(1)).thenReturn(Optional.of(ingredient));
        when(recipeRepository.save(any(Recipe.class))).thenAnswer(invocation -> {
            Recipe r = invocation.getArgument(0);
            setField(r, "id", 1);
            return r;
        });

        AdminRecipeRequest request = new AdminRecipeRequest(
                "김치찌개", "korean", "easy", 30, 2, 420,
                null, null, "맛있게 만드세요",
                List.of(new AdminRecipeRequest.IngredientItem(1, BigDecimal.ONE, "개", true, 0)),
                List.of(new AdminRecipeRequest.StepItem(1, "양파를 썬다", null, "active", 60, false))
        );

        AdminRecipeResponse response = adminRecipeService.createRecipe(request);

        assertThat(response.title()).isEqualTo("김치찌개");
        assertThat(response.ingredients()).hasSize(1);
        assertThat(response.steps()).hasSize(1);
        verify(recipeRepository).save(any(Recipe.class));
    }

    @Test
    void createRecipe_shouldThrowForInvalidCategory() {
        AdminRecipeRequest request = new AdminRecipeRequest(
                "테스트", "invalid_category", "easy", 30, 2, null,
                null, null, null, List.of(), List.of()
        );

        assertThatThrownBy(() -> adminRecipeService.createRecipe(request))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("유효하지 않은 카테고리");
    }

    @Test
    void createRecipe_shouldThrowForInvalidDifficulty() {
        AdminRecipeRequest request = new AdminRecipeRequest(
                "테스트", "korean", "super_hard", 30, 2, null,
                null, null, null, List.of(), List.of()
        );

        assertThatThrownBy(() -> adminRecipeService.createRecipe(request))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("유효하지 않은 난이도");
    }

    @Test
    void updateRecipe_shouldUpdateSuccessfully() throws Exception {
        Recipe existing = createRecipe(1, "원래 레시피");
        Ingredient ingredient = createIngredient(2, "당근");

        when(recipeRepository.findByIdAndIsDeletedFalse(1)).thenReturn(Optional.of(existing));
        when(ingredientRepository.findById(2)).thenReturn(Optional.of(ingredient));

        AdminRecipeRequest request = new AdminRecipeRequest(
                "수정된 레시피", "western", "medium", 45, 3, 380,
                null, null, null,
                List.of(new AdminRecipeRequest.IngredientItem(2, new BigDecimal("0.5"), "개", true, 0)),
                List.of(new AdminRecipeRequest.StepItem(1, "당근을 자른다", null, "active", 30, true))
        );

        AdminRecipeResponse response = adminRecipeService.updateRecipe(1, request);

        assertThat(response.title()).isEqualTo("수정된 레시피");
        assertThat(response.category()).isEqualTo("western");
    }

    @Test
    void deleteRecipe_shouldSoftDelete() throws Exception {
        Recipe recipe = createRecipe(1, "삭제 대상");
        when(recipeRepository.findByIdAndIsDeletedFalse(1)).thenReturn(Optional.of(recipe));

        adminRecipeService.deleteRecipe(1);

        assertThat(recipe.getIsDeleted()).isTrue();
    }

    @Test
    void deleteRecipe_shouldThrowWhenNotFound() {
        when(recipeRepository.findByIdAndIsDeletedFalse(999)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> adminRecipeService.deleteRecipe(999))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("레시피를 찾을 수 없습니다");
    }

    @Test
    void changeStatus_shouldChangeSuccessfully() throws Exception {
        Recipe recipe = createRecipe(1, "상태 변경");
        when(recipeRepository.findByIdAndIsDeletedFalse(1)).thenReturn(Optional.of(recipe));

        AdminRecipeResponse response = adminRecipeService.changeStatus(1, new RecipeStatusRequest("published"));

        assertThat(response.status()).isEqualTo("published");
    }

    @Test
    void changeStatus_shouldThrowForInvalidStatus() throws Exception {
        Recipe recipe = createRecipe(1, "상태 변경");
        when(recipeRepository.findByIdAndIsDeletedFalse(1)).thenReturn(Optional.of(recipe));

        assertThatThrownBy(() -> adminRecipeService.changeStatus(1, new RecipeStatusRequest("invalid")))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("유효하지 않은 상태");
    }

    private Recipe createRecipe(Integer id, String title) throws Exception {
        Recipe recipe = new Recipe(title, "korean", "easy", 30, 2);
        setField(recipe, "id", id);
        return recipe;
    }

    private Ingredient createIngredient(Integer id, String name) throws Exception {
        IngredientCategory category = new IngredientCategory("채소", 0);
        Ingredient ingredient = new Ingredient(name, category);
        setField(ingredient, "id", id);
        return ingredient;
    }

    private void setField(Object target, String fieldName, Object value) throws Exception {
        Field field = target.getClass().getDeclaredField(fieldName);
        field.setAccessible(true);
        field.set(target, value);
    }
}
