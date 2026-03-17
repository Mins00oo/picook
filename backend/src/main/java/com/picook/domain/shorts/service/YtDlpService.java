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

    @Value("${shorts.ffmpeg-path}")
    private String ffmpegPath;

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
            // ffmpeg-path에서 디렉토리 추출 (--ffmpeg-location은 디렉토리 경로 필요)
            String ffmpegLocation = Path.of(ffmpegPath).getParent().toString();

            ProcessBuilder pb = new ProcessBuilder(
                    ytdlpPath,
                    "--ffmpeg-location", ffmpegLocation,
                    "--extract-audio",
                    "--audio-format", "mp3",
                    "--audio-quality", "0",
                    "-o", outputPath.toString(),
                    url
            );
            pb.redirectErrorStream(true);

            Process process = pb.start();
            String output = new String(process.getInputStream().readAllBytes());
            boolean finished = process.waitFor(60, TimeUnit.SECONDS);

            if (!finished) {
                process.destroyForcibly();
                throw new BusinessException("AUDIO_EXTRACTION_FAILED",
                        "음성 추출 시간이 초과되었습니다", HttpStatus.BAD_GATEWAY);
            }

            log.debug("yt-dlp output: {}", output);

            if (process.exitValue() != 0) {
                log.error("yt-dlp failed (exit={}): {}", process.exitValue(), output);
                throw new BusinessException("AUDIO_EXTRACTION_FAILED",
                        "음성 추출에 실패했습니다", HttpStatus.BAD_GATEWAY);
            }

            // yt-dlp는 .webm으로 다운로드 후 ffmpeg으로 .mp3 변환
            // .mp3가 없으면 .webm 확인 후 반환
            if (Files.exists(outputPath)) {
                return outputPath;
            }
            // yt-dlp가 확장자를 변경했을 수 있음 (예: .webm)
            String baseName = outputPath.toString().replaceFirst("\\.[^.]+$", "");
            for (String ext : new String[]{".webm", ".m4a", ".opus", ".ogg"}) {
                Path altPath = Path.of(baseName + ext);
                if (Files.exists(altPath)) {
                    log.warn("yt-dlp produced {} instead of .mp3, renaming", ext);
                    Files.move(altPath, outputPath);
                    return outputPath;
                }
            }

            log.error("yt-dlp finished but no output file found at {}", outputPath);
            throw new BusinessException("AUDIO_EXTRACTION_FAILED",
                    "음성 추출에 실패했습니다", HttpStatus.BAD_GATEWAY);
        } catch (BusinessException e) {
            throw e;
        } catch (Exception e) {
            log.error("yt-dlp execution error", e);
            throw new BusinessException("AUDIO_EXTRACTION_FAILED",
                    "음성 추출에 실패했습니다", HttpStatus.BAD_GATEWAY);
        }
    }
}
