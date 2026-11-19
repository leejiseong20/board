package com.leejiseong.board.domain.member;

import com.leejiseong.board.domain.member.dto.NicknameUpdateRequest;
import com.leejiseong.board.domain.member.dto.PasswordUpdateRequest;
import com.leejiseong.board.domain.member.repository.MemberRepository;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class MemberService {

    private final MemberRepository memberRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    public MemberService(MemberRepository memberRepository,
                         BCryptPasswordEncoder passwordEncoder) {
        this.memberRepository = memberRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public String updateNickname(String email, NicknameUpdateRequest req) {
        Member member = memberRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 회원입니다."));

        // 현재 닉네임과 동일하면 그냥 통과 (중복 체크 불필요)
        if (!member.getNickname().equals(req.getNickname())
                && memberRepository.existsByNickname(req.getNickname())) {
            throw new IllegalArgumentException("이미 사용 중인 닉네임입니다.");
        }

        member.updateNickname(req.getNickname());
        return member.getNickname();
    }

    @Transactional
    public void updatePassword(String email, PasswordUpdateRequest req) {
        Member member = memberRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 회원입니다."));

        if (!passwordEncoder.matches(req.getCurrentPassword(), member.getPassword())) {
            throw new IllegalArgumentException("현재 비밀번호가 올바르지 않습니다.");
        }

        if (!req.getNewPassword().equals(req.getConfirmNewPassword())) {
            throw new IllegalArgumentException("새 비밀번호가 일치하지 않습니다.");
        }

        // 현재 비밀번호와 동일한 비밀번호로 변경 방지
        if (passwordEncoder.matches(req.getNewPassword(), member.getPassword())) {
            throw new IllegalArgumentException("현재 비밀번호와 동일한 비밀번호로 변경할 수 없습니다.");
        }

        member.updatePassword(passwordEncoder.encode(req.getNewPassword()));
    }
}
