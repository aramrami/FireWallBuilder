CREATE TABLE IF NOT EXISTS Rules (
  ruleID INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT,
  creationDate INTEGER,
  directionBitmask INTEGER,
  protocolBitmask INTEGER,
  ipFrom TEXT,
  ipTo TEXT,
  ports TEXT,
  comment TEXT
);