# 🎬 Video Service API 문서

## 📌 프로젝트 개요
Video Service는 **비디오 관리 및 주문 자동화 서비스**입니다.  
사용자는 **비디오를 업로드하고, 주문을 생성하며, 관리할 수 있는 API**를 통해 더 편리하게 서비스를 이용할 수 있습니다.

## 📌 기술 스택
- **Backend**: TypeScript, Nest.js
- **Database**: MySQL
- **Authentication**: JWT
- **API Docs**: Swagger

---

# 📌 Video Service API 문서

## 🎬 VideoController
| 엔드포인트 | 메서드 | 설명 | 인증 필요 | 요청 파라미터 / 바디 |
|------------|--------|---------------------------|:--------:|----------------------------------|
| `/videos/s3/upload-presigned-urls?count={count}` | `GET` | 비디오 업로드용 S3 Presigned URL 제공 | ✅ | `count` (비디오 개수) |
| `/videos/s3/download-presigned-urls` | `POST` | 비디오 다운로드용 S3 Presigned URL 생성 | ✅ | `{ "s3Keys": [{ "name": "파일명", "s3Key": "파일 경로" }] }` |

## 👤 UserController
| 엔드포인트 | 메서드 | 설명 | 인증 필요 | 요청 파라미터 |
|------------|--------|---------------------------|:--------:|---------------|
| `/users/{userId}/youtube-channels` | `GET` | 사용자가 접근 가능한 YouTube 채널 리스트 조회 | ✅ | `userId` |

## 📦 OrderController
| 엔드포인트 | 메서드 | 설명 | 인증 필요 | 요청 파라미터 / 바디 |
|------------|--------|--------------------------------|:--------:|----------------------------------|
| `/order-groups` | `GET` | 주문 그룹 리스트 조회 | ✅ | `channelName`, `title`, `channelId`, `status`, `page`, `limit` |
| `/order-groups/{orderGroupId}/detail` | `GET` | 주문 그룹 상세 조회 | ✅ | `orderGroupId` |
| `/order-groups` | `POST` | 주문 그룹 생성 | ✅ | `{ "channelId": "string", "videos": [{ "title": "string", "s3Key": "string" }] }` |

## 📌 인증 방식
- JWT 토큰을 사용하여 인증이 필요합니다.
- 모든 **✅(인증 필요)** API는 `Authorization: Bearer <token>` 헤더를 포함해야 합니다.

## 📌 응답 예시
### ✅ 성공
```json
{
  "status": "success",
  "data": { ... }
}
