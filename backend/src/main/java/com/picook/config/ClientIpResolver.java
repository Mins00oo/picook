package com.picook.config;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class ClientIpResolver {

    private final List<String> trustedProxies;

    public ClientIpResolver(
            @Value("${security.trusted-proxies:127.0.0.1,0:0:0:0:0:0:0:1}") List<String> trustedProxies) {
        this.trustedProxies = trustedProxies;
    }

    public String resolve(HttpServletRequest request) {
        String remoteAddr = request.getRemoteAddr();

        if (!trustedProxies.contains(remoteAddr)) {
            return remoteAddr;
        }

        String xRealIp = request.getHeader("X-Real-IP");
        if (xRealIp != null && !xRealIp.isBlank()) {
            return xRealIp.strip();
        }

        String xff = request.getHeader("X-Forwarded-For");
        if (xff != null && !xff.isBlank()) {
            return xff.split(",")[0].strip();
        }

        return remoteAddr;
    }
}
