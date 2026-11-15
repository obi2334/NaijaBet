import express from 'express';
import cors from 'cors';
import crypto from 'node:crypto';
import { DatabaseSync } from 'node:sqlite';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const db = new DatabaseSync(process.env.DATABASE_PATH || './sportsbook.db');
const app = express();
const PORT = Number(process.env.PORT || 4000);
const JWT_SECRET = process.env.JWT_SECRET;
const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
const PAYSTACK_WEBHOOK_SECRET = process.env.PAYSTACK_WEBHOOK_SECRET;
const APP_URL = process.env.APP_URL || 'http://localhost:5173';
if (!JWT_SECRET || JWT_SECRET.length < 32) throw new Error('Set JWT_SECRET to a random string of at least 32 characters.');

db.exec(`
  PRAGMA foreign_keys = ON;
  CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, email TEXT UNIQUE NOT NULL, password_hash TEXT);
  CREATE TABLE IF NOT EXISTS wallets (user_id TEXT PRIMARY KEY, balance INTEGER NOT NULL DEFAULT 0, currency TEXT DEFAULT 'NGN');
  CREATE TABLE IF NOT EXISTS events (id TEXT PRIMARY KEY, sport TEXT, league TEXT, home_team TEXT, away_team TEXT, kickoff_time TEXT, status TEXT DEFAULT 'UPCOMING');
  CREATE TABLE IF NOT EXISTS outcomes (id TEXT PRIMARY KEY, event_id TEXT, market_name TEXT, selection_name TEXT, odds REAL, is_suspended INTEGER DEFAULT 0);
  CREATE TABLE IF NOT EXISTS bets (id TEXT PRIMARY KEY, user_id TEXT, stake INTEGER, total_odds REAL, potential_payout INTEGER, status TEXT DEFAULT 'PENDING', created_at TEXT DEFAULT CURRENT_TIMESTAMP);
  CREATE TABLE IF NOT EXISTS bet_legs (id TEXT PRIMARY KEY, bet_id TEXT, event_id TEXT, outcome_id TEXT, locked_odds REAL);
  CREATE TABLE IF NOT EXISTS deposits (id TEXT PRIMARY KEY, user_id TEXT NOT NULL, reference TEXT NOT NULL UNIQUE, amount INTEGER NOT NULL CHECK(amount >= 5000), status TEXT NOT NULL DEFAULT 'PENDING' CHECK(status IN ('PENDING','SUCCESS','FAILED')), created_at TEXT DEFAULT CURRENT_TIMESTAMP, paid_at TEXT);
  CREATE TABLE IF NOT EXISTS booking_codes (code TEXT PRIMARY KEY, selections_json TEXT NOT NULL, created_at TEXT DEFAULT CURRENT_TIMESTAMP);
`);
// Add sign-in support to databases created by the older email-only schema.
const userColumns = db.prepare('PRAGMA table_info(users)').all().map((column) => column.name);
if (!userColumns.includes('password_hash')) db.exec('ALTER TABLE users ADD COLUMN password_hash TEXT');

// Demo fixtures for a new database.
const fixtureEvents = [
  ['22222222-2222-2222-2222-222222222221','Football','UEFA Champions League','Chelsea','Real Madrid',2],
  ['22222222-2222-2222-2222-222222222222','Football','UEFA Champions League','Liverpool','PSG',4],
  ['22222222-2222-2222-2222-222222222223','Basketball','NBA','LA Lakers','Boston Celtics',3],
  ['22222222-2222-2222-2222-222222222224','Basketball','NBA','Golden State Warriors','Denver Nuggets',5],
  ['22222222-2222-2222-2222-222222222225','Tennis','ATP Tour','Carlos Alcaraz','Jannik Sinner',1],
  ['22222222-2222-2222-2222-222222222226','Tennis','WTA Tour','Iga Swiatek','Aryna Sabalenka',2],
  ['22222222-2222-2222-2222-222222222227','Table Tennis','TT Elite Series','K. Duda','T. Moregard',0.5],
  ['22222222-2222-2222-2222-222222222228','Esports','CS2 Major','Natus Vincere','FaZe Clan',6],
  ['22222222-2222-2222-2222-222222222229','Football','English Premier League','Arsenal','Manchester City',7],
];
const addEvent = db.prepare("INSERT OR IGNORE INTO events (id,sport,league,home_team,away_team,kickoff_time,status) VALUES (?,?,?,?,?,datetime('now',?), 'UPCOMING')");
for (const [id,sport,league,home,away,hours] of fixtureEvents) addEvent.run(id,sport,league,home,away,`+${hours} hours`);
const fixtureOdds = [2.45,3.4,2.75,1.95,3.6,3.8,2.15,1.72,1.85,1.95,1.88,1.92,1.65,2.25,1.78,2.02,1.8,2.0];
const fixtureSelections = ['HOME','DRAW','AWAY','HOME','DRAW','AWAY','1 (HOME)','2 (AWAY)','1 (HOME)','2 (AWAY)','1','2','1','2','1','2','1','2'];
const fixtureMarket = ['1X2','1X2','1X2','1X2','1X2','1X2','Moneyline','Moneyline','Moneyline','Moneyline','Match Winner','Match Winner','Match Winner','Match Winner','Match Winner','Match Winner','Match Winner','Match Winner'];
for (let i=0;i<fixtureOdds.length;i++) addOutcome.run(`33333333-3333-3333-3333-${String(333333333331+i).slice(-12)}`,fixtureEvents[Math.floor(i/2)][0],fixtureMarket[i],fixtureSelections[i],fixtureOdds[i]);

// Complete the football 1X2 demo prices and add clearly sample-only detail markets.
const updateOutcome = db.prepare('UPDATE outcomes SET market_name=?, selection_name=? WHERE id=?');
updateOutcome.run('1X2','HOME','33333333-3333-3333-3333-333333333347');
updateOutcome.run('1X2','AWAY','33333333-3333-3333-3333-333333333348');
const demoFootballMarkets = [
  ['22222222-2222-2222-2222-222222222221','1X2','AWAY',3.00],
  ['22222222-2222-2222-2222-222222222222','1X2','DRAW',3.30],
  ['22222222-2222-2222-2222-222222222229','1X2','DRAW',3.60],
  ['22222222-2222-2222-2222-222222222221','Draw No Bet','Chelsea',1.70],
  ['22222222-2222-2222-2222-222222222221','Draw No Bet','Real Madrid',2.10],
  ['22222222-2222-2222-2222-222222222221','Both Teams to Score','Yes',1.65],
  ['22222222-2222-2222-2222-222222222221','Both Teams to Score','No',2.15],
  ['22222222-2222-2222-2222-222222222221','Asian Total','Over 2.5',1.85],
  ['22222222-2222-2222-2222-222222222221','Asian Total','Under 2.5',1.95],
  ['22222222-2222-2222-2222-222222222221','Asian Handicap','Chelsea -0.5',2.05],
  ['22222222-2222-2222-2222-222222222221','Asian Handicap','Real Madrid +0.5',1.75],
  ['22222222-2222-2222-2222-222222222221','Anytime Goalscorer','Cole Palmer',2.50],
  ['22222222-2222-2222-2222-222222222221','Anytime Goalscorer','Vinicius Jr',2.65],
  ['22222222-2222-2222-2222-222222222222','Draw No Bet','Liverpool',1.55],
  ['22222222-2222-2222-2222-222222222222','Draw No Bet','PSG',2.25],
  ['22222222-2222-2222-2222-222222222222','Both Teams to Score','Yes',1.62],
  ['22222222-2222-2222-2222-222222222222','Both Teams to Score','No',2.20],
  ['22222222-2222-2222-2222-222222222222','Asian Total','Over 2.5',1.80],
  ['22222222-2222-2222-2222-222222222222','Asian Total','Under 2.5',2.00],
  ['22222222-2222-2222-2222-222222222222','Asian Handicap','Liverpool -0.5',1.95],
  ['22222222-2222-2222-2222-222222222222','Asian Handicap','PSG +0.5',1.90],
  ['22222222-2222-2222-2222-222222222222','Anytime Goalscorer','Mohamed Salah',2.10],
  ['22222222-2222-2222-2222-222222222222','Anytime Goalscorer','Ousmane Dembele',2.75],
  ['22222222-2222-2222-2222-222222222229','Draw No Bet','Arsenal',1.62],
  ['22222222-2222-2222-2222-222222222229','Draw No Bet','Manchester City',2.20],
  ['22222222-2222-2222-2222-222222222229','Both Teams to Score','Yes',1.70],
  ['22222222-2222-2222-2222-222222222229','Both Teams to Score','No',2.05],
  ['22222222-2222-2222-2222-222222222229','Asian Total','Over 2.5',1.88],
  ['22222222-2222-2222-2222-222222222229','Asian Total','Under 2.5',1.92],
  ['22222222-2222-2222-2222-222222222229','Asian Handicap','Arsenal -0.5',1.95],
  ['22222222-2222-2222-2222-222222222229','Asian Handicap','Manchester City +0.5',1.90],
  ['22222222-2222-2222-2222-222222222229','Anytime Goalscorer','Bukayo Saka',2.40],
  ['22222222-2222-2222-2222-222222222229','Anytime Goalscorer','Erling Haaland',2.05],
];
for (const [index, [eventId, market, selection, odds]] of demoFootballMarkets.entries()) {
  addOutcome.run(`33333333-3333-3333-3333-${String(333333333349+index).slice(-12)}`,eventId,market,selection,odds);
}

const walletFor = (id) => db.prepare('SELECT balance FROM wallets WHERE user_id = ?').get(id);
function auth(req,res,next) { try { const h=req.get('authorization')||''; if(!h.startsWith('Bearer ')) throw Error(); req.user=jwt.verify(h.slice(7),JWT_SECRET); next(); } catch { res.status(401).json({error:'Please sign in to continue.'}); } }

// Parse no other middleware before the raw webhook body: Paystack signs the exact bytes.
app.post('/api/payments/paystack/webhook',express.raw({type:'application/json'}),(req,res)=>{
  if(!PAYSTACK_SECRET_KEY)return res.sendStatus(503);
  let verified=false;
  const modern=req.get('paystack-signature');
  if(modern&&PAYSTACK_WEBHOOK_SECRET){
    const parts=modern.split(',').map((part)=>part.trim());
    const timestamp=Number(parts.find((part)=>part.startsWith('t='))?.slice(2));
    const signatures=parts.filter((part)=>part.startsWith('v1=')).map((part)=>part.slice(3).split(':').at(-1));
    if(Number.isFinite(timestamp)&&Math.abs(Date.now()/1000-timestamp)<=300){
      const want=Buffer.from(crypto.createHmac('sha512',PAYSTACK_WEBHOOK_SECRET).update(`${timestamp}.`).update(req.body).digest('hex'));
      verified=signatures.some((value)=>{if(!/^[0-9a-f]{128}$/.test(value))return false;const got=Buffer.from(value,'hex');return got.length===want.length&&crypto.timingSafeEqual(got,want)});
    }
  }else{
    const value=req.get('x-paystack-signature')||'';
    if(/^[0-9a-f]{128}$/.test(value)){const got=Buffer.from(value,'hex'),want=crypto.createHmac('sha512',PAYSTACK_SECRET_KEY).update(req.body).digest();verified=got.length===want.length&&crypto.timingSafeEqual(got,want)}
  }
  if(!verified)return res.sendStatus(401);
  let event;try{event=JSON.parse(req.body.toString('utf8'))}catch{return res.sendStatus(400)}
  if(event.event!=='charge.success'||!event.data?.reference)return res.sendStatus(200);
  try{db.exec('BEGIN IMMEDIATE');const d=db.prepare('SELECT * FROM deposits WHERE reference=?').get(event.data.reference);
    if(!d||d.status!=='PENDING'){db.exec('COMMIT');return res.sendStatus(200)}
    if(event.data.status!=='success'||event.data.currency!=='NGN'||event.data.amount!==d.amount){db.prepare("UPDATE deposits SET status='FAILED' WHERE id=?").run(d.id);db.exec('COMMIT');return res.sendStatus(200)}
    db.prepare('UPDATE wallets SET balance=balance+? WHERE user_id=?').run(d.amount,d.user_id);
    db.prepare("UPDATE deposits SET status='SUCCESS',paid_at=CURRENT_TIMESTAMP WHERE id=? AND status='PENDING'").run(d.id);db.exec('COMMIT');return res.sendStatus(200)
  }catch(error){try{db.exec('ROLLBACK')}catch{}console.error(error);return res.sendStatus(500)}
});
app.use(express.json({limit:'100kb'}));
app.use(cors({origin:(process.env.CORS_ORIGIN||'http://localhost:5173').split(',')}));

app.post('/api/auth/register',async(req,res)=>{
  const email=String(req.body?.email||'').trim().toLowerCase(),password=String(req.body?.password||'');
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||password.length<8||password.length>200)return res.status(400).json({error:'Enter a valid email and a password of at least 8 characters.'});
  const id=crypto.randomUUID();try{const hash=await bcrypt.hash(password,12);db.exec('BEGIN IMMEDIATE');db.prepare('INSERT INTO users(id,email,password_hash) VALUES(?,?,?)').run(id,email,hash);db.prepare("INSERT INTO wallets(user_id,balance,currency) VALUES(?,0,'NGN')").run(id);db.exec('COMMIT');res.status(201).json({token:jwt.sign({userId:id,email},JWT_SECRET,{expiresIn:'7d'}),userId:id,email,balance:0})}
  catch{try{db.exec('ROLLBACK')}catch{}res.status(409).json({error:'That email already has an account.'})}
});
app.post('/api/auth/login',async(req,res)=>{const email=String(req.body?.email||'').trim().toLowerCase(),u=db.prepare('SELECT id,email,password_hash FROM users WHERE email=?').get(email);if(!u?.password_hash||!(await bcrypt.compare(String(req.body?.password||''),u.password_hash)))return res.status(401).json({error:'Email or password is incorrect.'});res.json({token:jwt.sign({userId:u.id,email:u.email},JWT_SECRET,{expiresIn:'7d'}),userId:u.id,email:u.email,balance:walletFor(u.id)?.balance||0})});
app.get('/api/wallet',auth,(req,res)=>{const w=walletFor(req.user.userId);if(!w)return res.status(404).json({error:'Wallet not found.'});res.json({balance:w.balance,balanceKobo:w.balance,currency:'NGN',minimumDeposit:50})});
app.post('/api/wallet/deposits',auth,async(req,res)=>{
  if(!PAYSTACK_SECRET_KEY)return res.status(503).json({error:'Deposits are not configured. Add PAYSTACK_SECRET_KEY to the server environment.'});
  const amount=req.body?.amount;if(typeof amount!=='number'||!Number.isSafeInteger(amount)||amount<50)return res.status(400).json({error:'The minimum deposit is ₦50. Enter a whole number of naira.'});
  const kobo=amount*100;if(!Number.isSafeInteger(kobo))return res.status(400).json({error:'Amount is too large.'});
  const reference=`dep-${crypto.randomUUID()}`,id=crypto.randomUUID();db.prepare('INSERT INTO deposits(id,user_id,reference,amount) VALUES(?,?,?,?)').run(id,req.user.userId,reference,kobo);
  try{const response=await fetch('https://api.paystack.co/transaction/initialize',{method:'POST',headers:{Authorization:`Bearer ${PAYSTACK_SECRET_KEY}`,'Content-Type':'application/json'},body:JSON.stringify({email:req.user.email,amount:kobo,currency:'NGN',reference,callback_url:APP_URL})});const result=await response.json();if(!response.ok||!result.status||!result.data?.authorization_url)throw Error('Could not start checkout. Please try again.');res.status(201).json({reference,checkoutUrl:result.data.authorization_url,amount,status:'PENDING'})}
  catch(error){db.prepare("UPDATE deposits SET status='FAILED' WHERE id=?").run(id);res.status(502).json({error:error.message})}
});
app.get('/api/wallet/deposits/:reference',auth,async(req,res)=>{
  let row=db.prepare('SELECT * FROM deposits WHERE reference=? AND user_id=?').get(req.params.reference,req.user.userId);
  if(!row)return res.status(404).json({error:'Deposit not found.'});
  // Verify the reference directly with Paystack after checkout. This also works
  // when the browser is local and Paystack cannot reach a webhook on localhost.
  if(row.status==='PENDING'&&PAYSTACK_SECRET_KEY){
    try{
      const response=await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(row.reference)}`,{headers:{Authorization:`Bearer ${PAYSTACK_SECRET_KEY}`}});
      const result=await response.json();
      if(response.ok&&result.status&&['success','failed'].includes(result.data?.status)){
        const paid=result.data;
        db.exec('BEGIN IMMEDIATE');
        row=db.prepare('SELECT * FROM deposits WHERE reference=? AND user_id=?').get(req.params.reference,req.user.userId);
        if(row.status==='PENDING'){
          if(paid.status==='success'&&paid.reference===row.reference&&paid.currency==='NGN'&&paid.amount===row.amount){
            db.prepare('UPDATE wallets SET balance=balance+? WHERE user_id=?').run(row.amount,row.user_id);
            db.prepare("UPDATE deposits SET status='SUCCESS',paid_at=CURRENT_TIMESTAMP WHERE id=? AND status='PENDING'").run(row.id);
          }else if(paid.status==='failed'||paid.status==='success') db.prepare("UPDATE deposits SET status='FAILED' WHERE id=? AND status='PENDING'").run(row.id);
        }
        db.exec('COMMIT');
        row=db.prepare('SELECT * FROM deposits WHERE reference=? AND user_id=?').get(req.params.reference,req.user.userId);
      }
    }catch(error){try{db.exec('ROLLBACK')}catch{}console.error('Paystack verification failed:',error.message)}
  }
  res.json({reference:row.reference,amount:row.amount/100,currency:'NGN',status:row.status,createdAt:row.created_at,paidAt:row.paid_at});
});
app.get('/api/events',(_req,res)=>{const events=db.prepare("SELECT id,sport,league,home_team AS homeTeam,away_team AS awayTeam,kickoff_time AS kickoffTime,status FROM events WHERE status IN ('UPCOMING','LIVE') ORDER BY kickoff_time").all(),get=db.prepare('SELECT id,market_name AS marketName,selection_name AS selectionName,odds,is_suspended AS isSuspended FROM outcomes WHERE event_id=?');res.json(events.map(e=>({...e,isLive:e.status==='LIVE'?1:0,outcomes:get.all(e.id)})))});
app.get('/api/bets',auth,(req,res)=>res.json(db.prepare('SELECT id,stake,total_odds AS totalOdds,potential_payout AS potentialPayout,status,created_at AS createdAt FROM bets WHERE user_id=? ORDER BY created_at DESC').all(req.user.userId)));
app.post('/api/bets',auth,(req,res)=>{
  const {stake,selections}=req.body||{};if(!Array.isArray(selections)||!selections.length||!Number.isSafeInteger(stake)||stake<=0)return res.status(400).json({error:'Enter a valid stake and select a market.'});
  try{db.exec('BEGIN IMMEDIATE');const w=walletFor(req.user.userId);if(!w)throw Error('WALLET_NOT_FOUND');if(w.balance<stake)throw Error('INSUFFICIENT_FUNDS');let odds=1;const rows=[];
    for(const s of selections){const o=db.prepare('SELECT id,event_id,odds,is_suspended FROM outcomes WHERE id=?').get(s.outcomeId);if(!o||o.is_suspended)throw Error('MARKET_SUSPENDED');if(Number(o.odds)<Number(s.expectedOdds))throw Error('ODDS_CHANGED');odds*=Number(o.odds);rows.push(o)}
    odds=Math.round(odds*1000)/1000;const payout=Math.floor(stake*odds),id=crypto.randomUUID(),balance=w.balance-stake;db.prepare('UPDATE wallets SET balance=? WHERE user_id=?').run(balance,req.user.userId);db.prepare('INSERT INTO bets(id,user_id,stake,total_odds,potential_payout) VALUES(?,?,?,?,?)').run(id,req.user.userId,stake,odds,payout);const leg=db.prepare('INSERT INTO bet_legs(id,bet_id,event_id,outcome_id,locked_odds) VALUES(?,?,?,?,?)');for(const o of rows)leg.run(crypto.randomUUID(),id,o.event_id,o.id,o.odds);db.exec('COMMIT');res.status(201).json({betId:id,stake,finalOdds:odds,potentialPayout:payout,newBalance:balance})
  }catch(e){try{db.exec('ROLLBACK')}catch{}const msg={WALLET_NOT_FOUND:'Wallet not found.',INSUFFICIENT_FUNDS:'Insufficient balance.',MARKET_SUSPENDED:'A selected market is unavailable.',ODDS_CHANGED:'Odds changed. Review selections.'};res.status(409).json({error:msg[e.message]||'Could not place bet.'})}
});
app.post('/api/booking-codes',auth,(req,res)=>{const selections=req.body?.selections;if(!Array.isArray(selections)||!selections.length)return res.status(400).json({error:'Bet slip is empty.'});const code=crypto.randomBytes(5).toString('hex').toUpperCase();db.prepare('INSERT INTO booking_codes(code,selections_json) VALUES(?,?)').run(code,JSON.stringify(selections));res.status(201).json({code})});
app.get('/api/booking-codes/:code',auth,(req,res)=>{const row=db.prepare('SELECT selections_json FROM booking_codes WHERE code=?').get(req.params.code.toUpperCase());if(!row)return res.status(404).json({error:'Booking code not found.'});res.json({selections:JSON.parse(row.selections_json)})});
app.listen(PORT,()=>console.log(`NaijaBet API listening on ${PORT}`));
