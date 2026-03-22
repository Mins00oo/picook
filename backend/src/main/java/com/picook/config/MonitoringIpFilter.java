package com.picook.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
@Order(Ordered.HIGHEST_PRECEDENCE + 5)
public class MonitoringIpFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(MonitoringIpFilter.class);

    @Value("${monitoring.allowed-ips}")
    private List<String> allowedIps;

    private final ClientIpResolver clientIpResolver;

    public MonitoringIpFilter(ClientIpResolver clientIpResolver) {
        this.clientIpResolver = clientIpResolver;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain chain) throws ServletException, IOException {
        String uri = request.getRequestURI();
        if (!isMonitoringPath(uri)) {
            chain.doFilter(request, response);
            return;
        }

        String clientIp = resolveClientIp(request);
        if (!allowedIps.contains(clientIp)) {
            log.warn("Monitoring access denied for IP: {} on path: {}", clientIp, uri);
            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
            return;
        }

        chain.doFilter(request, response);
    }

    private boolean isMonitoringPath(String uri) {
        return uri.startsWith("/api/monitoring/")
                || uri.equals("/actuator/prometheus")
                || uri.equals("/actuator/info");
    }

    private String resolveClientIp(HttpServletRequest request) {
        return clientIpResolver.resolve(request);
    }
}
