CREATE TABLE IF NOT EXISTS notes (
    id SERIAL PRIMARY KEY,
    text TEXT NOT NULL
);

INSERT INTO notes (text) VALUES ('Welcome to the notes service'), ('Docker Compose is running');
