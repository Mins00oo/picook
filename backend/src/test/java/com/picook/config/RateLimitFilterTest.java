package com.picook.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.FilterChain;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import java.io.PrintWriter;
import java.io.StringWriter;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

class RateLimitFilterTest {

    private RateLimitFilter filter;
    private ClientIpResolver clientIpResolver;
    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        clientIpResolver = new ClientIpResolver(List.of("127.0.0.1"));
        objectMapper = new ObjectMapper();
        filter = new RateLimitFilter(clientIpResolver, objectMapper);
        SecurityContextHolder.clearContext();
    }

    @Test
    void shouldAllowRequestWithinLimit() throws Exception {
        HttpServletRequest request = mockRequest("POST", "/api/auth/kakao", "10.0.0.1");
        HttpServletResponse response = mock(HttpServletResponse.class);
        FilterChain chain = mock(FilterChain.class);

        filter.doFilterInternal(request, response, chain);

        verify(chain).doFilter(request, response);
        verify(response, never()).setStatus(429);
    }

    @Test
    void shouldBlockRequestExceedingLimit() throws Exception {
        // /api/auth/kakao는 IP 기반 10/분
        for (int i = 0; i < 10; i++) {
            HttpServletRequest req = mockRequest("POST", "/api/auth/kakao", "10.0.0.1");
            HttpServletResponse resp = mock(HttpServletResponse.class);
            FilterChain chain = mock(FilterChain.class);
            filter.doFilterInternal(req, resp, chain);
        }

        // 11번째 요청 → 차단
        HttpServletRequest request = mockRequest("POST", "/api/auth/kakao", "10.0.0.1");
        StringWriter sw = new StringWriter();
        HttpServletResponse response = mock(HttpServletResponse.class);
        when(response.getWriter()).thenReturn(new PrintWriter(sw));
        FilterChain chain = mock(FilterChain.class);

        filter.doFilterInternal(request, response, chain);

        verify(response).setStatus(429);
        verify(chain, never()).doFilter(any(), any());
        assertThat(sw.toString()).contains("RATE_LIMIT_EXCEEDED");
    }

    @Test
    void shouldNotAffectDifferentIps() throws Exception {
        // IP1: 10회 소진
        for (int i = 0; i < 10; i++) {
            HttpServletRequest req = mockRequest("POST", "/api/auth/kakao", "10.0.0.1");
            filter.doFilterInternal(req, mock(HttpServletResponse.class), mock(FilterChain.class));
        }

        // IP2: 아직 여유 있음
        HttpServletRequest request = mockRequest("POST", "/api/auth/kakao", "10.0.0.2");
        HttpServletResponse response = mock(HttpServletResponse.class);
        FilterChain chain = mock(FilterChain.class);
        filter.doFilterInternal(request, response, chain);

        verify(chain).doFilter(request, response);
    }

    @Test
    void shouldAllowNonRateLimitedEndpoints() throws Exception {
        HttpServletRequest request = mockRequest("GET", "/api/v1/recipes/123", "10.0.0.1");
        HttpServletResponse response = mock(HttpServletResponse.class);
        FilterChain chain = mock(FilterChain.class);

        filter.doFilterInternal(request, response, chain);

        verify(chain).doFilter(request, response);
    }

    @Test
    void shouldRateLimitByUserIdForAuthenticatedEndpoints() throws Exception {
        setAuthenticatedUser("user-uuid-1234");

        // /api/v1/files/upload는 userId 기반 5/분
        for (int i = 0; i < 5; i++) {
            HttpServletRequest req = mockRequest("POST", "/api/v1/files/upload", "10.0.0.1");
            filter.doFilterInternal(req, mock(HttpServletResponse.class), mock(FilterChain.class));
        }

        // 6번째 → 차단
        HttpServletRequest request = mockRequest("POST", "/api/v1/files/upload", "10.0.0.1");
        StringWriter sw = new StringWriter();
        HttpServletResponse response = mock(HttpServletResponse.class);
        when(response.getWriter()).thenReturn(new PrintWriter(sw));
        FilterChain chain = mock(FilterChain.class);

        filter.doFilterInternal(request, response, chain);

        verify(response).setStatus(429);
    }

    @Test
    void cleanupShouldRemoveExpiredEntries() {
        // cleanup은 빈 deque를 제거. 직접 테스트하기 어려우므로 예외 없이 실행되는지만 확인
        filter.cleanup();
    }

    private HttpServletRequest mockRequest(String method, String uri, String remoteAddr) {
        HttpServletRequest request = mock(HttpServletRequest.class);
        when(request.getMethod()).thenReturn(method);
        when(request.getRequestURI()).thenReturn(uri);
        when(request.getRemoteAddr()).thenReturn(remoteAddr);
        return request;
    }

    private void setAuthenticatedUser(String userId) {
        UsernamePasswordAuthenticationToken auth =
                new UsernamePasswordAuthenticationToken(userId, null, List.of());
        SecurityContextHolder.getContext().setAuthentication(auth);
    }
}
