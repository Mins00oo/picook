package com.picook.domain.admin.recipe.service;

import com.picook.domain.admin.recipe.dto.RecipeBulkUploadResponse;
import com.picook.domain.admin.recipe.dto.RecipeBulkUploadResponse.BulkError;
import com.picook.domain.ingredient.entity.Ingredient;
import com.picook.domain.ingredient.repository.IngredientRepository;
import com.picook.domain.recipe.entity.Recipe;
import com.picook.domain.recipe.entity.RecipeCategory;
import com.picook.domain.recipe.entity.Difficulty;
import com.picook.domain.recipe.entity.RecipeIngredient;
import com.picook.domain.recipe.repository.RecipeRepository;
import com.picook.global.exception.BusinessException;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.math.BigDecimal;
import java.util.*;

@Service
public class RecipeBulkUploadService {

    private final RecipeRepository recipeRepository;
    private final IngredientRepository ingredientRepository;

    public RecipeBulkUploadService(RecipeRepository recipeRepository,
                                   IngredientRepository ingredientRepository) {
        this.recipeRepository = recipeRepository;
        this.ingredientRepository = ingredientRepository;
    }

    @Transactional
    public RecipeBulkUploadResponse uploadFromExcel(MultipartFile file) {
        if (file.isEmpty()) {
            throw new BusinessException("EMPTY_FILE", "파일이 비어있습니다", HttpStatus.BAD_REQUEST);
        }

        List<BulkError> errors = new ArrayList<>();
        int total = 0;
        int success = 0;

        // 재료 캐시 (이름 → 엔티티)
        Map<String, Ingredient> ingredientCache = new HashMap<>();
        ingredientRepository.findAll().forEach(i -> ingredientCache.put(i.getName(), i));

        try (Workbook workbook = new XSSFWorkbook(file.getInputStream())) {
            Sheet sheet = workbook.getSheetAt(0);

            for (int i = 1; i <= sheet.getLastRowNum(); i++) {
                Row row = sheet.getRow(i);
                if (row == null) continue;

                total++;
                int rowNum = i + 1;

                // A: 레시피명
                String title = getCellStringValue(row.getCell(0));
                if (title == null || title.isBlank()) {
                    errors.add(new BulkError(rowNum, "레시피명이 비어있습니다"));
                    continue;
                }

                // B: 카테고리
                String categoryStr = getCellStringValue(row.getCell(1));
                if (categoryStr == null || categoryStr.isBlank()) {
                    errors.add(new BulkError(rowNum, "카테고리가 비어있습니다"));
                    continue;
                }
                String category;
                try {
                    category = RecipeCategory.fromValue(categoryStr.trim()).getValue();
                } catch (IllegalArgumentException e) {
                    errors.add(new BulkError(rowNum, "유효하지 않은 카테고리: " + categoryStr));
                    continue;
                }

                // C: 난이도
                String difficultyStr = getCellStringValue(row.getCell(2));
                if (difficultyStr == null || difficultyStr.isBlank()) {
                    errors.add(new BulkError(rowNum, "난이도가 비어있습니다"));
                    continue;
                }
                String difficulty;
                try {
                    difficulty = Difficulty.fromValue(difficultyStr.trim()).getValue();
                } catch (IllegalArgumentException e) {
                    errors.add(new BulkError(rowNum, "유효하지 않은 난이도: " + difficultyStr));
                    continue;
                }

                // D: 조리시간(분)
                String cookingTimeStr = getCellStringValue(row.getCell(3));
                if (cookingTimeStr == null || cookingTimeStr.isBlank()) {
                    errors.add(new BulkError(rowNum, "조리시간이 비어있습니다"));
                    continue;
                }
                int cookingTime;
                try {
                    cookingTime = Integer.parseInt(cookingTimeStr.trim());
                } catch (NumberFormatException e) {
                    errors.add(new BulkError(rowNum, "조리시간은 숫자여야 합니다: " + cookingTimeStr));
                    continue;
                }

                // E: 인분
                String servingsStr = getCellStringValue(row.getCell(4));
                int servings = 2;
                if (servingsStr != null && !servingsStr.isBlank()) {
                    try {
                        servings = Integer.parseInt(servingsStr.trim());
                    } catch (NumberFormatException e) {
                        errors.add(new BulkError(rowNum, "인분은 숫자여야 합니다: " + servingsStr));
                        continue;
                    }
                }

                // F: 재료 (쉼표구분, 형식: 재료명:양:단위)
                String ingredientsStr = getCellStringValue(row.getCell(5));
                List<ParsedIngredient> parsedIngredients = new ArrayList<>();
                boolean ingredientError = false;

                if (ingredientsStr != null && !ingredientsStr.isBlank()) {
                    String[] parts = ingredientsStr.split(",");
                    for (String part : parts) {
                        String trimmed = part.trim();
                        if (trimmed.isEmpty()) continue;

                        String[] tokens = trimmed.split(":");
                        String ingredientName = tokens[0].trim();

                        Ingredient ingredient = ingredientCache.get(ingredientName);
                        if (ingredient == null) {
                            errors.add(new BulkError(rowNum, "존재하지 않는 재료: " + ingredientName));
                            ingredientError = true;
                            break;
                        }

                        BigDecimal amount = null;
                        String unit = null;
                        if (tokens.length >= 2) {
                            try {
                                amount = new BigDecimal(tokens[1].trim());
                            } catch (NumberFormatException e) {
                                // 양이 숫자가 아니면 무시
                            }
                        }
                        if (tokens.length >= 3) {
                            unit = tokens[2].trim();
                        }

                        parsedIngredients.add(new ParsedIngredient(ingredient, amount, unit));
                    }
                }

                if (ingredientError) continue;

                // G: 팁
                String tips = getCellStringValue(row.getCell(6));

                // 레시피 생성 (status: draft)
                Recipe recipe = new Recipe(title.trim(), category, difficulty, cookingTime, servings);
                recipe.setTips(tips);

                int sortOrder = 0;
                for (ParsedIngredient pi : parsedIngredients) {
                    RecipeIngredient ri = new RecipeIngredient(recipe, pi.ingredient, pi.amount, pi.unit, true, sortOrder++);
                    recipe.addIngredient(ri);
                }

                recipeRepository.save(recipe);
                success++;
            }
        } catch (IOException e) {
            throw new BusinessException("FILE_PARSE_ERROR", "엑셀 파일 파싱 실패: " + e.getMessage(), HttpStatus.BAD_REQUEST);
        }

        return new RecipeBulkUploadResponse(total, success, errors.size(), errors);
    }

    public byte[] downloadTemplate() {
        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("레시피 일괄등록");

            CellStyle headerStyle = workbook.createCellStyle();
            Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerStyle.setFont(headerFont);
            headerStyle.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);

            Row headerRow = sheet.createRow(0);
            String[] headers = {"레시피명", "카테고리", "난이도", "조리시간(분)", "인분", "재료(쉼표구분, 형식: 재료명:양:단위)", "팁"};
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
            }

            Row exampleRow = sheet.createRow(1);
            exampleRow.createCell(0).setCellValue("된장찌개");
            exampleRow.createCell(1).setCellValue("korean");
            exampleRow.createCell(2).setCellValue("easy");
            exampleRow.createCell(3).setCellValue("30");
            exampleRow.createCell(4).setCellValue("2");
            exampleRow.createCell(5).setCellValue("된장:2:큰술,두부:1:모,양파:1:개,대파:1:대");
            exampleRow.createCell(6).setCellValue("된장은 국산 된장을 추천합니다");

            for (int i = 0; i < headers.length; i++) {
                sheet.setColumnWidth(i, 6000);
            }
            sheet.setColumnWidth(5, 12000);

            ByteArrayOutputStream out = new ByteArrayOutputStream();
            workbook.write(out);
            return out.toByteArray();
        } catch (IOException e) {
            throw new BusinessException("TEMPLATE_ERROR", "템플릿 생성 실패", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    private String getCellStringValue(Cell cell) {
        if (cell == null) return null;
        return switch (cell.getCellType()) {
            case STRING -> cell.getStringCellValue();
            case NUMERIC -> String.valueOf((int) cell.getNumericCellValue());
            case BLANK -> null;
            default -> cell.toString();
        };
    }

    private record ParsedIngredient(Ingredient ingredient, BigDecimal amount, String unit) {}
}
