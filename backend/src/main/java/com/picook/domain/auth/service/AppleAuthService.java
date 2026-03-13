package com.picook.domain.auth.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.picook.domain.auth.dto.AuthResponse;
import com.picook.domain.user.entity.LoginType;
import com.picook.domain.user.entity.User;
import com.picook.domain.user.repository.UserRepository;
import com.picook.global.exception.BusinessException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.reactive.function.client.WebClient;

import java.math.BigInteger;
import java.security.KeyFactory;
import java.security.PublicKey;
import java.security.spec.RSAPublicKeySpec;
import java.time.Instant;
import java.util.Base64;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;

@Service
public class AppleAuthService {

    private static final Logger log = LoggerFactory.getLogger(AppleAuthService.class);
    private static final String APPLE_JWKS_URL = "https://appleid.apple.com/auth/keys";
    private static final String APPLE_ISSUER = "https://appleid.apple.com";

    private final UserRepository userRepository;
    private final AuthService authService;
    private final WebClient webClient;
    private final ObjectMapper objectMapper;

    @Value("${apple.bundle-id:com.picook.app}")
    private String bundleId;

    private final Map<String, PublicKey> keyCache = new ConcurrentHashMap<>();

    public AppleAuthService(UserRepository userRepository,
                            AuthService authService,
                            WebClient.Builder webClientBuilder,
                            ObjectMapper objectMapper) {
        this.userRepository = userRepository;
        this.authService = authService;
        this.webClient = webClientBuilder.build();
        this.objectMapper = objectMapper;
    }

    @Transactional
    public AuthResponse login(String identityToken) {
        Claims claims = verifyAppleToken(identityToken);

        String appleId = claims.getSubject();
        String email = claims.get("email", String.class);

        User user = userRepository.findByAppleId(appleId)
                .map(existingUser -> {
                    existingUser.setLastLoginAt(Instant.now());
                    return existingUser;
                })
                .orElseGet(() -> {
                    User newUser = new User(LoginType.APPLE);
                    newUser.setAppleId(appleId);
                    newUser.setEmail(email);
                    newUser.setLastLoginAt(Instant.now());
                    return userRepository.save(newUser);
                });

        return authService.createAuthResponse(user);
    }

    private Claims verifyAppleToken(String identityToken) {
        try {
            String header = identityToken.split("\\.")[0];
            String decodedHeader = new String(Base64.getUrlDecoder().decode(header));
            JsonNode headerNode = objectMapper.readTree(decodedHeader);
            String kid = headerNode.get("kid").asText();

            PublicKey publicKey = getApplePublicKey(kid);

            Claims claims = Jwts.parser()
                    .requireIssuer(APPLE_ISSUER)
                    .requireAudience(bundleId)
                    .verifyWith(publicKey)
                    .build()
                    .parseSignedClaims(identityToken)
                    .getPayload();

            if (claims.getExpiration().toInstant().isBefore(Instant.now())) {
                throw new BusinessException("APPLE_TOKEN_EXPIRED", "Apple token has expired", HttpStatus.UNAUTHORIZED);
            }

            return claims;
        } catch (BusinessException e) {
            throw e;
        } catch (Exception e) {
            log.error("Failed to verify Apple identity token", e);
            throw new BusinessException("APPLE_AUTH_FAILED", "Failed to verify Apple token", HttpStatus.UNAUTHORIZED);
        }
    }

    private PublicKey getApplePublicKey(String kid) {
        PublicKey cached = keyCache.get(kid);
        if (cached != null) {
            return cached;
        }

        try {
            String response = webClient.get()
                    .uri(APPLE_JWKS_URL)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            JsonNode jwks = objectMapper.readTree(response);
            JsonNode keys = jwks.get("keys");

            for (JsonNode key : keys) {
                String keyKid = key.get("kid").asText();
                if (keyKid.equals(kid)) {
                    String n = key.get("n").asText();
                    String e = key.get("e").asText();

                    byte[] nBytes = Base64.getUrlDecoder().decode(n);
                    byte[] eBytes = Base64.getUrlDecoder().decode(e);

                    RSAPublicKeySpec spec = new RSAPublicKeySpec(
                            new BigInteger(1, nBytes),
                            new BigInteger(1, eBytes)
                    );
                    PublicKey publicKey = KeyFactory.getInstance("RSA").generatePublic(spec);
                    keyCache.put(kid, publicKey);
                    return publicKey;
                }
            }

            throw new BusinessException("APPLE_KEY_NOT_FOUND", "Apple public key not found for kid: " + kid, HttpStatus.UNAUTHORIZED);
        } catch (BusinessException e) {
            throw e;
        } catch (Exception e) {
            log.error("Failed to fetch Apple JWKS", e);
            throw new BusinessException("APPLE_AUTH_FAILED", "Failed to fetch Apple public keys", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
