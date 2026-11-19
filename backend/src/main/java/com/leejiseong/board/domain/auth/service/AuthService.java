package com.leejiseong.board.domain.auth.service;

import com.leejiseong.board.domain.auth.dto.LoginRequest;
import com.leejiseong.board.domain.auth.dto.LoginResponse;
import com.leejiseong.board.domain.auth.dto.SignupRequest;
import com.leejiseong.board.domain.member.Member;
import com.leejiseong.board.domain.member.Role;
import com.leejiseong.board.domain.member.repository.MemberRepository;
import com.leejiseong.board.global.jwt.JwtTokenProvider;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final MemberRepository memberRepository;
    private final JwtTokenProvider jwtTokenProvider;
    private final BCryptPasswordEncoder passwordEncoder;

    public AuthService(MemberRepository memberRepository,
                       JwtTokenProvider jwtTokenProvider,
                       BCryptPasswordEncoder passwordEncoder) {
        this.memberRepository = memberRepository;
        this.jwtTokenProvider = jwtTokenProvider;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public Long signup(SignupRequest req) {
        if (memberRepository.existsByEmail(req.getEmail())) {
            throw new IllegalArgumentException("이미 존재하는 이메일입니다.");
        }
        if (memberRepository.existsByNickname(req.getNickname())) {
            throw new IllegalArgumentException("이미 사용 중인 닉네임입니다.");
        }
        if (!req.getPassword().equals(req.getConfirmPassword())) {
            throw new IllegalArgumentException("비밀번호가 일치하지 않습니다.");
        }

        String encodedPassword = passwordEncoder.encode(req.getPassword());
        Member member = new Member(
                req.getEmail(), encodedPassword,
                req.getNickname(), req.getAddress(), Role.USER
        );
        memberRepository.save(member);
        return member.getId();
    }

    public LoginResponse login(LoginRequest req) {
        Member member = memberRepository.findByEmail(req.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 이메일입니다."));

        if (!passwordEncoder.matches(req.getPassword(), member.getPassword())) {
            throw new IllegalArgumentException("비밀번호가 올바르지 않습니다.");
        }

        // nickname, memberId를 토큰에 포함 → WebSocket 인증에 활용
        String accessToken = jwtTokenProvider.createToken(
                member.getEmail(), member.getRole().name(),
                member.getNickname(), member.getId()
        );

        return new LoginResponse(accessToken, member.getRole().name(), member.getNickname(), member.getId());
    }
}
