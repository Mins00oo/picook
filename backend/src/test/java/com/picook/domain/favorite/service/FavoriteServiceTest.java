package com.picook.domain.favorite.service;

import com.picook.domain.favorite.dto.AddFavoriteRequest;
import com.picook.domain.favorite.dto.FavoriteResponse;
import com.picook.domain.favorite.entity.Favorite;
import com.picook.domain.favorite.repository.FavoriteRepository;
import com.picook.domain.recipe.entity.Recipe;
import com.picook.domain.recipe.repository.RecipeRepository;
import com.picook.global.exception.BusinessException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.lang.reflect.Field;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class FavoriteServiceTest {

    @Mock
    private FavoriteRepository favoriteRepository;

    @Mock
    private RecipeRepository recipeRepository;

    private FavoriteService favoriteService;

    private UUID userId;
    private Recipe recipe;

    @BeforeEach
    void setUp() throws Exception {
        favoriteService = new FavoriteService(favoriteRepository, recipeRepository);
        userId = UUID.randomUUID();
        recipe = new Recipe("김치찌개", "한식", "easy", 30, 2);
        setField(recipe, "id", 1);
    }

    @Test
    void 즐겨찾기_추가_성공() {
        AddFavoriteRequest request = new AddFavoriteRequest(1);
        when(favoriteRepository.existsByUserIdAndRecipeId(userId, 1)).thenReturn(false);
        when(favoriteRepository.countByUserId(userId)).thenReturn(0);
        when(recipeRepository.findByIdAndIsDeletedFalse(1)).thenReturn(Optional.of(recipe));
        when(favoriteRepository.save(any(Favorite.class))).thenAnswer(inv -> inv.getArgument(0));

        FavoriteResponse response = favoriteService.addFavorite(userId, request);

        assertThat(response.recipeId()).isEqualTo(1);
        assertThat(response.recipeTitle()).isEqualTo("김치찌개");
        verify(favoriteRepository).save(any(Favorite.class));
    }

    @Test
    void 즐겨찾기_중복_추가_시_에러() {
        AddFavoriteRequest request = new AddFavoriteRequest(1);
        when(favoriteRepository.existsByUserIdAndRecipeId(userId, 1)).thenReturn(true);

        assertThatThrownBy(() -> favoriteService.addFavorite(userId, request))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("이미 즐겨찾기에 추가된 레시피입니다");
    }

    @Test
    void 즐겨찾기_20개_초과_시_에러() {
        AddFavoriteRequest request = new AddFavoriteRequest(1);
        when(favoriteRepository.existsByUserIdAndRecipeId(userId, 1)).thenReturn(false);
        when(favoriteRepository.countByUserId(userId)).thenReturn(20);

        assertThatThrownBy(() -> favoriteService.addFavorite(userId, request))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("최대 20개");
    }

    @Test
    void 존재하지_않는_레시피_즐겨찾기_추가_시_에러() {
        AddFavoriteRequest request = new AddFavoriteRequest(999);
        when(favoriteRepository.existsByUserIdAndRecipeId(userId, 999)).thenReturn(false);
        when(favoriteRepository.countByUserId(userId)).thenReturn(0);
        when(recipeRepository.findByIdAndIsDeletedFalse(999)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> favoriteService.addFavorite(userId, request))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("레시피를 찾을 수 없습니다");
    }

    @Test
    void 즐겨찾기_삭제_성공() {
        Favorite favorite = new Favorite(userId, recipe);
        when(favoriteRepository.findByIdAndUserId(1, userId)).thenReturn(Optional.of(favorite));

        favoriteService.deleteFavorite(userId, 1);

        verify(favoriteRepository).delete(favorite);
    }

    @Test
    void 타인_즐겨찾기_삭제_방지() {
        when(favoriteRepository.findByIdAndUserId(1, userId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> favoriteService.deleteFavorite(userId, 1))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("즐겨찾기를 찾을 수 없습니다");
    }

    @Test
    void 즐겨찾기_목록_조회() {
        Favorite favorite = new Favorite(userId, recipe);
        setFieldSilent(favorite, "id", 1);
        setFieldSilent(favorite, "createdAt", Instant.now());
        when(favoriteRepository.findByUserIdOrderByCreatedAtDesc(userId)).thenReturn(List.of(favorite));

        List<FavoriteResponse> responses = favoriteService.getFavorites(userId);

        assertThat(responses).hasSize(1);
        assertThat(responses.get(0).recipeTitle()).isEqualTo("김치찌개");
    }

    private static void setField(Object obj, String fieldName, Object value) throws Exception {
        Field field = obj.getClass().getDeclaredField(fieldName);
        field.setAccessible(true);
        field.set(obj, value);
    }

    private static void setFieldSilent(Object obj, String fieldName, Object value) {
        try {
            setField(obj, fieldName, value);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
}
