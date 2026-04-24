package com.picook.domain.admin.ingredient.service;

import com.picook.domain.admin.ingredient.dto.IngredientBulkUploadResponse;
import com.picook.domain.admin.ingredient.dto.IngredientBulkUploadResponse.BulkError;
import com.picook.domain.ingredient.entity.Ingredient;
import com.picook.domain.ingredient.entity.IngredientCategory;
import com.picook.domain.ingredient.entity.IngredientSubcategory;
import com.picook.domain.ingredient.repository.IngredientCategoryRepository;
import com.picook.domain.ingredient.repository.IngredientRepository;
import com.picook.domain.ingredient.repository.IngredientSubcategoryRepository;
import com.picook.global.exception.BusinessException;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.*;

@Service
public class IngredientBulkUploadService {

    private final IngredientRepository ingredientRepository;
    private final IngredientCategoryRepository categoryRepository;
    private final IngredientSubcategoryRepository subcategoryRepository;

    public IngredientBulkUploadService(IngredientRepository ingredientRepository,
                                       IngredientCategoryRepository categoryRepository,
                                       IngredientSubcategoryRepository subcategoryRepository) {
        this.ingredientRepository = ingredientRepository;
        this.categoryRepository = categoryRepository;
        this.subcategoryRepository = subcategoryRepository;
    }

    @Transactional
    @CacheEvict(value = "ingredients", allEntries = true)
    public IngredientBulkUploadResponse uploadFromExcel(MultipartFile file, boolean dryRun) {
        if (file.isEmpty()) {
            throw new BusinessException("EMPTY_FILE", "파일이 비어있습니다", HttpStatus.BAD_REQUEST);
        }

        List<BulkError> errors = new ArrayList<>();
        int total = 0;
        int success = 0;

        Map<String, IngredientCategory> categoryCache = new HashMap<>();
        categoryRepository.findAll().forEach(c -> categoryCache.put(c.getName(), c));

        Map<String, IngredientSubcategory> subcategoryCache = new HashMap<>();
        subcategoryRepository.findAll().forEach(s ->
                subcategoryCache.put(s.getCategory().getId() + "|" + s.getName(), s));

        Set<String> existingNames = new HashSet<>();
        Set<String> newNamesInSheet = new HashSet<>();

        try (Workbook workbook = new XSSFWorkbook(file.getInputStream())) {
            Sheet sheet = workbook.getSheetAt(0);

            for (int i = 1; i <= sheet.getLastRowNum(); i++) {
                Row row = sheet.getRow(i);
                if (row == null) continue;

                total++;
                int rowNum = i + 1;

                String name = getCellStringValue(row.getCell(0));
                if (name == null || name.isBlank()) {
                    errors.add(new BulkError(rowNum, "재료명이 비어있습니다"));
                    continue;
                }
                name = name.trim();

                String categoryName = getCellStringValue(row.getCell(1));
                if (categoryName == null || categoryName.isBlank()) {
                    errors.add(new BulkError(rowNum, "카테고리명이 비어있습니다"));
                    continue;
                }

                IngredientCategory category = categoryCache.get(categoryName.trim());
                if (category == null) {
                    errors.add(new BulkError(rowNum, "존재하지 않는 카테고리: " + categoryName));
                    continue;
                }

                String subcategoryName = getCellStringValue(row.getCell(2));
                IngredientSubcategory subcategory = null;
                if (subcategoryName != null && !subcategoryName.isBlank()) {
                    subcategory = subcategoryCache.get(category.getId() + "|" + subcategoryName.trim());
                    if (subcategory == null) {
                        errors.add(new BulkError(rowNum,
                                "서브카테고리가 해당 카테고리에 없습니다: " + subcategoryName));
                        continue;
                    }
                }

                String emoji = getCellStringValue(row.getCell(3));
                if (emoji != null) {
                    emoji = emoji.trim();
                    if (emoji.isEmpty()) emoji = null;
                    else if (emoji.length() > 8) {
                        errors.add(new BulkError(rowNum, "이모지는 8자 이하여야 합니다: " + emoji));
                        continue;
                    }
                }

                if (newNamesInSheet.contains(name)) {
                    errors.add(new BulkError(rowNum, "엑셀 내 중복 재료명: " + name));
                    continue;
                }
                if (existingNames.contains(name) || ingredientRepository.existsByName(name)) {
                    errors.add(new BulkError(rowNum, "이미 존재하는 재료명: " + name));
                    continue;
                }

                String synonymsStr = getCellStringValue(row.getCell(4));

                if (!dryRun) {
                    Ingredient ingredient = new Ingredient(name, category);
                    ingredient.setSubcategory(subcategory);
                    if (emoji != null) ingredient.setEmoji(emoji);
                    if (synonymsStr != null && !synonymsStr.isBlank()) {
                        for (String syn : synonymsStr.split(",")) {
                            String trimmed = syn.trim();
                            if (!trimmed.isEmpty()) {
                                ingredient.addSynonym(trimmed);
                            }
                        }
                    }
                    ingredientRepository.save(ingredient);
                    existingNames.add(name);
                } else {
                    newNamesInSheet.add(name);
                }
                success++;
            }
        } catch (IOException e) {
            throw new BusinessException("FILE_PARSE_ERROR",
                    "엑셀 파일 파싱 실패: " + e.getMessage(), HttpStatus.BAD_REQUEST);
        }

        return new IngredientBulkUploadResponse(total, success, errors.size(), errors);
    }

    public byte[] downloadTemplate() {
        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("재료 일괄등록");

            CellStyle headerStyle = workbook.createCellStyle();
            Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerStyle.setFont(headerFont);
            headerStyle.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);

            Row headerRow = sheet.createRow(0);
            String[] headers = {"재료명", "카테고리명", "서브카테고리명", "이모지", "동의어(쉼표구분)"};
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
            }

            Row exampleRow = sheet.createRow(1);
            exampleRow.createCell(0).setCellValue("당근");
            exampleRow.createCell(1).setCellValue("채소");
            exampleRow.createCell(2).setCellValue("뿌리채소");
            exampleRow.createCell(3).setCellValue("🥕");
            exampleRow.createCell(4).setCellValue("홍당무,캐럿");

            sheet.setColumnWidth(0, 5000);
            sheet.setColumnWidth(1, 4000);
            sheet.setColumnWidth(2, 4500);
            sheet.setColumnWidth(3, 2500);
            sheet.setColumnWidth(4, 8000);

            ByteArrayOutputStream out = new ByteArrayOutputStream();
            workbook.write(out);
            return out.toByteArray();
        } catch (IOException e) {
            throw new BusinessException("TEMPLATE_ERROR",
                    "템플릿 생성 실패", HttpStatus.INTERNAL_SERVER_ERROR);
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
}
