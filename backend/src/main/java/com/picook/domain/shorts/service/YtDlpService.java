package com.picook.domain.shorts.service;

import com.picook.global.exception.BusinessException;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

@Service
public class YtDlpService {

    private static final Logger log = LoggerFactory.getLogger(YtDlpService.class);

    @Value("${shorts.ytdlp-path}")
    private String ytdlpPath;

    @Value("${shorts.temp-dir}")
    private String tempDir;

    @PostConstruct
    void init() throws IOException {
        Files.createDirectories(Path.of(tempDir));
    }

    public Path extractAudio(String url) {
        String filename = UUID.randomUUID() + ".mp3";
        Path outputPath = Path.of(tempDir, filename);

        try {
            ProcessBuilder pb = new ProcessBuilder(
                    ytdlpPath,
                    "--extract-audio",
                    "--audio-format", "mp3",
                    "--audio-quality", "0",
                    "-o", outputPath.toString(),
                    url
            );
            pb.redirectErrorStream(true);

            Process process = pb.start();
            boolean finished = process.waitFor(60, TimeUnit.SECONDS);

            if (!finished) {
                process.destroyForcibly();
                throw new BusinessException("AUDIO_EXTRACTION_FAILED",
                        "음성 추출 시간이 초과되었습니다", HttpStatus.BAD_GATEWAY);
            }

            if (process.exitValue() != 0) {
                String error = new String(process.getInputStream().readAllBytes());
                log.error("yt-dlp failed: {}", error);
                throw new BusinessException("AUDIO_EXTRACTION_FAILED",
                        "음성 추출에 실패했습니다", HttpStatus.BAD_GATEWAY);
            }

            return outputPath;
        } catch (BusinessException e) {
            throw e;
        } catch (Exception e) {
            log.error("yt-dlp execution error", e);
            throw new BusinessException("AUDIO_EXTRACTION_FAILED",
                    "음성 추출에 실패했습니다", HttpStatus.BAD_GATEWAY);
        }
    }
}
