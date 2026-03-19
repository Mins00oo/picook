package com.picook.domain.admin.category.service;

import com.picook.domain.admin.category.dto.AdminCategoryRequest;
import com.picook.domain.admin.category.dto.AdminCategoryResponse;
import com.picook.domain.admin.category.dto.CategoryReorderRequest;
import com.picook.domain.ingredient.entity.IngredientCategory;
import com.picook.domain.ingredient.repository.IngredientCategoryRepository;
import com.picook.domain.ingredient.repository.IngredientRepository;
import com.picook.global.exception.BusinessException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.lang.reflect.Field;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AdminCategoryServiceTest {

    @Mock
    private IngredientCategoryRepository categoryRepository;

    @Mock
    private IngredientRepository ingredientRepository;

    private AdminCategoryService service;

    @BeforeEach
    void setUp() {
        service = new AdminCategoryService(categoryRepository, ingredientRepository);
    }

    @Test
    void getAllCategories_shouldReturnWithIngredientCounts() throws Exception {
        IngredientCategory cat1 = new IngredientCategory("채소", 1);
        setField(cat1, "id", 1);
        IngredientCategory cat2 = new IngredientCategory("육류", 2);
        setField(cat2, "id", 2);

        when(categoryRepository.findAllByOrderBySortOrderAsc()).thenReturn(List.of(cat1, cat2));
        when(ingredientRepository.countGroupByCategoryId()).thenReturn(List.of(
                new Object[]{1, 5L},
                new Object[]{2, 3L}
        ));

        List<AdminCategoryResponse> result = service.getAllCategories();

        assertThat(result).hasSize(2);
        assertThat(result.get(0).name()).isEqualTo("채소");
        assertThat(result.get(1).name()).isEqualTo("육류");
    }

    @Test
    void createCategory_shouldSucceed() {
        AdminCategoryRequest request = new AdminCategoryRequest("해산물", 3);

        when(categoryRepository.existsByName("해산물")).thenReturn(false);
        when(categoryRepository.save(any(IngredientCategory.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        AdminCategoryResponse response = service.createCategory(request);

        assertThat(response.name()).isEqualTo("해산물");
        verify(categoryRepository).save(any(IngredientCategory.class));
    }

    @Test
    void createCategory_autoSortOrder_whenNull() {
        AdminCategoryRequest request = new AdminCategoryRequest("양념", null);

        when(categoryRepository.existsByName("양념")).thenReturn(false);
        when(categoryRepository.count()).thenReturn(5L);
        when(categoryRepository.save(any(IngredientCategory.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        AdminCategoryResponse response = service.createCategory(request);

        assertThat(response.name()).isEqualTo("양념");
    }

    @Test
    void createCategory_duplicateName_shouldThrow() {
        AdminCategoryRequest request = new AdminCategoryRequest("채소", 1);

        when(categoryRepository.existsByName("채소")).thenReturn(true);

        assertThatThrownBy(() -> service.createCategory(request))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("이미 존재하는 카테고리");
    }

    @Test
    void updateCategory_shouldSucceed() throws Exception {
        IngredientCategory existing = new IngredientCategory("채소류", 1);
        setField(existing, "id", 1);

        when(categoryRepository.findById(1)).thenReturn(Optional.of(existing));
        when(categoryRepository.findByName("채소")).thenReturn(Optional.empty());
        when(ingredientRepository.countByCategoryId(1)).thenReturn(5);

        AdminCategoryResponse response = service.updateCategory(1, new AdminCategoryRequest("채소", 1));

        assertThat(response.name()).isEqualTo("채소");
    }

    @Test
    void updateCategory_duplicateName_shouldThrow() throws Exception {
        IngredientCategory existing = new IngredientCategory("채소", 1);
        setField(existing, "id", 1);

        IngredientCategory other = new IngredientCategory("육류", 2);
        setField(other, "id", 2);

        when(categoryRepository.findById(1)).thenReturn(Optional.of(existing));
        when(categoryRepository.findByName("육류")).thenReturn(Optional.of(other));

        assertThatThrownBy(() -> service.updateCategory(1, new AdminCategoryRequest("육류", 1)))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("이미 존재하는 카테고리");
    }

    @Test
    void deleteCategory_shouldSucceed() throws Exception {
        IngredientCategory category = new IngredientCategory("빈 카테고리", 1);
        setField(category, "id", 1);

        when(categoryRepository.findById(1)).thenReturn(Optional.of(category));
        when(ingredientRepository.existsByCategoryId(1)).thenReturn(false);

        service.deleteCategory(1);

        verify(categoryRepository).delete(category);
    }

    @Test
    void deleteCategory_inUse_shouldThrow() throws Exception {
        IngredientCategory category = new IngredientCategory("채소", 1);
        setField(category, "id", 1);

        when(categoryRepository.findById(1)).thenReturn(Optional.of(category));
        when(ingredientRepository.existsByCategoryId(1)).thenReturn(true);

        assertThatThrownBy(() -> service.deleteCategory(1))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("소속 재료가 있는 카테고리");
    }

    @Test
    void deleteCategory_notFound_shouldThrow() {
        when(categoryRepository.findById(999)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.deleteCategory(999))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("카테고리를 찾을 수 없습니다");
    }

    @Test
    void reorderCategories_shouldUpdateSortOrders() throws Exception {
        IngredientCategory cat1 = new IngredientCategory("채소", 1);
        setField(cat1, "id", 1);
        IngredientCategory cat2 = new IngredientCategory("육류", 2);
        setField(cat2, "id", 2);
        IngredientCategory cat3 = new IngredientCategory("해산물", 3);
        setField(cat3, "id", 3);

        when(categoryRepository.findAllById(List.of(3, 1, 2)))
                .thenReturn(List.of(cat1, cat2, cat3));

        // 3, 1, 2 순서로 재정렬
        service.reorderCategories(new CategoryReorderRequest(List.of(3, 1, 2)));

        assertThat(cat3.getSortOrder()).isEqualTo(1);
        assertThat(cat1.getSortOrder()).isEqualTo(2);
        assertThat(cat2.getSortOrder()).isEqualTo(3);
    }

    @Test
    void reorderCategories_invalidId_shouldThrow() {
        when(categoryRepository.findAllById(List.of(1, 999)))
                .thenReturn(List.of(new IngredientCategory("채소", 1)));

        assertThatThrownBy(() -> service.reorderCategories(new CategoryReorderRequest(List.of(1, 999))))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("카테고리를 찾을 수 없습니다");
    }

    private void setField(Object target, String fieldName, Object value) throws Exception {
        Field field = target.getClass().getDeclaredField(fieldName);
        field.setAccessible(true);
        field.set(target, value);
    }
}
