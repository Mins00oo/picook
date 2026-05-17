package com.picook.domain.recipe.service;

import com.picook.domain.recipe.dto.RecipeSummaryResponse;
import com.picook.domain.recipe.dto.TimeRecipeResponse;
import com.picook.domain.recipe.entity.Recipe;
import com.picook.domain.recipe.repository.RecipeRepository;
import com.picook.global.util.PageResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class RecipeServiceTest {

    @Mock
    private RecipeRepository recipeRepository;

    private RecipeService recipeService;

    @BeforeEach
    void setUp() {
        recipeService = new RecipeService(recipeRepository);
    }

    @Test
    void recommendByTimeUsesRequestedLimit() {
        when(recipeRepository.findTopByMealTime(eq("breakfast"), any(Pageable.class)))
                .thenReturn(List.of());

        recipeService.recommendByTime("breakfast", 30, null);

        ArgumentCaptor<Pageable> captor = ArgumentCaptor.forClass(Pageable.class);
        verify(recipeRepository).findTopByMealTime(eq("breakfast"), captor.capture());
        assertThat(captor.getValue().getPageNumber()).isZero();
        assertThat(captor.getValue().getPageSize()).isEqualTo(30);
    }

    @Test
    void recommendByTimeCapsRequestedLimit() {
        when(recipeRepository.findTopByMealTime(eq("lunch"), any(Pageable.class)))
                .thenReturn(List.of());

        recipeService.recommendByTime("lunch", 999, null);

        ArgumentCaptor<Pageable> captor = ArgumentCaptor.forClass(Pageable.class);
        verify(recipeRepository).findTopByMealTime(eq("lunch"), captor.capture());
        assertThat(captor.getValue().getPageSize()).isEqualTo(50);
    }

    @Test
    void recommendByTimeWithSeedFetchesCandidatePoolAndReturnsStableSlice() {
        when(recipeRepository.findPublishedByMealTime("breakfast"))
                .thenReturn(numberedRecipes(12));

        List<TimeRecipeResponse> first = recipeService.recommendByTime("breakfast", 5, "session-a");
        List<TimeRecipeResponse> more = recipeService.recommendByTime("breakfast", 12, "session-a");
        List<TimeRecipeResponse> differentSeed = recipeService.recommendByTime("breakfast", 5, "session-b");

        verify(recipeRepository, org.mockito.Mockito.times(3)).findPublishedByMealTime("breakfast");
        assertThat(first).hasSize(5);
        assertThat(first).extracting(TimeRecipeResponse::title)
                .containsExactlyElementsOf(more.stream().limit(5).map(TimeRecipeResponse::title).toList());
        assertThat(first).extracting(TimeRecipeResponse::title)
                .isNotEqualTo(differentSeed.stream().map(TimeRecipeResponse::title).toList());
    }

    @Test
    void searchRecipesAppliesCategoryKeywordAndCapsPageSize() {
        when(recipeRepository.searchRecipes(
                eq("published"),
                eq("korean"),
                isNull(),
                eq("kimchi"),
                any(Pageable.class)
        )).thenReturn(new PageImpl<>(List.of(), PageRequest.of(0, 50), 0));

        PageResponse<RecipeSummaryResponse> response =
                recipeService.searchRecipes(" korean ", " kimchi ", -1, 500);

        ArgumentCaptor<Pageable> captor = ArgumentCaptor.forClass(Pageable.class);
        verify(recipeRepository).searchRecipes(
                eq("published"),
                eq("korean"),
                isNull(),
                eq("kimchi"),
                captor.capture()
        );
        assertThat(captor.getValue().getPageNumber()).isZero();
        assertThat(captor.getValue().getPageSize()).isEqualTo(50);
        assertThat(response.page()).isZero();
        assertThat(response.size()).isEqualTo(50);
    }

    @Test
    void searchRecipesTreatsBlankFiltersAsAbsent() {
        when(recipeRepository.searchRecipes(
                eq("published"),
                isNull(),
                isNull(),
                isNull(),
                any(Pageable.class)
        )).thenReturn(new PageImpl<>(List.of(), PageRequest.of(0, 20), 0));

        recipeService.searchRecipes(" ", " ", 0, 20);

        verify(recipeRepository).searchRecipes(
                eq("published"),
                isNull(),
                isNull(),
                isNull(),
                any(Pageable.class)
        );
    }

    private List<Recipe> numberedRecipes(int count) {
        return java.util.stream.IntStream.rangeClosed(1, count)
                .mapToObj(i -> new Recipe("recipe-" + i, "korean", "easy", 10 + i, 2))
                .toList();
    }
}
