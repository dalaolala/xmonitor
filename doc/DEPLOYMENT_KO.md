# XMonitor 완전 배포 가이드

이 문서는 XMonitor 서버 모니터링 시스템의 완전한 배포 과정을 설명합니다.

---

## 목차

- [아키텍처 개요](#아키텍처-개요)
- [요구사항](#요구사항)
- [도메인 계획](#도메인-계획)
- [방법 1: 원클릭 스크립트 배포 (推荐)](#방법-1-원클릭-스크립트-배포-推荐)
- [방법 2: Docker 배포](#방법-2-docker-배포)
- [방법 3: 수동 배포](#방법-3-수동-배포)
- [프론트엔드 설정](#프론트엔드-설정)
- [클라이언트 에이전트 설정](#클라이언트-에이전트-설정)
- [Telegram 알림 설정](#telegram-알림-설정)
- [일반적인 문제](#일반적인-문제)

---

## 아키텍처 개요

```
┌─────────────────────────────────────────────────────────────────┐
│                         사용자 브라우저                          │
│                    https://monitor.com                           │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                      프론트엔드 서비스 (Caddy)                    │
│                   정적 파일 + 리버스 프록시                       │
│                                                                  │
│  monitor.com → 정적 파일 서비스                                  │
│  api.monitor.com → 백엔드 :3001 리버스 프록시                    │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                     모니터 백엔드 (x_monitor)                     │
│                       :3001 대기                                 │
│                                                                  │
│  - WebSocket (/ws) → 실시간 데이터 전송                          │
│  - HTTP API (/monitor) → 클라이언트 데이터 보고                  │
│  - HTTP API (/hook) → Telegram Webhook                          │
└─────────────────────────┬───────────────────────────────────────┘
                          │
          ┌───────────────┼───────────────┐
          ▼               ▼               ▼
    ┌──────────┐    ┌──────────┐    ┌──────────┐
    │클라이언트A│    │클라이언트B│    │클라이언트C│
    │  홍콩   │    │  일본   │    │  미국   │
    └──────────┘    └──────────┘    └──────────┘
```

---

## 요구사항

### 모니터 서버

- OS: Ubuntu 20.04+ / Debian 10+ / CentOS 7+
- 아키텍처: x86_64 (amd64) 또는 aarch64 (arm64)
- 메모리: 512MB+
- 디스크: 1GB+
- 네트워크: 포트 80, 443 열림 (HTTPS)

### 클라이언트 서버

- OS: Ubuntu / Debian / CentOS / Alpine
- 아키텍처: x86_64 (amd64) 또는 aarch64 (arm64)
- 메모리: 128MB+

---

## 도메인 계획

배포 전 도메인을 계획하세요:

| 용도 | 도메인 예시 | 설명 |
|------|-----------|------|
| 프론트엔드 | `https://monitor.example.com` | 사용자 대시보드 |
| 백엔드 API | `https://api.monitor.example.com` | 백엔드 서비스 |
| WebSocket | `wss://api.monitor.example.com/ws` | 실시간 연결 |

### DNS 설정

도메인 제공자에서 두 개의 A 레코드를 추가:

```
monitor.example.com     A     서버 IP
api.monitor.example.com A     서버 IP
```

---

## 방법 1: 원클릭 스크립트 배포 (推荐)

### 1. 모니터 백엔드 설치

모니터 서버에서 실행:

```bash
wget -O ak-setup.sh "https://raw.githubusercontent.com/dalaolala/xmonitor/refs/heads/master/backend/ak-setup.sh" && chmod +x ak-setup.sh && sudo ./ak-setup.sh
```

"모니터 백엔드 설치"를 선택하고 입력:

1. **auth_secret**: 인증 키 (강력한 비밀번호 사용)
2. **listen port**: 백엔드 포트, 기본 `3001`
3. **hook_token**: Hook 인증 토큰 (Telegram 콜백용)

### 2. 프론트엔드 설치

스크립트를 계속 진행, "모니터 프론트엔드 설치" 선택:

1. **프론트엔드 도메인**: 예 `monitor.example.com`
2. **백엔드 도메인**: 예 `api.monitor.example.com`
3. **백엔드 포트**: 예 `3001`

스크립트는 자동으로:
- Caddy 서버 설치
- HTTPS 자동 인증서 설정
- 프론트엔드 설정 생성
- 리버스 프록시 설정

### 3. 클라이언트 에이전트 설치

모니터링할 각 서버에서 실행:

```bash
wget -O setup-client.sh "https://raw.githubusercontent.com/dalaolala/xmonitor/refs/heads/master/backend/setup-client.sh" && chmod +x setup-client.sh && sudo ./setup-client.sh <auth_secret> <url> <name>
```

**파라미터**:

| 파라미터 | 설명 | 예시 |
|---------|------|-----|
| auth_secret | 인증 키 (모니터와 동일) | `your_secret_key` |
| url | 모니터 WebSocket 주소 | `wss://api.monitor.example.com/monitor` |
| name | 호스트 이름 (처음 2자 = 지역) | `HK-Server01` |

**예시**:

```bash
# 홍콩 서버
sudo ./setup-client.sh mySecretKey123 wss://api.monitor.example.com/monitor HK-Server01

# 일본 서버
sudo ./setup-client.sh mySecretKey123 wss://api.monitor.example.com/monitor JP-Tokyo01

# 미국 서버
sudo ./setup-client.sh mySecretKey123 wss://api.monitor.example.com/monitor US-LA01
```

> **주의**: 호스트 이름의 처음 2자는 지역 식별자로 사용됩니다.

---

## 방법 2: Docker 배포

### 1. 이미지 빌드

```bash
git clone https://github.com/dalaolala/xmonitor
cd xmonitor/backend

docker build --target server --tag xmonitor_server .
docker build --target fe --tag xmonitor_fe .
docker build --target client --tag xmonitor_client .
```

### 2. 모니터 백엔드 배포

```bash
mkdir -p /opt/xmonitor
touch /opt/xmonitor/x_monitor.db

cat > /opt/xmonitor/server-compose.yml << 'EOF'
services:
  x_monitor_server:
    image: xmonitor_server
    container_name: x_monitor_server
    hostname: x_monitor_server
    restart: always
    ports:
      - 3001:3001
    volumes:
      - /opt/xmonitor/x_monitor.db:/app/x_monitor.db
    environment:
      TZ: "Asia/Shanghai"
      AUTH_SECRET: "your_auth_secret_here"
      LISTEN: ":3001"
      ENABLE_TG: false
      TG_TOKEN: "your_telegram_bot_token"
      HOOK_URI: "/hook"
      UPDATE_URI: "/monitor"
      WEB_URI: "/ws"
      HOOK_TOKEN: "your_hook_token"
      TG_CHAT_ID: 0
EOF

docker compose -f /opt/xmonitor/server-compose.yml up -d
```

### 3. 프론트엔드 배포

```bash
cat > /opt/xmonitor/fe-compose.yml << 'EOF'
services:
  x_monitor_fe:
    image: xmonitor_fe
    container_name: x_monitor_fe
    hostname: x_monitor_fe
    restart: always
    ports:
      - 80:80
    environment:
      TZ: "Asia/Shanghai"
      SOCKET: "wss://api.monitor.example.com/ws"
      APIURL: "https://api.monitor.example.com"
EOF

docker compose -f /opt/xmonitor/fe-compose.yml up -d
```

### 4. 클라이언트 에이전트 배포

> **중요**:
> - 정확한 트래픽 통계를 위해 `host` 네트워크 모드 필요
> - 정확한 시스템 정보를 위해 `/var/run/docker.sock` 마운트 필요

```bash
cat > /opt/xmonitor/client-compose.yml << 'EOF'
services:
  x_monitor_client:
    image: xmonitor_client
    container_name: x_monitor_client
    hostname: x_monitor_client
    restart: always
    network_mode: host
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
    environment:
      TZ: "Asia/Shanghai"
      AUTH_SECRET: "your_auth_secret_here"
      URL: "wss://api.monitor.example.com/monitor"
      NET_NAME: "eth0"
      NAME: "HK-Docker01"
EOF

docker compose -f /opt/xmonitor/client-compose.yml up -d
```

---

## 방법 3: 수동 배포

### 1. 바이너리 다운로드

```bash
mkdir -p /etc/x_monitor
cd /etc/x_monitor

# amd64
wget -O x_monitor https://github.com/dalaolala/xmonitor/releases/latest/download/x_monitor-linux-amd64
# arm64
wget -O x_monitor https://github.com/dalaolala/xmonitor/releases/latest/download/x_monitor-linux-arm64

chmod +x x_monitor
```

### 2. 설정 파일 생성

```bash
cat > /etc/x_monitor/config.json << 'EOF'
{
  "auth_secret": "your_auth_secret_here",
  "listen": ":3001",
  "enable_tg": false,
  "tg_token": "your_telegram_bot_token",
  "hook_uri": "/hook",
  "update_uri": "/monitor",
  "web_uri": "/ws",
  "hook_token": "your_hook_token",
  "tg_chat_id": 0
}
EOF
```

### 3. Systemd 서비스 생성

```bash
cat > /etc/systemd/system/x_monitor.service << 'EOF'
[Unit]
Description=X Monitor Service
After=network.target nss-lookup.target
Wants=network.target

[Service]
User=root
Group=root
Type=simple
LimitAS=infinity
LimitRSS=infinity
LimitCORE=infinity
LimitNOFILE=999999999
WorkingDirectory=/etc/x_monitor/
ExecStart=/etc/x_monitor/x_monitor
Restart=on-failure
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable x_monitor
systemctl start x_monitor
```

### 4. 리버스 프록시 설정 (Caddy)

```bash
sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/setup.deb.sh' | sudo bash
sudo apt install caddy

cat > /etc/caddy/Caddyfile << 'EOF'
monitor.example.com {
    root * /etc/x_monitor/frontend
    file_server
    encode gzip
    try_files {path} /index.html
}

api.monitor.example.com {
    reverse_proxy localhost:3001
    header Access-Control-Allow-Origin "*"
}
EOF

systemctl restart caddy
systemctl enable caddy
```

---

## 프론트엔드 설정

프론트엔드 설정 파일: `/etc/x_monitor/frontend/config.json`

### 설정 형식

```json
{
  "socket": "wss://api.monitor.example.com/ws",
  "apiURL": "https://api.monitor.example.com"
}
```

### 필드 설명

| 필드 | 타입 | 설명 | 예시 |
|-----|------|-----|-----|
| socket | string | WebSocket 주소 | `wss://api.monitor.example.com/ws` |
| apiURL | string | 백엔드 API 주소 | `https://api.monitor.example.com` |

### 중요 참고

1. **WebSocket 주소**:
   - 형식: `wss://<백엔드_도메인>/<web_uri>`
   - `web_uri` 기본값 `/ws`
   - `wss://` (암호화) 사용, `ws://` 불가

2. **API 주소**:
   - 형식: `https://<백엔드_도메인>`
   - 경로 접미사 불필요

3. **수정 후**:
   - 브라우저 새로고침으로 변경 적용

---

## 클라이언트 에이전트 설정

클라이언트 설정 파일: `/etc/x_monitor/client.json`

### 설정 형식

```json
{
  "auth_secret": "your_auth_secret_here",
  "url": "wss://api.monitor.example.com/monitor",
  "net_name": "eth0",
  "name": "HK-Server01"
}
```

### 필드 설명

| 필드 | 타입 | 설명 | 예시 |
|-----|------|-----|-----|
| auth_secret | string | 인증 키 (모니터와 일치) | `mySecretKey123` |
| url | string | 모니터 보고 주소 | `wss://api.monitor.example.com/monitor` |
| net_name | string | 네트워크 인터페이스 이름 | `eth0` |
| name | string | 호스트 이름 | `HK-Server01` |

### 중요 참고

1. **인증 키**:
   - 모니터의 `auth_secret`과 정확히 일치 필요
   - 불일치는 연결 실패 원인

2. **보고 주소**:
   - 형식: `wss://<백엔드_도메인>/<update_uri>`
   - `update_uri` 기본값 `/monitor`
   - 주의: `/ws`가 아니라 `/monitor`

3. **네트워크 인터페이스**:
   - 확인: `ip link` 또는 `ifconfig`
   - 일반적인 이름: `eth0`, `ens3`, `ens18`, `enp0s3`

4. **호스트 이름**:
   - 처음 2자 = 지역 식별자
   - 형식: `지역-호스트명`
   - 예: `HK`, `JP`, `US`, `SG`

---

## Telegram 알림 설정

### 1. Telegram Bot 생성

1. Telegram에서 `@BotFather` 검색
2. `/newbot` 전송하여 Bot 생성
3. Bot Token 획득 (형식: `123456789:ABCdefGHIjklMNOpqrsTUVwxyz`)

### 2. Chat ID 획득

1. Telegram에서 `@userinfobot` 검색
2. 메시지 전송하여 Chat ID 획득

### 3. 모니터 설정

`/etc/x_monitor/config.json` 수정:

```json
{
  "auth_secret": "your_auth_secret",
  "listen": ":3001",
  "enable_tg": true,
  "tg_token": "123456789:ABCdefGHIjklMNOpqrsTUVwxyz",
  "hook_uri": "/hook",
  "update_uri": "/monitor",
  "web_uri": "/ws",
  "hook_token": "your_hook_token",
  "tg_chat_id": 123456789
}
```

### 4. 서비스 재시작

```bash
systemctl restart x_monitor
```

### Telegram Bot 명령어

| 명령어 | 설명 |
|-------|------|
| `/akall` | 모든 서버 상태 요약 |
| `/status <name>` | 특정 서버 상태 조회 |
| `/server <name>` | 특정 서버 상세 정보 |

---

## 서비스 관리

### 모니터 서비스

```bash
systemctl start x_monitor    # 시작
systemctl stop x_monitor     # 중지
systemctl restart x_monitor  # 재시작
systemctl status x_monitor   # 상태
journalctl -u x_monitor -f   # 로그
```

### 클라이언트 서비스

```bash
systemctl start x_client     # 시작
systemctl stop x_client      # 중지
systemctl restart x_client   # 재시작
systemctl status x_client    # 상태
journalctl -u x_client -f    # 로그
```

### Caddy (프론트엔드)

```bash
systemctl start caddy        # 시작
systemctl stop caddy         # 중지
systemctl restart caddy      # 재시작
systemctl status caddy       # 상태
```

---

## 업데이트

```bash
wget -O ak-update.sh "https://raw.githubusercontent.com/dalaolala/xmonitor/refs/heads/master/backend/ak-update.sh" && chmod +x ak-update.sh && sudo ./ak-update.sh
```

---

## 일반적인 문제

### 1. 프론트엔드가 백엔드에 연결 불가

**확인**:
1. 프론트엔드 설정 `/etc/x_monitor/frontend/config.json`
2. WebSocket 주소 (`wss://` 확인)
3. 백엔드 서비스: `systemctl status x_monitor`
4. Caddy 리버스 프록시 설정

### 2. 클라이언트가 모니터에 연결 불가

**확인**:
1. `auth_secret`이 모니터와 일치
2. 보고 주소가 `/monitor` 경로
3. 네트워크 연결: `curl -v https://api.monitor.example.com/monitor`
4. 클라이언트 로그: `journalctl -u x_client -f`

### 3. 네트워크 트래픽이 0 표시

**원인**: 네트워크 인터페이스 이름 오류

**해결**:
1. 인터페이스 확인: `ip link`
2. `/etc/x_monitor/client.json` 수정
3. 재시작: `systemctl restart x_client`

### 4. HTTPS 인증서 문제

Caddy 로그 확인: `journalctl -u caddy -f`

**일반적인 원인**:
- DNS가 해결되지 않음
- 포트 80/443 차단
- 방화벽 차단

---

## 설정 파일 경로

| 파일 | 경로 | 설명 |
|-----|------|------|
| 모니터 설정 | `/etc/x_monitor/config.json` | 백엔드 설정 |
| 모니터 DB | `/etc/x_monitor/x_monitor.db` | SQLite 데이터베이스 |
| 클라이언트 설정 | `/etc/x_monitor/client.json` | 클라이언트 설정 |
| 프론트엔드 설정 | `/etc/x_monitor/frontend/config.json` | 프론트엔드 API 설정 |
| Caddy 설정 | `/etc/caddy/Caddyfile` | 리버스 프록시 설정 |
| 모니터 서비스 | `/etc/systemd/system/x_monitor.service` | Systemd 서비스 |
| 클라이언트 서비스 | `/etc/systemd/system/x_client.service` | Systemd 서비스 |

---

## 보안 권장

1. **auth_secret**: 강력한 비밀번호, 16자 이상 랜덤 문자
2. **hook_token**: 다른 랜덤 문자열 사용
3. **HTTPS**: 모든 연결에 HTTPS 사용
4. **방화벽**: 필요한 포트만 열기 (80, 443)
5. **정기 업데이트**: 최신 버전 유지

---

## 지원

- GitHub: https://github.com/dalaolala/xmonitor
- Issues: https://github.com/dalaolala/xmonitor/issues