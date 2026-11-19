import { useEffect, useState, useRef, useCallback } from "react";
import { Client } from "@stomp/stompjs";
import toast from "react-hot-toast";
import {
  getFriends,
  getPendingRequests,
  acceptFriendRequest,
  deleteFriendship,
  sendFriendRequest,
} from "../api/friend";
import { getChatMessages, buildRoomId } from "../api/chat";
import api from "../api/axios";

export default function FriendPage() {
  const [tab, setTab] = useState("friends"); // "friends" | "requests"
  const [friends, setFriends] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [searchNickname, setSearchNickname] = useState("");
  const [searchResult, setSearchResult] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);

  // 채팅 상태
  const [activeFriend, setActiveFriend] = useState(null); // { memberId, nickname, friendshipId }
  const [messages, setMessages] = useState([]);
  const [inputMsg, setInputMsg] = useState("");
  const [connected, setConnected] = useState(false);

  const stompClientRef = useRef(null);
  const messagesEndRef = useRef(null);
  const currentRoomRef = useRef(null);

  const myMemberId = Number(localStorage.getItem("memberId"));
  const token = localStorage.getItem("accessToken");

  // 친구 목록 불러오기
  const loadFriends = useCallback(async () => {
    try {
      const res = await getFriends();
      setFriends(res.data.data);
    } catch (err) { console.error(err); }
  }, []);

  // 받은 요청 불러오기
  const loadRequests = useCallback(async () => {
    try {
      const res = await getPendingRequests();
      setPendingRequests(res.data.data);
    } catch (err) { console.error(err); }
  }, []);

  useEffect(() => {
    loadFriends();
    loadRequests();
  }, [loadFriends, loadRequests]);

  // 스크롤 맨 아래로
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // WebSocket 연결
  const connectWebSocket = useCallback((roomId) => {
    // 기존 연결 해제
    if (stompClientRef.current) {
      stompClientRef.current.deactivate();
    }

    const client = new Client({
      brokerURL: undefined, // SockJS 사용 시 불필요
      webSocketFactory: () => {
        const SockJS = window.SockJS;
        return new SockJS(`http://localhost:8080/ws?token=${token}`);
      },
      reconnectDelay: 3000,
      onConnect: () => {
        setConnected(true);
        // 채팅방 구독
        client.subscribe(`/topic/chat/${roomId}`, (frame) => {
          const msg = JSON.parse(frame.body);
          setMessages((prev) => [...prev, msg]);
        });
      },
      onDisconnect: () => setConnected(false),
      onStompError: () => {
        toast.error("채팅 연결에 실패했습니다.");
        setConnected(false);
      },
    });

    client.activate();
    stompClientRef.current = client;
  }, [token]);

  // 채팅방 열기
  const openChat = async (friend) => {
    setActiveFriend(friend);
    setMessages([]);
    setInputMsg("");

    const roomId = buildRoomId(myMemberId, friend.memberId);
    currentRoomRef.current = roomId;

    // 이전 메시지 조회
    try {
      const res = await getChatMessages(roomId);
      setMessages(res.data.data);
    } catch (err) { console.error(err); }

    // WebSocket 연결
    connectWebSocket(roomId);
  };

  // 채팅방 닫기
  const closeChat = () => {
    if (stompClientRef.current) {
      stompClientRef.current.deactivate();
    }
    setActiveFriend(null);
    setMessages([]);
    setConnected(false);
    currentRoomRef.current = null;
  };

  // 메시지 전송
  const sendMessage = () => {
    if (!inputMsg.trim() || !stompClientRef.current?.connected) return;
    const roomId = currentRoomRef.current;
    stompClientRef.current.publish({
      destination: `/app/chat/${roomId}`,
      body: JSON.stringify({ content: inputMsg.trim() }),
    });
    setInputMsg("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // 친구 요청 수락
  const handleAccept = async (friendshipId) => {
    try {
      await acceptFriendRequest(friendshipId);
      toast.success("친구 요청을 수락했습니다.");
      await loadFriends();
      await loadRequests();
    } catch (err) {
      toast.error(err.response?.data?.error?.message || "수락 실패");
    }
  };

  // 친구 요청 거절 / 친구 삭제
  const handleDelete = async (friendshipId, isFriend = false) => {
    try {
      await deleteFriendship(friendshipId);
      toast.success(isFriend ? "친구를 삭제했습니다." : "요청을 거절했습니다.");
      if (isFriend) {
        if (activeFriend?.friendshipId === friendshipId) closeChat();
        await loadFriends();
      } else {
        await loadRequests();
      }
    } catch (err) {
      toast.error(err.response?.data?.error?.message || "실패");
    }
  };

  // 닉네임으로 회원 검색
  const handleSearch = async () => {
    if (!searchNickname.trim()) return;
    setSearchLoading(true);
    setSearchResult(null);
    try {
      const res = await api.get(`/api/members/search?nickname=${encodeURIComponent(searchNickname.trim())}`);
      setSearchResult(res.data.data);
    } catch (err) {
      setSearchResult({ notFound: true });
    } finally {
      setSearchLoading(false);
    }
  };

  // 친구 요청 보내기
  const handleSendRequest = async (targetMemberId) => {
    try {
      await sendFriendRequest(targetMemberId);
      toast.success("친구 요청을 보냈습니다.");
      setSearchResult(null);
      setSearchNickname("");
    } catch (err) {
      toast.error(err.response?.data?.error?.message || "요청 실패");
    }
  };

  const formatTime = (sentAt) => {
    if (!sentAt) return "";
    const d = new Date(sentAt);
    return d.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="friend-page">
      {/* 왼쪽 패널 */}
      <div className="friend-panel">
        <h2 className="friend-panel-title">친구</h2>

        {/* 탭 */}
        <div className="friend-tabs">
          <button
            className={`friend-tab ${tab === "friends" ? "active" : ""}`}
            onClick={() => setTab("friends")}
          >
            친구 목록 {friends.length > 0 && <span className="badge">{friends.length}</span>}
          </button>
          <button
            className={`friend-tab ${tab === "requests" ? "active" : ""}`}
            onClick={() => setTab("requests")}
          >
            받은 요청 {pendingRequests.length > 0 && <span className="badge red">{pendingRequests.length}</span>}
          </button>
        </div>

        {/* 친구 검색 */}
        <div className="friend-search-box">
          <input
            className="input"
            type="text"
            placeholder="닉네임으로 친구 검색"
            value={searchNickname}
            onChange={(e) => setSearchNickname(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            style={{ fontSize: "13px", padding: "9px 12px" }}
          />
          <button className="btn btn-primary" onClick={handleSearch} disabled={searchLoading}
            style={{ padding: "9px 14px", fontSize: "13px" }}>
            검색
          </button>
        </div>

        {/* 검색 결과 */}
        {searchResult && (
          <div className="friend-search-result">
            {searchResult.notFound ? (
              <p style={{ color: "var(--hint)", fontSize: "13px" }}>회원을 찾을 수 없습니다.</p>
            ) : searchResult.id === myMemberId ? (
              <p style={{ color: "var(--hint)", fontSize: "13px" }}>본인입니다.</p>
            ) : (
              <div className="friend-search-item">
                <span className="friend-avatar">{searchResult.nickname?.charAt(0).toUpperCase()}</span>
                <span className="friend-nickname">{searchResult.nickname}</span>
                <button className="btn btn-primary" style={{ fontSize: "12px", padding: "6px 12px" }}
                  onClick={() => handleSendRequest(searchResult.id)}>
                  친구 요청
                </button>
              </div>
            )}
          </div>
        )}

        {/* 친구 목록 */}
        {tab === "friends" && (
          <div className="friend-list">
            {friends.length === 0 ? (
              <p className="empty-text" style={{ padding: "20px 0" }}>친구가 없습니다.</p>
            ) : (
              friends.map((f) => (
                <div
                  key={f.friendshipId}
                  className={`friend-item ${activeFriend?.memberId === f.memberId ? "active" : ""}`}
                  onClick={() => openChat(f)}
                >
                  <span className="friend-avatar">{f.nickname.charAt(0).toUpperCase()}</span>
                  <span className="friend-nickname">{f.nickname}</span>
                  <button
                    className="btn friend-delete-btn"
                    onClick={(e) => { e.stopPropagation(); handleDelete(f.friendshipId, true); }}
                    title="친구 삭제"
                  >✕</button>
                </div>
              ))
            )}
          </div>
        )}

        {/* 받은 친구 요청 */}
        {tab === "requests" && (
          <div className="friend-list">
            {pendingRequests.length === 0 ? (
              <p className="empty-text" style={{ padding: "20px 0" }}>받은 요청이 없습니다.</p>
            ) : (
              pendingRequests.map((r) => (
                <div key={r.friendshipId} className="friend-request-item">
                  <span className="friend-avatar">{r.nickname.charAt(0).toUpperCase()}</span>
                  <span className="friend-nickname">{r.nickname}</span>
                  <div style={{ display: "flex", gap: "6px", marginLeft: "auto" }}>
                    <button className="btn btn-primary" style={{ fontSize: "12px", padding: "5px 10px" }}
                      onClick={() => handleAccept(r.friendshipId)}>수락</button>
                    <button className="btn btn-danger" style={{ fontSize: "12px", padding: "5px 10px" }}
                      onClick={() => handleDelete(r.friendshipId, false)}>거절</button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* 오른쪽 채팅 패널 */}
      <div className="chat-panel">
        {!activeFriend ? (
          <div className="chat-empty">
            <div className="chat-empty-icon">💬</div>
            <p>친구를 선택하면 채팅을 시작할 수 있어요.</p>
          </div>
        ) : (
          <>
            {/* 채팅 헤더 */}
            <div className="chat-header">
              <span className="friend-avatar">{activeFriend.nickname.charAt(0).toUpperCase()}</span>
              <span className="chat-header-name">{activeFriend.nickname}</span>
              <span className={`chat-status ${connected ? "online" : "offline"}`}>
                {connected ? "연결됨" : "연결 중..."}
              </span>
              <button className="btn" onClick={closeChat}
                style={{ marginLeft: "auto", fontSize: "12px", padding: "5px 12px" }}>
                닫기
              </button>
            </div>

            {/* 메시지 목록 */}
            <div className="chat-messages">
              {messages.length === 0 && (
                <p style={{ textAlign: "center", color: "var(--hint)", fontSize: "13px", marginTop: "20px" }}>
                  대화를 시작해보세요!
                </p>
              )}
              {messages.map((msg, i) => {
                const isMine = msg.senderId === myMemberId;
                return (
                  <div key={i} className={`chat-bubble-row ${isMine ? "mine" : "theirs"}`}>
                    {!isMine && (
                      <span className="chat-bubble-avatar">
                        {msg.senderNickname?.charAt(0).toUpperCase()}
                      </span>
                    )}
                    <div className={`chat-bubble ${isMine ? "mine" : "theirs"}`}>
                      {!isMine && <div className="chat-sender">{msg.senderNickname}</div>}
                      <div className="chat-content">{msg.content}</div>
                      <div className="chat-time">{formatTime(msg.sentAt)}</div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* 메시지 입력 */}
            <div className="chat-input-row">
              <textarea
                className="chat-input"
                placeholder="메시지 입력 (Enter 전송, Shift+Enter 줄바꿈)"
                value={inputMsg}
                onChange={(e) => setInputMsg(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={2}
              />
              <button
                className="btn btn-primary chat-send-btn"
                onClick={sendMessage}
                disabled={!connected || !inputMsg.trim()}
              >
                전송
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
