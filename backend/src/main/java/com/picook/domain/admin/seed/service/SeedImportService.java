package com.picook.domain.admin.seed.service;

import com.picook.domain.admin.seed.dto.SeedImportResponse;
import com.picook.domain.admin.seed.dto.SeedImportResponse.SeedError;
import com.picook.domain.admin.seed.dto.SeedImportResponse.SheetStat;
import com.picook.domain.ingredient.entity.Ingredient;
import com.picook.domain.ingredient.entity.IngredientCategory;
import com.picook.domain.ingredient.entity.IngredientSubcategory;
import com.picook.domain.ingredient.entity.UnitConversion;
import com.picook.domain.ingredient.repository.IngredientCategoryRepository;
import com.picook.domain.ingredient.repository.IngredientRepository;
import com.picook.domain.ingredient.repository.IngredientSubcategoryRepository;
import com.picook.domain.ingredient.repository.UnitConversionRepository;
import com.picook.domain.recipe.entity.Recipe;
import com.picook.domain.recipe.entity.RecipeIngredient;
import com.picook.domain.recipe.entity.RecipeStep;
import com.picook.domain.recipe.repository.RecipeIngredientRepository;
import com.picook.domain.recipe.repository.RecipeRepository;
import com.picook.domain.recipe.repository.RecipeStepRepository;
import com.picook.global.exception.BusinessException;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * 데이터 파이프라인 결과 (picook_seed.xlsx) 일괄 업로드 서비스.
 *
 * 처리 순서 (FK 의존):
 *   1. categories
 *   2. ingredients (+ synonyms)
 *   3. unit_conversions
 *   4. recipes
 *   5. recipe_ingredients
 *   6. recipe_steps
 *
 * 모든 작업은 단일 트랜잭션 — 어느 시트라도 치명 에러 시 전부 롤백.
 * dryRun=true 면 INSERT 안 함 (검증만).
 */
@Service
public class SeedImportService {

    private final IngredientCategoryRepository categoryRepository;
    private final IngredientSubcategoryRepository subcategoryRepository;
    private final IngredientRepository ingredientRepository;
    private final UnitConversionRepository unitConversionRepository;
    private final RecipeRepository recipeRepository;
    private final RecipeIngredientRepository recipeIngredientRepository;
    private final RecipeStepRepository recipeStepRepository;

    public SeedImportService(IngredientCategoryRepository categoryRepository,
                             IngredientSubcategoryRepository subcategoryRepository,
                             IngredientRepository ingredientRepository,
                             UnitConversionRepository unitConversionRepository,
                             RecipeRepository recipeRepository,
                             RecipeIngredientRepository recipeIngredientRepository,
                             RecipeStepRepository recipeStepRepository) {
        this.categoryRepository = categoryRepository;
        this.subcategoryRepository = subcategoryRepository;
        this.ingredientRepository = ingredientRepository;
        this.unitConversionRepository = unitConversionRepository;
        this.recipeRepository = recipeRepository;
        this.recipeIngredientRepository = recipeIngredientRepository;
        this.recipeStepRepository = recipeStepRepository;
    }

    @Transactional
    @CacheEvict(value = {"ingredients", "categories"}, allEntries = true)
    public SeedImportResponse uploadFromExcel(MultipartFile file, boolean dryRun) {
        if (file.isEmpty()) {
            throw new BusinessException("EMPTY_FILE", "파일이 비어있습니다", HttpStatus.BAD_REQUEST);
        }

        List<SeedError> errors = new ArrayList<>();
        SheetStat statCat = SheetStat.empty();
        SheetStat statIng = SheetStat.empty();
        SheetStat statSyn = SheetStat.empty();
        SheetStat statUnit = SheetStat.empty();
        SheetStat statRec = SheetStat.empty();
        SheetStat statRecIng = SheetStat.empty();
        SheetStat statRecStep = SheetStat.empty();

        try (Workbook wb = new XSSFWorkbook(file.getInputStream())) {

            // ===== 1. categories =====
            Sheet catSheet = requireSheet(wb, "categories");
            Map<String, IngredientCategory> categoryByName = new LinkedHashMap<>();
            statCat = importCategories(catSheet, categoryByName, errors, dryRun);

            // ===== 1.5 subcategories (선택 시트, 있으면 처리) =====
            Map<String, IngredientSubcategory> subcategoryByCatAndName = new LinkedHashMap<>();
            if (wb.getSheet("subcategories") != null) {
                importSubcategories(wb.getSheet("subcategories"),
                        categoryByName, subcategoryByCatAndName, errors, dryRun);
            }

            // ===== 2. ingredients (+ synonyms + parent) =====
            Sheet ingSheet = requireSheet(wb, "ingredients");
            Map<String, Ingredient> ingredientByName = new LinkedHashMap<>();
            // (name, parent_name) 쌍 저장 → 모든 ingredient INSERT 후 2-pass 로 parent 연결
            List<String[]> parentLinks = new ArrayList<>();
            int[] synStat = new int[]{0, 0, 0}; // total, success, failed
            statIng = importIngredients(ingSheet, categoryByName, subcategoryByCatAndName,
                    ingredientByName, parentLinks, errors, dryRun, synStat);
            statSyn = new SheetStat(synStat[0], synStat[1], synStat[2]);

            // ===== 2.5 parent_id 연결 (2-pass) =====
            if (!dryRun) {
                for (String[] link : parentLinks) {
                    String childName = link[0];
                    String parentName = link[1];
                    Ingredient child = ingredientByName.get(childName);
                    Ingredient parent = ingredientByName.get(parentName);
                    if (child != null && parent != null) {
                        child.setParent(parent);
                        ingredientRepository.save(child);
                    } else if (parent == null) {
                        errors.add(new SeedError("ingredients", 0,
                                "parent 재료 '" + parentName + "' 없음 (child='" + childName + "')"));
                    }
                }
            }

            // ===== 3. unit_conversions =====
            if (wb.getSheet("unit_conversions") != null) {
                statUnit = importUnitConversions(wb.getSheet("unit_conversions"),
                        ingredientByName, errors, dryRun);
            }

            // ===== 4. recipes =====
            Sheet recSheet = requireSheet(wb, "recipes");
            Map<String, Recipe> recipeByTempId = new LinkedHashMap<>();
            statRec = importRecipes(recSheet, recipeByTempId, errors, dryRun);

            // ===== 5. recipe_ingredients =====
            if (wb.getSheet("recipe_ingredients") != null) {
                statRecIng = importRecipeIngredients(wb.getSheet("recipe_ingredients"),
                        recipeByTempId, ingredientByName, errors, dryRun);
            }

            // ===== 6. recipe_steps =====
            if (wb.getSheet("recipe_steps") != null) {
                statRecStep = importRecipeSteps(wb.getSheet("recipe_steps"),
                        recipeByTempId, errors, dryRun);
            }

        } catch (IOException e) {
            throw new BusinessException("FILE_PARSE_ERROR",
                    "엑셀 파일 파싱 실패: " + e.getMessage(), HttpStatus.BAD_REQUEST);
        }

        return new SeedImportResponse(
                dryRun, statCat, statIng, statSyn, statUnit,
                statRec, statRecIng, statRecStep,
                errors.size(), errors
        );
    }

    // ---------- 시트별 처리 ----------

    private SheetStat importCategories(Sheet sheet,
                                        Map<String, IngredientCategory> byName,
                                        List<SeedError> errors,
                                        boolean dryRun) {
        int total = 0, success = 0, failed = 0;
        for (int i = 1; i <= sheet.getLastRowNum(); i++) {
            Row row = sheet.getRow(i);
            if (row == null) continue;
            total++;
            int rowNum = i + 1;
            try {
                // 컬럼: id | name | sort_order | emoji
                String name = req(row.getCell(1), "name", "categories", rowNum);
                Integer sortOrder = optInt(row.getCell(2));
                String emoji = optStr(row.getCell(3));

                if (byName.containsKey(name)) {
                    errors.add(new SeedError("categories", rowNum, "엑셀 내 중복 name: " + name));
                    failed++; continue;
                }

                int order = sortOrder != null ? sortOrder : (byName.size() + 1);
                IngredientCategory cat = new IngredientCategory(name, order);
                cat.setEmoji(emoji);
                if (!dryRun) {
                    cat = categoryRepository.save(cat);
                }
                byName.put(name, cat);
                success++;
            } catch (Exception e) {
                errors.add(new SeedError("categories", rowNum, e.getMessage()));
                failed++;
            }
        }
        return new SheetStat(total, success, failed);
    }

    private SheetStat importSubcategories(Sheet sheet,
                                            Map<String, IngredientCategory> categoryByName,
                                            Map<String, IngredientSubcategory> outBySubKey,
                                            List<SeedError> errors,
                                            boolean dryRun) {
        int total = 0, success = 0, failed = 0;
        for (int i = 1; i <= sheet.getLastRowNum(); i++) {
            Row row = sheet.getRow(i);
            if (row == null) continue;
            total++;
            int rowNum = i + 1;
            try {
                // 컬럼: category | name | sort_order
                String catName = req(row.getCell(0), "category", "subcategories", rowNum);
                String name = req(row.getCell(1), "name", "subcategories", rowNum);
                Integer sortOrder = optInt(row.getCell(2));
                if (sortOrder == null) sortOrder = 0;

                IngredientCategory cat = categoryByName.get(catName);
                if (cat == null) {
                    errors.add(new SeedError("subcategories", rowNum,
                            "존재하지 않는 카테고리: " + catName));
                    failed++; continue;
                }

                String key = catName + "|" + name;
                if (outBySubKey.containsKey(key)) {
                    errors.add(new SeedError("subcategories", rowNum,
                            "엑셀 내 중복: " + key));
                    failed++; continue;
                }

                IngredientSubcategory sub = new IngredientSubcategory(cat, name, null, sortOrder);
                if (!dryRun) sub = subcategoryRepository.save(sub);
                outBySubKey.put(key, sub);
                success++;
            } catch (Exception e) {
                errors.add(new SeedError("subcategories", rowNum, e.getMessage()));
                failed++;
            }
        }
        return new SheetStat(total, success, failed);
    }

    private SheetStat importIngredients(Sheet sheet,
                                         Map<String, IngredientCategory> categoryByName,
                                         Map<String, IngredientSubcategory> subcatByKey,
                                         Map<String, Ingredient> byName,
                                         List<String[]> parentLinks,
                                         List<SeedError> errors,
                                         boolean dryRun,
                                         int[] synStat) {
        int total = 0, success = 0, failed = 0;
        for (int i = 1; i <= sheet.getLastRowNum(); i++) {
            Row row = sheet.getRow(i);
            if (row == null) continue;
            total++;
            int rowNum = i + 1;
            try {
                // 컬럼: name | category | subcategory | parent_name | is_seasoning | default_unit | aliases
                String name = req(row.getCell(0), "name", "ingredients", rowNum);
                String catName = req(row.getCell(1), "category", "ingredients", rowNum);
                String subName = optStr(row.getCell(2));
                String parentName = optStr(row.getCell(3));
                boolean isSeasoning = optBool(row.getCell(4));
                // default_unit (col 5) — Ingredient 엔티티에 컬럼 없음. 무시
                String aliasesStr = optStr(row.getCell(6));

                IngredientCategory cat = categoryByName.get(catName);
                if (cat == null) {
                    errors.add(new SeedError("ingredients", rowNum,
                            "존재하지 않는 카테고리: " + catName));
                    failed++; continue;
                }
                if (byName.containsKey(name)) {
                    errors.add(new SeedError("ingredients", rowNum,
                            "엑셀 내 중복 name: " + name));
                    failed++; continue;
                }

                Ingredient ing = new Ingredient(name, cat);
                ing.setIsSeasoning(isSeasoning);

                // subcategory 연결
                if (subName != null && !subName.isBlank()) {
                    IngredientSubcategory sub = subcatByKey.get(catName + "|" + subName);
                    if (sub == null) {
                        errors.add(new SeedError("ingredients", rowNum,
                                "subcategory '" + subName + "' (cat=" + catName + ") 없음"));
                        // 그래도 ingredient 자체는 생성 (subcat 없이)
                    } else {
                        ing.setSubcategory(sub);
                    }
                }

                List<String> synonymList = new ArrayList<>();
                if (aliasesStr != null && !aliasesStr.isBlank()) {
                    for (String syn : aliasesStr.split(",")) {
                        String t = syn.trim();
                        if (!t.isEmpty() && !t.equals(name)) {
                            ing.addSynonym(t);
                            synonymList.add(t);
                            synStat[0]++; synStat[1]++;
                        }
                    }
                }

                if (!dryRun) {
                    ing = ingredientRepository.save(ing);
                }
                byName.put(name, ing);
                // recipe_ingredients 검색 시 alias 로도 찾기 (충돌 방지: putIfAbsent)
                for (String syn : synonymList) {
                    byName.putIfAbsent(syn, ing);
                }

                // parent_name → 2-pass 에서 연결 (지금은 다른 ingredient 가 아직 INSERT 안 됐을 수 있음)
                if (parentName != null && !parentName.isBlank()) {
                    parentLinks.add(new String[]{name, parentName});
                }

                success++;
            } catch (Exception e) {
                errors.add(new SeedError("ingredients", rowNum, e.getMessage()));
                failed++;
            }
        }
        return new SheetStat(total, success, failed);
    }

    private SheetStat importUnitConversions(Sheet sheet,
                                             Map<String, Ingredient> ingByName,
                                             List<SeedError> errors,
                                             boolean dryRun) {
        int total = 0, success = 0, failed = 0;
        for (int i = 1; i <= sheet.getLastRowNum(); i++) {
            Row row = sheet.getRow(i);
            if (row == null) continue;
            total++;
            int rowNum = i + 1;
            try {
                // 컬럼: ingredient_name | from_unit | to_unit | conversion
                String ingName = req(row.getCell(0), "ingredient_name", "unit_conversions", rowNum);
                String fromUnit = req(row.getCell(1), "from_unit", "unit_conversions", rowNum);
                String toUnit = req(row.getCell(2), "to_unit", "unit_conversions", rowNum);
                BigDecimal conversion = optBigDec(row.getCell(3));
                if (conversion == null) {
                    errors.add(new SeedError("unit_conversions", rowNum, "conversion 비어있음"));
                    failed++; continue;
                }

                Ingredient ing = ingByName.get(ingName);
                if (ing == null) {
                    errors.add(new SeedError("unit_conversions", rowNum,
                            "존재하지 않는 재료: " + ingName));
                    failed++; continue;
                }

                if (!dryRun) {
                    unitConversionRepository.save(new UnitConversion(ing, fromUnit, toUnit, conversion));
                }
                success++;
            } catch (Exception e) {
                errors.add(new SeedError("unit_conversions", rowNum, e.getMessage()));
                failed++;
            }
        }
        return new SheetStat(total, success, failed);
    }

    private SheetStat importRecipes(Sheet sheet,
                                     Map<String, Recipe> byTempId,
                                     List<SeedError> errors,
                                     boolean dryRun) {
        int total = 0, success = 0, failed = 0;
        for (int i = 1; i <= sheet.getLastRowNum(); i++) {
            Row row = sheet.getRow(i);
            if (row == null) continue;
            total++;
            int rowNum = i + 1;
            try {
                // 컬럼: temp_id | title | category | difficulty | cooking_time | servings | calories | thumbnail | tips | status
                String tempId = req(row.getCell(0), "temp_id", "recipes", rowNum);
                String title = req(row.getCell(1), "title", "recipes", rowNum);
                String category = req(row.getCell(2), "category", "recipes", rowNum);
                String difficulty = req(row.getCell(3), "difficulty", "recipes", rowNum);
                Integer cookingTime = optInt(row.getCell(4));
                Integer servings = optInt(row.getCell(5));
                Integer calories = optInt(row.getCell(6));
                String thumbnail = optStr(row.getCell(7));
                String tips = optStr(row.getCell(8));
                String status = optStr(row.getCell(9));

                if (cookingTime == null) {
                    errors.add(new SeedError("recipes", rowNum, "cooking_time_minutes 비어있음"));
                    failed++; continue;
                }
                if (servings == null) servings = 2;

                if (byTempId.containsKey(tempId)) {
                    errors.add(new SeedError("recipes", rowNum,
                            "엑셀 내 중복 temp_id: " + tempId));
                    failed++; continue;
                }

                Recipe r = new Recipe(title, category, difficulty, cookingTime, servings);
                r.setCalories(calories);
                r.setThumbnailUrl(thumbnail);
                r.setTips(tips);
                if (status != null && !status.isBlank()) r.setStatus(status);

                if (!dryRun) r = recipeRepository.save(r);
                byTempId.put(tempId, r);
                success++;
            } catch (Exception e) {
                errors.add(new SeedError("recipes", rowNum, e.getMessage()));
                failed++;
            }
        }
        return new SheetStat(total, success, failed);
    }

    private SheetStat importRecipeIngredients(Sheet sheet,
                                                Map<String, Recipe> recipeByTempId,
                                                Map<String, Ingredient> ingByName,
                                                List<SeedError> errors,
                                                boolean dryRun) {
        int total = 0, success = 0, failed = 0;
        for (int i = 1; i <= sheet.getLastRowNum(); i++) {
            Row row = sheet.getRow(i);
            if (row == null) continue;

            int rowNum = i + 1;
            try {
                // 컬럼: recipe_temp_id | ingredient_name | amount | unit | is_required | sort_order
                String recTempId = req(row.getCell(0), "recipe_temp_id", "recipe_ingredients", rowNum);
                String ingName = req(row.getCell(1), "ingredient_name", "recipe_ingredients", rowNum);

                // SKIP — 의도적 제외 재료 (D12: 물/얼음/쌀뜨물 등)
                // total/success/failed 어디에도 카운트 안 함 (silent)
                if (shouldSkip(ingName)) continue;

                total++;

                BigDecimal amount = optBigDec(row.getCell(2));
                String unit = optStr(row.getCell(3));
                boolean isRequired = optBool(row.getCell(4));
                Integer sortOrder = optInt(row.getCell(5));
                if (sortOrder == null) sortOrder = 0;

                Recipe recipe = recipeByTempId.get(recTempId);
                if (recipe == null) {
                    errors.add(new SeedError("recipe_ingredients", rowNum,
                            "존재하지 않는 recipe_temp_id: " + recTempId));
                    failed++; continue;
                }
                Ingredient ing = resolveIngredient(ingName, ingByName);
                if (ing == null) {
                    errors.add(new SeedError("recipe_ingredients", rowNum,
                            "존재하지 않는 재료: " + ingName));
                    failed++; continue;
                }

                if (!dryRun) {
                    RecipeIngredient ri = new RecipeIngredient(recipe, ing, amount, unit, isRequired, sortOrder);
                    recipeIngredientRepository.save(ri);
                }
                success++;
            } catch (Exception e) {
                errors.add(new SeedError("recipe_ingredients", rowNum, e.getMessage()));
                failed++;
            }
        }
        return new SheetStat(total, success, failed);
    }

    private SheetStat importRecipeSteps(Sheet sheet,
                                          Map<String, Recipe> recipeByTempId,
                                          List<SeedError> errors,
                                          boolean dryRun) {
        int total = 0, success = 0, failed = 0;
        for (int i = 1; i <= sheet.getLastRowNum(); i++) {
            Row row = sheet.getRow(i);
            if (row == null) continue;
            total++;
            int rowNum = i + 1;
            try {
                // 컬럼: recipe_temp_id | step_number | description | image_url | tip
                String recTempId = req(row.getCell(0), "recipe_temp_id", "recipe_steps", rowNum);
                Integer stepNum = optInt(row.getCell(1));
                String desc = req(row.getCell(2), "description", "recipe_steps", rowNum);
                String imageUrl = optStr(row.getCell(3));
                String tip = optStr(row.getCell(4));

                if (stepNum == null) stepNum = 0;

                Recipe recipe = recipeByTempId.get(recTempId);
                if (recipe == null) {
                    errors.add(new SeedError("recipe_steps", rowNum,
                            "존재하지 않는 recipe_temp_id: " + recTempId));
                    failed++; continue;
                }

                if (!dryRun) {
                    RecipeStep s = new RecipeStep(recipe, stepNum, desc, imageUrl, tip);
                    recipeStepRepository.save(s);
                }
                success++;
            } catch (Exception e) {
                errors.add(new SeedError("recipe_steps", rowNum, e.getMessage()));
                failed++;
            }
        }
        return new SheetStat(total, success, failed);
    }

    // ---------- 재료 해석 (alias / 괄호 / 부위 / 처리상태 / SKIP) ----------

    /**
     * 의도적 제외 재료 (D12). 매칭 실패로 카운트 하지 않고 silent skip.
     */
    private static final java.util.Set<String> SKIP_NAMES = java.util.Set.of(
            "물", "얼음", "물 또는 쌀뜨물", "찬물", "뜨거운 물", "끓는 물", "쌀뜨물"
    );

    /**
     * 처리 상태 prefix 정규식 (재료 앞에 붙는 가공 표기).
     * "잘게 다진 양파" → "양파" / "불린 당면" → "당면" / "깐 새우" → "새우"
     */
    private static final java.util.regex.Pattern STATE_PREFIX = java.util.regex.Pattern.compile(
            "^(잘게\\s*다진|다진|채\\s*썬|썬|얇게\\s*저민|저민|얇게\\s*슬라이스(한|된)?|" +
            "불린|삶은|구운|볶은|찐|데친|손질한?|깐|냉동|냉장|얇게|두껍게|굵게|곱게)\\s*"
    );

    static boolean shouldSkip(String rawName) {
        if (rawName == null) return false;
        String t = rawName.trim();
        if (SKIP_NAMES.contains(t)) return true;
        // "물 또는 ..." 같은 변형도 silent skip
        return t.startsWith("물 또는") || t.startsWith("얼음 또는");
    }

    static Ingredient resolveIngredient(String rawName, Map<String, Ingredient> byName) {
        if (rawName == null) return null;
        String name = rawName.trim();

        // 1. 정확 매칭 (main name + 모든 alias)
        Ingredient hit = byName.get(name);
        if (hit != null) return hit;

        // 2. 괄호 표기 제거: "돼지고기(앞다리살 또는 목살)" / "X (얇게 슬라이스)"
        String paren = name.replaceAll("\\(.*?\\)", "").trim();
        if (!paren.equals(name)) {
            hit = byName.get(paren);
            if (hit != null) return hit;
        }

        // 3. 띄어쓰기 제거: "다진 마늘" → "다진마늘"
        String noSpace = name.replaceAll("\\s+", "");
        hit = byName.get(noSpace);
        if (hit != null) return hit;

        // 4. 괄호 + 띄어쓰기 둘 다
        String parenNoSpace = paren.replaceAll("\\s+", "");
        hit = byName.get(parenNoSpace);
        if (hit != null) return hit;

        // 5. 처리 상태 prefix 제거: "잘게 다진 당근" → "당근", "불린 당면" → "당면"
        String afterPrefix = STATE_PREFIX.matcher(paren).replaceFirst("").trim();
        if (!afterPrefix.equals(paren) && !afterPrefix.isEmpty()) {
            hit = byName.get(afterPrefix);
            if (hit != null) return hit;
            hit = byName.get(afterPrefix.replaceAll("\\s+", ""));
            if (hit != null) return hit;
        }

        // 6. 첫 단어로 매핑 (부위/용도 표기): "돼지고기 목살" → "돼지고기"
        //                                "닭볶음탕용 닭" → "닭볶음탕용" 안 됨, "닭"이 첫 X 다른 처리
        String firstWord = paren.split("\\s+", 2)[0];
        if (!firstWord.equals(paren) && firstWord.length() >= 2) {
            hit = byName.get(firstWord);
            if (hit != null) return hit;
        }

        // 7. 마지막 단어 (예: "닭볶음탕용 닭" → "닭")
        // 1글자도 시도 (byName 정확 일치 — false positive 적음)
        String[] words = paren.split("\\s+");
        if (words.length >= 2) {
            String lastWord = words[words.length - 1];
            hit = byName.get(lastWord);
            if (hit != null) return hit;
        }

        return null;
    }

    // ---------- 셀 헬퍼 ----------

    private static Sheet requireSheet(Workbook wb, String name) {
        Sheet s = wb.getSheet(name);
        if (s == null) {
            throw new BusinessException("SHEET_MISSING",
                    "필수 시트가 없습니다: " + name, HttpStatus.BAD_REQUEST);
        }
        return s;
    }

    private static String req(Cell c, String field, String sheet, int row) {
        String v = optStr(c);
        if (v == null || v.isBlank()) {
            throw new IllegalArgumentException(field + " 비어있음");
        }
        return v;
    }

    private static String optStr(Cell c) {
        if (c == null) return null;
        return switch (c.getCellType()) {
            case STRING -> {
                String s = c.getStringCellValue();
                yield (s == null || s.isBlank()) ? null : s.trim();
            }
            case NUMERIC -> {
                double d = c.getNumericCellValue();
                if (d == Math.floor(d) && !Double.isInfinite(d)) yield String.valueOf((long) d);
                yield String.valueOf(d);
            }
            case BOOLEAN -> String.valueOf(c.getBooleanCellValue());
            case BLANK -> null;
            default -> {
                String s = c.toString().trim();
                yield s.isBlank() ? null : s;
            }
        };
    }

    private static Integer optInt(Cell c) {
        if (c == null) return null;
        return switch (c.getCellType()) {
            case NUMERIC -> (int) c.getNumericCellValue();
            case STRING -> {
                String s = c.getStringCellValue().trim();
                try { yield s.isEmpty() ? null : Integer.parseInt(s); }
                catch (NumberFormatException e) { yield null; }
            }
            default -> null;
        };
    }

    private static BigDecimal optBigDec(Cell c) {
        if (c == null) return null;
        return switch (c.getCellType()) {
            case NUMERIC -> BigDecimal.valueOf(c.getNumericCellValue());
            case STRING -> {
                String s = c.getStringCellValue().trim();
                try { yield s.isEmpty() ? null : new BigDecimal(s); }
                catch (NumberFormatException e) { yield null; }
            }
            default -> null;
        };
    }

    private static boolean optBool(Cell c) {
        if (c == null) return false;
        return switch (c.getCellType()) {
            case BOOLEAN -> c.getBooleanCellValue();
            case STRING -> {
                String s = c.getStringCellValue().trim().toLowerCase();
                yield "true".equals(s) || "yes".equals(s) || "y".equals(s) || "1".equals(s);
            }
            case NUMERIC -> c.getNumericCellValue() != 0;
            default -> false;
        };
    }
}
