package com.project.back_end.services;

import java.util.Map;

public interface TokenValidationService {
    Map<String, Object> validateToken(String token, String role);
}
