package com.picook.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.picook.global.response.ApiResponse;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.MediaType;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentLinkedDeque;

@Component
public class RateLimitFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(RateLimitFilter.class);

    private final ClientIpResolver clientIpResolver;
    private final ObjectMapper objectMapper;
    private final ConcurrentHashMap<String, ConcurrentLinkedDeque<Instant>> requestCounts = new ConcurrentHashMap<>();

    private record RateLimitRule(String method, String path, int maxRequests, boolean useUserId) {}

    private static final List<RateLimitRule> RULES = List.of(
            new RateLimitRule("POST", "/api/auth/kakao", 10, false),
            new RateLimitRule("POST", "/api/auth/apple", 10, false),
            new RateLimitRule("POST", "/api/auth/refresh", 30, false),
            new RateLimitRule("POST", "/api/admin/auth/login", 10, false),
            new RateLimitRule("POST", "/api/v1/recipes/recommend", 20, true),
            new RateLimitRule("POST", "/api/v1/files/upload", 5, true)
    );

    public RateLimitFilter(ClientIpResolver clientIpResolver, ObjectMapper objectMapper) {
        this.clientIpResolver = clientIpResolver;
        this.objectMapper = objectMapper;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        String method = request.getMethod();
        String uri = request.getRequestURI();

        for (RateLimitRule rule : RULES) {
            if (rule.method.equals(method) && uri.equals(rule.path)) {
                String key = buildKey(rule, request);
                if (key != null && isRateLimited(key, rule.maxRequests)) {
                    log.warn("[RATE_LIMIT] {} {} - key: {}", method, uri, key);
                    writeErrorResponse(response);
                    return;
                }
                break;
            }
        }

        filterChain.doFilter(request, response);
    }

    private String buildKey(RateLimitRule rule, HttpServletRequest request) {
        if (rule.useUserId) {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.getPrincipal() instanceof String principal && !"anonymousUser".equals(principal)) {
                return "user:" + principal + ":" + rule.path;
            }
            return null;
        }
        return "ip:" + clientIpResolver.resolve(request) + ":" + rule.path;
    }

    private boolean isRateLimited(String key, int maxRequests) {
        Instant now = Instant.now();
        Instant oneMinuteAgo = now.minus(1, ChronoUnit.MINUTES);

        ConcurrentLinkedDeque<Instant> timestamps = requestCounts.computeIfAbsent(key, k -> new ConcurrentLinkedDeque<>());

        // 만료된 엔트리 제거
        while (!timestamps.isEmpty() && timestamps.peekFirst().isBefore(oneMinuteAgo)) {
            timestamps.pollFirst();
        }

        if (timestamps.size() >= maxRequests) {
            return true;
        }

        timestamps.addLast(now);
        return false;
    }

    private void writeErrorResponse(HttpServletResponse response) throws IOException {
        response.setStatus(429);
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding(StandardCharsets.UTF_8.name());

        ApiResponse<Void> errorResponse = ApiResponse.error(
                "RATE_LIMIT_EXCEEDED", "요청이 너무 많습니다. 잠시 후 다시 시도해주세요.");
        response.getWriter().write(objectMapper.writeValueAsString(errorResponse));
    }

    @Scheduled(fixedRate = 60_000)
    public void cleanup() {
        Instant oneMinuteAgo = Instant.now().minus(1, ChronoUnit.MINUTES);
        requestCounts.entrySet().removeIf(entry -> {
            ConcurrentLinkedDeque<Instant> timestamps = entry.getValue();
            while (!timestamps.isEmpty() && timestamps.peekFirst().isBefore(oneMinuteAgo)) {
                timestamps.pollFirst();
            }
            return timestamps.isEmpty();
        });
    }
}
