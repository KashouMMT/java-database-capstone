package com.project.back_end.mvc;

import com.project.back_end.services.TokenValidationService; // <-- important
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import java.util.Map;

@Controller
public class DashboardController {
    private final TokenValidationService tokenValidationService;

    public DashboardController(TokenValidationService tokenValidationService) {
        this.tokenValidationService = tokenValidationService;
    }

    @GetMapping("/adminDashboard/{token}")
    public String adminDashboard(@PathVariable String token) {
        Map<String, Object> result = tokenValidationService.validateToken(token, "admin");
        return (result == null || result.isEmpty()) ? "admin/adminDashboard" : "redirect:http://localhost:8080";
    }

    @GetMapping("/doctorDashboard/{token}")
    public String doctorDashboard(@PathVariable String token) {
        Map<String, Object> result = tokenValidationService.validateToken(token, "doctor");
        return (result == null || result.isEmpty()) ? "doctor/doctorDashboard" : "redirect:http://localhost:8080";
    }
}
