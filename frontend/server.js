import express from 'express';
import cors from 'cors';
import crypto from 'node:crypto';
import { DatabaseSync } from 'node:sqlite';

const db = new DatabaseSync('./sportsbook.db');
const app = express();
app.use(cors());
app.use(express.json());

db.exec(`
  CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, email TEXT UNIQUE NOT NULL);
  CREATE TABLE IF NOT EXISTS wallets (user_id TEXT PRIMARY KEY, balance INTEGER NOT NULL DEFAULT 0, currency TEXT DEFAULT 'NGN');
  CREATE TABLE IF NOT EXISTS events (id TEXT PRIMARY KEY, sport TEXT, league TEXT, home_team TEXT, away_team TEXT, kickoff_time TEXT, status TEXT DEFAULT 'UPCOMING');
  CREATE TABLE IF NOT EXISTS outcomes (id TEXT PRIMARY KEY, event_id TEXT, market_name TEXT, selection_name TEXT, odds REAL, is_suspended INTEGER DEFAULT 0);
  CREATE TABLE IF NOT EXISTS bets (id TEXT PRIMARY KEY, user_id TEXT, stake INTEGER, total_odds REAL, potential_payout INTEGER, status TEXT DEFAULT 'PENDING', created_at TEXT DEFAULT CURRENT_TIMESTAMP);
  CREATE TABLE IF NOT EXISTS bet_legs (id TEXT PRIMARY KEY, bet_id TEXT, event_id TEXT, outcome_id TEXT, locked_odds REAL);

  INSERT OR IGNORE INTO users VALUES ('11111111-1111-1111-1111-111111111111', 'player@test.com');
  INSERT OR IGNORE INTO wallets VALUES ('11111111-1111-1111-1111-111111111111', 10000000, 'NGN');

  -- Seed Multi-Sport Events (Football, Basketball, Tennis, Table Tennis, Esports)
  INSERT OR IGNORE INTO events (id, sport, league, home_team, away_team, kickoff_time, status) VALUES
    ('22222222-2222-2222-2222-222222222221', 'Football', 'UEFA Champions League', 'Chelsea', 'Real Madrid', datetime('now', '+2 hours'), 'UPCOMING'),
    ('22222222-2222-2222-2222-222222222222', 'Football', 'UEFA Champions League', 'Liverpool', 'PSG', datetime('now', '+4 hours'), 'UPCOMING'),
    ('22222222-2222-2222-2222-222222222223', 'Basketball', 'NBA', 'LA Lakers', 'Boston Celtics', datetime('now', '+3 hours'), 'UPCOMING'),
    ('22222222-2222-2222-2222-222222222224', 'Basketball', 'NBA', 'Golden State Warriors', 'Denver Nuggets', datetime('now', '+5 hours'), 'UPCOMING'),
    ('22222222-2222-2222-2222-222222222225', 'Tennis', 'ATP Tour', 'Carlos Alcaraz', 'Jannik Sinner', datetime('now', '+1 hour'), 'UPCOMING'),
    ('22222222-2222-2222-2222-222222222226', 'Tennis', 'WTA Tour', 'Iga Swiatek', 'Aryna Sabalenka', datetime('now', '+2 hours'), 'UPCOMING'),
    ('22222222-2222-2222-2222-222222222227', 'Table Tennis', 'TT Elite Series', 'K. Duda', 'T. Moregard', datetime('now', '+30 minutes'), 'UPCOMING'),
    ('22222222-2222-2222-2222-222222222228', 'Esports', 'CS2 Major', 'Natus Vincere', 'FaZe Clan', datetime('now', '+6 hours'), 'UPCOMING');

  -- Seed Outcomes (3-way 1X2 for Football, 2-way Winner for Basketball/Tennis/Table Tennis/Esports)
  INSERT OR IGNORE INTO outcomes VALUES
    ('33333333-3333-3333-3333-333333333331', '22222222-2222-2222-2222-222222222221', '1X2', 'HOME', 2.45, 0),
    ('33333333-3333-3333-3333-333333333332', '22222222-2222-2222-2222-222222222221', '1X2', 'DRAW', 3.40, 0),
    ('33333333-3333-3333-3333-333333333333', '22222222-2222-2222-2222-222222222221', '1X2', 'AWAY', 2.75, 0),
    ('33333333-3333-3333-3333-333333333334', '22222222-2222-2222-2222-222222222222', '1X2', 'HOME', 1.95, 0),
    ('33333333-3333-3333-3333-333333333335', '22222222-2222-2222-2222-222222222222', '1X2', 'DRAW', 3.60, 0),
    ('33333333-3333-3333-3333-333333333336', '22222222-2222-2222-2222-222222222222', '1X2', 'AWAY', 3.80, 0),
    ('33333333-3333-3333-3333-333333333337', '22222222-2222-2222-2222-222222222223', 'Moneyline', '1 (HOME)', 2.15, 0),
    ('33333333-3333-3333-3333-333333333338', '22222222-2222-2222-2222-222222222223', 'Moneyline', '2 (AWAY)', 1.72, 0),
    ('33333333-3333-3333-3333-333333333339', '22222222-2222-2222-2222-222222222224', 'Moneyline', '1 (HOME)', 1.85, 0),
    ('33333333-3333-3333-3333-333333333340', '22222222-2222-2222-2222-222222222224', 'Moneyline', '2 (AWAY)', 1.95, 0),
    ('33333333-3333-3333-3333-333333333341', '22222222-2222-2222-2222-222222222225', 'Match Winner', '1', 1.88, 0),
    ('33333333-3333-3333-3333-333333333342', '22222222-2222-2222-2222-222222222225', 'Match Winner', '2', 1.92, 0),
    ('33333333-3333-3333-3333-333333333343', '22222222-2222-2222-2222-222222222226', 'Match Winner', '1', 1.65, 0),
    ('33333333-3333-3333-3333-333333333344', '22222222-2222-2222-2222-222222222226', 'Match Winner', '2', 2.25, 0),
    ('33333333-3333-3333-3333-333333333345', '22222222-2222-2222-2222-222222222227', 'Match Winner', '1', 1.78, 0),
    ('33333333-3333-3333-3333-333333333346', '22222222-2222-2222-2222-222222222227', 'Match Winner', '2', 2.02, 0),
    ('33333333-3333-3333-3333-333333333347', '22222222-2222-2222-2222-222222222228', 'Match Winner', '1', 1.80, 0),
    ('33333333-3333-3333-3333-333333333348', '22222222-2222-2222-2222-222222222228', 'Match Winner', '2', 2.00, 0);
`);

app.get('/api/wallet/:userId', (req, res) => {
  const wallet = db.prepare('SELECT balance, currency FROM wallets WHERE user_id = ?').get(req.params.userId);
  if (!wallet) return res.status(404).json({ error: 'Wallet not found' });
  res.json(wallet);
});

// Optional top-up endpoint so you can refill test balance anytime
app.post('/api/wallet/:userId/deposit', (req, res) => {
  const amount = Number(req.body.amount) || 5000000; // Default +₦50,000
  db.prepare('UPDATE wallets SET balance = balance + ? WHERE user_id = ?').run(amount, req.params.userId);
  const wallet = db.prepare('SELECT balance FROM wallets WHERE user_id = ?').get(req.params.userId);
  res.json(wallet);
});

app.get('/api/events', (req, res) => {
  const events = db.prepare(`SELECT id, sport, league, home_team AS homeTeam, away_team AS awayTeam, kickoff_time AS kickoffTime FROM events WHERE status IN ('UPCOMING', 'LIVE') ORDER BY kickoff_time ASC`).all();
  const getOutcomes = db.prepare(`SELECT id, market_name AS marketName, selection_name AS selectionName, odds, is_suspended AS isSuspended FROM outcomes WHERE event_id = ?`);
  res.json(events.map((e) => ({ ...e, outcomes: getOutcomes.all(e.id) })));
});

app.post('/api/bets', (req, res) => {
  const { userId, stake, selections } = req.body;
  if (!Array.isArray(selections) || !selections.length || !Number.isInteger(stake) || stake <= 0) {
    return res.status(400).json({ error: 'Invalid stake or empty selections' });
  }

  try {
    db.exec('BEGIN IMMEDIATE');
    const wallet = db.prepare('SELECT balance FROM wallets WHERE user_id = ?').get(userId);
    if (!wallet) throw new Error('WALLET_NOT_FOUND');
    if (wallet.balance < stake) throw new Error('INSUFFICIENT_FUNDS');

    let totalOdds = 1.0;
    const resolved = [];
    for (const sel of selections) {
      const out = db.prepare('SELECT id, event_id, odds, is_suspended FROM outcomes WHERE id = ?').get(sel.outcomeId);
      if (!out || out.is_suspended) throw new Error(`MARKET_SUSPENDED:${sel.outcomeId}`);
      if (Number(out.odds) < Number(sel.expectedOdds)) throw new Error(`ODDS_CHANGED:${sel.outcomeId}:${out.odds}`);
      totalOdds *= Number(out.odds);
      resolved.push(out);
    }

    const finalOdds = Math.round(totalOdds * 1000) / 1000;
    const potentialPayout = Math.floor(stake * finalOdds);
    const newBalance = wallet.balance - stake;
    const betId = crypto.randomUUID();

    db.prepare('UPDATE wallets SET balance = ? WHERE user_id = ?').run(newBalance, userId);
    db.prepare('INSERT INTO bets (id, user_id, stake, total_odds, potential_payout) VALUES (?, ?, ?, ?, ?)').run(betId, userId, stake, finalOdds, potentialPayout);

    const insertLeg = db.prepare('INSERT INTO bet_legs (id, bet_id, event_id, outcome_id, locked_odds) VALUES (?, ?, ?, ?, ?)');
    for (const out of resolved) insertLeg.run(crypto.randomUUID(), betId, out.event_id, out.id, out.odds);

    db.exec('COMMIT');
    res.status(201).json({ betId, stake, finalOdds, potentialPayout, newBalance });
  } catch (err) {
    db.exec('ROLLBACK');
    res.status(409).json({ error: err.message });
  }
});
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'naijabet_super_secret_key_2026';

// Users table check/creation
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE,
    password_hash TEXT,
    balance INTEGER DEFAULT 0
  );
`);

// Register Endpoint
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = crypto.randomUUID();

    db.prepare('INSERT INTO users (id, username, password_hash, balance) VALUES (?, ?, ?, ?)').run(
      userId, username, hashedPassword, 5000000
    );

    const token = jwt.sign({ userId, username }, JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ token, userId, username, balance: 5000000 });
  } catch (err) {
    res.status(400).json({ error: 'Username already taken or invalid data' });
  }
});

// Login Endpoint
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);

    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const token = jwt.sign({ userId: user.id, username: user.username }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, userId: user.id, username: user.username, balance: user.balance });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
