package com.picook.domain.admin.ingredient.service;

import com.picook.domain.admin.ingredient.dto.AdminIngredientRequest;
import com.picook.domain.admin.ingredient.dto.AdminIngredientResponse;
import com.picook.domain.admin.ingredient.dto.BulkDeleteRequest;
import com.picook.domain.admin.ingredient.dto.BulkDeleteResponse;
import com.picook.domain.admin.ingredient.dto.BulkMoveRequest;
import com.picook.domain.ingredient.entity.Ingredient;
import com.picook.domain.ingredient.entity.IngredientCategory;
import com.picook.domain.ingredient.entity.IngredientSubcategory;
import com.picook.domain.ingredient.repository.IngredientCategoryRepository;
import com.picook.domain.ingredient.repository.IngredientRepository;
import com.picook.domain.ingredient.repository.IngredientSubcategoryRepository;
import com.picook.global.exception.BusinessException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AdminIngredientServiceTest {

    @Mock
    private IngredientRepository ingredientRepository;

    @Mock
    private IngredientCategoryRepository categoryRepository;

    @Mock
    private IngredientSubcategoryRepository subcategoryRepository;

    private AdminIngredientService service;

    @BeforeEach
    void setUp() {
        service = new AdminIngredientService(ingredientRepository, categoryRepository, subcategoryRepository);
    }

    @Test
    void createIngredient_withSubcategory_shouldSucceed() {
        IngredientCategory vegetable = category(1, "채소");
        IngredientSubcategory root = subcategory(10, vegetable, "뿌리채소");

        when(ingredientRepository.existsByName("당근")).thenReturn(false);
        when(categoryRepository.findById(1)).thenReturn(Optional.of(vegetable));
        when(subcategoryRepository.findById(10)).thenReturn(Optional.of(root));
        when(ingredientRepository.save(any(Ingredient.class))).thenAnswer(inv -> inv.getArgument(0));

        AdminIngredientResponse response = service.createIngredient(
                new AdminIngredientRequest("당근", 1, 10, "🥕", null, List.of("홍당무")));

        assertThat(response.name()).isEqualTo("당근");
        assertThat(response.subcategoryId()).isEqualTo(10);
        assertThat(response.emoji()).isEqualTo("🥕");
        assertThat(response.synonyms()).containsExactly("홍당무");
    }

    @Test
    void createIngredient_subcategoryInDifferentCategory_shouldThrow() {
        IngredientCategory vegetable = category(1, "채소");
        IngredientCategory fruit = category(2, "과일");
        IngredientSubcategory fruitSub = subcategory(20, fruit, "베리");

        when(ingredientRepository.existsByName("당근")).thenReturn(false);
        when(categoryRepository.findById(1)).thenReturn(Optional.of(vegetable));
        when(subcategoryRepository.findById(20)).thenReturn(Optional.of(fruitSub));

        assertThatThrownBy(() -> service.createIngredient(
                new AdminIngredientRequest("당근", 1, 20, null, null, null)))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("선택한 카테고리에 속하지 않습니다");
    }

    @Test
    void createIngredient_duplicateName_shouldThrow() {
        when(ingredientRepository.existsByName("당근")).thenReturn(true);

        assertThatThrownBy(() -> service.createIngredient(
                new AdminIngredientRequest("당근", 1, null, null, null, null)))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("이미 존재하는");
    }

    @Test
    void deleteIngredient_inUse_shouldThrow() {
        IngredientCategory vegetable = category(1, "채소");
        Ingredient ing = ingredient(100, "당근", vegetable, null);

        when(ingredientRepository.findById(100)).thenReturn(Optional.of(ing));
        when(ingredientRepository.countRecipeUsageByIngredientIds(List.of(100)))
                .thenReturn(List.<Object[]>of(new Object[]{100, 3L}));

        assertThatThrownBy(() -> service.deleteIngredient(100))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("사용 중");
    }

    @Test
    void bulkDelete_mixedCases() {
        IngredientCategory vegetable = category(1, "채소");
        Ingredient a = ingredient(100, "당근", vegetable, null);
        Ingredient b = ingredient(101, "양파", vegetable, null);

        when(ingredientRepository.findAllById(List.of(100, 101, 999)))
                .thenReturn(List.of(a, b));
        when(ingredientRepository.countRecipeUsageByIngredientIds(List.of(100, 101, 999)))
                .thenReturn(List.<Object[]>of(new Object[]{101, 2L}));

        BulkDeleteResponse response = service.bulkDelete(new BulkDeleteRequest(List.of(100, 101, 999)));

        assertThat(response.requested()).isEqualTo(3);
        assertThat(response.deleted()).isEqualTo(1);
        assertThat(response.skipped()).isEqualTo(2);
        assertThat(response.skipReasons())
                .extracting(BulkDeleteResponse.SkipReason::id)
                .containsExactlyInAnyOrder(101, 999);
        verify(ingredientRepository).deleteAll(List.of(a));
    }

    @Test
    void bulkDelete_allSkipped_shouldNotDelete() {
        when(ingredientRepository.findAllById(List.of(999)))
                .thenReturn(List.of());
        when(ingredientRepository.countRecipeUsageByIngredientIds(List.of(999)))
                .thenReturn(List.of());

        BulkDeleteResponse response = service.bulkDelete(new BulkDeleteRequest(List.of(999)));

        assertThat(response.deleted()).isEqualTo(0);
        assertThat(response.skipped()).isEqualTo(1);
        verify(ingredientRepository, never()).deleteAll(anyList());
    }

    @Test
    void bulkMove_shouldUpdateCategoryAndSubcategory() {
        IngredientCategory oldCat = category(1, "채소");
        IngredientCategory newCat = category(2, "과일");
        IngredientSubcategory newSub = subcategory(30, newCat, "베리");
        Ingredient a = ingredient(100, "딸기", oldCat, null);
        Ingredient b = ingredient(101, "블루베리", oldCat, null);

        when(categoryRepository.findById(2)).thenReturn(Optional.of(newCat));
        when(subcategoryRepository.findById(30)).thenReturn(Optional.of(newSub));
        when(ingredientRepository.findAllById(List.of(100, 101))).thenReturn(List.of(a, b));

        service.bulkMove(new BulkMoveRequest(List.of(100, 101), 2, 30));

        assertThat(a.getCategory()).isEqualTo(newCat);
        assertThat(a.getSubcategory()).isEqualTo(newSub);
        assertThat(b.getCategory()).isEqualTo(newCat);
    }

    @Test
    void bulkMove_missingIds_shouldThrow() {
        IngredientCategory cat = category(1, "채소");
        Ingredient a = ingredient(100, "당근", cat, null);

        when(categoryRepository.findById(1)).thenReturn(Optional.of(cat));
        when(ingredientRepository.findAllById(List.of(100, 999)))
                .thenReturn(List.of(a));

        assertThatThrownBy(() ->
                service.bulkMove(new BulkMoveRequest(List.of(100, 999), 1, null)))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("찾을 수 없습니다");
    }

    @Test
    void bulkMove_subcategoryInWrongCategory_shouldThrow() {
        IngredientCategory fruit = category(2, "과일");
        IngredientCategory vegetable = category(1, "채소");
        IngredientSubcategory vegSub = subcategory(10, vegetable, "잎채소");

        when(categoryRepository.findById(2)).thenReturn(Optional.of(fruit));
        when(subcategoryRepository.findById(10)).thenReturn(Optional.of(vegSub));

        assertThatThrownBy(() ->
                service.bulkMove(new BulkMoveRequest(List.of(100), 2, 10)))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("선택한 카테고리에 속하지 않습니다");
    }

    private IngredientCategory category(int id, String name) {
        IngredientCategory c = new IngredientCategory(name, 1);
        ReflectionTestUtils.setField(c, "id", id);
        return c;
    }

    private IngredientSubcategory subcategory(int id, IngredientCategory category, String name) {
        IngredientSubcategory s = new IngredientSubcategory(category, name, null, 1);
        ReflectionTestUtils.setField(s, "id", id);
        return s;
    }

    private Ingredient ingredient(int id, String name, IngredientCategory category, IngredientSubcategory sub) {
        Ingredient i = new Ingredient(name, category);
        if (sub != null) i.setSubcategory(sub);
        ReflectionTestUtils.setField(i, "id", id);
        return i;
    }
}
