package com.picook.domain.shorts.service;

import com.picook.domain.shorts.dto.YtDlpResult;
import com.picook.global.exception.BusinessException;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Duration;
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

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(5))
            .build();

    @PostConstruct
    void init() throws IOException {
        Files.createDirectories(Path.of(tempDir));
    }

    /**
     * yt-dlp로 영상 길이(초)를 조회. 3분 초과 시 거부.
     */
    public void checkDuration(String url) {
        try {
            ProcessBuilder pb = new ProcessBuilder(
                    ytdlpPath, "--no-warnings", "--print", "duration", "--no-download", url
            );
            pb.redirectErrorStream(true);
            Process process = pb.start();
            String output = new String(process.getInputStream().readAllBytes()).strip();
            boolean finished = process.waitFor(15, TimeUnit.SECONDS);

            if (!finished) {
                process.destroyForcibly();
                log.warn("Duration check timed out for {}", url);
                return; // 타임아웃 시 길이 체크 스킵 (변환은 시도)
            }

            if (process.exitValue() == 0 && !output.isBlank()) {
                // 멀티라인 출력 시 마지막 줄만 파싱 (경고 메시지 무시)
                String lastLine = output.lines().reduce((first, second) -> second).orElse(output).strip();
                try {
                    double seconds = Double.parseDouble(lastLine);
                    if (seconds > 180) {
                        throw new BusinessException("VIDEO_TOO_LONG",
                                "3분 이하의 영상만 변환할 수 있습니다", HttpStatus.BAD_REQUEST);
                    }
                    log.debug("Video duration: {}s for {}", seconds, url);
                } catch (NumberFormatException e) {
                    log.warn("Could not parse duration '{}' for {}", lastLine, url);
                }
            }
        } catch (BusinessException e) {
            throw e;
        } catch (Exception e) {
            log.warn("Duration check failed for {}: {}", url, e.getMessage());
        }
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

    /**
     * yt-dlp --dump-json으로 메타데이터를 가져온 뒤 음성 추출까지 수행.
     * 메타데이터 파싱 실패 시에도 음성 추출은 계속 진행한다.
     */
    public YtDlpResult fetchMetadataAndExtractAudio(String url) {
        String channelName = null;
        String originalTitle = null;
        Integer durationSeconds = null;
        String thumbnailUrl = null;

        // 1) --dump-json 으로 메타데이터 조회
        try {
            ProcessBuilder pb = new ProcessBuilder(
                    ytdlpPath, "--no-warnings", "--dump-json", "--no-download", url
            );
            pb.redirectErrorStream(true);
            Process process = pb.start();
            String output = new String(process.getInputStream().readAllBytes()).strip();
            boolean finished = process.waitFor(20, TimeUnit.SECONDS);

            if (!finished) {
                process.destroyForcibly();
                log.warn("Metadata fetch timed out for {}", url);
            } else if (process.exitValue() == 0 && !output.isBlank()) {
                JsonNode json = objectMapper.readTree(output);
                originalTitle = getTextOrNull(json, "title");
                if (json.has("duration") && !json.get("duration").isNull()) {
                    durationSeconds = json.get("duration").asInt();
                }
                thumbnailUrl = getTextOrNull(json, "thumbnail");

                // yt-dlp의 channel 필드는 MCN 네트워크명이 반환될 수 있으므로
                // YouTube oEmbed API로 정확한 채널 표시명을 조회
                channelName = fetchChannelNameFromOEmbed(url);
                if (channelName == null) {
                    // oEmbed 실패 시 yt-dlp fallback
                    channelName = getTextOrNull(json, "channel");
                    if (channelName == null) {
                        channelName = getTextOrNull(json, "uploader");
                    }
                }

                log.debug("YouTube metadata: channel={}, title={}, duration={}s",
                        channelName, originalTitle, durationSeconds);
            }
        } catch (Exception e) {
            log.warn("Metadata fetch failed for {}: {}", url, e.getMessage());
        }

        // 2) 기존 음성 추출
        Path audioPath = extractAudio(url);

        return new YtDlpResult(audioPath, channelName, originalTitle, durationSeconds, thumbnailUrl);
    }

    /**
     * YouTube oEmbed API로 정확한 채널 표시명을 조회한다.
     * yt-dlp의 channel 필드는 MCN 소속 채널의 경우 네트워크명(예: Tasty)이 반환되는 문제가 있어
     * oEmbed의 author_name을 사용한다.
     */
    private String fetchChannelNameFromOEmbed(String videoUrl) {
        try {
            // shorts URL을 watch URL 형식으로 변환 (oEmbed는 watch URL만 지원)
            String watchUrl = videoUrl.replaceFirst("/shorts/", "/watch?v=");
            String encoded = URLEncoder.encode(watchUrl, StandardCharsets.UTF_8);
            String oembedUrl = "https://www.youtube.com/oembed?url=" + encoded + "&format=json";

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(oembedUrl))
                    .timeout(Duration.ofSeconds(5))
                    .GET()
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() == 200) {
                JsonNode json = objectMapper.readTree(response.body());
                String authorName = getTextOrNull(json, "author_name");
                if (authorName != null) {
                    log.debug("oEmbed channel name: {}", authorName);
                }
                return authorName;
            }
            log.warn("oEmbed API returned status {} for {}", response.statusCode(), videoUrl);
        } catch (Exception e) {
            log.warn("oEmbed channel name fetch failed for {}: {}", videoUrl, e.getMessage());
        }
        return null;
    }

    private String getTextOrNull(JsonNode node, String field) {
        if (node.has(field) && !node.get(field).isNull()) {
            String text = node.get(field).asText();
            return text.isBlank() ? null : text;
        }
        return null;
    }
}
