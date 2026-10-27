CREATE TABLE IF NOT EXISTS letra_songs (
 user_id TEXT NOT NULL,
 id TEXT NOT NULL,
 data JSONB NOT NULL,
 updated_at BIGINT NOT NULL,
 PRIMARY KEY(user_id,id)
);
