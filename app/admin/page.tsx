'use client';

import { useEffect, useState } from 'react';

interface Stats {
  generatedAt: string;
  totals: { sessions: number; completed: number; paid: number };
  rates: { completion_pct: number; conversion_pct: number };
  averages: { estimated_iq: number | null };
  recent_sessions_1h: number;
  recent_sessions_24h: number;
  recent_paid: Array<{
    id: string;
    locale: string;
    paidAt: string | null;
    estimatedIq: number | null;
    emailDomain: string | null;
  }>;
  note: string;
}

const TOKEN_KEY = 'iq-admin-token';

export default function AdminPage() {
  const [token, setToken] = useState('');
  const [stats, setStats] = useState<Stats | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // Restore token from localStorage so reloads don't lose access.
  useEffect(() => {
    const saved = window.localStorage.getItem(TOKEN_KEY);
    if (saved) {
      setToken(saved);
      void load(saved);
    }
  }, []);

  async function load(t: string) {
    setBusy(true);
    setErr(null);
    try {
      const res = await fetch('/api/admin/stats', {
        headers: { 'x-admin-token': t },
        cache: 'no-store',
      });
      if (!res.ok) {
        setErr(`HTTP ${res.status} — wrong token?`);
        setStats(null);
        return;
      }
      const data = (await res.json()) as Stats;
      setStats(data);
      window.localStorage.setItem(TOKEN_KEY, t);
    } catch (e) {
      setErr(String(e));
    } finally {
      setBusy(false);
    }
  }

  // Auto-refresh every 30s if signed in.
  useEffect(() => {
    if (!stats || !token) return;
    const id = setInterval(() => void load(token), 30_000);
    return () => clearInterval(id);
  }, [stats, token]);

  if (!stats) {
    return (
      <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-5 pb-10">
        <h1 className="text-2xl font-extrabold text-gray-900">Admin</h1>
        <p className="mt-2 text-sm text-gray-600">
          Enter the <code className="rounded bg-gray-100 px-1 text-xs">ADMIN_TOKEN</code> set in Vercel env.
        </p>
        <input
          type="password"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder="admin token"
          className="mt-6 rounded-xl border border-gray-200 px-4 py-3 text-base focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
        />
        <button
          type="button"
          onClick={() => void load(token)}
          disabled={busy || !token}
          className="mt-3 rounded-xl bg-brand-600 px-4 py-3 text-base font-semibold text-white disabled:opacity-50"
        >
          {busy ? 'Loading…' : 'Open dashboard'}
        </button>
        {err && <p className="mt-3 text-xs text-red-600">{err}</p>}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-5 pb-12 pt-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-gray-900">Admin · 7iq</h1>
        <button
          type="button"
          onClick={() => {
            window.localStorage.removeItem(TOKEN_KEY);
            setToken('');
            setStats(null);
          }}
          className="text-xs text-gray-400 underline-offset-2 hover:underline"
        >
          sign out
        </button>
      </div>
      <p className="mt-1 text-xs text-gray-400">
        as of {new Date(stats.generatedAt).toLocaleString()}
      </p>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Card label="Sessions" value={stats.totals.sessions} />
        <Card label="Completed" value={stats.totals.completed} />
        <Card label="Paid" value={stats.totals.paid} />
        <Card label="Completion %" value={`${stats.rates.completion_pct}`} />
        <Card label="Conversion %" value={`${stats.rates.conversion_pct}`} accent />
        <Card label="Avg IQ" value={stats.averages.estimated_iq ?? '—'} />
        <Card label="Last 1 h" value={stats.recent_sessions_1h} />
        <Card label="Last 24 h" value={stats.recent_sessions_24h} />
      </div>

      <h2 className="mt-10 text-sm font-semibold uppercase tracking-wider text-gray-500">
        Recent paid orders
      </h2>
      <table className="mt-2 w-full text-xs">
        <thead className="border-b border-gray-200 text-left text-[10px] uppercase text-gray-400">
          <tr>
            <th className="py-2">id</th>
            <th>locale</th>
            <th>iq</th>
            <th>email</th>
            <th>paid</th>
          </tr>
        </thead>
        <tbody>
          {stats.recent_paid.length === 0 && (
            <tr>
              <td colSpan={5} className="py-4 text-center text-gray-400">
                no paid orders yet
              </td>
            </tr>
          )}
          {stats.recent_paid.map((row) => (
            <tr key={row.id} className="border-b border-gray-100">
              <td className="py-2 font-mono">{row.id}</td>
              <td>{row.locale}</td>
              <td>{row.estimatedIq}</td>
              <td>{row.emailDomain}</td>
              <td className="text-gray-500">
                {row.paidAt ? new Date(row.paidAt).toLocaleTimeString() : '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <p className="mt-10 text-[10px] text-gray-400">{stats.note}</p>
    </div>
  );
}

function Card({
  label,
  value,
  accent,
}: {
  label: string;
  value: string | number;
  accent?: boolean;
}) {
  return (
    <div
      className={
        'rounded-2xl border p-4 ' +
        (accent
          ? 'border-brand-500 bg-brand-50'
          : 'border-gray-200 bg-white')
      }
    >
      <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">
        {label}
      </p>
      <p className="mt-1 text-2xl font-bold text-gray-900 tabular-nums">{value}</p>
    </div>
  );
}
