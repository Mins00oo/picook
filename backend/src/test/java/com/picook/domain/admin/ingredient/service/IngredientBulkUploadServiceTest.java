package com.picook.domain.admin.ingredient.service;

import com.picook.domain.admin.ingredient.dto.IngredientBulkUploadResponse;
import com.picook.domain.ingredient.entity.Ingredient;
import com.picook.domain.ingredient.entity.IngredientCategory;
import com.picook.domain.ingredient.repository.IngredientCategoryRepository;
import com.picook.domain.ingredient.repository.IngredientRepository;
import com.picook.global.exception.BusinessException;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;

import java.io.ByteArrayOutputStream;
import java.util.ArrayList;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class IngredientBulkUploadServiceTest {

    @Mock
    private IngredientRepository ingredientRepository;

    @Mock
    private IngredientCategoryRepository categoryRepository;

    private IngredientBulkUploadService service;

    @BeforeEach
    void setUp() {
        service = new IngredientBulkUploadService(ingredientRepository, categoryRepository);
    }

    @Test
    void uploadFromExcel_success() throws Exception {
        byte[] excelBytes = createExcelFile(rows(
                new String[]{"당근", "채소"},
                new String[]{"양파", "채소"}
        ));
        MockMultipartFile file = new MockMultipartFile("file", "ingredients.xlsx",
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", excelBytes);

        IngredientCategory category = new IngredientCategory("채소", 1);
        when(categoryRepository.findAll()).thenReturn(List.of(category));
        when(ingredientRepository.existsByName("당근")).thenReturn(false);
        when(ingredientRepository.existsByName("양파")).thenReturn(false);
        when(ingredientRepository.save(any(Ingredient.class))).thenAnswer(inv -> inv.getArgument(0));

        IngredientBulkUploadResponse response = service.uploadFromExcel(file);

        assertThat(response.total()).isEqualTo(2);
        assertThat(response.success()).isEqualTo(2);
        assertThat(response.failed()).isEqualTo(0);
        verify(ingredientRepository, times(2)).save(any(Ingredient.class));
    }

    @Test
    void uploadFromExcel_withSynonyms() throws Exception {
        byte[] excelBytes = createExcelFile(rows(
                new String[]{"당근", "채소", "캐롯,홍당무"}
        ));
        MockMultipartFile file = new MockMultipartFile("file", "ingredients.xlsx",
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", excelBytes);

        IngredientCategory category = new IngredientCategory("채소", 1);
        when(categoryRepository.findAll()).thenReturn(List.of(category));
        when(ingredientRepository.existsByName("당근")).thenReturn(false);
        when(ingredientRepository.save(any(Ingredient.class))).thenAnswer(inv -> inv.getArgument(0));

        IngredientBulkUploadResponse response = service.uploadFromExcel(file);

        assertThat(response.success()).isEqualTo(1);
    }

    @Test
    void uploadFromExcel_duplicateName_shouldSkipWithError() throws Exception {
        byte[] excelBytes = createExcelFile(rows(
                new String[]{"당근", "채소"}
        ));
        MockMultipartFile file = new MockMultipartFile("file", "ingredients.xlsx",
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", excelBytes);

        IngredientCategory category = new IngredientCategory("채소", 1);
        when(categoryRepository.findAll()).thenReturn(List.of(category));
        when(ingredientRepository.existsByName("당근")).thenReturn(true);

        IngredientBulkUploadResponse response = service.uploadFromExcel(file);

        assertThat(response.total()).isEqualTo(1);
        assertThat(response.success()).isEqualTo(0);
        assertThat(response.failed()).isEqualTo(1);
        assertThat(response.errors().getFirst().reason()).contains("이미 존재하는 재료명");
    }

    @Test
    void uploadFromExcel_invalidCategory_shouldSkipWithError() throws Exception {
        byte[] excelBytes = createExcelFile(rows(
                new String[]{"당근", "없는카테고리"}
        ));
        MockMultipartFile file = new MockMultipartFile("file", "ingredients.xlsx",
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", excelBytes);

        when(categoryRepository.findAll()).thenReturn(List.of(new IngredientCategory("채소", 1)));

        IngredientBulkUploadResponse response = service.uploadFromExcel(file);

        assertThat(response.failed()).isEqualTo(1);
        assertThat(response.errors().getFirst().reason()).contains("존재하지 않는 카테고리");
    }

    @Test
    void uploadFromExcel_emptyFile_shouldThrow() {
        MockMultipartFile file = new MockMultipartFile("file", "empty.xlsx",
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", new byte[0]);

        assertThatThrownBy(() -> service.uploadFromExcel(file))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("파일이 비어있습니다");
    }

    @Test
    void uploadFromExcel_missingName_shouldSkipWithError() throws Exception {
        byte[] excelBytes = createExcelFile(rows(
                new String[]{"", "채소"}
        ));
        MockMultipartFile file = new MockMultipartFile("file", "ingredients.xlsx",
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", excelBytes);

        when(categoryRepository.findAll()).thenReturn(List.of(new IngredientCategory("채소", 1)));

        IngredientBulkUploadResponse response = service.uploadFromExcel(file);

        assertThat(response.failed()).isEqualTo(1);
    }

    @Test
    void downloadTemplate_shouldReturnValidExcel() {
        byte[] template = service.downloadTemplate();

        assertThat(template).isNotEmpty();
        assertThat(template.length).isGreaterThan(100);
    }

    private List<String[]> rows(String[]... rows) {
        return List.of(rows);
    }

    private byte[] createExcelFile(List<String[]> rows) throws Exception {
        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("재료");

            // 헤더
            Row header = sheet.createRow(0);
            header.createCell(0).setCellValue("재료명");
            header.createCell(1).setCellValue("카테고리");
            header.createCell(2).setCellValue("동의어");

            // 데이터
            for (int i = 0; i < rows.size(); i++) {
                Row row = sheet.createRow(i + 1);
                String[] cells = rows.get(i);
                for (int j = 0; j < cells.length; j++) {
                    row.createCell(j).setCellValue(cells[j]);
                }
            }

            ByteArrayOutputStream out = new ByteArrayOutputStream();
            workbook.write(out);
            return out.toByteArray();
        }
    }
}
