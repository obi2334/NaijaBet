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
  CREATE TABLE IF NOT EXISTS events (
    id TEXT PRIMARY KEY, sport TEXT, country TEXT, league TEXT,
    home_team TEXT, away_team TEXT, home_score INTEGER DEFAULT 0, away_score INTEGER DEFAULT 0,
    match_clock TEXT, kickoff_time TEXT, status TEXT DEFAULT 'UPCOMING',
    is_live INTEGER DEFAULT 0, trend_pct INTEGER DEFAULT 65, trend_side TEXT DEFAULT 'HOME', watchers INTEGER DEFAULT 4200
  );
  CREATE TABLE IF NOT EXISTS outcomes (id TEXT PRIMARY KEY, event_id TEXT, market_name TEXT, selection_name TEXT, odds REAL, is_suspended INTEGER DEFAULT 0);
  CREATE TABLE IF NOT EXISTS bets (id TEXT PRIMARY KEY, user_id TEXT, stake INTEGER, total_odds REAL, potential_payout INTEGER, status TEXT DEFAULT 'PENDING', created_at TEXT DEFAULT CURRENT_TIMESTAMP);
  CREATE TABLE IF NOT EXISTS bet_legs (id TEXT PRIMARY KEY, bet_id TEXT, event_id TEXT, outcome_id TEXT, locked_odds REAL);
  CREATE TABLE IF NOT EXISTS booking_codes (code TEXT PRIMARY KEY, outcome_ids TEXT NOT NULL);

  INSERT OR IGNORE INTO users VALUES ('11111111-1111-1111-1111-111111111111', 'player@test.com');
  INSERT OR IGNORE INTO wallets VALUES ('11111111-1111-1111-1111-111111111111', 10000000, 'NGN');

  INSERT OR IGNORE INTO events (id, sport, country, league, home_team, away_team, home_score, away_score, match_clock, kickoff_time, status, is_live, trend_pct, trend_side, watchers) VALUES
    -- FOOTBALL (6 Matches / 12 Top Clubs)
    ('evt-fb-1', 'Football', 'Europe', 'UEFA Champions League', 'Chelsea', 'Real Madrid', 1, 1, '64''', datetime('now', '-64 minutes'), 'LIVE', 1, 77, 'AWAY', 19680),
    ('evt-fb-2', 'Football', 'Europe', 'UEFA Champions League', 'Liverpool', 'Paris Saint-Germain', 0, 0, NULL, datetime('now', '+2 hours'), 'UPCOMING', 0, 84, 'HOME', 18420),
    ('evt-fb-3', 'Football', 'England', 'Premier League', 'Arsenal', 'Manchester City', 0, 0, NULL, datetime('now', '+3 hours'), 'UPCOMING', 0, 68, 'HOME', 22150),
    ('evt-fb-4', 'Football', 'England', 'Premier League', 'Manchester United', 'Tottenham Hotspur', 0, 0, NULL, datetime('now', '+5 hours'), 'UPCOMING', 0, 62, 'HOME', 17300),
    ('evt-fb-5', 'Football', 'Spain', 'La Liga', 'FC Barcelona', 'Atletico Madrid', 2, 1, '78''', datetime('now', '-78 minutes'), 'LIVE', 1, 79, 'HOME', 14900),
    ('evt-fb-6', 'Football', 'Germany', 'Bundesliga', 'Bayern Munich', 'Borussia Dortmund', 0, 0, NULL, datetime('now', '+6 hours'), 'UPCOMING', 0, 81, 'HOME', 16200),

    -- BASKETBALL (4 Matches / 8 NBA Franchises)
    ('evt-bb-1', 'Basketball', 'USA', 'NBA', 'LA Lakers', 'Boston Celtics', 88, 92, 'Q3 04:12', datetime('now', '-90 minutes'), 'LIVE', 1, 72, 'AWAY', 11340),
    ('evt-bb-2', 'Basketball', 'USA', 'NBA', 'Golden State Warriors', 'Denver Nuggets', 0, 0, NULL, datetime('now', '+3 hours'), 'UPCOMING', 0, 61, 'HOME', 9820),
    ('evt-bb-3', 'Basketball', 'USA', 'NBA', 'Milwaukee Bucks', 'Phoenix Suns', 0, 0, NULL, datetime('now', '+4 hours'), 'UPCOMING', 0, 67, 'HOME', 8910),
    ('evt-bb-4', 'Basketball', 'USA', 'NBA', 'Miami Heat', 'Dallas Mavericks', 0, 0, NULL, datetime('now', '+6 hours'), 'UPCOMING', 0, 59, 'AWAY', 8450),

    -- TENNIS (3 Matches / 6 Stars)
    ('evt-tn-1', 'Tennis', 'International', 'ATP Tour', 'Carlos Alcaraz', 'Jannik Sinner', 1, 1, 'Set 3 • 4-3', datetime('now', '-110 minutes'), 'LIVE', 1, 58, 'HOME', 8740),
    ('evt-tn-2', 'Tennis', 'International', 'WTA Tour', 'Iga Swiatek', 'Aryna Sabalenka', 0, 0, NULL, datetime('now', '+3 hours'), 'UPCOMING', 0, 74, 'HOME', 6510),
    ('evt-tn-3', 'Tennis', 'International', 'ATP Masters', 'Novak Djokovic', 'Daniil Medvedev', 0, 0, NULL, datetime('now', '+5 hours'), 'UPCOMING', 0, 76, 'HOME', 9120),

    -- TABLE TENNIS (2 Matches)
    ('evt-tt-1', 'Table Tennis', 'International', 'TT Elite Series', 'K. Duda', 'T. Moregard', 2, 1, 'Set 4', datetime('now', '-20 minutes'), 'LIVE', 1, 64, 'HOME', 3210),
    ('evt-tt-2', 'Table Tennis', 'International', 'WTT Champions', 'Fan Zhendong', 'Wang Chuqin', 0, 0, NULL, datetime('now', '+2 hours'), 'UPCOMING', 0, 55, 'AWAY', 4100),

    -- ESPORTS (2 Matches)
    ('evt-es-1', 'Esports', 'Global', 'CS2 Major', 'Natus Vincere', 'FaZe Clan', 0, 0, NULL, datetime('now', '+5 hours'), 'UPCOMING', 0, 81, 'HOME', 15400),
    ('evt-es-2', 'Esports', 'Global', 'LoL Worlds', 'T1', 'G2 Esports', 0, 0, NULL, datetime('now', '+7 hours'), 'UPCOMING', 0, 85, 'HOME', 19200),

    -- ICE HOCKEY (2 Matches)
    ('evt-ih-1', 'Ice Hockey', 'North America', 'NHL', 'Toronto Maple Leafs', 'New York Rangers', 0, 0, NULL, datetime('now', '+4 hours'), 'UPCOMING', 0, 66, 'HOME', 5400),
    ('evt-ih-2', 'Ice Hockey', 'North America', 'NHL', 'Edmonton Oilers', 'Colorado Avalanche', 0, 0, NULL, datetime('now', '+6 hours'), 'UPCOMING', 0, 63, 'HOME', 6100),

    -- AMERICAN FOOTBALL (2 Matches)
    ('evt-af-1', 'American Football', 'USA', 'NFL', 'Kansas City Chiefs', 'San Francisco 49ers', 0, 0, NULL, datetime('now', '+7 hours'), 'UPCOMING', 0, 71, 'HOME', 17800),
    ('evt-af-2', 'American Football', 'USA', 'NFL', 'Philadelphia Eagles', 'Dallas Cowboys', 0, 0, NULL, datetime('now', '+8 hours'), 'UPCOMING', 0, 68, 'HOME', 16500),

    -- CRICKET (2 Matches)
    ('evt-cr-1', 'Cricket', 'International', 'ICC T20', 'India', 'Australia', 0, 0, NULL, datetime('now', '+2 hours'), 'UPCOMING', 0, 88, 'HOME', 24100),
    ('evt-cr-2', 'Cricket', 'International', 'ICC ODI', 'England', 'South Africa', 0, 0, NULL, datetime('now', '+5 hours'), 'UPCOMING', 0, 64, 'HOME', 13200),

    -- MMA / BOXING (2 Bouts)
    ('evt-mm-1', 'MMA / Boxing', 'Global', 'UFC Main Event', 'Islam Makhachev', 'Ilia Topuria', 0, 0, NULL, datetime('now', '+8 hours'), 'UPCOMING', 0, 69, 'HOME', 16200),
    ('evt-mm-2', 'MMA / Boxing', 'Global', 'Heavyweight Boxing', 'Oleksandr Usyk', 'Anthony Joshua', 0, 0, NULL, datetime('now', '+9 hours'), 'UPCOMING', 0, 73, 'HOME', 18900),

    -- VOLLEYBALL (2 Matches)
    ('evt-vb-1', 'Volleyball', 'Europe', 'CEV Champions League', 'Trentino Volley', 'ZAKSA Kedzierzyn', 0, 0, NULL, datetime('now', '+3 hours'), 'UPCOMING', 0, 63, 'HOME', 2890),
    ('evt-vb-2', 'Volleyball', 'Europe', 'SuperLega', 'Sir Safety Perugia', 'Lube Civitanova', 0, 0, NULL, datetime('now', '+5 hours'), 'UPCOMING', 0, 70, 'HOME', 3120);

  INSERT OR IGNORE INTO outcomes VALUES
    -- Football
    ('out-fb-1a', 'evt-fb-1', '1X2', '1', 2.45, 0), ('out-fb-1b', 'evt-fb-1', '1X2', 'X', 3.40, 0), ('out-fb-1c', 'evt-fb-1', '1X2', '2', 2.75, 0),
    ('out-fb-1d', 'evt-fb-1', 'Total 2.5', 'Over 2.5', 1.52, 0), ('out-fb-1e', 'evt-fb-1', 'Total 2.5', 'Under 2.5', 2.40, 0),
    ('out-fb-2a', 'evt-fb-2', '1X2', '1', 1.95, 0), ('out-fb-2b', 'evt-fb-2', '1X2', 'X', 3.60, 0), ('out-fb-2c', 'evt-fb-2', '1X2', '2', 3.80, 0),
    ('out-fb-2d', 'evt-fb-2', 'Total 2.5', 'Over 2.5', 1.65, 0), ('out-fb-2e', 'evt-fb-2', 'Total 2.5', 'Under 2.5', 2.15, 0),
    ('out-fb-3a', 'evt-fb-3', '1X2', '1', 2.30, 0), ('out-fb-3b', 'evt-fb-3', '1X2', 'X', 3.35, 0), ('out-fb-3c', 'evt-fb-3', '1X2', '2', 3.05, 0),
    ('out-fb-3d', 'evt-fb-3', 'GG/NG', 'Yes (GG)', 1.72, 0), ('out-fb-3e', 'evt-fb-3', 'GG/NG', 'No (NG)', 2.05, 0),
    ('out-fb-4a', 'evt-fb-4', '1X2', '1', 2.15, 0), ('out-fb-4b', 'evt-fb-4', '1X2', 'X', 3.50, 0), ('out-fb-4c', 'evt-fb-4', '1X2', '2', 3.20, 0),
    ('out-fb-5a', 'evt-fb-5', '1X2', '1', 1.42, 0), ('out-fb-5b', 'evt-fb-5', '1X2', 'X', 4.30, 0), ('out-fb-5c', 'evt-fb-5', '1X2', '2', 7.50, 0),
    ('out-fb-6a', 'evt-fb-6', '1X2', '1', 1.72, 0), ('out-fb-6b', 'evt-fb-6', '1X2', 'X', 4.00, 0), ('out-fb-6c', 'evt-fb-6', '1X2', '2', 4.40, 0),

    -- Basketball
    ('out-bb-1a', 'evt-bb-1', 'Moneyline', '1', 2.15, 0), ('out-bb-1b', 'evt-bb-1', 'Moneyline', '2', 1.72, 0),
    ('out-bb-1c', 'evt-bb-1', 'Total 224.5', 'Over 224.5', 1.90, 0), ('out-bb-1d', 'evt-bb-1', 'Total 224.5', 'Under 224.5', 1.90, 0),
    ('out-bb-2a', 'evt-bb-2', 'Moneyline', '1', 1.85, 0), ('out-bb-2b', 'evt-bb-2', 'Moneyline', '2', 1.95, 0),
    ('out-bb-3a', 'evt-bb-3', 'Moneyline', '1', 1.78, 0), ('out-bb-3b', 'evt-bb-3', 'Moneyline', '2', 2.05, 0),
    ('out-bb-4a', 'evt-bb-4', 'Moneyline', '1', 2.10, 0), ('out-bb-4b', 'evt-bb-4', 'Moneyline', '2', 1.75, 0),

    -- Tennis
    ('out-tn-1a', 'evt-tn-1', 'Winner', '1', 1.88, 0), ('out-tn-1b', 'evt-tn-1', 'Winner', '2', 1.92, 0),
    ('out-tn-2a', 'evt-tn-2', 'Winner', '1', 1.65, 0), ('out-tn-2b', 'evt-tn-2', 'Winner', '2', 2.25, 0),
    ('out-tn-3a', 'evt-tn-3', 'Winner', '1', 1.70, 0), ('out-tn-3b', 'evt-tn-3', 'Winner', '2', 2.15, 0),

    -- Table Tennis
    ('out-tt-1a', 'evt-tt-1', 'Winner', '1', 1.78, 0), ('out-tt-1b', 'evt-tt-1', 'Winner', '2', 2.02, 0),
    ('out-tt-2a', 'evt-tt-2', 'Winner', '1', 1.82, 0), ('out-tt-2b', 'evt-tt-2', 'Winner', '2', 1.98, 0),

    -- Esports
    ('out-es-1a', 'evt-es-1', 'Winner', '1', 1.80, 0), ('out-es-1b', 'evt-es-1', 'Winner', '2', 2.00, 0),
    ('out-es-2a', 'evt-es-2', 'Winner', '1', 1.58, 0), ('out-es-2b', 'evt-es-2', 'Winner', '2', 2.32, 0),

    -- Ice Hockey
    ('out-ih-1a', 'evt-ih-1', '1X2', '1', 2.10, 0), ('out-ih-1b', 'evt-ih-1', '1X2', 'X', 4.10, 0), ('out-ih-1c', 'evt-ih-1', '1X2', '2', 2.75, 0),
    ('out-ih-2a', 'evt-ih-2', '1X2', '1', 2.25, 0), ('out-ih-2b', 'evt-ih-2', '1X2', 'X', 4.05, 0), ('out-ih-2c', 'evt-ih-2', '1X2', '2', 2.55, 0),

    -- American Football
    ('out-af-1a', 'evt-af-1', 'Moneyline', '1', 1.76, 0), ('out-af-1b', 'evt-af-1', 'Moneyline', '2', 2.08, 0),
    ('out-af-2a', 'evt-af-2', 'Moneyline', '1', 1.84, 0), ('out-af-2b', 'evt-af-2', 'Moneyline', '2', 1.96, 0),

    -- Cricket
    ('out-cr-1a', 'evt-cr-1', 'Winner', '1', 1.82, 0), ('out-cr-1b', 'evt-cr-1', 'Winner', '2', 1.98, 0),
    ('out-cr-2a', 'evt-cr-2', 'Winner', '1', 1.74, 0), ('out-cr-2b', 'evt-cr-2', 'Winner', '2', 2.10, 0),

    -- MMA / Boxing
    ('out-mm-1a', 'evt-mm-1', 'Bout Winner', '1', 1.60, 0), ('out-mm-1b', 'evt-mm-1', 'Bout Winner', '2', 2.35, 0),
    ('out-mm-2a', 'evt-mm-2', 'Bout Winner', '1', 1.55, 0), ('out-mm-2b', 'evt-mm-2', 'Bout Winner', '2', 2.45, 0),

    -- Volleyball
    ('out-vb-1a', 'evt-vb-1', 'Winner', '1', 1.68, 0), ('out-vb-1b', 'evt-vb-1', 'Winner', '2', 2.18, 0),
    ('out-vb-2a', 'evt-vb-2', 'Winner', '1', 1.62, 0), ('out-vb-2b', 'evt-vb-2', 'Winner', '2', 2.28, 0);
`);

app.get('/api/wallet/:userId', (req, res) => {
  const wallet = db.prepare('SELECT balance, currency FROM wallets WHERE user_id = ?').get(req.params.userId);
  if (!wallet) return res.status(404).json({ error: 'Wallet not found' });
  res.json(wallet);
});

app.post('/api/wallet/:userId/deposit', (req, res) => {
  const amount = Number(req.body.amount) || 5000000;
  db.prepare('UPDATE wallets SET balance = balance + ? WHERE user_id = ?').run(amount, req.params.userId);
  res.json(db.prepare('SELECT balance FROM wallets WHERE user_id = ?').get(req.params.userId));
});

app.get('/api/events', (req, res) => {
  const events = db.prepare(`
    SELECT id, sport, country, league, home_team AS homeTeam, away_team AS awayTeam,
           home_score AS homeScore, away_score AS awayScore, match_clock AS matchClock,
           kickoff_time AS kickoffTime, status, is_live AS isLive, trend_pct AS trendPct,
           trend_side AS trendSide, watchers
    FROM events ORDER BY is_live DESC, watchers DESC
  `).all();
  const getOutcomes = db.prepare(`SELECT id, market_name AS marketName, selection_name AS selectionName, odds, is_suspended AS isSuspended FROM outcomes WHERE event_id = ?`);
  res.json(events.map((e) => ({ ...e, outcomes: getOutcomes.all(e.id) })));
});

app.get('/api/bets/:userId', (req, res) => {
  const bets = db.prepare(`SELECT id, stake, total_odds AS totalOdds, potential_payout AS potentialPayout, status, created_at AS createdAt FROM bets WHERE user_id = ? ORDER BY created_at DESC`).all(req.params.userId);
  const getLegs = db.prepare(`
    SELECT bl.locked_odds AS lockedOdds, o.selection_name AS selectionName, o.market_name AS marketName, e.home_team AS homeTeam, e.away_team AS awayTeam
    FROM bet_legs bl JOIN outcomes o ON bl.outcome_id = o.id JOIN events e ON bl.event_id = e.id WHERE bl.bet_id = ?
  `);
  res.json(bets.map((b) => ({ ...b, legs: getLegs.all(b.id) })));
});

app.post('/api/booking-codes', (req, res) => {
  const { outcomeIds } = req.body;
  if (!Array.isArray(outcomeIds) || !outcomeIds.length) return res.status(400).json({ error: 'No selections' });
  const code = 'NB-' + Math.random().toString(36).substring(2, 7).toUpperCase();
  db.prepare('INSERT INTO booking_codes (code, outcome_ids) VALUES (?, ?)').run(code, JSON.stringify(outcomeIds));
  res.json({ code });
});

app.get('/api/booking-codes/:code', (req, res) => {
  const row = db.prepare('SELECT outcome_ids FROM booking_codes WHERE code = ?').get(req.params.code.trim().toUpperCase());
  if (!row) return res.status(404).json({ error: 'Invalid booking code' });
  const ids = JSON.parse(row.outcome_ids);
  const selections = ids.map((id) => db.prepare(`
    SELECT o.id AS outcomeId, o.market_name AS marketName, o.selection_name AS selectionName, o.odds,
           e.id AS eventId, (e.home_team || ' vs ' || e.away_team) AS matchName
    FROM outcomes o JOIN events e ON o.event_id = e.id WHERE o.id = ?
  `).get(id)).filter(Boolean);
  res.json({ selections });
});

app.post('/api/bets', (req, res) => {
  const { userId, stake, selections } = req.body;
  if (!Array.isArray(selections) || !selections.length || !Number.isInteger(stake) || stake <= 0) {
    return res.status(400).json({ error: 'Invalid stake or empty selections' });
  }
  try {
    db.exec('BEGIN IMMEDIATE');
    const wallet = db.prepare('SELECT balance FROM wallets WHERE user_id = ?').get(userId);
    if (!wallet || wallet.balance < stake) throw new Error('INSUFFICIENT_FUNDS');

    let totalOdds = 1.0;
    const resolved = [];
    for (const sel of selections) {
      const out = db.prepare('SELECT id, event_id, odds, is_suspended FROM outcomes WHERE id = ?').get(sel.outcomeId);
      if (!out || out.is_suspended) throw new Error('MARKET_SUSPENDED');
      if (Number(out.odds) < Number(sel.expectedOdds)) throw new Error('ODDS_CHANGED');
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

app.listen(4000, () => console.log('Pro Trading Engine (27 Matches / 54 Clubs) running on http://localhost:4000'));