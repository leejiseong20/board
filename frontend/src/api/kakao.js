import api from "./axios";

/**
 * 브라우저 Geolocation으로 현재 위치(위도/경도) 가져오기
 */
export const getCurrentPosition = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("이 브라우저는 위치 정보를 지원하지 않습니다."));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          reject(new Error("위치 권한이 거부되었습니다. 브라우저 설정에서 허용해주세요."));
        } else {
          reject(new Error("위치 정보를 가져올 수 없습니다."));
        }
      },
      { timeout: 10000, maximumAge: 60000 }
    );
  });
};

/**
 * 백엔드를 통해 좌표 → 주소 변환
 * (CORS 문제 없이 서버에서 Kakao API 직접 호출)
 */
export const coordToAddress = async (lat, lng) => {
  const res = await api.get("/api/kakao/address", { params: { lat, lng } });
  return res.data.data; // 주소 문자열
};

/**
 * 현재 위치 → 주소 한 번에 가져오기
 */
export const getCurrentAddress = async () => {
  const { lat, lng } = await getCurrentPosition();
  return await coordToAddress(lat, lng);
};
