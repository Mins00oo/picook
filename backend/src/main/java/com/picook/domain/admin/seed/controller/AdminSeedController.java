package com.picook.domain.admin.seed.controller;

import com.picook.domain.admin.seed.dto.SeedImportResponse;
import com.picook.domain.admin.seed.service.SeedExportService;
import com.picook.domain.admin.seed.service.SeedImportService;
import com.picook.global.response.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;

@Tag(name = "[관리자] 시드", description = "데이터 파이프라인 결과 엑셀 업로드/다운로드")
@RestController
@RequestMapping("/api/admin/seed")
public class AdminSeedController {

    private final SeedImportService importService;
    private final SeedExportService exportService;

    public AdminSeedController(SeedImportService importService, SeedExportService exportService) {
        this.importService = importService;
        this.exportService = exportService;
    }

    /**
     * 시드 엑셀 일괄 업로드 (7시트 한 파일).
     * dryRun=true 면 검증만 (트랜잭션 롤백 보장).
     */
    @PostMapping("/upload")
    public ResponseEntity<ApiResponse<SeedImportResponse>> upload(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "dryRun", defaultValue = "true") boolean dryRun) {
        SeedImportResponse response = importService.uploadFromExcel(file, dryRun);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * 현재 DB의 시드 데이터를 엑셀로 export.
     * 운영 후 데이터 받아 수정/재업로드 위함.
     */
    @GetMapping("/download")
    public ResponseEntity<byte[]> download() {
        byte[] xlsx = exportService.exportAll();
        String filename = "picook_seed_" + LocalDate.now() + ".xlsx";
        String encoded = URLEncoder.encode(filename, StandardCharsets.UTF_8).replace("+", "%20");

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType(
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"));
        headers.set(HttpHeaders.CONTENT_DISPOSITION,
                "attachment; filename*=UTF-8''" + encoded);

        return ResponseEntity.ok().headers(headers).body(xlsx);
    }
}
