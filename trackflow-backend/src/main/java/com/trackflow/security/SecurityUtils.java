package com.trackflow.security;

import org.springframework.security.core.context.SecurityContextHolder;

public class SecurityUtils {
    public static CurrentUser currentUser() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof CurrentUser cu) {
            return cu;
        }
        throw new IllegalStateException("No authenticated user in context");
    }

    // Resolves the effective baseId to filter by: ADMIN can pass any/no baseId (filter param),
    // non-admins are always restricted to their own base regardless of what they request.
    public static Long resolveBaseId(Long requestedBaseId) {
        CurrentUser user = currentUser();
        if (user.isAdmin()) {
            return requestedBaseId;
        }
        return user.baseId();
    }
}
