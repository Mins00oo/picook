# Expo Managed Workflow에서 카카오 로그인 — 공식 방법이 안 될 때 Config Plugin 직접 만들기

## 들어가며

React Native 앱에 카카오 로그인을 넣어야 했다. 스택은 **Expo SDK 54 (managed workflow)** + **@react-native-seoul/kakao-login 5.4.x**.

카카오 로그인은 네이티브 모듈이 필요하다. Expo Go에서는 돌아가지 않고, EAS Build로 네이티브 빌드를 해야 한다. 여기까지는 예상 범위였다. 문제는 **Expo managed workflow에서 네이티브 설정을 주입하는 과정**에서 터졌다.

커밋 로그를 보면 이 기능에 2번의 수정이 쌓여 있다. 첫 번째는 "공식 방법이 안 되니까 플러그인을 만들자", 두 번째는 "만든 플러그인도 안 되네"였다.

---

## 배경: Expo Config Plugin이 뭔가

Expo managed workflow에서는 `ios/`나 `android/` 네이티브 폴더를 직접 건드리지 않는다. 대신 **Config Plugin**이라는 메커니즘으로 빌드 시점에 네이티브 코드를 자동 주입한다.

```
app.json의 plugins 배열 → 빌드 시 prebuild → 네이티브 코드 생성/수정
```

카카오 로그인이 동작하려면 iOS 쪽에 최소 3가지가 필요하다:

1. **Info.plist**: 카카오 URL scheme 등록 (`kakao{NATIVE_APP_KEY}`)
2. **Info.plist**: `LSApplicationQueriesSchemes`에 `kakaokompassauth`, `kakaolink` 추가
3. **AppDelegate**: `application(_:open:options:)` 메서드에서 카카오 URL 핸들링

1번과 2번은 `app.json`의 `infoPlist`로 해결된다. 문제는 3번이다.

---

## 라운드 1. @expo/config-plugins의 codeMod가 사라졌다

### 시도

`@react-native-seoul/kakao-login`의 README에는 Expo용 설정이 안내되어 있다. 하지만 내부적으로 `@expo/config-plugins`의 `codeMod` 모듈을 사용하는데, **이 모듈이 최신 버전에서 제거되었다.**

```
Error: Cannot find module '@expo/config-plugins/build/utils/codeMod'
```

`@expo/config-plugins`의 변경 이력을 보면 `codeMod` 유틸리티가 deprecation 없이 조용히 빠졌다. 라이브러리 측에서 아직 대응하지 않은 상태였다.

### 판단

선택지는 두 가지였다:

1. `@expo/config-plugins`를 `codeMod`가 있던 옛 버전으로 고정
2. 커스텀 Config Plugin을 직접 작성

1번은 Expo SDK 54의 다른 패키지와 버전 충돌이 날 가능성이 높았다. 2번을 선택했다.

---

## 라운드 2. 커스텀 Config Plugin 작성

### 구조

`plugins/withKakaoLogin.js` 파일을 만들고, `app.json`에서 참조한다.

```json
// app.json
{
  "plugins": [
    ["./plugins/withKakaoLogin", {
      "nativeAppKey": "6acd28308e258039a2cb24c7b4b6a0a7"
    }]
  ]
}
```

Config Plugin은 Expo의 `withInfoPlist`, `withAppDelegate` 등의 mod를 사용해서 네이티브 파일을 수정한다. 카카오 로그인에 필요한 작업:

```javascript
const { withInfoPlist, withAppDelegate } = require('expo/config-plugins');

// 1. Info.plist 수정
config = withInfoPlist(config, (cfg) => {
  // URL scheme 추가
  cfg.modResults.CFBundleURLTypes = [
    ...(cfg.modResults.CFBundleURLTypes || []),
    { CFBundleURLSchemes: [`kakao${nativeAppKey}`] }
  ];
  // queries schemes 추가
  cfg.modResults.LSApplicationQueriesSchemes = [
    ...(cfg.modResults.LSApplicationQueriesSchemes || []),
    'kakaokompassauth', 'kakaolink', 'kakaoplus',
  ];
  return cfg;
});

// 2. AppDelegate 수정 — 여기서 문제가 생겼다
config = withAppDelegate(config, (cfg) => {
  // ...regex로 코드 주입
});
```

### 1차 구현: regex로 기존 메서드에 코드 주입

AppDelegate에 `application(_:open:options:)` 메서드가 있을 거라고 가정하고, regex로 메서드 본문에 카카오 URL 핸들러를 주입했다.

```javascript
// 1차 구현 (실패한 버전)
const regex = /func application\(_[^,]+, open url: URL, options[^)]+\)[^{]*\{/;
const match = contents.match(regex);
if (match) {
  contents = contents.replace(regex, `${match[0]}\n    if AuthApi.isKakaoTalkLoginUrl(url) { return AuthController.handleOpenUrl(url: url) }`);
}
```

로컬에서 prebuild 돌려보니 코드가 주입되는 것처럼 보였다. EAS 빌드를 돌렸다.

---

## 라운드 3. 빌드는 되는데 카카오 로그인이 안 된다

### 증상

빌드 자체는 성공했다. 카카오톡 앱으로 넘어가서 인증도 된다. 그런데 **카카오톡에서 앱으로 돌아올 때** 로그인 콜백이 먹히지 않고 expo-router의 "Unmatched Route" 에러가 뜬다.

```
Unmatched Route: kakao6acd28308e258039a2cb24c7b4b6a0a7://...
```

### 원인

카카오톡이 `kakao{appKey}://` scheme으로 앱을 열면, iOS는 `application(_:open:options:)` 메서드를 호출한다. 여기서 카카오 SDK가 URL을 먼저 가로채야 하는데, **이 메서드 자체가 없었다.**

Expo SDK 54의 Swift AppDelegate에는 `application(_:open:options:)` 메서드가 기본으로 포함되어 있지 않다. 그래서 1차 구현의 regex가 **매칭할 대상이 없어 조용히 실패**하고, 카카오 URL이 expo-router로 넘어간 것이다.

이게 디버깅하기 까다로운 이유:

1. prebuild 시 에러가 나지 않는다 (regex가 매칭 안 되면 그냥 넘어감)
2. 빌드도 성공한다
3. 카카오톡 → 앱 전환까지 정상 동작한다
4. **콜백 시점에서만** 문제가 드러난다

### 해결: 메서드가 없으면 직접 만든다

2차 수정에서 분기 로직을 추가했다:

```javascript
// 2차 구현 (수정된 버전)
const KAKAO_IMPORT = `import KakaoSDKAuth`;
const KAKAO_HANDLE_URL = `if AuthApi.isKakaoTalkLoginUrl(url) {\n      return AuthController.handleOpenUrl(url: url)\n    }`;

const OPEN_URL_METHOD = `
  override func application(_ app: UIApplication, open url: URL, options: [UIApplication.OpenURLOptionsKey : Any] = [:]) -> Bool {
    ${KAKAO_HANDLE_URL}
    return super.application(app, open: url, options: options)
  }`;

config = withAppDelegate(config, (cfg) => {
  let contents = cfg.modResults.contents;

  // import 추가
  if (!contents.includes('import KakaoSDKAuth')) {
    const importRegex = /import Expo\n/;
    if (importRegex.test(contents)) {
      contents = contents.replace(importRegex, `import Expo\n${KAKAO_IMPORT}\n`);
    } else {
      // import Expo가 없으면 import UIKit 뒤에
      contents = contents.replace(/import UIKit\n/, `import UIKit\n${KAKAO_IMPORT}\n`);
    }
  }

  // 핵심: 메서드 존재 여부에 따라 분기
  const openUrlRegex = /func\s+application\s*\([^)]*open\s+url:\s*URL[^)]*\)[^{]*\{/;
  const match = contents.match(openUrlRegex);

  if (match) {
    // 메서드가 있으면 → 본문 최상단에 핸들러 주입
    contents = contents.replace(
      openUrlRegex,
      `${match[0]}\n    ${KAKAO_HANDLE_URL}`
    );
  } else {
    // 메서드가 없으면 → 클래스 닫는 중괄호 앞에 메서드 전체를 추가
    const classEndRegex = /\n\}\s*$/;
    contents = contents.replace(classEndRegex, `\n${OPEN_URL_METHOD}\n}\n`);
  }

  cfg.modResults.contents = contents;
  return cfg;
});
```

핵심 변경은 `else` 분기다. 메서드가 없으면 `override func application(_:open:options:)` 전체를 클래스 끝에 삽입한다. `super.application()`을 호출해서 다른 플러그인과의 호환성도 유지한다.

---

## Expo Go에서는 어떡하나

카카오 로그인은 네이티브 모듈이 필요하므로 Expo Go에서는 동작하지 않는다. 개발 중에 Expo Go를 쓰고 있다면 앱이 크래시 난다.

같은 문제가 `@react-native-voice/voice`(STT)에서도 있었다. 해결책은 **lazy-load + 조건 분기**:

```typescript
// STTService.ts
let Voice: any = null;

try {
  Voice = require('@react-native-voice/voice').default;
} catch {
  // Expo Go에서는 네이티브 모듈 로드 실패 → 무시
}

class STTService {
  private available = !!Voice;

  async start() {
    if (!this.available) {
      console.warn('STT not available in Expo Go');
      return;
    }
    await Voice.start('ko-KR');
  }
}
```

카카오 로그인도 마찬가지로, 로그인 화면에서 `@react-native-seoul/kakao-login`을 try-catch로 감싸서 Expo Go에서는 "개발 빌드에서만 사용 가능" 안내를 띄운다.

---

## 정리

### 왜 이 글을 쓰는가

"Expo managed workflow + 카카오 로그인"을 검색하면 대부분 bare workflow 기준이거나, `codeMod`가 있던 시절의 가이드다. 2024년 이후 `@expo/config-plugins`에서 `codeMod`가 빠진 뒤의 해결법은 한국어 자료가 거의 없다.

### 핵심 교훈

1. **Config Plugin의 regex 주입은 "매칭 실패 = 조용한 실패"다.** 에러가 안 나므로 prebuild 성공 ≠ 동작 보장이 아니다. 빌드 후 반드시 실제 플로우를 테스트해야 한다.

2. **Expo SDK 버전마다 AppDelegate 구조가 다르다.** SDK 54의 Swift AppDelegate에는 `application(_:open:options:)` 메서드가 기본 포함되어 있지 않다. 특정 메서드의 존재를 가정하는 플러그인은 SDK 업그레이드 시 깨질 수 있다.

3. **커스텀 Config Plugin은 생각보다 간단하다.** `withInfoPlist`와 `withAppDelegate`만 쓸 줄 알면 대부분의 네이티브 설정을 주입할 수 있다. 서드파티 라이브러리의 플러그인이 안 될 때 직접 만드는 것도 선택지다.

4. **Expo Go 미지원 모듈은 lazy-load로 격리한다.** `try { require(...) } catch {}`로 감싸면 Expo Go에서 크래시 없이 개발할 수 있다.

### 환경

| 항목 | 버전 |
|------|------|
| Expo SDK | 54 |
| React Native | 0.81.5 |
| @react-native-seoul/kakao-login | ~5.4.0 |
| @expo/config-plugins | SDK 54 번들 |
| 빌드 | EAS Build (iOS development profile) |

### 참고한 자료

- [@react-native-seoul/kakao-login README](https://github.com/crossplatformkorea/react-native-kakao-login)
- [Expo Config Plugins 공식 문서](https://docs.expo.dev/config-plugins/introduction/)
- [Expo withAppDelegate API](https://docs.expo.dev/versions/latest/config-plugins/mod-types/#withappdelegate)
- Kakao iOS SDK — [앱 실행 허용 목록](https://developers.kakao.com/docs/latest/ko/getting-started/app)
