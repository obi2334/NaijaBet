import React, { useEffect, useMemo, useState } from 'react';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import welcomeImage from './assets/naijabet-welcome.png';

const API_BASE = import.meta.env.VITE_API_BASE || '';
const AUTH_KEY = 'naijabet-token';
const authHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem(AUTH_KEY) || ''}` });

/* Full-Color Realistic Sport Emblems */
const SportLogo = ({ name, className = 'w-4 h-4' }) => {
  switch (name) {
    case 'Football':
      return (
        <svg viewBox="0 0 24 24" className={className}>
          <circle cx="12" cy="12" r="10" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1" />
          <polygon points="12,7.2 15.6,9.8 14.2,14 9.8,14 8.4,9.8" fill="#1e293b" />
          <path d="M12 2v5.2M21.2 9l-5.6.8M18.2 19.8l-4-5.8M5.8 19.8l4-5.8M2.8 9l5.6.8" stroke="#1e293b" strokeWidth="1.4" />
        </svg>
      );
    case 'Basketball':
      return (
        <svg viewBox="0 0 24 24" className={className}>
          <circle cx="12" cy="12" r="10" fill="#ea580c" stroke="#9a3412" strokeWidth="1" />
          <path d="M2 12h20M12 2v20M5.2 5.2c3.8 3.8 3.8 9.8 0 13.6M18.8 5.2c-3.8 3.8-3.8 9.8 0 13.6" fill="none" stroke="#431407" strokeWidth="1.35" />
        </svg>
      );
    case 'Tennis':
      return (
        <svg viewBox="0 0 24 24" className={className}>
          <circle cx="12" cy="12" r="10" fill="#bef264" stroke="#65a30d" strokeWidth="1" />
          <path d="M6.2 3.8c3.2 3.4 3.2 13 0 16.4M17.8 3.8c-3.2 3.4-3.2 13 0 16.4" fill="none" stroke="#ffffff" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      );
    case 'Table Tennis':
      return (
        <svg viewBox="0 0 24 24" className={className}>
          <circle cx="10.5" cy="9.5" r="7" fill="#dc2626" stroke="#991b1b" strokeWidth="1" />
          <path d="M15 14l5.5 5.5a1.5 1.5 0 01-2.1 2.1L12.9 16" fill="#d97706" />
          <circle cx="18.5" cy="6.5" r="2.5" fill="#ffffff" />
        </svg>
      );
    case 'Esports':
      return (
        <svg viewBox="0 0 24 24" className={className}>
          <rect x="2" y="6" width="20" height="12" rx="5" fill="#6366f1" stroke="#4338ca" strokeWidth="1" />
          <path d="M7 12h4M9 10v4" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" />
          <circle cx="15.5" cy="11" r="1" fill="#fbbf24" />
          <circle cx="17.5" cy="13" r="1" fill="#38bdf8" />
        </svg>
      );
    case 'Ice Hockey':
      return (
        <svg viewBox="0 0 24 24" className={className}>
          <ellipse cx="12" cy="16" rx="8" ry="3.5" fill="#1e293b" stroke="#64748b" strokeWidth="1.2" />
          <path d="M6 15L17 4l2.5 2.5-9 9H6z" fill="#d97706" />
        </svg>
      );
    case 'American Football':
      return (
        <svg viewBox="0 0 24 24" className={className}>
          <ellipse cx="12" cy="12" rx="10" ry="6" transform="rotate(-35 12 12)" fill="#92400e" stroke="#451a03" strokeWidth="1" />
          <path d="M8.5 14.5l7-5M10 11.2l1.8 2.2M12 9.8l1.8 2.2M14 8.4l1.8 2.2" stroke="#ffffff" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
      );
    case 'Cricket':
      return (
        <svg viewBox="0 0 24 24" className={className}>
          <circle cx="12" cy="12" r="9.5" fill="#b91c1c" stroke="#7f1d1d" strokeWidth="1" />
          <path d="M6.5 6.5c4 4 7 7 11 11" stroke="#fecaca" strokeWidth="1.5" strokeDasharray="2 1.5" />
        </svg>
      );
    case 'MMA / Boxing':
      return (
        <svg viewBox="0 0 24 24" className={className}>
          <rect x="5" y="4" width="14" height="12" rx="5" fill="#dc2626" stroke="#7f1d1d" strokeWidth="1" />
          <rect x="7" y="15" width="10" height="5" rx="1.5" fill="#1e293b" />
          <path d="M5 10h7" stroke="#7f1d1d" strokeWidth="1.4" />
        </svg>
      );
    case 'Volleyball':
      return (
        <svg viewBox="0 0 24 24" className={className}>
          <circle cx="12" cy="12" r="10" fill="#fef08a" stroke="#eab308" strokeWidth="1" />
          <path d="M12 2a10 10 0 018.6 15L12 12V2z" fill="#3b82f6" />
          <path d="M12 12L3.4 17A10 10 0 0112 2v10z" fill="#f8fafc" />
          <path d="M12 2v10l8.6 5M12 12l-8.6 5" stroke="#1e3a8a" strokeWidth="1.2" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 24 24" className={className}>
          <circle cx="12" cy="12" r="9" fill="#334155" />
          <circle cx="12" cy="12" r="4" fill="#f8fafc" />
        </svg>
      );
  }
};

/* Official Club & Competitor Crests */
const REAL_CLUB_LOGOS = {
  Chelsea: { url: 'https://a.espncdn.com/i/teamlogos/soccer/500/363.png', bg: '#034694', code: 'CFC' },
  'Real Madrid': { url: 'https://a.espncdn.com/i/teamlogos/soccer/500/86.png', bg: '#ffffff', code: 'RMA' },
  Liverpool: { url: 'https://a.espncdn.com/i/teamlogos/soccer/500/364.png', bg: '#c8102e', code: 'LFC' },
  'Paris Saint-Germain': { url: 'https://a.espncdn.com/i/teamlogos/soccer/500/160.png', bg: '#004170', code: 'PSG' },
  Arsenal: { url: 'https://a.espncdn.com/i/teamlogos/soccer/500/359.png', bg: '#ef0107', code: 'ARS' },
  'Manchester City': { url: 'https://a.espncdn.com/i/teamlogos/soccer/500/382.png', bg: '#6cabdd', code: 'MCI' },
  'Manchester United': { url: 'https://a.espncdn.com/i/teamlogos/soccer/500/360.png', bg: '#da291c', code: 'MUN' },
  'Tottenham Hotspur': { url: 'https://a.espncdn.com/i/teamlogos/soccer/500/367.png', bg: '#132257', code: 'TOT' },
  'FC Barcelona': { url: 'https://a.espncdn.com/i/teamlogos/soccer/500/83.png', bg: '#a50044', code: 'FCB' },
  'Atletico Madrid': { url: 'https://a.espncdn.com/i/teamlogos/soccer/500/1068.png', bg: '#cb3524', code: 'ATM' },
  'Bayern Munich': { url: 'https://a.espncdn.com/i/teamlogos/soccer/500/132.png', bg: '#dc052d', code: 'BAY' },
  'Borussia Dortmund': { url: 'https://a.espncdn.com/i/teamlogos/soccer/500/124.png', bg: '#fde100', code: 'BVB' },
  'LA Lakers': { url: 'https://a.espncdn.com/i/teamlogos/nba/500/lal.png', bg: '#552583', code: 'LAL' },
  'Boston Celtics': { url: 'https://a.espncdn.com/i/teamlogos/nba/500/bos.png', bg: '#007a33', code: 'BOS' },
  'Golden State Warriors': { url: 'https://a.espncdn.com/i/teamlogos/nba/500/gs.png', bg: '#1d428a', code: 'GSW' },
  'Denver Nuggets': { url: 'https://a.espncdn.com/i/teamlogos/nba/500/den.png', bg: '#0e2240', code: 'DEN' },
  'Milwaukee Bucks': { url: 'https://a.espncdn.com/i/teamlogos/nba/500/mil.png', bg: '#00471b', code: 'MIL' },
  'Phoenix Suns': { url: 'https://a.espncdn.com/i/teamlogos/nba/500/phx.png', bg: '#1d1160', code: 'PHX' },
  'Miami Heat': { url: 'https://a.espncdn.com/i/teamlogos/nba/500/mia.png', bg: '#98002e', code: 'MIA' },
  'Dallas Mavericks': { url: 'https://a.espncdn.com/i/teamlogos/nba/500/dal.png', bg: '#00538c', code: 'DAL' },
  'Toronto Maple Leafs': { url: 'https://a.espncdn.com/i/teamlogos/nhl/500/tor.png', bg: '#00205b', code: 'TOR' },
  'New York Rangers': { url: 'https://a.espncdn.com/i/teamlogos/nhl/500/nyr.png', bg: '#0038a8', code: 'NYR' },
  'Edmonton Oilers': { url: 'https://a.espncdn.com/i/teamlogos/nhl/500/edm.png', bg: '#041e42', code: 'EDM' },
  'Colorado Avalanche': { url: 'https://a.espncdn.com/i/teamlogos/nhl/500/col.png', bg: '#6f263d', code: 'COL' },
  'Kansas City Chiefs': { url: 'https://a.espncdn.com/i/teamlogos/nfl/500/kc.png', bg: '#e31837', code: 'KC' },
  'San Francisco 49ers': { url: 'https://a.espncdn.com/i/teamlogos/nfl/500/sf.png', bg: '#aa0000', code: 'SF' },
  'Philadelphia Eagles': { url: 'https://a.espncdn.com/i/teamlogos/nfl/500/phi.png', bg: '#004c54', code: 'PHI' },
  'Dallas Cowboys': { url: 'https://a.espncdn.com/i/teamlogos/nfl/500/dal.png', bg: '#003594', code: 'DAL' },
  India: { url: 'https://a.espncdn.com/i/teamlogos/countries/500/ind.png', bg: '#0066b2', code: 'IND' },
  Australia: { url: 'https://a.espncdn.com/i/teamlogos/countries/500/aus.png', bg: '#ffcd00', code: 'AUS' },
  England: { url: 'https://a.espncdn.com/i/teamlogos/countries/500/eng.png', bg: '#cf142b', code: 'ENG' },
  'South Africa': { url: 'https://a.espncdn.com/i/teamlogos/countries/500/rsa.png', bg: '#007a4d', code: 'RSA' },
  'Carlos Alcaraz': { url: 'https://a.espncdn.com/i/teamlogos/countries/500/esp.png', bg: '#aa151b', code: 'ESP' },
  'Jannik Sinner': { url: 'https://a.espncdn.com/i/teamlogos/countries/500/ita.png', bg: '#008c45', code: 'ITA' },
  'Iga Swiatek': { url: 'https://a.espncdn.com/i/teamlogos/countries/500/pol.png', bg: '#dc143c', code: 'POL' },
  'Aryna Sabalenka': { url: 'https://a.espncdn.com/i/teamlogos/countries/500/blr.png', bg: '#1e293b', code: 'SAB' },
  'Novak Djokovic': { url: 'https://a.espncdn.com/i/teamlogos/countries/500/srb.png', bg: '#c6363c', code: 'SRB' },
  'Daniil Medvedev': { url: 'https://a.espncdn.com/i/teamlogos/countries/500/rus.png', bg: '#1d4ed8', code: 'MED' },
  'K. Duda': { url: 'https://a.espncdn.com/i/teamlogos/countries/500/ger.png', bg: '#111827', code: 'GER' },
  'T. Moregard': { url: 'https://a.espncdn.com/i/teamlogos/countries/500/swe.png', bg: '#006aa7', code: 'SWE' },
  'Fan Zhendong': { url: 'https://a.espncdn.com/i/teamlogos/countries/500/chn.png', bg: '#de2910', code: 'CHN' },
  'Wang Chuqin': { url: 'https://a.espncdn.com/i/teamlogos/countries/500/chn.png', bg: '#de2910', code: 'CHN' },
  'Natus Vincere': { bg: '#ca8a04', code: 'NAVI' },
  'FaZe Clan': { bg: '#dc2626', code: 'FAZE' },
  T1: { bg: '#b91c1c', code: 'T1' },
  'G2 Esports': { bg: '#1e293b', code: 'G2' },
  'Islam Makhachev': { bg: '#065f46', code: 'MAK' },
  'Ilia Topuria': { bg: '#991b1b', code: 'TOP' },
  'Oleksandr Usyk': { url: 'https://a.espncdn.com/i/teamlogos/countries/500/ukr.png', bg: '#0057b7', code: 'UKR' },
  'Anthony Joshua': { url: 'https://a.espncdn.com/i/teamlogos/countries/500/gbr.png', bg: '#012169', code: 'GBR' },
  'Trentino Volley': { bg: '#1d4ed8', code: 'TRE' },
  'ZAKSA Kedzierzyn': { bg: '#b91c1c', code: 'ZAK' },
  'Sir Safety Perugia': { bg: '#111827', code: 'PER' },
  'Lube Civitanova': { bg: '#dc2626', code: 'LUB' },
};

const ClubLogo = ({ name }) => {
  const [imgFailed, setImgFailed] = useState(false);
  const cfg = REAL_CLUB_LOGOS[name] || { bg: '#1e293b', code: name.slice(0, 3).toUpperCase() };

  if (cfg.url && !imgFailed) {
    return (
      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/[0.08] p-0.5" title={name}>
        <img src={cfg.url} alt={name} onError={() => setImgFailed(true)} className="h-5 w-5 object-contain" />
      </div>
    );
  }

  return (
    <span
      style={{ backgroundColor: cfg.bg }}
      className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-white/15 text-[8px] font-bold text-white"
      title={name}
    >
      {cfg.code}
    </span>
  );
};

const SPORT_LIST = [
  'All Sports', 'Football', 'Basketball', 'Tennis', 'Table Tennis',
  'Esports', 'Ice Hockey', 'American Football', 'Cricket', 'MMA / Boxing', 'Volleyball',
];

const useBetSlipStore = create(
  persist(
    (set, get) => ({
      selections: [],
      stake: '',
      acceptOddsChanges: true,
      isSubmitting: false,
      error: null,
      lastReceipt: null,

      setSelections: (selections) => set({ selections, error: null, lastReceipt: null }),

      toggleSelection: (selection) =>
        set((state) => {
          const existsExact = state.selections.some((s) => s.outcomeId === selection.outcomeId);
          if (existsExact) {
            return { selections: state.selections.filter((s) => s.outcomeId !== selection.outcomeId), error: null };
          }
          const filtered = state.selections.filter((s) => s.eventId !== selection.eventId);
          return { selections: [...filtered, selection], error: null, lastReceipt: null };
        }),

      removeSelection: (outcomeId) =>
        set((state) => ({ selections: state.selections.filter((s) => s.outcomeId !== outcomeId), error: null })),

      clearSlip: () => set({ selections: [], stake: '', error: null, lastReceipt: null }),

      setStake: (value) => {
        if (value === '' || /^\d+(\.\d{0,2})?$/.test(value)) set({ stake: value, error: null });
      },

      placeBet: async (onSuccess) => {
        const { selections, stake, acceptOddsChanges } = get();
        const numericStake = parseFloat(stake);
        if (!selections.length) return set({ error: 'Select at least one market.' });
        if (isNaN(numericStake) || numericStake <= 0) return set({ error: 'Enter a valid stake amount.' });

        const stakeMinorUnits = Math.round(numericStake * 100);
        set({ isSubmitting: true, error: null });

        try {
          const res = await fetch(`${API_BASE}/api/bets`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...authHeaders() },
            body: JSON.stringify({
              stake: stakeMinorUnits,
              selections: selections.map((s) => ({
                outcomeId: s.outcomeId,
                expectedOdds: acceptOddsChanges ? 1.0 : s.odds,
              })),
            }),
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || 'Bet placement failed');

          set({ selections: [], stake: '', isSubmitting: false, lastReceipt: data });
          if (onSuccess) onSuccess(Number(data.newBalance));
        } catch (err) {
          set({ isSubmitting: false, error: err.message });
        }
      },
    }),
    { name: 'naijabet-v7-slip', partialize: (s) => ({ selections: s.selections, stake: s.stake }) }
  )
);

export default function App() {
  const [events, setEvents] = useState([]);
  const [myBets, setMyBets] = useState([]);
  const [balanceKobo, setBalanceKobo] = useState(0);
  const [activeTab, setActiveTab] = useState('Highlights');
  const [selectedSport, setSelectedSport] = useState('All Sports');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedMatchIds, setExpandedMatchIds] = useState({});
  const [bookingInput, setBookingInput] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [mobileSlipOpen, setMobileSlipOpen] = useState(false);
  const [token, setToken] = useState(() => localStorage.getItem(AUTH_KEY) || '');
  const [email, setEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authMode, setAuthMode] = useState('login');
  const [authOpen, setAuthOpen] = useState(false);
  const [welcomeOpen, setWelcomeOpen] = useState(() => !sessionStorage.getItem('naijabet-welcomed') && !new URLSearchParams(window.location.search).has('reference'));
  const [authError, setAuthError] = useState('');
  const [depositOpen, setDepositOpen] = useState(false);
  const [depositAmount, setDepositAmount] = useState('50');
  const [depositError, setDepositError] = useState('');
  const [depositBusy, setDepositBusy] = useState(false);
  const [paymentNotice, setPaymentNotice] = useState('');

  const dismissWelcome = () => {
    sessionStorage.setItem('naijabet-welcomed', 'true');
    setWelcomeOpen(false);
  };

  const {
    selections, stake, isSubmitting, error, lastReceipt,
    setSelections, toggleSelection, removeSelection, clearSlip, setStake, placeBet,
  } = useBetSlipStore();

  const loadData = (session = token) => {
    fetch(`${API_BASE}/api/events`).then((r) => r.json()).then(setEvents).catch(() => {});
    if (!session) { setBalanceKobo(0); setMyBets([]); return; }
    const headers = { Authorization: `Bearer ${session}` };
    fetch(`${API_BASE}/api/wallet`, { headers }).then((r) => r.ok ? r.json() : Promise.reject()).then((w) => setBalanceKobo(Number(w.balanceKobo ?? w.balance))).catch(() => {});
    fetch(`${API_BASE}/api/bets`, { headers }).then((r) => r.ok ? r.json() : Promise.reject()).then(setMyBets).catch(() => {});
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const reference = new URLSearchParams(window.location.search).get('reference');
    if (!token || !reference) return undefined;
    let attempts = 0;
    const check = async () => {
      attempts += 1;
      try {
        const response = await fetch(`${API_BASE}/api/wallet/deposits/${encodeURIComponent(reference)}`, { headers: { Authorization: `Bearer ${token}` } });
        const deposit = await response.json();
        if (deposit.status === 'SUCCESS') { setPaymentNotice('Deposit confirmed. Your wallet has been updated.'); loadData(token); window.history.replaceState({}, '', window.location.pathname); clearInterval(timer); }
        else if (deposit.status === 'FAILED') { setPaymentNotice('The deposit was not confirmed. If you were charged, contact support with your payment reference.'); clearInterval(timer); }
      } catch { /* Retry briefly while the payment provider sends its confirmation. */ }
      if (attempts >= 20) {
        setPaymentNotice('Your payment is still being confirmed. Reopen the app or sign in again shortly to refresh your wallet.');
        clearInterval(timer);
      }
    };
    const timer = setInterval(check, 2500);
    check();
    return () => clearInterval(timer);
  }, [token]);

  const handleAuth = async (event) => {
    event.preventDefault(); 
    setAuthError('');
    
    try {
      const response = await fetch(`${API_BASE}/api/auth/${authMode === 'register' ? 'register' : 'login'}`, {
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ email, password: authPassword }),
      });

      // Check if the response is actually JSON before parsing
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const errorText = await response.text();
        console.error("Non-JSON server response:", errorText);
        throw new Error("Server returned an invalid response format. Check your API route or backend server.");
      }

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Could not sign in.');
      
      localStorage.setItem(AUTH_KEY, data.token); 
      setToken(data.token); 
      setBalanceKobo(Number(data.balance || 0));
      setAuthOpen(false); 
      setAuthPassword(''); 
      loadData(data.token);
      
    } catch (err) { 
      setAuthError(err.message); 
    }
  };

  const handleDeposit = async (event) => {
    event.preventDefault(); setDepositError('');
    const amount = Number(depositAmount);
    if (!Number.isSafeInteger(amount) || amount < 50) { setDepositError('Minimum deposit is ₦50.'); return; }
    if (!token) { setDepositOpen(false); setAuthMode('login'); setAuthOpen(true); return; }
    setDepositBusy(true);
    try {
      const response = await fetch(`${API_BASE}/api/wallet/deposits`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', ...authHeaders() }, body: JSON.stringify({ amount }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Could not start deposit.');
      window.location.assign(data.checkoutUrl);
    } catch (err) { setDepositError(err.message); setDepositBusy(false); }
  };

  const handleGenerateCode = async () => {
    const res = await fetch(`${API_BASE}/api/booking-codes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify({ selections }),
    });
    const data = await res.json();
    if (data.code) setGeneratedCode(data.code);
  };

  const handleLoadCode = async () => {
    if (!bookingInput.trim()) return;
    const res = await fetch(`${API_BASE}/api/booking-codes/${bookingInput.trim()}`, { headers: authHeaders() });
    const data = await res.json();
    if (res.ok && data.selections) {
      setSelections(data.selections);
      setBookingInput('');
    }
  };

  const toggleExpandMarkets = (id) => {
    setExpandedMatchIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const liveCount = useMemo(() => events.filter((e) => e.isLive === 1).length, [events]);
  const welcomeMatches = useMemo(() => {
    const football = events.filter((event) => event.sport === 'Football').slice(0, 2);
    return football.length ? football : [
      { id: 'welcome-chelsea-bayern', homeTeam: 'Chelsea', awayTeam: 'Bayern', league: 'Top match', status: 'LIVE', isLive: 1, outcomes: [{ selectionName: '1', odds: 3.56 }, { selectionName: 'X', odds: 3.56 }, { selectionName: '2', odds: 3.56 }] },
      { id: 'welcome-madrid-city', homeTeam: 'Real Madrid', awayTeam: 'Man City', league: 'Top match', status: 'LIVE', isLive: 1, outcomes: [{ selectionName: '1', odds: 2.1 }, { selectionName: 'X', odds: 3.4 }, { selectionName: '2', odds: 2.8 }] },
    ];
  }, [events]);

  const filteredEvents = useMemo(() => {
    return events.filter((e) => {
      if (activeTab === 'In-Play' && e.isLive !== 1) return false;
      if (selectedSport !== 'All Sports' && e.sport !== selectedSport) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return `${e.homeTeam} ${e.awayTeam} ${e.league} ${e.sport}`.toLowerCase().includes(q);
      }
      return true;
    });
  }, [events, activeTab, selectedSport, searchQuery]);

  const groupedByLeague = useMemo(() => {
    const map = new Map();
    filteredEvents.forEach((ev) => {
      const key = `${ev.sport}::${ev.league}`;
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(ev);
    });
    return Array.from(map.entries());
  }, [filteredEvents]);

  const { rawOdds, bonusPct, bonusAmount, finalPayout } = useMemo(() => {
    if (!selections.length) return { rawOdds: 0, bonusPct: 0, bonusAmount: 0, finalPayout: 0 };
    const prod = selections.reduce((acc, item) => acc * Number(item.odds), 1);
    const roundedOdds = Math.round(prod * 1000) / 1000;
    const stakeNum = parseFloat(stake) || 0;
    const baseWin = stakeNum * roundedOdds;
    const pct = selections.length >= 3 ? Math.min(selections.length * 5, 100) : 0;
    const bonus = (baseWin * pct) / 100;
    return {
      rawOdds: roundedOdds,
      bonusPct: pct,
      bonusAmount: bonus,
      finalPayout: baseWin + bonus,
    };
  }, [selections, stake]);

  const renderBetslipContent = (isMobile = false) => (
    <>
      <div className="flex items-center justify-between border-b border-white/[0.08] px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold tracking-wide text-white">Betslip</span>
          <span className="rounded-full bg-white/10 px-2 py-0.2 text-[11px] font-semibold text-white tabular-nums">
            {selections.length}
          </span>
        </div>
        <div className="flex items-center gap-3 text-xs">
          {selections.length > 0 && (
            <>
              <button onClick={handleGenerateCode} className="font-medium text-slate-300 hover:text-white">
                Book Code
              </button>
              <button onClick={clearSlip} className="text-slate-400 hover:text-rose-400">
                Clear
              </button>
            </>
          )}
          {isMobile && (
            <button
              onClick={() => setMobileSlipOpen(false)}
              className="rounded-md bg-white/10 px-2.5 py-1 text-xs font-semibold text-white"
            >
              Close
            </button>
          )}
        </div>
      </div>

      {generatedCode && (
        <div className="mx-3 mt-2.5 rounded-md border border-white/15 bg-white/[0.05] px-3 py-2 text-center text-xs text-slate-300">
          Booking Code: <span className="font-bold text-white">{generatedCode}</span>
        </div>
      )}

      {lastReceipt && (
        <div className="mx-3 mt-2.5 rounded-md border border-white/15 bg-[#161c28] p-3 text-xs">
          <div className="font-semibold text-white">✓ Bet Placed</div>
          <div className="mt-0.5 text-[11px] text-slate-300 tabular-nums">
            Potential Payout: <strong className="text-white">NGN {(Number(lastReceipt.potentialPayout) / 100).toLocaleString()}</strong>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {selections.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center px-4 text-center space-y-3 py-8">
            <p className="text-xs text-slate-500">Select odds from any match to add to your slip, or load a booking code.</p>
            <div className="w-full space-y-2">
              <input
                type="text"
                placeholder="Booking code (e.g. NB-7F2A1)"
                value={bookingInput}
                onChange={(e) => setBookingInput(e.target.value)}
                className="w-full rounded-md border border-white/[0.08] bg-[#0b0e14] px-3 py-2.5 text-center text-xs text-white placeholder-slate-600 focus:border-slate-500 focus:outline-none"
              />
              <button
                onClick={handleLoadCode}
                className="w-full rounded-md border border-white/[0.08] bg-[#171d29] py-2 text-xs font-medium text-slate-200 hover:bg-[#1f2736]"
              >
                Load Slip
              </button>
            </div>
          </div>
        ) : (
          selections.map((item) => (
            <div key={item.outcomeId} className="rounded-md border border-white/[0.08] bg-[#141924] p-3 space-y-1">
              <div className="flex items-start justify-between gap-2">
                <span className="text-[11px] text-slate-400 truncate">{item.matchName}</span>
                <button onClick={() => removeSelection(item.outcomeId)} className="text-xs text-slate-500 hover:text-rose-400 px-1">
                  ✕
                </button>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-white">
                  {item.selectionName} <span className="text-[10px] font-normal text-slate-500">({item.marketName})</span>
                </span>
                <span className="font-semibold text-white tabular-nums">
                  {Number(item.odds).toFixed(2)}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="border-t border-white/[0.08] bg-[#0b0e14] p-3.5 space-y-2.5">
        {selections.length > 0 && (
          <>
            <div className="grid grid-cols-4 gap-1.5">
              {[100, 500, 1000, 5000].map((amt) => (
                <button
                  key={amt}
                  onClick={() => setStake(String((parseFloat(stake) || 0) + amt))}
                  className="rounded border border-white/[0.08] bg-[#141924] py-1.5 text-xs text-slate-300 hover:bg-[#1c2333]"
                >
                  +{amt}
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between rounded-md border border-white/[0.12] bg-[#141924] px-3 py-2">
              <span className="text-xs text-slate-400">Stake (NGN)</span>
              <input
                type="text"
                inputMode="decimal"
                placeholder="0.00"
                value={stake}
                onChange={(e) => setStake(e.target.value)}
                className="w-28 bg-transparent text-right text-sm font-bold text-white focus:outline-none"
              />
            </div>
          </>
        )}

        <div className="space-y-1 text-xs tabular-nums">
          <div className="flex justify-between text-slate-400">
            <span>Total Odds</span>
            <span className="font-medium text-white">{rawOdds.toFixed(2)}</span>
          </div>
          {bonusPct > 0 && (
            <div className="flex justify-between text-amber-300">
              <span>Multi Bonus ({bonusPct}%)</span>
              <span>+NGN {bonusAmount.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between border-t border-white/[0.08] pt-1.5 text-xs font-bold">
            <span className="text-slate-300">Potential Payout</span>
            <span className="text-white">NGN {finalPayout.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
          </div>
        </div>

        {error && (
          <div className="rounded border border-rose-500/30 bg-rose-500/10 px-2.5 py-1.5 text-[11px] text-rose-300">
            {error}
          </div>
        )}

        <button
          disabled={isSubmitting || !selections.length || !stake || parseFloat(stake) <= 0}
          onClick={() => placeBet(() => loadData())}
          className="w-full rounded-md bg-emerald-600 py-3 text-xs font-bold text-white hover:bg-emerald-500 disabled:opacity-40 transition"
        >
          {isSubmitting ? 'Placing Bet...' : 'Place Bet'}
        </button>
      </div>
    </>
  );

  return (
      <div className="bet-app flex h-dvh flex-col overflow-hidden text-slate-200 antialiased">
      {/* Top Bar */}
      <header className="sports-topbar flex h-13 shrink-0 items-center justify-between border-b border-white/[0.08] bg-[#11151e] px-3.5 sm:px-4">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="brand-mark flex h-8 w-8 items-center justify-center rounded-lg text-xs font-extrabold tracking-tight text-white">
              NB
            </div>
            <span className="text-sm font-extrabold tracking-tight text-white">
              NaijaBet<span className="text-slate-400 font-semibold">.ng</span>
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-1 text-xs font-medium">
            {['Highlights', 'In-Play', 'My Bets'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`relative px-3.5 py-3.5 transition ${
                  activeTab === tab ? 'text-white font-semibold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <span className="flex items-center gap-1.5">
                  {tab}
                  {tab === 'In-Play' && (
                    <span className="rounded bg-rose-500/20 px-1.5 py-0.2 text-[10px] font-semibold text-rose-300 tabular-nums">
                      {liveCount}
                    </span>
                  )}
                  {tab === 'My Bets' && myBets.length > 0 && (
                    <span className="rounded bg-white/10 px-1.5 py-0.2 text-[10px] text-slate-300 tabular-nums">
                      {myBets.length}
                    </span>
                  )}
                </span>
                {activeTab === tab && (
                  <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-white rounded-full" />
                )}
              </button>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <div className="wallet-pill flex items-center rounded-lg border border-white/[0.1] text-xs">
            <span className="px-2.5 sm:px-3 py-1.5 font-semibold text-white tabular-nums">
              NGN {(balanceKobo / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
            <button
              onClick={() => { setDepositError(''); setDepositOpen(true); }}
              className="deposit-button rounded-r-lg px-3.5 py-2 font-bold text-white transition"
            >
              Deposit
            </button>
          </div>
          {token ? (
            <button onClick={() => { localStorage.removeItem(AUTH_KEY); setToken(''); setBalanceKobo(0); setMyBets([]); }} className="hidden sm:inline-flex rounded-lg border border-white/10 px-3 py-2 text-xs font-semibold text-slate-300 hover:bg-white/5">Sign out</button>
          ) : (
            <button onClick={() => { setAuthMode('login'); setAuthOpen(true); }} className="rounded-lg border border-white/10 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-white/5">Sign in</button>
          )}
        </div>
      </header>

      {/* MOBILE & TABLET HORIZONTAL SPORT BAR */}
      <div className="flex lg:hidden shrink-0 items-center gap-1.5 overflow-x-auto border-b border-white/[0.08] bg-[#0e121a] px-3 py-2">
        {SPORT_LIST.map((sp) => {
          const isSelected = selectedSport === sp && activeTab !== 'My Bets';
          return (
            <button
              key={sp}
              onClick={() => {
                setSelectedSport(sp);
                if (activeTab === 'My Bets') setActiveTab('Highlights');
              }}
              className={`flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs transition ${
                isSelected
                  ? 'border-white/25 bg-white/10 font-semibold text-white'
                  : 'border-white/[0.06] bg-[#141924] text-slate-400'
              }`}
            >
              <SportLogo name={sp} className="h-3.5 w-3.5" />
              <span>{sp}</span>
            </button>
          );
        })}
      </div>

      {/* Main 3-Column Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* DESKTOP LEFT SIDEBAR */}
        <aside className="sports-sidebar hidden lg:flex w-44 shrink-0 flex-col border-r border-white/[0.08] bg-[#0e121a]">
          <div className="p-2.5 border-b border-white/[0.06]">
            <input
              type="text"
              placeholder="Search teams or leagues..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-md border border-white/[0.08] bg-[#0b0e14] px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:border-slate-500 focus:outline-none"
            />
          </div>

          <div className="flex-1 overflow-y-auto py-2 px-1.5 space-y-0.5">
            <div className="px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
              Sports
            </div>
            {SPORT_LIST.map((sp) => {
              const count = sp === 'All Sports' ? events.length : events.filter((e) => e.sport === sp).length;
              const isSelected = selectedSport === sp && activeTab !== 'My Bets';
              return (
                <button
                  key={sp}
                  onClick={() => {
                    setSelectedSport(sp);
                    if (activeTab === 'My Bets') setActiveTab('Highlights');
                  }}
                  className={`flex w-full items-center justify-between rounded-md px-2.5 py-2 text-xs transition ${
                    isSelected
                      ? 'bg-white/[0.08] font-semibold text-white'
                      : 'text-slate-400 hover:bg-white/[0.04] hover:text-slate-200'
                  }`}
                >
                  <span className="flex items-center gap-2.5 truncate">
                    <SportLogo name={sp} className="h-4 w-4 shrink-0" />
                    <span className="truncate">{sp}</span>
                  </span>
                  <span className="text-[11px] text-slate-500 tabular-nums">{count}</span>
                </button>
              );
            })}
          </div>
        </aside>

        {/* CENTER WORKSPACE */}
        <main className="sports-main flex-1 overflow-y-auto p-3 sm:p-4 pb-20 lg:pb-4 space-y-3.5">
          <section className="sports-hero relative overflow-hidden rounded-2xl border border-emerald-400/20 px-5 py-5 sm:px-7 sm:py-6">
            <div className="relative z-10 max-w-xl">
              <p className="mb-2 flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-[0.22em] text-emerald-300"><span className="live-dot h-2 w-2 rounded-full bg-emerald-400" /> NaijaBet • Sportsbook</p>
              <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl">Make every match <span className="text-emerald-300">count.</span></h1>
              <p className="mt-2 max-w-lg text-xs leading-5 text-slate-300 sm:text-sm">Live odds, big fixtures and your bet slip in one place. Add funds securely from ₦50.</p>
              <button onClick={() => token ? setDepositOpen(true) : (setAuthMode('register'), setAuthOpen(true))} className="mt-4 rounded-lg bg-emerald-400 px-4 py-2.5 text-xs font-extrabold text-[#062015] transition hover:bg-emerald-300">{token ? 'Fund your wallet' : 'Create your account'}</button>
            </div>
            <div aria-hidden="true" className="hero-ball absolute -right-5 -top-16 h-64 w-64 rounded-full border-[24px] border-white/[0.04] sm:right-12 sm:h-80 sm:w-80" />
            <div aria-hidden="true" className="absolute -right-1 bottom-0 h-32 w-64 bg-gradient-to-t from-emerald-400/10 to-transparent" />
          </section>
          {paymentNotice && <button onClick={() => setPaymentNotice('')} className="w-full rounded-lg border border-emerald-400/30 bg-emerald-500/10 px-4 py-3 text-left text-xs text-emerald-100">{paymentNotice}<span className="float-right text-emerald-300">Dismiss ×</span></button>}
          <div className="lg:hidden">
            <input
              type="text"
              placeholder="Search clubs, players, or leagues..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-md border border-white/[0.08] bg-[#11151e] px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-slate-500 focus:outline-none"
            />
          </div>

          <div className="promo-card flex flex-wrap items-center justify-between gap-2 rounded-xl border px-3.5 py-2.5 sm:px-4 sm:py-3">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="rounded bg-amber-500/15 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-300">
                  Multi Bonus
                </span>
                <span className="text-xs font-semibold text-white">Up to 100% Extra Payout on 3+ Legs</span>
              </div>
              <p className="hidden sm:block text-[11px] text-slate-400">
                Combine Football, NBA, Tennis & Esports legs on one ticket for automatic accumulator boosts.
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
              <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
              <span>Markets Open</span>
            </div>
          </div>

          {activeTab === 'My Bets' ? (
            <div className="space-y-2.5">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Bet History ({myBets.length})
              </h2>
              {myBets.length === 0 ? (
                <div className="rounded-lg border border-white/[0.08] bg-[#11151e] py-12 text-center text-xs text-slate-500">
                  No bets placed yet. Select odds from the board to build a ticket.
                </div>
              ) : (
                myBets.map((bet) => (
                  <div key={bet.id} className="rounded-lg border border-white/[0.08] bg-[#11151e] p-3.5 space-y-2.5">
                    <div className="flex items-center justify-between border-b border-white/[0.06] pb-2 text-[11px]">
                      <span className="text-slate-400">Ref #{bet.id.slice(0, 8).toUpperCase()}</span>
                      <span className="rounded bg-amber-500/15 px-2 py-0.5 font-semibold text-amber-300">{bet.status}</span>
                    </div>
                    <div className="space-y-1.5">
                      {bet.legs.map((leg, idx) => (
                        <div key={idx} className="flex items-center justify-between text-xs gap-2">
                          <span className="text-slate-300 truncate">
                            {leg.homeTeam} vs {leg.awayTeam} <span className="text-slate-500">•</span>{' '}
                            <span className="font-semibold text-white">{leg.selectionName}</span>
                          </span>
                          <span className="font-semibold text-white tabular-nums shrink-0">
                            {Number(leg.lockedOdds).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center justify-between border-t border-white/[0.06] pt-2 text-xs">
                      <span className="text-slate-400">Stake: NGN {(bet.stake / 100).toLocaleString()}</span>
                      <span className="font-semibold text-white tabular-nums">
                        Est. Return: NGN {(bet.potentialPayout / 100).toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            <div className="space-y-3.5">
              {groupedByLeague.map(([groupKey, leagueEvents]) => {
                const [sportName, leagueName] = groupKey.split('::');
                return (
                  <div key={groupKey} className="league-board overflow-hidden rounded-lg border border-white/[0.08] bg-[#11151e]">
                    <div className="league-heading flex items-center justify-between border-b border-white/[0.08] bg-[#161b26] px-3 sm:px-3.5 py-2 text-xs font-semibold text-slate-200">
                      <div className="flex items-center gap-2 truncate">
                        <SportLogo name={sportName} className="h-4 w-4 shrink-0" />
                        <span className="text-slate-400">{sportName}</span>
                        <span className="text-slate-600">/</span>
                        <span className="text-white truncate">{leagueName}</span>
                      </div>
                      <span className="hidden sm:inline text-[11px] font-normal text-slate-400">Match Odds</span>
                    </div>

                    <div className="divide-y divide-white/[0.06]">
                      {leagueEvents.map((ev) => {
                        const primaryOutcomes = ev.outcomes.filter((o) => ['1X2', 'Moneyline', 'Winner', 'Bout Winner'].includes(o.marketName));
                        const extraOutcomes = ev.outcomes.filter((o) => !['1X2', 'Moneyline', 'Winner', 'Bout Winner'].includes(o.marketName));
                        const isExpanded = !!expandedMatchIds[ev.id];

                        return (
                          <div key={ev.id} className="match-row transition hover:bg-white/[0.02]">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 px-3 sm:px-3.5 py-2.5">
                              <div className="flex items-center justify-between sm:justify-start gap-3 flex-1 min-w-0">
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <div className="flex w-14 shrink-0 flex-col items-start gap-0.5 text-[11px] tabular-nums">
                                    <div className="flex items-center gap-1">
                                      <SportLogo name={ev.sport} className="h-3.5 w-3.5" />
                                      {ev.isLive === 1 ? (
                                        <span className="font-semibold text-rose-400">{ev.matchClock || 'LIVE'}</span>
                                      ) : (
                                        <span className="text-slate-400">
                                          {new Date(ev.kickoffTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                      )}
                                    </div>
                                    <span className="text-[10px] text-slate-500 truncate max-w-full">{ev.sport}</span>
                                  </div>

                                  <div className="space-y-1.5 text-xs min-w-0">
                                    <div className="flex items-center gap-2">
                                      <ClubLogo name={ev.homeTeam} />
                                      <span className="font-medium text-slate-100 truncate">{ev.homeTeam}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <ClubLogo name={ev.awayTeam} />
                                      <span className="font-medium text-slate-100 truncate">{ev.awayTeam}</span>
                                    </div>
                                  </div>
                                </div>

                                {ev.isLive === 1 && (
                                  <div className="flex flex-col items-end justify-center gap-1.5 text-xs font-bold text-amber-400 tabular-nums pl-2">
                                    <span>{ev.homeScore}</span>
                                    <span>{ev.awayScore}</span>
                                  </div>
                                )}
                              </div>

                              <div className="flex items-center gap-1.5 w-full sm:w-auto">
                                {primaryOutcomes.map((out) => {
                                  const active = selections.some((s) => s.outcomeId === out.id);
                                  return (
                                    <button
                                      key={out.id}
                                      onClick={() =>
                                        toggleSelection({
                                          eventId: ev.id,
                                          matchName: `${ev.homeTeam} vs ${ev.awayTeam}`,
                                          outcomeId: out.id,
                                          marketName: out.marketName,
                                          selectionName: out.selectionName,
                                          odds: out.odds,
                                        })
                                      }
                                      className={`odds-button flex flex-1 sm:flex-none sm:w-16 flex-col items-center justify-center rounded-md border py-1.5 transition tabular-nums ${
                                        active
                                          ? 'border-emerald-500 bg-emerald-600 text-white font-bold shadow-sm'
                                          : 'border-white/[0.08] bg-[#181e2a] text-white hover:border-white/25 hover:bg-[#1f2736]'
                                      }`}
                                    >
                                      <span className={`text-[10px] ${active ? 'text-emerald-100' : 'text-slate-400'}`}>
                                        {out.selectionName}
                                      </span>
                                      <span className="text-xs font-semibold">
                                        {Number(out.odds).toFixed(2)}
                                      </span>
                                    </button>
                                  );
                                })}

                                <button
                                  onClick={() => toggleExpandMarkets(ev.id)}
                                  disabled={!extraOutcomes.length}
                                  className={`flex h-10 w-10 sm:w-9 shrink-0 items-center justify-center rounded-md border text-[11px] transition ${
                                    extraOutcomes.length
                                      ? 'border-white/[0.08] bg-[#161b26] text-slate-400 hover:text-white'
                                      : 'border-transparent text-slate-600 cursor-default'
                                  }`}
                                >
                                  {extraOutcomes.length ? `+${extraOutcomes.length}` : '—'}
                                </button>
                              </div>
                            </div>

                            {isExpanded && extraOutcomes.length > 0 && (
                              <div className="border-t border-white/[0.06] bg-[#0d1017] px-3 sm:px-3.5 py-2.5 flex flex-wrap items-center justify-between gap-2">
                                <span className="text-[11px] font-medium text-slate-400">
                                  {extraOutcomes[0].marketName}
                                </span>
                                <div className="flex gap-1.5 w-full sm:w-auto">
                                  {extraOutcomes.map((out) => {
                                    const active = selections.some((s) => s.outcomeId === out.id);
                                    return (
                                      <button
                                        key={out.id}
                                        onClick={() =>
                                          toggleSelection({
                                            eventId: ev.id,
                                            matchName: `${ev.homeTeam} vs ${ev.awayTeam}`,
                                            outcomeId: out.id,
                                            marketName: out.marketName,
                                            selectionName: out.selectionName,
                                            odds: out.odds,
                                          })
                                        }
                                        className={`flex flex-1 sm:flex-none items-center justify-center gap-2 rounded-md border px-3 py-1.5 text-xs transition tabular-nums ${
                                          active
                                            ? 'border-emerald-500 bg-emerald-600 text-white font-semibold'
                                            : 'border-white/[0.08] bg-[#181e2a] text-white hover:border-white/25'
                                        }`}
                                      >
                                        <span className={active ? 'text-emerald-100' : 'text-slate-400'}>{out.selectionName}</span>
                                        <span className="font-semibold">{Number(out.odds).toFixed(2)}</span>
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>

        {/* DESKTOP RIGHT BETSLIP SIDEBAR */}
        <aside className="betslip-panel hidden lg:flex w-64 shrink-0 flex-col border-l border-white/[0.08] bg-[#0e121a]">
          {renderBetslipContent(false)}
        </aside>
      </div>

      {/* MOBILE SLIDE-UP BETSLIP DRAWER */}
      {mobileSlipOpen && (
        <div className="fixed inset-0 z-50 flex flex-col bg-[#0e121a] lg:hidden">
          {renderBetslipContent(true)}
        </div>
      )}

      {/* MOBILE BOTTOM NAVIGATION BAR */}
      <nav className="flex lg:hidden shrink-0 items-center justify-around border-t border-white/[0.1] bg-[#11151e] py-2 px-2 z-40">
        <button
          onClick={() => { setActiveTab('Highlights'); setMobileSlipOpen(false); }}
          className={`flex flex-col items-center gap-0.5 px-3 py-1 text-[11px] font-medium ${
            activeTab === 'Highlights' && !mobileSlipOpen ? 'text-white font-semibold' : 'text-slate-400'
          }`}
        >
          <span>Sports</span>
        </button>

        <button
          onClick={() => { setActiveTab('In-Play'); setMobileSlipOpen(false); }}
          className={`flex flex-col items-center gap-0.5 px-3 py-1 text-[11px] font-medium ${
            activeTab === 'In-Play' && !mobileSlipOpen ? 'text-white font-semibold' : 'text-slate-400'
          }`}
        >
          <span>In-Play ({liveCount})</span>
        </button>

        <button
          onClick={() => setMobileSlipOpen(true)}
          className="relative -mt-4 flex items-center gap-1.5 rounded-full bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg"
        >
          <span>Betslip</span>
          <span className="rounded-full bg-black/25 px-1.5 py-0.2 text-[11px] tabular-nums">
            {selections.length}
          </span>
        </button>

        <button
          onClick={() => { setActiveTab('My Bets'); setMobileSlipOpen(false); }}
          className={`flex flex-col items-center gap-0.5 px-3 py-1 text-[11px] font-medium ${
            activeTab === 'My Bets' && !mobileSlipOpen ? 'text-white font-semibold' : 'text-slate-400'
          }`}
        >
          <span>My Bets ({myBets.length})</span>
        </button>
      </nav>

      {authOpen && (
        <div className="modal-backdrop fixed inset-0 z-[70] flex items-center justify-center p-4" onClick={() => setAuthOpen(false)}>
          <section role="dialog" aria-modal="true" aria-labelledby="auth-title" className="modal-card w-full max-w-md rounded-2xl border border-white/10 p-6 shadow-2xl" onClick={(event) => event.stopPropagation()}>
            <div className="mb-5 flex items-start justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-300">NaijaBet account</p><h2 id="auth-title" className="mt-1 text-xl font-extrabold text-white">{authMode === 'register' ? 'Create your account' : 'Welcome back'}</h2></div><button onClick={() => setAuthOpen(false)} className="text-xl leading-none text-slate-400 hover:text-white">×</button></div>
            <form onSubmit={handleAuth} className="space-y-3"><label className="block text-xs font-semibold text-slate-300">Email address<input autoComplete="email" type="email" required value={email} onChange={(event) => setEmail(event.target.value)} className="form-field mt-1.5 w-full rounded-lg border px-3 py-3 text-sm text-white outline-none" placeholder="you@example.com" /></label><label className="block text-xs font-semibold text-slate-300">Password<input autoComplete={authMode === 'register' ? 'new-password' : 'current-password'} type="password" minLength={8} required value={authPassword} onChange={(event) => setAuthPassword(event.target.value)} className="form-field mt-1.5 w-full rounded-lg border px-3 py-3 text-sm text-white outline-none" placeholder="At least 8 characters" /></label>{authError && <p className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-200">{authError}</p>}<button className="deposit-button w-full rounded-lg py-3 text-sm font-bold text-white">{authMode === 'register' ? 'Create account' : 'Sign in'}</button></form>
            <p className="mt-4 text-center text-xs text-slate-400">{authMode === 'register' ? 'Already have an account?' : 'New to NaijaBet?'} <button onClick={() => { setAuthError(''); setAuthMode(authMode === 'register' ? 'login' : 'register'); }} className="font-bold text-emerald-300">{authMode === 'register' ? 'Sign in' : 'Create an account'}</button></p>
          </section>
        </div>
      )}

      {depositOpen && (
        <div className="modal-backdrop fixed inset-0 z-[70] flex items-center justify-center p-4" onClick={() => !depositBusy && setDepositOpen(false)}>
          <section role="dialog" aria-modal="true" aria-labelledby="deposit-title" className="modal-card w-full max-w-md rounded-2xl border border-white/10 p-6 shadow-2xl" onClick={(event) => event.stopPropagation()}>
            <div className="mb-5 flex items-start justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-300">Wallet • NGN</p><h2 id="deposit-title" className="mt-1 text-xl font-extrabold text-white">Add funds</h2></div><button disabled={depositBusy} onClick={() => setDepositOpen(false)} className="text-xl leading-none text-slate-400 hover:text-white">×</button></div>
            <div className="mb-4 rounded-xl border border-white/10 bg-white/[0.03] p-3 text-xs text-slate-300">Available balance <strong className="float-right text-white">₦{(balanceKobo / 100).toLocaleString('en-NG', { minimumFractionDigits: 2 })}</strong></div>
            <form onSubmit={handleDeposit} className="space-y-4"><label className="block text-xs font-semibold text-slate-300">Deposit amount<input type="number" min="50" step="1" required value={depositAmount} onChange={(event) => setDepositAmount(event.target.value)} className="form-field mt-1.5 w-full rounded-lg border px-3 py-3 text-lg font-bold text-white outline-none" /><span className="mt-1 block text-[11px] text-slate-500">Minimum deposit ₦50 • Whole naira only</span></label><div className="grid grid-cols-3 gap-2">{[500, 1000, 5000].map((value) => <button type="button" key={value} onClick={() => setDepositAmount(String(value))} className="quick-amount rounded-lg border px-2 py-2 text-xs font-bold">₦{value.toLocaleString('en-NG')}</button>)}</div>{depositError && <p className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-200">{depositError}</p>}<button disabled={depositBusy} className="deposit-button w-full rounded-lg py-3 text-sm font-bold text-white disabled:opacity-60">{depositBusy ? 'Connecting to secure checkout…' : 'Continue to payment'}</button><p className="text-center text-[10px] text-slate-500">Secure checkout powered by Paystack. Funds are added after payment confirmation.</p></form>
          </section>
        </div>
      )}

      {welcomeOpen && (
        <section className="welcome-screen fixed inset-0 z-[80] overflow-y-auto px-4 py-4 sm:px-8 sm:py-6" aria-labelledby="welcome-title">
          <div className="welcome-scene mx-auto flex min-h-[calc(100dvh-2rem)] w-full max-w-6xl flex-col">
            <header className="welcome-header flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="welcome-brand-mark flex h-10 w-10 items-center justify-center rounded-xl text-sm font-black text-white">NB</span>
                <div><span className="block text-base font-black tracking-tight text-white">NaijaBet</span><span className="block text-[9px] font-bold uppercase tracking-[0.2em] text-emerald-300">Sports • Live odds</span></div>
              </div>
              <button onClick={dismissWelcome} aria-label="Skip welcome screen" className="welcome-skip rounded-full px-4 py-2 text-xs font-bold text-white">Skip <span aria-hidden="true" className="ml-1">→</span></button>
            </header>

            <div className="welcome-devices relative flex flex-1 items-center justify-center py-8 sm:py-10">
              <div className="welcome-phone welcome-phone-promo relative z-10">
                <div className="welcome-phone-screen">
                  <div className="welcome-phone-status"><span>19:27</span><span>● ● ▰</span></div>
                  <div className="welcome-promo-image">
                    <img src={welcomeImage} alt="Footballer featured in NaijaBet" />
                    <div className="welcome-image-shade absolute inset-0" aria-hidden="true" />
                    <div className="welcome-image-title absolute left-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-2xl px-4 py-3 text-2xl font-black tracking-tight text-white">Bet Naija</div>
                  </div>
                  <div className="welcome-promo-bottom flex flex-1 flex-col justify-center px-4 pb-4 pt-3 text-center">
                    <p className="text-[9px] font-extrabold uppercase tracking-[0.2em] text-emerald-300">Your game. Your moment.</p>
                    <button onClick={dismissWelcome} className="welcome-primary mt-3 rounded-full py-3 text-sm font-extrabold text-white">Get Started</button>
                    {!token && <button onClick={() => { dismissWelcome(); setAuthMode('register'); setAuthOpen(true); }} className="mt-2 text-[10px] font-semibold text-emerald-200">Create your account</button>}
                  </div>
                </div>
              </div>

              <div className="welcome-phone welcome-phone-events relative z-20">
                <div className="welcome-phone-screen welcome-events-screen">
                  <div className="welcome-phone-status"><span>19:27</span><span>● ● ▰</span></div>
                  <div className="welcome-events-header flex items-center justify-between px-4 pt-2">
                    <span className="text-sm font-black text-white">NaijaBet</span><span className="text-[10px] text-slate-400">● Live</span>
                  </div>
                  <div className="welcome-categories flex items-center justify-between gap-1 px-3 py-4">
                    {['Football', 'Basketball', 'Tennis', 'Esports'].map((sport) => <span key={sport} className="flex flex-col items-center gap-1 text-[8px] text-slate-300"><i className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/15"><SportLogo name={sport} className="h-4 w-4" /></i>{sport}</span>)}
                  </div>
                  <div className="flex items-center justify-between px-4 pb-2"><h2 className="text-sm font-extrabold text-white">Top Events</h2><span className="text-[9px] font-semibold text-emerald-300">View all →</span></div>
                  <div className="welcome-event-list flex-1 space-y-3 overflow-hidden px-3 pb-3">
                    {welcomeMatches.map((match, index) => {
                      const matchOutcomes = (match.outcomes || []).slice(0, 3);
                      return <article className={`welcome-event-card ${index === 1 ? 'welcome-event-card-alt' : ''}`} key={match.id}>
                        <div className="mb-3 flex items-center justify-between"><span className="text-[8px] font-bold uppercase tracking-[0.12em] text-emerald-100/75">{match.league || 'Top match'}</span><span className="text-[8px] font-semibold text-white/75">{match.isLive ? '● LIVE' : 'UPCOMING'}</span></div>
                        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-1 text-center text-[9px] font-bold text-white"><span>{match.homeTeam}</span><span className="text-sm font-black">{match.isLive ? (index === 0 ? '2 : 1' : '2 : 2') : 'VS'}</span><span>{match.awayTeam}</span></div>
                        <div className="mt-1 text-center text-[7px] text-white/65">{match.isLive ? '1ST HALF 39′' : 'Match winner'}</div>
                        <div className="mt-3 grid grid-cols-3 gap-1">{matchOutcomes.map((outcome, outcomeIndex) => <span className="welcome-mini-odd" key={outcome.id || outcome.selectionName || outcomeIndex}><small>{outcome.selectionName}</small><b>{Number(outcome.odds).toFixed(2)}</b></span>)}</div>
                      </article>;
                    })}
                  </div>
                  <div className="welcome-phone-nav flex items-center justify-around px-3 py-3 text-[8px] text-slate-400"><span className="active">⌂<small>Home</small></span><span>▦<small>Sports</small></span><span>▤<small>My Bets</small></span><span>◉<small>Wallet</small></span></div>
                </div>
              </div>
            </div>
            <footer className="welcome-footer pb-2 text-center text-[10px] text-slate-400">Live sports, live odds • Play responsibly • 18+</footer>
          </div>
        </section>
      )}
    </div>
  );
}
