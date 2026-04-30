package com.picook.domain.admin.seed.service;

import com.picook.domain.ingredient.entity.Ingredient;
import com.picook.domain.ingredient.entity.IngredientCategory;
import com.picook.domain.ingredient.entity.UnitConversion;
import com.picook.domain.ingredient.repository.IngredientCategoryRepository;
import com.picook.domain.ingredient.repository.IngredientRepository;
import com.picook.domain.ingredient.repository.UnitConversionRepository;
import com.picook.domain.recipe.entity.Recipe;
import com.picook.domain.recipe.entity.RecipeIngredient;
import com.picook.domain.recipe.entity.RecipeStep;
import com.picook.domain.recipe.repository.RecipeRepository;
import com.picook.global.exception.BusinessException;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.List;

/**
 * 시드 데이터 엑셀 다운로드 (운영 후 데이터 받아 수정/재업로드용).
 *
 * 업로드 엑셀과 동일 형식 (7시트):
 *   categories, ingredients, unit_conversions, recipes, recipe_ingredients, recipe_steps, metadata
 */
@Service
public class SeedExportService {

    private final IngredientCategoryRepository categoryRepository;
    private final IngredientRepository ingredientRepository;
    private final UnitConversionRepository unitConversionRepository;
    private final RecipeRepository recipeRepository;

    public SeedExportService(IngredientCategoryRepository categoryRepository,
                             IngredientRepository ingredientRepository,
                             UnitConversionRepository unitConversionRepository,
                             RecipeRepository recipeRepository) {
        this.categoryRepository = categoryRepository;
        this.ingredientRepository = ingredientRepository;
        this.unitConversionRepository = unitConversionRepository;
        this.recipeRepository = recipeRepository;
    }

    @Transactional(readOnly = true)
    public byte[] exportAll() {
        try (Workbook wb = new XSSFWorkbook()) {
            CellStyle headerStyle = createHeaderStyle(wb);

            // 1. categories
            Sheet s1 = wb.createSheet("categories");
            writeHeader(s1, headerStyle, "id", "name", "sort_order", "emoji");
            int r = 1;
            for (IngredientCategory c : categoryRepository.findAll()) {
                Row row = s1.createRow(r++);
                row.createCell(0).setCellValue(c.getId());
                row.createCell(1).setCellValue(c.getName());
                if (c.getSortOrder() != null) row.createCell(2).setCellValue(c.getSortOrder());
                if (c.getEmoji() != null) row.createCell(3).setCellValue(c.getEmoji());
            }

            // 2. ingredients (+ aliases 컬럼에 synonyms 통합)
            Sheet s2 = wb.createSheet("ingredients");
            writeHeader(s2, headerStyle, "name", "category", "is_seasoning", "default_unit", "aliases");
            r = 1;
            for (Ingredient ing : ingredientRepository.findAll()) {
                Row row = s2.createRow(r++);
                row.createCell(0).setCellValue(ing.getName());
                row.createCell(1).setCellValue(ing.getCategory() != null ? ing.getCategory().getName() : "");
                row.createCell(2).setCellValue(Boolean.TRUE.equals(ing.getIsSeasoning()));
                // default_unit: 엔티티에 없음 — 빈 칸
                row.createCell(3).setCellValue("");
                String aliases = ing.getSynonyms().stream()
                        .map(s -> s.getSynonym())
                        .reduce((a, b) -> a + "," + b)
                        .orElse("");
                row.createCell(4).setCellValue(aliases);
            }

            // 3. unit_conversions
            Sheet s3 = wb.createSheet("unit_conversions");
            writeHeader(s3, headerStyle, "ingredient_name", "from_unit", "to_unit", "conversion");
            r = 1;
            for (UnitConversion uc : unitConversionRepository.findAll()) {
                Row row = s3.createRow(r++);
                row.createCell(0).setCellValue(uc.getIngredient().getName());
                row.createCell(1).setCellValue(uc.getFromUnit());
                row.createCell(2).setCellValue(uc.getToUnit());
                row.createCell(3).setCellValue(uc.getConversion().doubleValue());
            }

            // 4. recipes
            Sheet s4 = wb.createSheet("recipes");
            writeHeader(s4, headerStyle, "temp_id", "title", "category", "difficulty",
                    "cooking_time_minutes", "servings", "calories", "thumbnail_url", "tips", "status");
            // 5. recipe_ingredients
            Sheet s5 = wb.createSheet("recipe_ingredients");
            writeHeader(s5, headerStyle, "recipe_temp_id", "ingredient_name", "amount", "unit",
                    "is_required", "sort_order");
            // 6. recipe_steps
            Sheet s6 = wb.createSheet("recipe_steps");
            writeHeader(s6, headerStyle, "recipe_temp_id", "step_number", "description", "image_url", "tip");

            int r4 = 1, r5 = 1, r6 = 1;
            for (Recipe rec : recipeRepository.findAll()) {
                String tempId = "recipe_" + rec.getId();  // 출력 시 임시 ID
                Row row = s4.createRow(r4++);
                row.createCell(0).setCellValue(tempId);
                row.createCell(1).setCellValue(rec.getTitle());
                row.createCell(2).setCellValue(rec.getCategory());
                row.createCell(3).setCellValue(rec.getDifficulty());
                row.createCell(4).setCellValue(rec.getCookingTimeMinutes());
                row.createCell(5).setCellValue(rec.getServings());
                if (rec.getCalories() != null) row.createCell(6).setCellValue(rec.getCalories());
                if (rec.getThumbnailUrl() != null) row.createCell(7).setCellValue(rec.getThumbnailUrl());
                if (rec.getTips() != null) row.createCell(8).setCellValue(rec.getTips());
                if (rec.getStatus() != null) row.createCell(9).setCellValue(rec.getStatus());

                // recipe_ingredients
                int sortOrder = 0;
                for (RecipeIngredient ri : rec.getIngredients()) {
                    Row rr = s5.createRow(r5++);
                    rr.createCell(0).setCellValue(tempId);
                    rr.createCell(1).setCellValue(ri.getIngredient().getName());
                    if (ri.getAmount() != null) rr.createCell(2).setCellValue(ri.getAmount().doubleValue());
                    if (ri.getUnit() != null) rr.createCell(3).setCellValue(ri.getUnit());
                    rr.createCell(4).setCellValue(Boolean.TRUE.equals(ri.getIsRequired()));
                    rr.createCell(5).setCellValue(ri.getSortOrder() != null ? ri.getSortOrder() : sortOrder++);
                }
                // recipe_steps
                for (RecipeStep st : rec.getSteps()) {
                    Row rr = s6.createRow(r6++);
                    rr.createCell(0).setCellValue(tempId);
                    rr.createCell(1).setCellValue(st.getStepNumber());
                    rr.createCell(2).setCellValue(st.getDescription());
                    if (st.getImageUrl() != null) rr.createCell(3).setCellValue(st.getImageUrl());
                    if (st.getTip() != null) rr.createCell(4).setCellValue(st.getTip());
                }
            }

            // 7. metadata
            Sheet s7 = wb.createSheet("metadata");
            writeHeader(s7, headerStyle, "key", "value");
            int r7 = 1;
            s7.createRow(r7++).createCell(0).setCellValue("exported_at");
            s7.getRow(r7 - 1).createCell(1).setCellValue(java.time.Instant.now().toString());
            Row mr = s7.createRow(r7++);
            mr.createCell(0).setCellValue("recipes_count");
            mr.createCell(1).setCellValue(recipeRepository.count());
            mr = s7.createRow(r7++);
            mr.createCell(0).setCellValue("ingredients_count");
            mr.createCell(1).setCellValue(ingredientRepository.count());

            // 컬럼 폭
            int[][] widths = {
                    {6, 18, 12, 8},                          // categories
                    {18, 16, 14, 14, 60},                    // ingredients
                    {18, 14, 14, 14},                        // unit_conversions
                    {22, 30, 12, 12, 14, 10, 10, 50, 60, 12},// recipes
                    {22, 18, 10, 10, 14, 12},                // recipe_ingredients
                    {22, 12, 80, 50, 50},                    // recipe_steps
                    {30, 30},                                // metadata
            };
            Sheet[] all = {s1, s2, s3, s4, s5, s6, s7};
            for (int i = 0; i < all.length; i++) {
                for (int j = 0; j < widths[i].length; j++) {
                    all[i].setColumnWidth(j, widths[i][j] * 256);
                }
            }

            ByteArrayOutputStream out = new ByteArrayOutputStream();
            wb.write(out);
            return out.toByteArray();
        } catch (IOException e) {
            throw new BusinessException("EXPORT_ERROR",
                    "엑셀 export 실패: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    private static void writeHeader(Sheet s, CellStyle style, String... names) {
        Row r = s.createRow(0);
        for (int i = 0; i < names.length; i++) {
            Cell c = r.createCell(i);
            c.setCellValue(names[i]);
            c.setCellStyle(style);
        }
    }

    private static CellStyle createHeaderStyle(Workbook wb) {
        CellStyle style = wb.createCellStyle();
        Font font = wb.createFont();
        font.setBold(true);
        font.setColor(IndexedColors.WHITE.getIndex());
        style.setFont(font);
        style.setFillForegroundColor(IndexedColors.DARK_BLUE.getIndex());
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        style.setAlignment(HorizontalAlignment.CENTER);
        return style;
    }
}
