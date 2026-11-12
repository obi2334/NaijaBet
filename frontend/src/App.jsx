import React, { useEffect, useMemo, useState } from 'react';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const USER_ID = '11111111-1111-1111-1111-111111111111';

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