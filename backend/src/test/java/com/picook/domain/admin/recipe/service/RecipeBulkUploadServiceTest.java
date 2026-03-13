package com.picook.domain.admin.recipe.service;

import com.picook.domain.admin.recipe.dto.RecipeBulkUploadResponse;
import com.picook.domain.ingredient.entity.Ingredient;
import com.picook.domain.ingredient.entity.IngredientCategory;
import com.picook.domain.ingredient.repository.IngredientRepository;
import com.picook.domain.recipe.entity.Recipe;
import com.picook.domain.recipe.repository.RecipeRepository;
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
import java.io.IOException;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RecipeBulkUploadServiceTest {

    @Mock
    private RecipeRepository recipeRepository;

    @Mock
    private IngredientRepository ingredientRepository;

    private RecipeBulkUploadService bulkUploadService;

    @BeforeEach
    void setUp() {
        bulkUploadService = new RecipeBulkUploadService(recipeRepository, ingredientRepository);
    }

    @Test
    void uploadFromExcel_shouldUploadSuccessfully() throws IOException {
        IngredientCategory category = new IngredientCategory("채소", 0);
        Ingredient onion = new Ingredient("양파", category);
        Ingredient carrot = new Ingredient("당근", category);

        when(ingredientRepository.findAll()).thenReturn(List.of(onion, carrot));
        when(recipeRepository.save(any(Recipe.class))).thenAnswer(i -> i.getArgument(0));

        byte[] excelBytes = createExcel(new String[][]{
                {"된장찌개", "korean", "easy", "30", "2", "양파:1:개,당근:0.5:개", "팁입니다"}
        });
        MockMultipartFile file = new MockMultipartFile("file", "recipes.xlsx",
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", excelBytes);

        RecipeBulkUploadResponse response = bulkUploadService.uploadFromExcel(file);

        assertThat(response.total()).isEqualTo(1);
        assertThat(response.success()).isEqualTo(1);
        assertThat(response.failed()).isEqualTo(0);
        verify(recipeRepository, times(1)).save(any(Recipe.class));
    }

    @Test
    void uploadFromExcel_shouldThrowForEmptyFile() {
        MockMultipartFile file = new MockMultipartFile("file", "empty.xlsx",
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", new byte[0]);

        assertThatThrownBy(() -> bulkUploadService.uploadFromExcel(file))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("파일이 비어있습니다");
    }

    @Test
    void uploadFromExcel_shouldReportInvalidCategory() throws IOException {
        when(ingredientRepository.findAll()).thenReturn(List.of());

        byte[] excelBytes = createExcel(new String[][]{
                {"테스트 레시피", "invalid_cat", "easy", "30", "2", "", ""}
        });
        MockMultipartFile file = new MockMultipartFile("file", "recipes.xlsx",
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", excelBytes);

        RecipeBulkUploadResponse response = bulkUploadService.uploadFromExcel(file);

        assertThat(response.total()).isEqualTo(1);
        assertThat(response.success()).isEqualTo(0);
        assertThat(response.failed()).isEqualTo(1);
        assertThat(response.errors().get(0).reason()).contains("유효하지 않은 카테고리");
    }

    @Test
    void uploadFromExcel_shouldReportNonExistentIngredient() throws IOException {
        when(ingredientRepository.findAll()).thenReturn(List.of());

        byte[] excelBytes = createExcel(new String[][]{
                {"된장찌개", "korean", "easy", "30", "2", "존재안함:1:개", ""}
        });
        MockMultipartFile file = new MockMultipartFile("file", "recipes.xlsx",
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", excelBytes);

        RecipeBulkUploadResponse response = bulkUploadService.uploadFromExcel(file);

        assertThat(response.total()).isEqualTo(1);
        assertThat(response.success()).isEqualTo(0);
        assertThat(response.failed()).isEqualTo(1);
        assertThat(response.errors().get(0).reason()).contains("존재하지 않는 재료");
    }

    @Test
    void downloadTemplate_shouldReturnValidExcel() {
        byte[] template = bulkUploadService.downloadTemplate();

        assertThat(template).isNotEmpty();
        assertThat(template.length).isGreaterThan(0);
    }

    private byte[] createExcel(String[][] rows) throws IOException {
        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("레시피");

            // Header
            Row headerRow = sheet.createRow(0);
            headerRow.createCell(0).setCellValue("레시피명");
            headerRow.createCell(1).setCellValue("카테고리");
            headerRow.createCell(2).setCellValue("난이도");
            headerRow.createCell(3).setCellValue("조리시간(분)");
            headerRow.createCell(4).setCellValue("인분");
            headerRow.createCell(5).setCellValue("재료");
            headerRow.createCell(6).setCellValue("팁");

            // Data rows
            for (int i = 0; i < rows.length; i++) {
                Row row = sheet.createRow(i + 1);
                for (int j = 0; j < rows[i].length; j++) {
                    row.createCell(j).setCellValue(rows[i][j]);
                }
            }

            ByteArrayOutputStream out = new ByteArrayOutputStream();
            workbook.write(out);
            return out.toByteArray();
        }
    }
}
