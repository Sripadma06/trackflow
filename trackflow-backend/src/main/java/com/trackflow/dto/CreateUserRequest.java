package com.trackflow.dto;

import com.trackflow.entity.Role;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CreateUserRequest {
    @NotBlank
    private String username;
    @NotBlank
    private String password;
    private String fullName;
    @NotNull
    private Role role;
    private Long baseId; // required unless role == ADMIN
}
