package com.picook.domain.admin.feedback.service;

import com.picook.domain.admin.feedback.dto.*;
import com.picook.domain.feedback.entity.Feedback;
import com.picook.domain.feedback.entity.FeedbackRating;
import com.picook.domain.feedback.entity.FeedbackStatus;
import com.picook.domain.feedback.repository.FeedbackRepository;
import com.picook.domain.recipe.entity.Recipe;
import com.picook.domain.recipe.repository.RecipeRepository;
import com.picook.domain.user.entity.User;
import com.picook.domain.user.repository.UserRepository;
import com.picook.global.exception.BusinessException;
import com.picook.global.util.PageResponse;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@Transactional(readOnly = true)
public class AdminFeedbackService {

    private final FeedbackRepository feedbackRepository;
    private final UserRepository userRepository;
    private final RecipeRepository recipeRepository;

    public AdminFeedbackService(FeedbackRepository feedbackRepository,
                                UserRepository userRepository,
                                RecipeRepository recipeRepository) {
        this.feedbackRepository = feedbackRepository;
        this.userRepository = userRepository;
        this.recipeRepository = recipeRepository;
    }

    public PageResponse<AdminFeedbackListResponse> getFeedbackList(String status, String rating,
                                                                     Integer recipeId, int page, int size) {
        FeedbackStatus feedbackStatus = null;
        if (status != null) {
            try {
                feedbackStatus = FeedbackStatus.fromValue(status);
            } catch (IllegalArgumentException e) {
                throw new BusinessException("INVALID_STATUS", "유효하지 않은 상태입니다: " + status, HttpStatus.BAD_REQUEST);
            }
        }

        FeedbackRating feedbackRating = null;
        if (rating != null) {
            try {
                feedbackRating = FeedbackRating.fromValue(rating);
            } catch (IllegalArgumentException e) {
                throw new BusinessException("INVALID_RATING", "유효하지 않은 평가입니다: " + rating, HttpStatus.BAD_REQUEST);
            }
        }

        var pageRequest = PageRequest.of(page, size, Sort.by("createdAt").descending());
        var feedbackPage = feedbackRepository.searchFeedback(feedbackStatus, feedbackRating, recipeId, pageRequest);
        var responsePage = feedbackPage.map(feedback -> {
            String userDisplayName = userRepository.findById(feedback.getUserId())
                    .map(User::getDisplayName).orElse(null);
            String recipeTitle = recipeRepository.findById(feedback.getRecipeId())
                    .map(Recipe::getTitle).orElse(null);
            return AdminFeedbackListResponse.of(feedback, userDisplayName, recipeTitle);
        });
        return PageResponse.from(responsePage);
    }

    public AdminFeedbackDetailResponse getFeedback(Integer id) {
        Feedback feedback = findOrThrow(id);
        String userDisplayName = userRepository.findById(feedback.getUserId())
                .map(User::getDisplayName).orElse(null);
        String userEmail = userRepository.findById(feedback.getUserId())
                .map(User::getEmail).orElse(null);
        String recipeTitle = recipeRepository.findById(feedback.getRecipeId())
                .map(Recipe::getTitle).orElse(null);
        return AdminFeedbackDetailResponse.of(feedback, userDisplayName, userEmail, recipeTitle);
    }

    @Transactional
    public void changeStatus(Integer id, AdminFeedbackStatusRequest request) {
        Feedback feedback = findOrThrow(id);
        FeedbackStatus newStatus;
        try {
            newStatus = FeedbackStatus.fromValue(request.status());
        } catch (IllegalArgumentException e) {
            throw new BusinessException("INVALID_STATUS", "유효하지 않은 상태입니다: " + request.status(), HttpStatus.BAD_REQUEST);
        }
        feedback.setAdminStatus(newStatus);
    }

    @Transactional
    public void updateNote(Integer id, AdminFeedbackNoteRequest request) {
        Feedback feedback = findOrThrow(id);
        feedback.setAdminNote(request.note());
    }

    public AdminFeedbackSummaryResponse getSummary() {
        long total = feedbackRepository.count();

        Map<String, Long> statusDistribution = new HashMap<>();
        for (FeedbackStatus s : FeedbackStatus.values()) {
            statusDistribution.put(s.getValue(), feedbackRepository.countByAdminStatus(s));
        }

        Map<String, Long> ratingDistribution = new HashMap<>();
        for (FeedbackRating r : FeedbackRating.values()) {
            ratingDistribution.put(r.getValue(), feedbackRepository.countByRating(r));
        }

        // Top difficult recipes
        var topDifficult = feedbackRepository.findTopRecipesByRating(
                FeedbackRating.DIFFICULT, PageRequest.of(0, 5));
        List<AdminFeedbackSummaryResponse.DifficultRecipe> difficultRecipes = topDifficult.stream()
                .map(row -> {
                    Integer rid = (Integer) row[0];
                    Long cnt = (Long) row[1];
                    String title = recipeRepository.findById(rid).map(Recipe::getTitle).orElse("Unknown");
                    return new AdminFeedbackSummaryResponse.DifficultRecipe(rid, title, cnt);
                }).toList();

        return new AdminFeedbackSummaryResponse(total, statusDistribution, ratingDistribution, difficultRecipes);
    }

    private Feedback findOrThrow(Integer id) {
        return feedbackRepository.findById(id)
                .orElseThrow(() -> new BusinessException("FEEDBACK_NOT_FOUND", "피드백을 찾을 수 없습니다", HttpStatus.NOT_FOUND));
    }
}
