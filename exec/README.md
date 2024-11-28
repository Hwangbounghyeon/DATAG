# Gitlab 소스 클론 이후 빅드 및 배포할 수 있도록 정리한 문서

1. 사용한 JVM, 웹서버, WAS 제품 등의 종류와 설정 값, 버전(IDE버전 포함)기재
2. 빌드 시 사용되는 환경 변수 등의 내용 상세 기재
3. 배포 시 특이사항 기재
4. DB접속 정보 등 프로젝트(ERD)에 활용되는 주요 계정 및 프로퍼티가 정의된 파일 목록

## 사용도구

- 이슈 관리 : Jira
- 형상 관리 : GitLab
- 커뮤니케이션 : Notion, MatterMost
- 디자인 : Figma
- CI/CD : Jenkins

## 개발도구

- Backend
  - Visual Studio Code : 1.93
- frontend
  - Visual Studio Code : 1.93

## 개발환경

**BackEnd**
| 언어 | 버전 |
| --- | --- |
| Python | 3.11.8 |
| FastAPI | 0.114.1 |

**FrontEnd**
|언어|버전|
|------|---|
|React|1.9|
|Next.js|1.9|

### Database

| 언어    | 버전  |
| ------- | ----- |
| MariaDB | 8.10  |
| MongoDB | 7.2.1 |

### Infra

| 언어    | 버전      |
| ------- | --------- |
| Jenkins | 2.477     |
| Nginx   | 1.25.2    |
| Ec2     | 2.3.978.0 |
| S3      |           |

## EC2 포트번호

- Backend(API, DL) : 8080
- Frontend : 3000
- nginx : 80
- Redis : 6379
- Jenkins : 8080


# DB 덤프 파일 최신본
## MariaDB
[MariaDB](./S108.sql)
## MongoDB
- [project](./S11P31S108.projects.json)
- [feature](./S11P31S108.features.json)
- [metadata](./S11P31S108.metadata.json)
- [images](./S11P31S108.images.json)
- [history](./S11P31S108.histories.json)
- [imagelabel](./S11P31S108.imageLabels.json)
- [image_models](./S11P31S108.imageModels.json)
- [image_permissions](./S11P31S108.imagePermissions.json)
- [project_history](./S11P31S108.projectHistories.json)
- [project_image](./S11P31S108.projectImages.json)
- [project_permission](./S11P31S108.projectPermissions.json)
- [tag_image](./S11P31S108.tagImages.json)
- [upload_batches](./S11P31S108.uploadBatches.json)
- [user_upload_batches](./S11P31S108.userUploadBatches.json)


# Back End(API) 실행 방법

## 1. **BE 디렉토리로 이동**

- 아래 명령어를 사용하여 BE 디렉토리로 이동합니다:
  ```bash
  cd BE/app
  ```

## 2. 라이브러리 설치

- 아래 명령어를 사용하여 필요한 라이브러리를 설치합니다.
  ```bash
  pip install requirements.txt
  ```

## 3. BE 서버 실행

- uvicorn을 사용하여 BE 서버를 실행합니다:
  ```bash
  uvicorn main:app --reload
  ```

# Back End(DL) 실행 방법

## 1. **DL 디렉토리로 이동**

- 아래 명령어를 사용하여 DL 디렉토리로 이동합니다:
  ```bash
  cd DL/app
  ```

## 2. 라이브러리 설치

- 아래 명령어를 사용하여 필요한 라이브러리를 설치합니다.
  ```bash
  pip install requirements.txt
  ```

## 3. DL 서버 실행

- uvicorn을 사용하여 DL 서버를 실행합니다:
  ```bash
  python main.py
  ```
- python명령어를 통해 8081 port로 실행(port 충돌 방지)
- [DL서버 호출](BE/app/services/project/upload_service.py)코드 수정 필요(193줄)

# FE local 실행 방법

1. **Node.js** 설치 필요

[Node.js](https://nodejs.org/en) 파일을 설치 (LTS)

> Mac OS 환경에서는 Homebrew를 통한 설치를 권합합니다. [블로그설명](https://memostack.tistory.com/274)

2. FE 프로젝트 디렉토리로 이동. 해당 프로젝트 경로에서 VSCode 실행

3. 다음 명령어 실행 하여 라이브러리 설치 : `npm install`

4. 환경설정 변수 설정 : fe 폴더 디렉토리 바로 하위 경로에 `.env.local` 파일을 추가하여 다음과 같은 값을 설정합니다.

```
NEXT_PUBLIC_BACKEND_URL=백엔드 서버 API.
NEXT_PUBLIC_FRONTEND_URL=프론트 서버 URL (로컬인 경우 http://localhost:3000 )

```

**주의점** : 백엔드 서버 API는 엔드포인트 전까지 전부 작성해야 합니다. 마지막 부분엔 슬래시를 넣지 않습니다.  
Ex : `http://localhost:8000/be/api`

5. 환경에 따른 실행

   - 개발자 모드에서 실행 : `npm run dev`

   - 배포 모드에서 실행 : `npm run build` 후 성공적일 경우 `npm run start`

   - SSR 동작을 지원하므로, 코드를 수정할 일이 없을 경우. 빌드 후 실행을 추천합니다

   - 중요 : 사전에 환경설정된 백엔드 서버가 정상적으로 동작해야 합니다. 동작하지 않는 경우 build가 이루어지지 않습니다.

