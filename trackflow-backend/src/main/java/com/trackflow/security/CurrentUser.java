package com.trackflow.security;

// Lightweight principal placed into the SecurityContext by JwtAuthFilter.
public record CurrentUser(String username, String role, Long baseId) {
    public boolean isAdmin() {
        return "ADMIN".equals(role);
    }
}
