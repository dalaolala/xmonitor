# X Monitor

[简体中文](README_CN.md) | [English](README.md) | [日本語](README_JA.md) | 한국어

가볍고 고성능인 서버 모니터링 시스템으로, 다중 서버 관리, 실시간 상태 모니터링, Telegram Bot 알림을 지원합니다.

## 기능

- **다중 서버 모니터링** - 여러 서버를 동시에 모니터링, 지역별 분류 표시
- **실시간 데이터** - CPU, 메모리, 네트워크, 부하 매초 업데이트
- **시각화 차트** - Highcharts 실시간 성능 추세 그래프
- **Telegram 알림** - 서버 온라인/오프라인 상태 자동 알림
- **원격 조회** - Telegram 명령어 `/akall`, `/status`로 서버 상태 조회
- **호스트 관리** - 만료일, 제공자, 가격, 구매 링크 기록
- **다국어 지원** - 중국어, 영어, 일본어, 한국어, 독일어 5개 언어 지원
- **테마 전환** - 라이트/다크 테마 지원

## 빠른 설치

### 원클릭 관리 스크립트

```bash
wget -O ak-setup.sh "https://raw.githubusercontent.com/dalaolala/xmonitor/refs/heads/master/backend/ak-setup.sh" && chmod +x ak-setup.sh && sudo ./ak-setup.sh
```

지원 기능:
- 모니터 프론트엔드 설치
- 모니터 백엔드 설치
- 모니터 백엔드 제거
- 모니터 설정 확인
- 클라이언트 에이전트 설치
- 클라이언트 에이전트 제거
- 클라이언트 설정 확인

### 모니터 백엔드 설치

```bash
wget -O setup-monitor.sh "https://raw.githubusercontent.com/dalaolala/xmonitor/refs/heads/master/backend/setup-monitor.sh" && chmod +x setup-monitor.sh && sudo ./setup-monitor.sh
```

### 클라이언트 에이전트 설치

```bash
wget -O setup-client.sh "https://raw.githubusercontent.com/dalaolala/xmonitor/refs/heads/master/backend/setup-client.sh" && chmod +x setup-client.sh && sudo ./setup-client.sh <auth_secret> <url> <name>
```

예시:
```bash
wget -O setup-client.sh "https://raw.githubusercontent.com/dalaolala/xmonitor/refs/heads/master/backend/setup-client.sh" && chmod +x setup-client.sh && sudo ./setup-client.sh 123321 wss://api.example.com/ws HK-XMonitor
```

### Alpine Linux 클라이언트 에이전트 설치

```bash
wget -O alpine-client.sh "https://raw.githubusercontent.com/dalaolala/xmonitor/refs/heads/master/backend/alpine-client.sh" && chmod +x alpine-client.sh && sudo ./alpine-client.sh <auth_secret> <url> <name>
```

### 모니터 프론트엔드 설치

```bash
wget -O setup-monitor-fe.sh "https://raw.githubusercontent.com/dalaolala/xmonitor/refs/heads/master/backend/setup-monitor-fe.sh" && chmod +x setup-monitor-fe.sh && sudo ./setup-monitor-fe.sh
```

### 업데이트 스크립트

```bash
wget -O ak-update.sh "https://raw.githubusercontent.com/dalaolala/xmonitor/refs/heads/master/backend/ak-update.sh" && chmod +x ak-update.sh && sudo ./ak-update.sh
```

업데이트 항목:
- 모니터 프론트엔드
- 모니터 백엔드
- 클라이언트 에이전트

## 기술 스택

### 백엔드
- **Go** - 프로그래밍 언어
- **Hertz** - ByteDance 고성능 HTTP 프레임워크
- **GORM** - ORM 프레임워크
- **SQLite** - 경량 데이터베이스
- **WebSocket** - 실시간 데이터 전송
- **Telegram Bot API** - 메시지 알림

### 프론트엔드
- **Vue 3** - 프로그레시브 JavaScript 프레임워크
- **Vite 6** - 차세대 프론트엔드 빌드 도구
- **Arco Design Vue** - ByteDance UI 컴포넌트 라이브러리
- **Highcharts** - 인터랙티브 차트 라이브러리
- **vue-i18n** - 국제화 지원

## 설정

### 모니터 설정 (`/etc/x_monitor/config.json`)

| 필드 | 설명 |
|------|------|
| `auth_secret` | 인증 시크릿 |
| `listen` | 서비스 리슨 주소 (예: `:3000`) |
| `enable_tg` | Telegram 알림 활성화 |
| `tg_token` | Telegram Bot Token |
| `tg_chat_id` | Telegram Chat ID |
| `hook_uri` | Hook 경로 |
| `update_uri` | 클라이언트 보고 경로 |
| `web_uri` | WebSocket 경로 |
| `hook_token` | Hook 인증 토큰 |

### 클라이언트 설정 (`/etc/x_monitor/client.json`)

| 필드 | 설명 |
|------|------|
| `auth_secret` | 인증 시크릿 (모니터와 일치해야 함) |
| `url` | 모니터 WebSocket 주소 |
| `net_name` | 모니터링할 네트워크 인터페이스 이름 |
| `name` | 호스트 이름 |

## 서비스 관리

### 모니터 서비스

```bash
systemctl start x_monitor    # 시작
systemctl stop x_monitor     # 중지
systemctl restart x_monitor  # 재시작
systemctl status x_monitor   # 상태 확인
```

### 클라이언트 서비스

```bash
systemctl start x_client     # 시작
systemctl stop x_client      # 중지
systemctl restart x_client   # 재시작
systemctl status x_client    # 상태 확인
```

## Telegram Bot 명령어

| 명령어 | 설명 |
|--------|------|
| `/akall` | 모든 서버 상태 요약 보기 |
| `/status <name>` | 특정 서버 상태 조회 |
| `/server <name>` | 특정 서버 상세 정보 조회 |

## 지원 아키텍처

| 아키텍처 | 모니터 | 클라이언트 |
|----------|--------|------------|
| linux/amd64 | `x_monitor-linux-amd64` | `x_client-linux-amd64` |
| linux/arm64 | `x_monitor-linux-arm64` | `x_client-linux-arm64` |
| darwin/amd64 | `x_monitor-darwin-amd64` | `x_client-darwin-amd64` |

## 모니터링 지표

| 지표 | 설명 |
|------|------|
| CPU 사용률 | 실시간 CPU 사용률 |
| 메모리 사용량 | 사용 메모리 / 전체 메모리 |
| Swap 사용량 | Swap 메모리 사용 현황 |
| 네트워크 트래픽 | 인바운드/아웃바운드 트래픽 통계 |
| 네트워크 속도 | 실시간 업로드/다운로드 속도 |
| 시스템 부하 | Load1 / Load5 / Load15 |
| 가동 시간 | 시스템 가동 시간 |

## 로컬 개발

[로컬 디버그 가이드](doc/local-debug-guide.md) 참조

## 라이선스

[MIT License](LICENSE)

## 감사의 글

이 프로젝트는 [akile_monitor](https://github.com/akile-network/akile_monitor)를 참조했습니다. 원작자분들께 감사드립니다.

## 작성자

X Monitor Team