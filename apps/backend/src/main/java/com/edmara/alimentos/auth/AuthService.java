package com.edmara.alimentos.auth;

import com.edmara.alimentos.auth.dto.LoginRequest;
import com.edmara.alimentos.auth.dto.LoginResponse;
import com.edmara.alimentos.user.AppUser;
import com.edmara.alimentos.user.dto.UserResponse;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    public AuthService(AuthenticationManager authenticationManager, JwtService jwtService) {
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
    }

    public LoginResponse login(LoginRequest request) {
        var authentication = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(request.email(), request.password())
        );
        AppUser user = (AppUser) authentication.getPrincipal();
        String token = jwtService.generateToken(user);
        return new LoginResponse(token, UserResponse.from(user));
    }
}
