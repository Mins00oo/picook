package com.picook.domain.admin.ingredient.service;

import com.picook.domain.admin.ingredient.dto.IngredientBulkUploadResponse;
import com.picook.domain.admin.ingredient.dto.IngredientBulkUploadResponse.BulkError;
import com.picook.domain.ingredient.entity.Ingredient;
import com.picook.domain.ingredient.entity.IngredientCategory;
import com.picook.domain.ingredient.repository.IngredientCategoryRepository;
import com.picook.domain.ingredient.repository.IngredientRepository;
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

    public IngredientBulkUploadService(IngredientRepository ingredientRepository,
                                       IngredientCategoryRepository categoryRepository) {
        this.ingredientRepository = ingredientRepository;
        this.categoryRepository = categoryRepository;
    }

    @Transactional
    @CacheEvict(value = "ingredients", allEntries = true)
    public IngredientBulkUploadResponse uploadFromExcel(MultipartFile file) {
        if (file.isEmpty()) {
            throw new BusinessException("EMPTY_FILE", "파일이 비어있습니다", HttpStatus.BAD_REQUEST);
        }

        List<BulkError> errors = new ArrayList<>();
        int total = 0;
        int success = 0;

        // 카테고리 캐시
        Map<String, IngredientCategory> categoryCache = new HashMap<>();
        categoryRepository.findAll().forEach(c -> categoryCache.put(c.getName(), c));

        try (Workbook workbook = new XSSFWorkbook(file.getInputStream())) {
            Sheet sheet = workbook.getSheetAt(0);

            for (int i = 1; i <= sheet.getLastRowNum(); i++) { // 헤더 스킵
                Row row = sheet.getRow(i);
                if (row == null) continue;

                total++;
                int rowNum = i + 1; // 사용자에게 보여줄 행 번호 (1-indexed + 헤더)

                // 재료명
                String name = getCellStringValue(row.getCell(0));
                if (name == null || name.isBlank()) {
                    errors.add(new BulkError(rowNum, "재료명이 비어있습니다"));
                    continue;
                }

                // 카테고리명
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

                // 중복 체크
                if (ingredientRepository.existsByName(name.trim())) {
                    errors.add(new BulkError(rowNum, "이미 존재하는 재료명: " + name));
                    continue;
                }

                // 재료 생성
                Ingredient ingredient = new Ingredient(name.trim(), category);

                // 동의어 (선택)
                String synonymsStr = getCellStringValue(row.getCell(2));
                if (synonymsStr != null && !synonymsStr.isBlank()) {
                    String[] synonymArr = synonymsStr.split(",");
                    for (String synonym : synonymArr) {
                        String trimmed = synonym.trim();
                        if (!trimmed.isEmpty()) {
                            ingredient.addSynonym(trimmed);
                        }
                    }
                }

                ingredientRepository.save(ingredient);
                success++;
            }
        } catch (IOException e) {
            throw new BusinessException("FILE_PARSE_ERROR", "엑셀 파일 파싱 실패: " + e.getMessage(), HttpStatus.BAD_REQUEST);
        }

        return new IngredientBulkUploadResponse(total, success, errors.size(), errors);
    }

    public byte[] downloadTemplate() {
        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("재료 일괄등록");

            // 헤더 스타일
            CellStyle headerStyle = workbook.createCellStyle();
            Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerStyle.setFont(headerFont);
            headerStyle.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);

            // 헤더
            Row headerRow = sheet.createRow(0);
            String[] headers = {"재료명", "카테고리명", "동의어(쉼표구분)"};
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
            }

            // 예시 데이터
            Row exampleRow = sheet.createRow(1);
            exampleRow.createCell(0).setCellValue("당근");
            exampleRow.createCell(1).setCellValue("채소");
            exampleRow.createCell(2).setCellValue("홍당무,캐럿");

            // 열 너비
            sheet.setColumnWidth(0, 5000);
            sheet.setColumnWidth(1, 5000);
            sheet.setColumnWidth(2, 8000);

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
}
