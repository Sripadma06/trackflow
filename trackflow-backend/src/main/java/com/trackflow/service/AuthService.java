package com.trackflow.service;

import com.trackflow.dto.LoginRequest;
import com.trackflow.dto.LoginResponse;
import com.trackflow.entity.AppUser;
import com.trackflow.repository.AppUserRepository;
import com.trackflow.security.JwtUtil;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final AppUserRepository appUserRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuditLogService auditLogService;

    public AuthService(AppUserRepository appUserRepository, PasswordEncoder passwordEncoder,
                        JwtUtil jwtUtil, AuditLogService auditLogService) {
        this.appUserRepository = appUserRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.auditLogService = auditLogService;
    }

    public LoginResponse login(LoginRequest request) {
        AppUser user = appUserRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new BadCredentialsException("Invalid username or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new BadCredentialsException("Invalid username or password");
        }

        Long baseId = user.getBase() != null ? user.getBase().getId() : null;
        String token = jwtUtil.generateToken(user.getUsername(), user.getRole().name(), baseId);

        auditLogService.log(user.getUsername(), "LOGIN", "AppUser", user.getId().toString(), "User logged in");

        return new LoginResponse(
                token,
                user.getUsername(),
                user.getRole().name(),
                baseId,
                user.getBase() != null ? user.getBase().getName() : null
        );
    }
}
