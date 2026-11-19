package com.leejiseong.board.domain.kakao;

import com.leejiseong.board.global.ApiResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/kakao")
public class KakaoController {

    @Value("${kakao.rest-api-key}")
    private String kakaoRestApiKey;

    private final RestTemplate restTemplate = new RestTemplate();

    @GetMapping("/address")
    public ApiResponse<String> coordToAddress(
            @RequestParam double lat,
            @RequestParam double lng
    ) {
        String url = String.format(
                "https://dapi.kakao.com/v2/local/geo/coord2address.json?y=%s&x=%s",
                lat, lng
        );

        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "KakaoAK " + kakaoRestApiKey);
        HttpEntity<Void> entity = new HttpEntity<>(headers);

        try {
            ResponseEntity<Map> response = restTemplate.exchange(
                    url, HttpMethod.GET, entity, Map.class
            );

            Map body = response.getBody();
            if (body == null) throw new IllegalArgumentException("카카오 API 응답이 없습니다.");

            List<Map<String, Object>> documents =
                    (List<Map<String, Object>>) body.get("documents");

            if (documents == null || documents.isEmpty())
                throw new IllegalArgumentException("해당 위치의 주소를 찾을 수 없습니다.");

            Map<String, Object> doc = documents.get(0);

            Map<String, Object> roadAddr = (Map<String, Object>) doc.get("road_address");
            Map<String, Object> jibunAddr = (Map<String, Object>) doc.get("address");

            // 도로명 주소 우선 — 없으면 지번 주소
            if (roadAddr != null) {
                String addr = (String) roadAddr.get("address_name");
                if (addr != null && !addr.isBlank()) return ApiResponse.ok(addr);
            }

            if (jibunAddr != null) {
                String addr = (String) jibunAddr.get("address_name");
                if (addr != null && !addr.isBlank()) return ApiResponse.ok(addr);
            }

            throw new IllegalArgumentException("주소 정보를 가져올 수 없습니다.");

        } catch (HttpClientErrorException e) {
            System.err.println("[Kakao API 오류] status=" + e.getStatusCode()
                    + " body=" + e.getResponseBodyAsString());
            throw new IllegalArgumentException(
                    "카카오 API 오류: " + e.getStatusCode() + " - " + e.getResponseBodyAsString()
            );
        } catch (Exception e) {
            System.err.println("[Kakao API 오류] " + e.getMessage());
            throw new IllegalArgumentException("주소 변환 실패: " + e.getMessage());
        }
    }
}
