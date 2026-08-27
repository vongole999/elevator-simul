# 엘리베이터 테마 관련 코드 중복

- `CAR_LABELS`(A/B/C/D) 배열이 `components/elevator/lobby-scene.tsx`와 `components/elevator/cabin-scene.tsx`에 각각 하드코딩되어 있다. 대수 범위나 레이블 규칙을 바꿀 때 두 곳을 함께 고쳐야 한다.
- `components/elevator/door-panel.tsx`에서 문 표면 장식(`doorSurface`의 테마별 삼항 체인)과 `CabinBackdrop`의 테마별 분기가 같은 목적(테마별 장식)을 별도 구조로 반복한다. 새 테마 추가 시 여러 곳을 빠짐없이 고쳐야 한다.
