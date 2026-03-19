# Hibernate가 null String을 bytea로 보내는 이유 — PostgreSQL LOWER() 에러 해결기

## 들어가며

Spring Data JPA + PostgreSQL 조합에서 **검색 기능**을 만들다가 이상한 에러를 만났다. keyword로 검색하면 잘 되는데, keyword 없이 전체 목록을 조회하면 에러가 난다.

```
ERROR: function lower(bytea) does not exist
HINT: No function matches the given name and argument types.
      You might need to add explicit type casts.
```

`lower(bytea)`? 나는 `LOWER()`에 문자열을 넘기고 있는데, 왜 `bytea`(바이너리 타입)로 인식하는 걸까?

---

## 상황 재현

### JPQL 쿼리

레시피, 재료, 사용자, 쇼츠 캐시 등 여러 곳에서 같은 패턴을 쓰고 있었다.

```java
@Query("SELECT i FROM Ingredient i " +
       "WHERE (:categoryId IS NULL OR i.category.id = :categoryId) " +
       "AND (:keyword IS NULL OR LOWER(i.name) LIKE LOWER(CONCAT('%', :keyword, '%')))")
List<Ingredient> searchIngredients(
    @Param("categoryId") Integer categoryId,
    @Param("keyword") String keyword
);
```

의도는 이렇다.
- `keyword`가 null이면 → `(:keyword IS NULL)`이 true → `LOWER()` 부분은 평가하지 않음
- `keyword`가 있으면 → 대소문자 무시 검색

### 동작

| 호출 | 결과 |
|------|------|
| `searchIngredients(null, "양파")` | 정상 동작 |
| `searchIngredients(null, null)` | **에러 발생** |

keyword에 값이 있을 때는 Hibernate가 String 타입으로 정상 바인딩한다. 문제는 **null을 넘길 때** 발생한다.

---

## 원인 분석

### Hibernate의 파라미터 타입 추론

Hibernate는 JPQL의 `:keyword` 파라미터에 바인딩할 때, **실제로 넘어온 값의 Java 타입을 보고 SQL 타입을 결정**한다.

- `keyword = "양파"` → Java `String` → PostgreSQL `varchar` → `LOWER(varchar)` 정상
- `keyword = null` → **Java 타입 정보 없음** → Hibernate가 기본 fallback으로 `bytea` 선택

Hibernate가 null 값의 타입을 추론하지 못할 때 `bytea`(바이트 배열)로 폴백하는 것은 Hibernate + PostgreSQL 드라이버의 오래된 동작이다. MySQL에서는 이 문제가 발생하지 않는데, PostgreSQL은 함수 오버로딩을 지원하기 때문에 **정확한 타입이 일치하는 함수를 찾으려 한다.**

SQL로 번역하면 이런 일이 벌어지는 것이다.
```sql
-- keyword = "양파"일 때 (정상)
WHERE LOWER(name) LIKE LOWER(CONCAT('%', '양파'::varchar, '%'))

-- keyword = null일 때 (에러)
WHERE LOWER(name) LIKE LOWER(CONCAT('%', null::bytea, '%'))
-- → CONCAT이 bytea를 반환 → LOWER(bytea) 호출 → 함수 없음!
```

핵심은 **`OR` 단축 평가가 SQL에서는 보장되지 않는다**는 것이다. `:keyword IS NULL`이 true여도, 데이터베이스는 뒤의 `LOWER(CONCAT(...))` 부분을 파싱하고 타입 체크한다. 실행은 안 하더라도 **쿼리 플래닝 시점에 타입이 결정**되어야 하기 때문이다.

---

## 해결

### CAST로 명시적 타입 지정

```java
// Before — null일 때 bytea로 추론
LOWER(CONCAT('%', :keyword, '%'))

// After — 명시적으로 text 타입 캐스팅
LOWER(CONCAT('%', CAST(:keyword AS text), '%'))
```

`CAST(:keyword AS text)`를 추가하면, Hibernate가 null을 넘기더라도 PostgreSQL은 이 파라미터를 `text` 타입으로 취급한다.

### 실제 적용 (4개 리포지토리)

프로젝트 전체를 검색해보니 같은 패턴이 4곳에 있었다. 전부 동일하게 수정했다.

```java
// IngredientRepository
@Query("SELECT i FROM Ingredient i JOIN FETCH i.category LEFT JOIN FETCH i.synonyms " +
       "WHERE (:categoryId IS NULL OR i.category.id = :categoryId) " +
       "AND (:keyword IS NULL OR LOWER(i.name) LIKE LOWER(CONCAT('%', CAST(:keyword AS text), '%')))")

// RecipeRepository
@Query("... AND (:keyword IS NULL OR LOWER(r.title) LIKE LOWER(CONCAT('%', CAST(:keyword AS text), '%')))")

// UserRepository
@Query("... AND (:keyword IS NULL OR LOWER(u.email) LIKE LOWER(CONCAT('%', CAST(:keyword AS text), '%')) " +
       "     OR LOWER(u.displayName) LIKE LOWER(CONCAT('%', CAST(:keyword AS text), '%')))")

// ShortsCacheRepository
@Query("... WHERE (:keyword IS NULL OR LOWER(s.title) LIKE LOWER(CONCAT('%', CAST(:keyword AS text), '%')) " +
       "       OR LOWER(s.youtubeUrl) LIKE LOWER(CONCAT('%', CAST(:keyword AS text), '%')))")
```

---

## 대안 비교

이 문제를 해결하는 방법은 여러 가지가 있다.

### 1. CAST (내가 선택한 방법)
```java
LOWER(CONCAT('%', CAST(:keyword AS text), '%'))
```
- 장점: JPQL 안에서 해결, 코드 변경 최소
- 단점: 쿼리가 약간 길어짐

### 2. COALESCE로 null 회피
```java
LOWER(CONCAT('%', COALESCE(:keyword, ''), '%'))
```
- 장점: 직관적
- 단점: keyword가 null이면 `LIKE '%%'`가 되어 **전체 행에 LIKE 연산**이 돈다. 인덱스를 못 탈 수도 있고 불필요한 연산이 추가된다.

### 3. 서비스 레이어에서 분기
```java
if (keyword == null) {
    return repository.findByCategory(categoryId);
} else {
    return repository.searchByCategoryAndKeyword(categoryId, keyword);
}
```
- 장점: 쿼리가 깔끔
- 단점: 쿼리 2개 관리, 필터 조합이 늘면 조합 폭발

### 4. Specification / QueryDSL 동적 쿼리
```java
Specification<Ingredient> spec = (root, query, cb) -> {
    List<Predicate> predicates = new ArrayList<>();
    if (keyword != null) {
        predicates.add(cb.like(cb.lower(root.get("name")), "%" + keyword.toLowerCase() + "%"));
    }
    return cb.and(predicates.toArray(new Predicate[0]));
};
```
- 장점: null 파라미터 문제가 원천 차단
- 단점: 기존 `@Query` 기반 코드 전면 리팩토링 필요

`CAST` 방식을 선택한 이유는 **기존 코드 변경이 최소**이고, JPQL 내에서 의도가 명확히 드러나기 때문이다. 새 프로젝트라면 Specification 방식을 쓰겠지만, 이미 `@Query`로 작성된 쿼리가 많은 상태에서는 `CAST` 한 줄 추가가 가장 실용적이었다.

---

## 정리

| 항목 | 내용 |
|------|------|
| **증상** | `lower(bytea) does not exist` 에러. keyword가 null일 때만 발생 |
| **원인** | Hibernate가 null String 파라미터의 타입을 추론 못해 bytea로 폴백 |
| **왜 PostgreSQL만** | PostgreSQL은 함수 오버로딩을 지원해서 정확한 타입 매칭을 요구 |
| **왜 keyword가 있을 때는 정상** | 값이 있으면 Java String → varchar 타입이 정상 바인딩됨 |
| **해결** | `CAST(:keyword AS text)` 명시적 타입 캐스팅 |
| **주의** | `IS NULL OR ...` 패턴의 단축 평가를 SQL에서 기대하면 안 됨 |

이 문제를 검색했을 때 영어권 Stack Overflow에 몇 개 답변이 있었지만, **JPQL + PostgreSQL + null 파라미터** 조합으로 정확히 설명하는 한국어 자료는 찾지 못했다. 같은 상황에 빠진 분에게 도움이 되길 바란다.
