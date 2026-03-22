package com.picook.config;

import jakarta.servlet.http.HttpServletRequest;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class ClientIpResolverTest {

    private final ClientIpResolver resolver = new ClientIpResolver(
            List.of("127.0.0.1", "0:0:0:0:0:0:0:1", "10.0.0.1")
    );

    @Test
    void shouldUseXForwardedForWhenFromTrustedProxy() {
        HttpServletRequest request = mockRequest("127.0.0.1", "203.0.113.50, 10.0.0.1", null);

        assertThat(resolver.resolve(request)).isEqualTo("203.0.113.50");
    }

    @Test
    void shouldUseXRealIpWhenFromTrustedProxy() {
        HttpServletRequest request = mockRequest("10.0.0.1", null, "203.0.113.99");

        assertThat(resolver.resolve(request)).isEqualTo("203.0.113.99");
    }

    @Test
    void shouldIgnoreHeadersWhenNotFromTrustedProxy() {
        HttpServletRequest request = mockRequest("192.168.1.100", "1.2.3.4", "5.6.7.8");

        assertThat(resolver.resolve(request)).isEqualTo("192.168.1.100");
    }

    @Test
    void shouldFallbackToRemoteAddrWhenNoHeaders() {
        HttpServletRequest request = mockRequest("127.0.0.1", null, null);

        assertThat(resolver.resolve(request)).isEqualTo("127.0.0.1");
    }

    @Test
    void shouldPreferXRealIpOverXForwardedFor() {
        HttpServletRequest request = mockRequest("127.0.0.1", "1.1.1.1", "2.2.2.2");

        assertThat(resolver.resolve(request)).isEqualTo("2.2.2.2");
    }

    private HttpServletRequest mockRequest(String remoteAddr, String xff, String xRealIp) {
        HttpServletRequest request = mock(HttpServletRequest.class);
        when(request.getRemoteAddr()).thenReturn(remoteAddr);
        when(request.getHeader("X-Forwarded-For")).thenReturn(xff);
        when(request.getHeader("X-Real-IP")).thenReturn(xRealIp);
        return request;
    }
}
