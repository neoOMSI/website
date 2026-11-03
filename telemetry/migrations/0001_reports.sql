CREATE TABLE reports (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at TEXT NOT NULL,
  game_version TEXT NOT NULL,
  report_json TEXT NOT NULL
);

CREATE INDEX reports_created_at ON reports (created_at);
CREATE INDEX reports_game_version ON reports (game_version);
