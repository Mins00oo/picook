package com.picook.domain.fridge.service;

import com.picook.domain.fridge.dto.FridgeIngredientResponse;
import com.picook.domain.fridge.entity.UserFridgeIngredient;
import com.picook.domain.fridge.repository.UserFridgeIngredientRepository;
import com.picook.domain.ingredient.entity.Ingredient;
import com.picook.domain.ingredient.repository.IngredientRepository;
import com.picook.global.exception.BusinessException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class FridgeService {

    private final UserFridgeIngredientRepository fridgeRepository;
    private final IngredientRepository ingredientRepository;

    public FridgeService(UserFridgeIngredientRepository fridgeRepository,
                         IngredientRepository ingredientRepository) {
        this.fridgeRepository = fridgeRepository;
        this.ingredientRepository = ingredientRepository;
    }

    public List<FridgeIngredientResponse> list(UUID userId) {
        return fridgeRepository.findByUserIdOrderByAddedAtDesc(userId).stream()
                .map(FridgeIngredientResponse::of)
                .toList();
    }

    @Transactional
    public FridgeIngredientResponse add(UUID userId, Integer ingredientId) {
        if (fridgeRepository.existsByUserIdAndIngredientId(userId, ingredientId)) {
            throw new BusinessException("FRIDGE_DUPLICATE",
                    "이미 냉장고에 있는 재료입니다", HttpStatus.CONFLICT);
        }
        Ingredient ingredient = ingredientRepository.findById(ingredientId)
                .orElseThrow(() -> new BusinessException("INGREDIENT_NOT_FOUND",
                        "재료를 찾을 수 없습니다", HttpStatus.NOT_FOUND));

        UserFridgeIngredient saved = fridgeRepository.save(new UserFridgeIngredient(userId, ingredient));
        return FridgeIngredientResponse.of(saved);
    }

    @Transactional
    public void remove(UUID userId, Integer ingredientId) {
        int deleted = fridgeRepository.deleteByUserIdAndIngredientId(userId, ingredientId);
        if (deleted == 0) {
            throw new BusinessException("FRIDGE_NOT_FOUND",
                    "냉장고에 없는 재료입니다", HttpStatus.NOT_FOUND);
        }
    }

    /** 현재 냉장고 상태를 입력 목록과 동일하게 치환 */
    @Transactional
    public List<FridgeIngredientResponse> bulkSet(UUID userId, List<Integer> ingredientIds) {
        Set<Integer> target = new HashSet<>(ingredientIds);

        List<UserFridgeIngredient> current = fridgeRepository.findByUserIdOrderByAddedAtDesc(userId);
        Set<Integer> currentIds = current.stream()
                .map(f -> f.getIngredient().getId())
                .collect(Collectors.toSet());

        // 삭제 대상
        Set<Integer> toRemove = new HashSet<>(currentIds);
        toRemove.removeAll(target);
        if (!toRemove.isEmpty()) {
            fridgeRepository.deleteByUserIdAndIngredientIdIn(userId, toRemove);
        }

        // 추가 대상
        Set<Integer> toAdd = new HashSet<>(target);
        toAdd.removeAll(currentIds);
        if (!toAdd.isEmpty()) {
            List<Ingredient> ingredients = ingredientRepository.findAllByIdIn(List.copyOf(toAdd));
            if (ingredients.size() != toAdd.size()) {
                throw new BusinessException("INGREDIENT_NOT_FOUND",
                        "일부 재료를 찾을 수 없습니다", HttpStatus.BAD_REQUEST);
            }
            for (Ingredient ing : ingredients) {
                fridgeRepository.save(new UserFridgeIngredient(userId, ing));
            }
        }

        return list(userId);
    }
}
