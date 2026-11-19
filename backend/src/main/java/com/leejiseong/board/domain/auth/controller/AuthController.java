package com.leejiseong.board.domain.auth.controller;

import com.leejiseong.board.domain.auth.dto.LoginRequest;
import com.leejiseong.board.domain.auth.dto.LoginResponse;
import com.leejiseong.board.domain.auth.dto.SignupRequest;
import com.leejiseong.board.domain.auth.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/signup")
    public Long signup(@Valid @RequestBody SignupRequest req) {
        return authService.signup(req);
    }

    @PostMapping("/login")
    public LoginResponse login(@Valid @RequestBody LoginRequest req) {
        return authService.login(req);
    }
}