package com.picook.global.exception;

import com.picook.global.response.ApiResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.io.PrintWriter;
import java.io.StringWriter;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ApiResponse<Void>> handleBusinessException(BusinessException e) {
        log.warn("Business exception: {} - {}", e.getErrorCode(), e.getMessage());
        putExceptionToMdc(e);
        return ResponseEntity
                .status(e.getHttpStatus())
                .body(ApiResponse.error(e.getErrorCode(), e.getMessage()));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Void>> handleValidation(MethodArgumentNotValidException e) {
        String message = e.getBindingResult().getFieldErrors().stream()
                .map(f -> f.getField() + ": " + f.getDefaultMessage())
                .reduce((a, b) -> a + ", " + b)
                .orElse("Validation failed");
        putExceptionToMdc(e);
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error("VALIDATION_ERROR", message));
    }

    /**
     * 서비스 계층에서 선검사를 통과했더라도 동시 요청으로 유니크 제약에 걸릴 수 있음.
     * display_name 유니크 충돌은 409 + DISPLAY_NAME_TAKEN으로 매핑, 그 외 무결성 충돌은 CONFLICT로 일반화.
     */
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ApiResponse<Void>> handleDataIntegrity(DataIntegrityViolationException e) {
        log.warn("Data integrity violation: {}", e.getMostSpecificCause().getMessage());
        putExceptionToMdc(e);
        String causeMessage = e.getMostSpecificCause().getMessage();
        if (causeMessage != null && causeMessage.contains("uq_users_display_name")) {
            return ResponseEntity
                    .status(HttpStatus.CONFLICT)
                    .body(ApiResponse.error("DISPLAY_NAME_TAKEN", "이미 사용 중인 닉네임입니다"));
        }
        return ResponseEntity
                .status(HttpStatus.CONFLICT)
                .body(ApiResponse.error("DATA_INTEGRITY_VIOLATION", "데이터 무결성 제약 위반"));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Void>> handleException(Exception e) {
        log.error("Unexpected error", e);
        putExceptionToMdc(e);
        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("INTERNAL_ERROR", "Internal server error"));
    }

    /**
     * Lighthouse 모니터링 수집용: exception 정보를 MDC에 저장.
     * RequestLoggingFilter의 accessLog가 찍힐 때 LogstashEncoder가 MDC 값을 JSON에 포함시킨다.
     * MDC 정리는 RequestLoggingFilter의 finally 블록에서 수행.
     */
    private void putExceptionToMdc(Exception e) {
        MDC.put("exception_class", e.getClass().getName());
        StringWriter sw = new StringWriter(1024);
        e.printStackTrace(new PrintWriter(sw));
        String stackTrace = sw.toString();
        // 스택트레이스가 너무 길면 잘라서 저장 (ClickHouse 저장 효율)
        if (stackTrace.length() > 4096) {
            stackTrace = stackTrace.substring(0, 4096) + "\n... truncated";
        }
        MDC.put("stack_trace", stackTrace);
    }
}
