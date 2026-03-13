package com.picook.domain.searchhistory.service;

import com.picook.domain.searchhistory.dto.SearchHistoryResponse;
import com.picook.domain.searchhistory.entity.SearchHistory;
import com.picook.domain.searchhistory.repository.SearchHistoryRepository;
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
class SearchHistoryServiceTest {

    @Mock
    private SearchHistoryRepository searchHistoryRepository;

    private SearchHistoryService searchHistoryService;

    private UUID userId;

    @BeforeEach
    void setUp() {
        searchHistoryService = new SearchHistoryService(searchHistoryRepository);
        userId = UUID.randomUUID();
    }

    @Test
    void 검색기록_저장_성공() {
        List<Integer> ingredientIds = List.of(1, 2, 3);
        String filters = "{\"maxTime\":30}";

        searchHistoryService.saveSearchHistory(userId, ingredientIds, filters, 5);

        verify(searchHistoryRepository).save(any(SearchHistory.class));
    }

    @Test
    void 검색기록_조회() {
        SearchHistory history = new SearchHistory(userId, List.of(1, 2), null, 3);
        setFieldSilent(history, "id", 1);
        setFieldSilent(history, "createdAt", Instant.now());
        when(searchHistoryRepository.findByUserIdOrderByCreatedAtDesc(userId))
                .thenReturn(List.of(history));

        List<SearchHistoryResponse> responses = searchHistoryService.getSearchHistory(userId);

        assertThat(responses).hasSize(1);
        assertThat(responses.get(0).ingredientIds()).containsExactly(1, 2);
        assertThat(responses.get(0).resultCount()).isEqualTo(3);
    }

    @Test
    void 검색기록_개별_삭제_성공() {
        SearchHistory history = new SearchHistory(userId, List.of(1), null, 1);
        when(searchHistoryRepository.findByIdAndUserId(1, userId)).thenReturn(Optional.of(history));

        searchHistoryService.deleteSearchHistory(userId, 1);

        verify(searchHistoryRepository).delete(history);
    }

    @Test
    void 타인_검색기록_삭제_방지() {
        when(searchHistoryRepository.findByIdAndUserId(1, userId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> searchHistoryService.deleteSearchHistory(userId, 1))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("검색 기록을 찾을 수 없습니다");
    }

    @Test
    void 검색기록_전체_삭제_성공() {
        searchHistoryService.deleteAllSearchHistory(userId);

        verify(searchHistoryRepository).deleteByUserId(userId);
    }

    private static void setFieldSilent(Object obj, String fieldName, Object value) {
        try {
            Field field = obj.getClass().getDeclaredField(fieldName);
            field.setAccessible(true);
            field.set(obj, value);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
}
