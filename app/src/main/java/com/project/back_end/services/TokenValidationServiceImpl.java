package com.project.back_end.services;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.project.back_end.repo.AdminRepository;
import com.project.back_end.repo.DoctorRepository;
import com.project.back_end.repo.PatientRepository;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@Service
public class TokenValidationServiceImpl implements TokenValidationService {

    private final AdminRepository adminRepository;
    private final DoctorRepository doctorRepository;
    private final PatientRepository patientRepository;

    @Value("${jwt.secret}")
    private String jwtSecret;

    public TokenValidationServiceImpl(AdminRepository adminRepository,
                                      DoctorRepository doctorRepository,
                                      PatientRepository patientRepository) {
        this.adminRepository = adminRepository;
        this.doctorRepository = doctorRepository;
        this.patientRepository = patientRepository;
    }

    private SecretKey key() {
        return Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
    }

    private Jws<Claims> parse(String token) {
        return Jwts.parserBuilder().setSigningKey(key()).build().parseClaimsJws(token);
    }

    @Override
    public Map<String, Object> validateToken(String token, String role) {
        Map<String, Object> err = new HashMap<>();
        try {
            Jws<Claims> jws = parse(token);
            Claims claims = jws.getBody();

            Date exp = claims.getExpiration();
            if (exp != null && exp.before(new Date())) {
                err.put("error", "Token expired");
                return err;
            }

            String email = claims.getSubject();
            if (email == null || email.isBlank()) {
                err.put("error", "Token subject (email) missing");
                return err;
            }

            boolean exists =
                "admin".equalsIgnoreCase(role)   ? adminRepository.existsByEmail(email) :
                "doctor".equalsIgnoreCase(role)  ? doctorRepository.existsByEmail(email) :
                "patient".equalsIgnoreCase(role) ? patientRepository.existsByEmail(email) :
                false;

            if (!exists) {
                err.put("error", "No " + role + " found for token subject");
            }
        } catch (ExpiredJwtException e) {
            err.put("error", "Token expired");
        } catch (UnsupportedJwtException | MalformedJwtException e) {
            err.put("error", "Invalid token");
        } catch (SignatureException e) {
            err.put("error", "Invalid signature");
        } catch (IllegalArgumentException e) {
            err.put("error", "Token missing or blank");
        } catch (Exception e) {
            err.put("error", "Token validation failed");
        }
        return err; // empty map = valid per your controller logic
    }
}
