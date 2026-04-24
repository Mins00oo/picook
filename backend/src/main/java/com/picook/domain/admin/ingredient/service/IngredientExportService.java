package com.picook.domain.admin.ingredient.service;

import com.picook.domain.ingredient.entity.Ingredient;
import com.picook.domain.ingredient.entity.IngredientSubcategory;
import com.picook.domain.ingredient.entity.IngredientSynonym;
import com.picook.domain.ingredient.repository.IngredientRepository;
import com.picook.global.exception.BusinessException;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class IngredientExportService {

    private final IngredientRepository ingredientRepository;

    public IngredientExportService(IngredientRepository ingredientRepository) {
        this.ingredientRepository = ingredientRepository;
    }

    @Transactional(readOnly = true)
    public byte[] exportToExcel(Integer categoryId, Integer subcategoryId, String keyword) {
        Sort sort = Sort.by(Sort.Order.asc("category.id"),
                Sort.Order.asc("name"));
        List<Ingredient> items = ingredientRepository.findForExport(
                categoryId, subcategoryId, keyword, sort);

        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("재료 export");

            CellStyle headerStyle = workbook.createCellStyle();
            Font font = workbook.createFont();
            font.setBold(true);
            headerStyle.setFont(font);
            headerStyle.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);

            Row headerRow = sheet.createRow(0);
            String[] headers = {"재료명", "카테고리명", "서브카테고리명", "이모지", "동의어(쉼표구분)"};
            for (int i = 0; i < headers.length; i++) {
                Cell c = headerRow.createCell(i);
                c.setCellValue(headers[i]);
                c.setCellStyle(headerStyle);
            }

            int rowIdx = 1;
            for (Ingredient ing : items) {
                Row row = sheet.createRow(rowIdx++);
                row.createCell(0).setCellValue(ing.getName());
                row.createCell(1).setCellValue(ing.getCategory().getName());
                IngredientSubcategory sub = ing.getSubcategory();
                row.createCell(2).setCellValue(sub != null ? sub.getName() : "");
                row.createCell(3).setCellValue(ing.getEmoji() != null ? ing.getEmoji() : "");
                String synonyms = ing.getSynonyms().stream()
                        .map(IngredientSynonym::getSynonym)
                        .collect(Collectors.joining(","));
                row.createCell(4).setCellValue(synonyms);
            }

            sheet.setColumnWidth(0, 5000);
            sheet.setColumnWidth(1, 4000);
            sheet.setColumnWidth(2, 4500);
            sheet.setColumnWidth(3, 2500);
            sheet.setColumnWidth(4, 8000);

            ByteArrayOutputStream out = new ByteArrayOutputStream();
            workbook.write(out);
            return out.toByteArray();
        } catch (IOException e) {
            throw new BusinessException("EXPORT_ERROR",
                    "엑셀 export 실패: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
