-- shorts_cache에 유튜브 메타데이터 컬럼 추가
ALTER TABLE shorts_cache ADD COLUMN channel_name VARCHAR(200);
ALTER TABLE shorts_cache ADD COLUMN original_title VARCHAR(500);
ALTER TABLE shorts_cache ADD COLUMN duration_seconds INT;
