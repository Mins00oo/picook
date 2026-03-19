# Spring Boot 4.0 실전 마이그레이션 — Jackson 3.x 패키지 이동과 Auto-Configuration 분리 대응기

## 들어가며

사이드 프로젝트에 Spring Boot 4.0.3을 적용했다. 공식 Release Notes를 읽고 "큰 변화는 Jakarta EE 전환은 이미 3.0에서 끝났으니까 이번엔 수월하겠지"라고 생각했는데, 실제로 빌드하고 돌려보니 **컴파일은 되는데 런타임에서 터지는** 두 가지 문제를 만났다.

Release Notes나 마이그레이션 가이드에 원칙적인 설명은 있지만, 실제 프로젝트에서 어디가 어떻게 깨지는지는 직접 겪어봐야 알 수 있는 부분들이었다.

---

## 문제 1. Flyway가 아무 말 없이 실행되지 않는다

### 증상

애플리케이션이 정상 기동되고 API도 뜨는데, DB 마이그레이션이 전혀 실행되지 않았다. 테이블이 안 만들어져서 첫 API 호출에서 바로 에러. Flyway 관련 로그도 아예 출력되지 않았다.

### 원인 — Auto-Configuration 모듈 분리

Spring Boot 4.0에서 auto-configuration이 **별도 모듈로 분리**되었다. 이전까지는 `spring-boot-starter-*`에 auto-configuration이 포함되어 있었는데, 4.0부터는 일부 기능의 auto-configuration이 독립 모듈로 빠졌다.

```kotlin
// Boot 3.x — 이것만으로 FlywayAutoConfiguration이 잡혔다
implementation("org.flywaydb:flyway-core")

// Boot 4.0 — flyway-core에 더 이상 auto-config가 포함되지 않는다
// FlywayAutoConfiguration을 포함하는 별도 모듈이 필요
implementation("org.springframework.boot:spring-boot-flyway")
```

**에러 로그도 없이** 조용히 실행되지 않는다는 게 치명적이다. Flyway 라이브러리 자체는 클래스패스에 있으니 `ClassNotFoundException`도 안 나고, 단지 auto-configuration이 등록되지 않아서 Flyway 자체가 시작되지 않을 뿐이다.

### WebClient도 같은 문제

같은 이유로 `WebClient.Builder` 빈도 생성되지 않았다. Whisper API와 GPT API를 호출하는 데 WebClient를 쓰고 있었는데, 빈 주입 시점에 `NoSuchBeanDefinitionException`이 발생했다.

```kotlin
// 추가 필요
implementation("org.springframework.boot:spring-boot-webclient")
```

### build.gradle.kts 최종 diff

```diff
 // Database
 runtimeOnly("org.postgresql:postgresql")
-implementation("org.flywaydb:flyway-core")
+implementation("org.springframework.boot:spring-boot-flyway")
 implementation("org.flywaydb:flyway-database-postgresql")

 // OpenAI (REST client)
 implementation("org.springframework.boot:spring-boot-starter-webflux")
+implementation("org.springframework.boot:spring-boot-webclient")
```

### 교훈

Boot 4.0에서 특정 기능이 "조용히 비활성화"되면, 의존성 트리에서 `spring-boot-{기능명}` 모듈이 있는지 확인해야 한다. 기존에는 `spring-boot-starter-*`가 다 챙겨줬지만, 4.0부터는 일부가 분리되었다. 특히 **에러 없이 안 되는** 경우가 가장 위험하다.

---

## 문제 2. Jackson 2.x → 3.x — 패키지가 통째로 바뀌었다

### 증상

Boot 3.x에서 4.0으로 올리자 `com.fasterxml.jackson` 관련 import가 전부 컴파일 에러.

### 원인

Spring Boot 4.0은 Jackson 3.0을 사용한다. Jackson 3.0에서 **패키지가 `com.fasterxml.jackson` → `tools.jackson`으로 완전히 변경**되었다.

### 변경해야 하는 것들

**1. ObjectMapper, JsonNode**
```java
// Before
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.JsonNode;

// After
import tools.jackson.databind.ObjectMapper;
import tools.jackson.databind.JsonNode;
```

**2. 예외 클래스 — 이름도 바뀌었다**
```java
// Before
import com.fasterxml.jackson.core.JsonProcessingException;

// After
import tools.jackson.core.JacksonException;
```

이건 단순 패키지 이동이 아니라 **클래스명 자체가 변경**된 케이스다. `JsonProcessingException`이라는 이름으로 검색하면 아무것도 안 나온다.

### 실제 영향받은 파일들

내 프로젝트에서는 4개 파일이 영향받았다.

| 파일 | 사용처 |
|------|--------|
| `AppleAuthService` | Apple 공개키 JSON 파싱 (JsonNode) |
| `RecipeController` | 검색 필터 JSON 직렬화 (ObjectMapper) |
| `OpenAiStructurizer` | GPT 응답 파싱 (ObjectMapper, JacksonException) |
| `ShortsConvertService` | 레시피 결과 직렬화/역직렬화 (ObjectMapper, JacksonException) |

Jackson의 `ObjectMapper`를 직접 주입받아 쓰는 곳이 아니라, Spring이 내부적으로 처리하는 `@RequestBody`/`@ResponseBody` 변환은 자동으로 Jackson 3.x를 사용하므로 수정할 필요가 없다. **직접 `ObjectMapper`를 사용하는 코드만 수정하면 된다.**

### 마이그레이션 체크리스트

```
1. com.fasterxml.jackson.databind.ObjectMapper → tools.jackson.databind.ObjectMapper
2. com.fasterxml.jackson.databind.JsonNode    → tools.jackson.databind.JsonNode
3. com.fasterxml.jackson.core.JsonProcessingException → tools.jackson.core.JacksonException
4. com.fasterxml.jackson.core.type.TypeReference → tools.jackson.core.type.TypeReference
5. com.fasterxml.jackson.annotation.* → tools.jackson.annotation.*
```

IDE의 전체 검색(Ctrl+Shift+F)으로 `com.fasterxml.jackson`을 찾아서 일괄 교체하면 되는데, 3번의 **클래스명 변경**은 단순 치환으로 안 되니 주의.

### 교훈

Spring Boot 메이저 업그레이드 시 내장 라이브러리의 메이저 버전도 함께 오를 수 있다. Jackson 3.0의 패키지 변경은 공식적으로 오래전부터 예고되었지만, 실제로 프로젝트에 적용할 때는 "어떤 파일이 영향받는지" 를 빌드 에러를 보면서 하나씩 찾아야 한다.

단순히 `@RequestBody`로 자동 역직렬화하는 코드는 영향이 없고, **`ObjectMapper`를 직접 주입받아 쓰는 코드만 수정 대상**이라는 점을 알면 범위를 빠르게 좁힐 수 있다.

---

## 정리

| 문제 | 증상 | 해결 |
|------|------|------|
| Flyway 미실행 | 에러 없이 마이그레이션이 안 됨 | `flyway-core` → `spring-boot-flyway` 교체 |
| WebClient 빈 없음 | `NoSuchBeanDefinitionException` | `spring-boot-webclient` 추가 |
| Jackson import 에러 | 컴파일 에러 | `com.fasterxml.jackson` → `tools.jackson` |
| 예외 클래스 변경 | `JsonProcessingException` 못 찾음 | `JacksonException`으로 변경 |

Spring Boot 4.0 마이그레이션에서 가장 까다로운 건 "컴파일 에러"가 아니라 **"에러 없이 동작하지 않는 것"**이었다. Flyway 문제는 통합 테스트가 없었으면 배포 후에야 발견했을 것이다.

Boot 4.0을 도입하려는 분들에게 한 가지 조언을 드리자면: 업그레이드 후 반드시 **애플리케이션 기동 로그에서 Flyway, WebClient 등 auto-configuration이 실제로 등록되었는지** 확인하자. `--debug` 플래그로 auto-configuration report를 출력하면 어떤 것이 활성화/비활성화되었는지 한눈에 볼 수 있다.
