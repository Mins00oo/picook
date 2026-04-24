package com.picook.domain.admin.subcategory.service;

import com.picook.domain.admin.subcategory.dto.AdminSubcategoryRequest;
import com.picook.domain.admin.subcategory.dto.AdminSubcategoryResponse;
import com.picook.domain.admin.subcategory.dto.ReorderSubcategoryRequest;
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
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AdminSubcategoryServiceTest {

    @Mock
    private IngredientSubcategoryRepository subcategoryRepository;

    @Mock
    private IngredientCategoryRepository categoryRepository;

    @Mock
    private IngredientRepository ingredientRepository;

    private AdminSubcategoryService service;

    @BeforeEach
    void setUp() {
        service = new AdminSubcategoryService(subcategoryRepository, categoryRepository, ingredientRepository);
    }

    @Test
    void list_byCategory_shouldReturnSortedSubcategories() {
        IngredientCategory category = category(1, "채소");
        IngredientSubcategory leaf = subcategory(10, category, "잎채소", "🥬", 1);
        IngredientSubcategory root = subcategory(11, category, "뿌리채소", "🥕", 2);

        when(subcategoryRepository.findByCategoryIdOrderBySortOrderAsc(1))
                .thenReturn(List.of(leaf, root));

        List<AdminSubcategoryResponse> result = service.list(1);

        assertThat(result).hasSize(2);
        assertThat(result.get(0).name()).isEqualTo("잎채소");
        assertThat(result.get(0).categoryId()).isEqualTo(1);
    }

    @Test
    void list_allCategories_shouldReturnAllSubcategories() {
        IngredientCategory cat = category(1, "채소");
        IngredientSubcategory sub = subcategory(10, cat, "잎채소", null, 1);

        when(subcategoryRepository.findAllByOrderBySortOrderAsc()).thenReturn(List.of(sub));

        List<AdminSubcategoryResponse> result = service.list(null);

        assertThat(result).hasSize(1);
    }

    @Test
    void create_shouldSucceed() {
        IngredientCategory category = category(1, "채소");
        AdminSubcategoryRequest req = new AdminSubcategoryRequest(1, "잎채소", "🥬", 1);

        when(categoryRepository.findById(1)).thenReturn(Optional.of(category));
        when(subcategoryRepository.existsByCategoryIdAndName(1, "잎채소")).thenReturn(false);
        when(subcategoryRepository.save(any(IngredientSubcategory.class)))
                .thenAnswer(inv -> inv.getArgument(0));

        AdminSubcategoryResponse response = service.create(req);

        assertThat(response.name()).isEqualTo("잎채소");
        assertThat(response.emoji()).isEqualTo("🥬");
    }

    @Test
    void create_duplicate_shouldThrow() {
        IngredientCategory category = category(1, "채소");
        AdminSubcategoryRequest req = new AdminSubcategoryRequest(1, "잎채소", null, 1);

        when(categoryRepository.findById(1)).thenReturn(Optional.of(category));
        when(subcategoryRepository.existsByCategoryIdAndName(1, "잎채소")).thenReturn(true);

        assertThatThrownBy(() -> service.create(req))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("이미 존재하는");
    }

    @Test
    void create_categoryNotFound_shouldThrow() {
        when(categoryRepository.findById(999)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.create(new AdminSubcategoryRequest(999, "x", null, 1)))
                .isInstanceOf(BusinessException.class);
    }

    @Test
    void update_shouldSucceed() {
        IngredientCategory category = category(1, "채소");
        IngredientSubcategory entity = subcategory(10, category, "뿌리채소", null, 1);

        when(subcategoryRepository.findById(10)).thenReturn(Optional.of(entity));
        when(categoryRepository.findById(1)).thenReturn(Optional.of(category));
        when(subcategoryRepository.existsByCategoryIdAndName(1, "뿌리")).thenReturn(false);

        AdminSubcategoryResponse response = service.update(10,
                new AdminSubcategoryRequest(1, "뿌리", "🥕", 2));

        assertThat(response.name()).isEqualTo("뿌리");
        assertThat(response.emoji()).isEqualTo("🥕");
        assertThat(entity.getSortOrder()).isEqualTo(2);
    }

    @Test
    void update_categoryMismatch_shouldThrow() {
        IngredientCategory vegetable = category(1, "채소");
        IngredientCategory fruit = category(2, "과일");
        IngredientSubcategory entity = subcategory(10, vegetable, "뿌리채소", null, 1);

        when(subcategoryRepository.findById(10)).thenReturn(Optional.of(entity));
        when(categoryRepository.findById(2)).thenReturn(Optional.of(fruit));

        assertThatThrownBy(() -> service.update(10,
                new AdminSubcategoryRequest(2, "뿌리", null, 1)))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("카테고리는 변경할 수 없습니다");
    }

    @Test
    void delete_shouldSucceed() {
        IngredientCategory category = category(1, "채소");
        IngredientSubcategory entity = subcategory(10, category, "잎채소", null, 1);

        when(subcategoryRepository.findById(10)).thenReturn(Optional.of(entity));
        when(ingredientRepository.countBySubcategoryId(10)).thenReturn(0L);

        service.delete(10);

        verify(subcategoryRepository).delete(entity);
    }

    @Test
    void delete_withIngredients_shouldThrow() {
        IngredientCategory category = category(1, "채소");
        IngredientSubcategory entity = subcategory(10, category, "잎채소", null, 1);

        when(subcategoryRepository.findById(10)).thenReturn(Optional.of(entity));
        when(ingredientRepository.countBySubcategoryId(10)).thenReturn(7L);

        assertThatThrownBy(() -> service.delete(10))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("소속 재료가 있어");
    }

    @Test
    void reorder_shouldUpdateSortOrder() {
        IngredientCategory category = category(1, "채소");
        IngredientSubcategory a = subcategory(10, category, "잎채소", null, 1);
        IngredientSubcategory b = subcategory(11, category, "뿌리채소", null, 2);
        IngredientSubcategory c = subcategory(12, category, "버섯", null, 3);

        when(subcategoryRepository.findByCategoryIdOrderBySortOrderAsc(1))
                .thenReturn(List.of(a, b, c));

        service.reorder(new ReorderSubcategoryRequest(1, List.of(12, 10, 11)));

        assertThat(c.getSortOrder()).isEqualTo(1);
        assertThat(a.getSortOrder()).isEqualTo(2);
        assertThat(b.getSortOrder()).isEqualTo(3);
    }

    @Test
    void reorder_countMismatch_shouldThrow() {
        IngredientCategory category = category(1, "채소");
        IngredientSubcategory a = subcategory(10, category, "잎채소", null, 1);

        when(subcategoryRepository.findByCategoryIdOrderBySortOrderAsc(1))
                .thenReturn(List.of(a));

        assertThatThrownBy(() ->
                service.reorder(new ReorderSubcategoryRequest(1, List.of(10, 11))))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("일치하지 않습니다");
    }

    private IngredientCategory category(int id, String name) {
        IngredientCategory c = new IngredientCategory(name, 1);
        ReflectionTestUtils.setField(c, "id", id);
        return c;
    }

    private IngredientSubcategory subcategory(int id, IngredientCategory category,
                                              String name, String emoji, int sortOrder) {
        IngredientSubcategory s = new IngredientSubcategory(category, name, emoji, sortOrder);
        ReflectionTestUtils.setField(s, "id", id);
        return s;
    }
}
