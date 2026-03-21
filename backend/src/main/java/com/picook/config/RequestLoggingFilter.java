package com.picook.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.web.util.ContentCachingResponseWrapper;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Set;
import java.util.UUID;

@Component
public class RequestLoggingFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(RequestLoggingFilter.class);
    private static final Logger accessLog = LoggerFactory.getLogger("lighthouse_access");

    private static final Set<String> SKIP_PREFIXES = Set.of(
            "/actuator", "/swagger-ui", "/v3/api-docs", "/uploads"
    );

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        String uri = request.getRequestURI();
        if (shouldSkip(uri)) {
            filterChain.doFilter(request, response);
            return;
        }

        String method = request.getMethod();
        String userId = extractUserId();
        String clientIp = extractClientIp(request);

        log.info("[REQUEST] {} {} - userId: {} ip: {}", method, uri, userId, clientIp);

        // Lighthouse 수집용 MDC 설정 (chain.doFilter 전에 설정해야 컨트롤러 로그에도 포함)
        MDC.put("http_method", method);
        MDC.put("http_path", uri);
        MDC.put("client_ip", clientIp);

        long startTime = System.nanoTime();
        ContentCachingResponseWrapper wrappedResponse = new ContentCachingResponseWrapper(response);

        try {
            filterChain.doFilter(request, wrappedResponse);
        } catch (Exception e) {
            MDC.put("exception_class", e.getClass().getName());
            throw e;
        } finally {
            long elapsedMs = (System.nanoTime() - startTime) / 1_000_000;
            int status = wrappedResponse.getStatus();

            if (status >= 400) {
                String errorMessage = extractErrorMessage(wrappedResponse);
                log.warn("[ERROR] {} {} - {} - {}", method, uri, status, errorMessage);
            } else {
                log.info("[RESPONSE] {} {} - {} - {}ms", method, uri, status, elapsedMs);
            }

            // Lighthouse 수집용 JSON 로그 출력
            MDC.put("http_status", String.valueOf(status));
            MDC.put("response_time_ms", String.valueOf(elapsedMs));
            accessLog.info("{} {} {} {}ms", method, uri, status, elapsedMs);

            // MDC 정리
            MDC.remove("http_method");
            MDC.remove("http_path");
            MDC.remove("http_status");
            MDC.remove("response_time_ms");
            MDC.remove("client_ip");
            MDC.remove("exception_class");
            MDC.remove("stack_trace");

            wrappedResponse.copyBodyToResponse();
        }
    }

    private boolean shouldSkip(String uri) {
        for (String prefix : SKIP_PREFIXES) {
            if (uri.startsWith(prefix)) return true;
        }
        return false;
    }

    private String extractUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof String principal) {
            try {
                UUID.fromString(principal);
                return principal.substring(0, 8);
            } catch (IllegalArgumentException ignored) {
            }
        }
        return "anonymous";
    }

    private String extractClientIp(HttpServletRequest request) {
        String xRealIp = request.getHeader("X-Real-IP");
        if (xRealIp != null && !xRealIp.isBlank()) return xRealIp;
        String xff = request.getHeader("X-Forwarded-For");
        if (xff != null && !xff.isBlank()) return xff.split(",")[0].strip();
        return request.getRemoteAddr();
    }

    private String extractErrorMessage(ContentCachingResponseWrapper response) {
        byte[] body = response.getContentAsByteArray();
        if (body.length == 0) {
            return "no response body";
        }
        String content = new String(body, StandardCharsets.UTF_8);
        // ApiResponse의 error.message 필드를 간단히 추출
        int msgIdx = content.indexOf("\"message\"");
        if (msgIdx >= 0) {
            int start = content.indexOf('"', msgIdx + 10);
            int end = content.indexOf('"', start + 1);
            if (start >= 0 && end > start) {
                return content.substring(start + 1, end);
            }
        }
        // 메시지 추출 실패 시 상태코드만
        return "status " + response.getStatus();
    }
}
