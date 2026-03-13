package com.picook.global.response;

import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record ApiResponse<T>(
        String status,
        T data,
        ErrorDetail error
) {
    public record ErrorDetail(String code, String message) {}

    public static <T> ApiResponse<T> success(T data) {
        return new ApiResponse<>("success", data, null);
    }

    public static ApiResponse<Void> success() {
        return new ApiResponse<>("success", null, null);
    }

    public static ApiResponse<Void> error(String code, String message) {
        return new ApiResponse<>("error", null, new ErrorDetail(code, message));
    }
}
