CREATE TABLE IF NOT EXISTS Firewalls (
    firewallID INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    creationDate INTEGER
);

CREATE TABLE IF NOT EXISTS Rules (
  ruleID INTEGER PRIMARY KEY AUTOINCREMENT,
  directionBitmask INTEGER,
  protocolBitmask INTEGER,
  ipFrom TEXT,
  ipTo TEXT,
  ports TEXT,
  comment TEXT,
  firewallID INTEGER,
  FOREIGN KEY(firewallID) REFERENCES Firewalls(firewallID)
);