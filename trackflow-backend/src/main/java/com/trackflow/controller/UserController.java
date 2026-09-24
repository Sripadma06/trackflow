package com.trackflow.controller;

import com.trackflow.dto.CreateUserRequest;
import com.trackflow.entity.AppUser;
import com.trackflow.entity.Base;
import com.trackflow.entity.Role;
import com.trackflow.repository.AppUserRepository;
import com.trackflow.repository.BaseRepository;
import jakarta.validation.Valid;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final AppUserRepository appUserRepository;
    private final BaseRepository baseRepository;
    private final PasswordEncoder passwordEncoder;

    public UserController(AppUserRepository appUserRepository, BaseRepository baseRepository, PasswordEncoder passwordEncoder) {
        this.appUserRepository = appUserRepository;
        this.baseRepository = baseRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @GetMapping
    public List<AppUser> all() {
        return appUserRepository.findAll();
    }

    @PostMapping
    public AppUser create(@Valid @RequestBody CreateUserRequest request) {
        Base base = null;
        if (request.getRole() != Role.ADMIN) {
            if (request.getBaseId() == null) {
                throw new IllegalArgumentException("baseId is required for non-admin roles");
            }
            base = baseRepository.findById(request.getBaseId())
                    .orElseThrow(() -> new IllegalArgumentException("Base not found"));
        }
        AppUser user = AppUser.builder()
                .username(request.getUsername())
                .password(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName())
                .role(request.getRole())
                .base(base)
                .build();
        return appUserRepository.save(user);
    }
}
