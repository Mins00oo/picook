# Expo SDK 다운그레이드 삽질기 — 버전 추측하지 말고 expo-doctor 쓰세요

## 들어가며

Expo SDK 55로 프로젝트를 시작했다가, **Expo Go 최신 버전이 SDK 55를 지원하지 않는다**는 걸 뒤늦게 알았다. SDK 54로 다운그레이드해야 했다.

"package.json에서 버전 숫자만 바꾸면 되겠지." 순진한 생각이었다.

커밋 로그를 보면 이 다운그레이드에 **3번의 커밋**이 쌓여 있다. 각각이 "이번엔 되겠지 → 빌드 실패" 사이클이었다. 결론부터 말하면, `npx expo-doctor`라는 도구를 처음부터 썼으면 한 번에 끝날 일이었다.

---

## 왜 다운그레이드했나

Expo의 버전 구조를 먼저 이해해야 한다.

- **Expo SDK**: React Native 버전, Expo 패키지 버전을 묶는 메타 버전. SDK 54 = RN 0.81.x, SDK 55 = RN 0.83.x.
- **Expo Go**: 네이티브 빌드 없이 개발 중 앱을 테스트하는 클라이언트 앱.

문제는 **Expo Go 앱이 지원하는 SDK 버전이 한정적**이라는 것이다. 2026년 3월 기준, App Store의 Expo Go 최신 버전은 SDK 54까지만 지원했다. SDK 55로 만든 프로젝트는 Expo Go에서 열리지 않는다.

개발 초기에는 Expo Go로 빠르게 테스트하면서 진행하고, 네이티브 모듈이 필요한 시점에 EAS Build로 전환하는 게 계획이었다. SDK 55에서는 이 계획 자체가 불가능했다.

---

## 라운드 1. 숫자만 바꾸기 (실패)

### 시도

SDK 55에서 설치된 패키지들의 버전을 SDK 54 호환으로 바꿨다.

```diff
# package.json 주요 변경
- "expo": "~55.0.6",
+ "expo": "~54.0.0",

- "react": "19.2.0",
+ "react": "19.1.0",

- "react-native": "0.83.2",
+ "react-native": "0.81.5",
```

여기까지는 당연한 부분이다. 문제는 **나머지 expo-* 패키지들의 버전**이었다.

SDK 55에서는 대부분의 Expo 패키지가 `*` (와일드카드)로 설치되어 있었다. SDK가 알아서 호환 버전을 잡아주기 때문이다. 하지만 SDK를 54로 바꾸면 이 `*`가 어떤 버전으로 풀릴지 보장할 수 없다.

그래서 각 패키지의 **SDK 54 호환 버전을 직접 지정**했다:

```diff
- "expo-router": "*",
+ "expo-router": "~6.0.23",

- "expo-image": "*",
+ "expo-image": "~3.0.11",

- "expo-notifications": "*",
+ "expo-notifications": "~0.32.16",

# ... 15개 이상의 패키지를 하나씩 버전 고정
```

이 버전들은 Expo 문서와 CHANGELOG를 보면서 **추측으로 결정**했다. 여기서 첫 번째 실수가 시작됐다.

### 또 하나의 변경: expo-dev-client

EAS 네이티브 빌드를 위해 `expo-dev-client`도 추가했다. SDK 55 프로젝트에서 쓰던 버전을 그대로 가져왔다.

```json
"expo-dev-client": "^55.0.16"
```

이게 두 번째 실수다. `expo-dev-client` 55.x는 SDK 55 전용이다.

### 함께 한 설정들

다운그레이드와 함께 EAS Build 환경도 세팅했다:

```json
// eas.json
{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal"
    },
    "production": {
      "autoIncrement": true
    }
  }
}
```

```
# .npmrc
legacy-peer-deps=true
```

`.npmrc`의 `legacy-peer-deps=true`는 EAS 빌드 서버에서 peer dependency 충돌을 방지하기 위한 설정이다. 로컬에서는 문제가 없어도 EAS 서버의 npm 버전이 다를 수 있어서 이걸 빼면 빌드가 실패한다.

### 결과

Expo Go에서는 돌아갔다. 하지만 **EAS 네이티브 빌드를 돌리니 실패**했다.

---

## 라운드 2. expo-dev-client 버전 수동 추측 (또 실패)

### 증상

EAS Build 로그를 보니 이런 에러가 나왔다:

```
expo-dev-menu의 AppContext.reloadAppAsync()를 호출하는데
SDK 54의 expo-modules-core에는 해당 메서드가 없음
→ Xcode 빌드 실패
```

`expo-dev-client` 55.x가 SDK 55의 `expo-modules-core`에 있는 API를 호출하고 있었다. SDK 54에서는 이 API가 존재하지 않으니 컴파일 에러.

### 시도

"그러면 expo-dev-client를 낮추면 되겠지." npm에서 버전 히스토리를 뒤져보고, 5.2.4가 적당해 보여서 넣었다.

```diff
- "expo-dev-client": "^55.0.16",
+ "expo-dev-client": "~5.2.4",
```

### 결과

이번에도 EAS 빌드가 실패했다. 에러 메시지:

```
React_RCTAppDelegate 헤더 미발견
```

`expo-dev-client` 5.2.4는 **SDK 54보다 오래된 버전**이었다. SDK 54의 React Native 0.81.5와 호환되지 않는 구버전이었던 것이다.

여기서 깨달았다: **Expo 패키지 버전을 수동으로 추측하면 안 된다.**

---

## 라운드 3. expo-doctor로 해결

### npx expo-doctor

Expo CLI에는 `expo-doctor`라는 진단 도구가 있다. 현재 SDK 버전에 맞는 패키지 권장 버전을 알려준다.

```bash
npx expo-doctor
```

출력이 이렇게 나왔다:

```
The following packages should be updated for best compatibility:
  expo-dev-client: ~5.2.4 → ~6.0.20
  expo-av: ~15.1.7 → ~16.0.8
  react-native-worklets: ^0.7.4 → 0.5.1

Missing peer dependencies:
  expo-constants: ~18.0.13 (required by expo-router)
```

5.2.4가 아니라 **6.0.20**이 SDK 54의 정확한 호환 버전이었다. 버전 숫자 체계가 직관적이지 않다 — 55.x가 SDK 55용이니까 5.x가 SDK 54용일 거라는 추측은 완전히 틀렸다.

### 수정

```diff
- "expo-dev-client": "~5.2.4",
+ "expo-dev-client": "~6.0.20",

- "expo-av": "~15.1.7",
+ "expo-av": "~16.0.8",

- "react-native-worklets": "^0.7.4",
+ "react-native-worklets": "0.5.1",

+ "expo-constants": "~18.0.13",
```

`expo-constants`는 **아예 빠져 있었다.** `expo-router`의 peer dependency인데, SDK 55에서는 암묵적으로 설치되어 있어서 몰랐던 것이다. SDK 54로 내리면서 명시적으로 추가해야 했다.

### npx expo install --fix

`expo-doctor`가 알려준 버전을 `npx expo install`로 설치하면 자동으로 SDK 호환 버전이 설치된다.

```bash
npx expo install expo-dev-client expo-av expo-constants react-native-worklets
```

수동으로 버전을 찍는 것보다 `npx expo install {패키지명}`으로 설치하는 게 항상 안전하다. Expo가 현재 SDK에 맞는 버전을 자동으로 결정해준다.

### 결과

EAS 빌드 성공.

---

## 삽질의 근본 원인

3번의 시도를 정리하면 이렇다:

| 라운드 | 시도 | 결과 | 원인 |
|--------|------|------|------|
| 1 | expo-dev-client 55.x 유지 | Xcode 빌드 실패 | SDK 55 전용 API 호출 |
| 2 | expo-dev-client 5.2.4로 추측 | Xcode 빌드 실패 | SDK 54보다 오래된 버전 |
| 3 | expo-doctor로 6.0.20 확인 | 성공 | 정확한 SDK 54 호환 버전 |

근본 원인은 하나다: **Expo 패키지의 버전 넘버링이 SDK 번호와 일치하지 않는다.**

| 패키지 | SDK 54 호환 | SDK 55 호환 |
|--------|-------------|-------------|
| expo | 54.x | 55.x |
| expo-router | 6.x | 7.x (추정) |
| expo-dev-client | 6.x | 55.x |
| expo-av | 16.x | 17.x (추정) |
| expo-constants | 18.x | 19.x (추정) |

`expo` 자체는 SDK 번호와 일치하지만, 나머지 패키지들은 각자의 메이저 버전 체계를 따른다. "SDK 54니까 패키지도 54.x겠지"라는 추측은 통하지 않는다.

---

## 버전 관리 규칙 (교훈)

이 삽질 이후 프로젝트에 정한 규칙이다:

### 1. 새 패키지는 반드시 `npx expo install`로 설치

```bash
# 이렇게 (O)
npx expo install expo-camera

# 이렇게 하지 않기 (X)
npm install expo-camera
npm install expo-camera@~7.0.0  # 버전 추측
```

`npx expo install`은 현재 SDK에 맞는 버전을 자동으로 결정한다.

### 2. 문제가 생기면 `npx expo-doctor` 먼저

```bash
npx expo-doctor
```

이 명령어가 알려주는 버전이 정답이다. npm 레지스트리를 뒤지거나 CHANGELOG를 읽는 것보다 빠르고 정확하다.

### 3. 와일드카드(`*`) 금지, 틸드(`~`)로 고정

```json
// 이렇게 (O)
"expo-image": "~3.0.11",

// 이렇게 하지 않기 (X)
"expo-image": "*",
"expo-image": "^3.0.11",
```

`*`는 예측 불가능하고, `^`는 메이저 범위가 넓어서 SDK 경계를 넘을 수 있다. `~`는 패치 버전만 유동적이라 가장 안전하다.

### 4. `.npmrc`에 `legacy-peer-deps=true`

로컬에서는 문제 없어도 EAS 빌드 서버에서 peer dependency 충돌이 날 수 있다. 이 설정이 없으면 `npm install` 단계에서 빌드가 실패한다.

---

## 정리

### 왜 이 글을 쓰는가

Expo SDK 다운그레이드 자체는 드문 케이스가 아니다. Expo Go 호환 문제, 특정 라이브러리의 SDK 미지원 등으로 다운그레이드가 필요한 경우가 종종 있다. 그런데 **"패키지 버전을 어떻게 맞추느냐"**에 대한 자료는 부실하다. 대부분의 가이드가 "업그레이드"만 다루고, 다운그레이드는 "역순으로 하면 됩니다" 정도로 넘어간다.

실제로는 역순으로 안 된다. SDK 번호와 패키지 버전의 매핑이 직관적이지 않기 때문이다. `expo-doctor`와 `npx expo install`의 존재를 모르면 npm 레지스트리에서 버전을 하나하나 추측해야 하고, 그건 거의 확실하게 실패한다.

### 핵심 한 줄

**Expo 패키지 버전은 추측하지 말고, `npx expo-doctor`가 알려주는 대로 `npx expo install`로 설치하라.**

### 환경

| 항목 | 변경 전 | 변경 후 |
|------|---------|---------|
| Expo SDK | 55 | 54 |
| React Native | 0.83.2 | 0.81.5 |
| React | 19.2.0 | 19.1.0 |
| expo-dev-client | 55.0.16 → 5.2.4 (실패) | 6.0.20 (성공) |
| 빌드 방식 | Expo Go만 | Expo Go + EAS Build |

### 참고한 자료

- [Expo SDK 54 릴리스 노트](https://expo.dev/changelog)
- [npx expo-doctor 문서](https://docs.expo.dev/more/expo-cli/#expo-doctor)
- [npx expo install 문서](https://docs.expo.dev/more/expo-cli/#expo-install)
- [EAS Build 시작 가이드](https://docs.expo.dev/build/introduction/)
