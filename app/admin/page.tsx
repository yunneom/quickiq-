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
  by_campaign?: Array<{
    name: string;
    sessions: number;
    completed: number;
    paid: number;
    conversion_pct: number;
  }>;
  by_locale?: Array<{
    locale: 'ko' | 'en';
    sessions: number;
    completed: number;
    paid: number;
    conversion_pct: number;
  }>;
  by_day?: Array<{
    date: string;
    sessions: number;
    completed: number;
    paid: number;
  }>;
  by_price?: Array<{
    price_krw: number;
    sessions: number;
    paid: number;
    revenue: number;
    conversion_pct: number;
  }>;
  by_experiment?: Array<{
    experiment: string;
    variants: Array<{
      variant: string;
      sessions: number;
      completed: number;
      paid: number;
      conversion_pct: number;
    }>;
  }>;
  funnel?: Record<string, { total: number; last24h: number; last1h: number }>;
  note: string;
}

const FUNNEL_ORDER = [
  'IQ_TestStart',
  'IQ_Q1Answered',
  'IQ_Q15Answered',
  'IQ_Q25Answered',
  'IQ_TestSubmitted',
  'IQ_ResultViewed',
  'IQ_CheckoutViewed',
  'IQ_PaymentSuccess',
  'IQ_ExitIntent',
];

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

      <button
        type="button"
        onClick={() => void downloadCsv(token)}
        className="mt-3 inline-flex items-center gap-1 rounded-md border border-gray-200 px-2 py-1 text-[11px] font-medium text-gray-600 hover:bg-gray-50"
      >
        ↓ Sessions CSV
      </button>

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

      {stats.funnel && (
        <>
          <h2 className="mt-10 text-sm font-semibold uppercase tracking-wider text-gray-500">
            Funnel (last 24 h)
          </h2>
          <div className="mt-2 space-y-1.5">
            {FUNNEL_ORDER.map((name) => {
              const row = stats.funnel?.[name];
              const start = stats.funnel?.['IQ_TestStart']?.last24h ?? 0;
              const v = row?.last24h ?? 0;
              const pct = start === 0 ? 0 : Math.round((v / start) * 100);
              return (
                <div key={name} className="flex items-center gap-2 text-xs">
                  <span className="w-44 truncate text-gray-600">{name}</span>
                  <div className="relative h-2 flex-1 rounded-full bg-gray-100">
                    <div
                      className="h-full rounded-full bg-brand-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="w-14 text-right font-medium tabular-nums text-gray-900">
                    {v}
                  </span>
                  <span className="w-10 text-right text-[10px] text-gray-400">
                    {pct}%
                  </span>
                </div>
              );
            })}
          </div>
        </>
      )}

      {stats.by_locale && (
        <>
          <h2 className="mt-10 text-sm font-semibold uppercase tracking-wider text-gray-500">
            By locale
          </h2>
          <table className="mt-2 w-full text-xs">
            <thead className="border-b border-gray-200 text-left text-[10px] uppercase text-gray-400">
              <tr>
                <th className="py-2">locale</th>
                <th>sessions</th>
                <th>completed</th>
                <th>paid</th>
                <th>conv %</th>
              </tr>
            </thead>
            <tbody>
              {stats.by_locale.map((row) => (
                <tr key={row.locale} className="border-b border-gray-100">
                  <td className="py-2 font-medium">{row.locale}</td>
                  <td>{row.sessions}</td>
                  <td>{row.completed}</td>
                  <td>{row.paid}</td>
                  <td>{row.conversion_pct}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {stats.by_experiment && stats.by_experiment.length > 0 && (
        <>
          <h2 className="mt-10 text-sm font-semibold uppercase tracking-wider text-gray-500">
            A/B experiments
          </h2>
          <div className="mt-2 space-y-4">
            {stats.by_experiment.map((exp) => (
              <div
                key={exp.experiment}
                className="rounded-2xl border border-gray-200 bg-white p-3"
              >
                <p className="text-xs font-medium text-gray-700">
                  {exp.experiment}
                </p>
                <table className="mt-2 w-full text-xs">
                  <thead className="border-b border-gray-100 text-left text-[10px] uppercase text-gray-400">
                    <tr>
                      <th className="py-1">variant</th>
                      <th>sessions</th>
                      <th>completed</th>
                      <th>paid</th>
                      <th>conv %</th>
                    </tr>
                  </thead>
                  <tbody>
                    {exp.variants.map((v) => (
                      <tr key={v.variant} className="border-b border-gray-50">
                        <td className="py-1 font-mono uppercase">{v.variant}</td>
                        <td>{v.sessions}</td>
                        <td>{v.completed}</td>
                        <td>{v.paid}</td>
                        <td>{v.conversion_pct}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        </>
      )}

      {stats.by_price && stats.by_price.length > 0 && (
        <>
          <h2 className="mt-10 text-sm font-semibold uppercase tracking-wider text-gray-500">
            By price (A/B)
          </h2>
          <table className="mt-2 w-full text-xs">
            <thead className="border-b border-gray-200 text-left text-[10px] uppercase text-gray-400">
              <tr>
                <th className="py-2">price</th>
                <th>sessions</th>
                <th>paid</th>
                <th>conv %</th>
                <th>revenue (₩)</th>
              </tr>
            </thead>
            <tbody>
              {stats.by_price.map((row) => (
                <tr key={row.price_krw} className="border-b border-gray-100">
                  <td className="py-2 font-medium">
                    {row.price_krw.toLocaleString('ko-KR')}원
                  </td>
                  <td>{row.sessions}</td>
                  <td>{row.paid}</td>
                  <td>{row.conversion_pct}</td>
                  <td>{row.revenue.toLocaleString('ko-KR')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {stats.by_day && (
        <>
          <h2 className="mt-10 text-sm font-semibold uppercase tracking-wider text-gray-500">
            Last 7 days
          </h2>
          <div className="mt-2 flex items-end gap-1.5">
            {stats.by_day.map((d) => {
              const max = Math.max(
                1,
                ...(stats.by_day ?? []).map((x) => x.sessions),
              );
              const h = Math.round((d.sessions / max) * 80);
              return (
                <div
                  key={d.date}
                  className="flex flex-1 flex-col items-center gap-1"
                  title={`${d.date} — ${d.sessions} sessions, ${d.paid} paid`}
                >
                  <div
                    className="w-full rounded-t bg-brand-500"
                    style={{ height: `${h}px` }}
                  />
                  <span className="text-[9px] text-gray-400">
                    {d.date.slice(5)}
                  </span>
                </div>
              );
            })}
          </div>
        </>
      )}

      <SessionLookup token={token} />

      <p className="mt-10 text-[10px] text-gray-400">{stats.note}</p>
    </div>
  );
}

/**
 * Tiny session inspector: paste a UUID, see masked email + paid status
 * + A/B variants + UTM + result. Auth piggybacks on the dashboard's
 * already-loaded token so the operator doesn't paste it twice.
 */
function SessionLookup({ token }: { token: string }) {
  const [id, setId] = useState('');
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function look() {
    setErr(null);
    setData(null);
    try {
      const res = await fetch(`/api/admin/sessions/${encodeURIComponent(id.trim())}`, {
        headers: { 'x-admin-token': token },
        cache: 'no-store',
      });
      if (!res.ok) {
        setErr(`HTTP ${res.status}`);
        return;
      }
      setData((await res.json()) as Record<string, unknown>);
    } catch (e) {
      setErr(String(e));
    }
  }

  return (
    <>
      <h2 className="mt-10 text-sm font-semibold uppercase tracking-wider text-gray-500">
        Session lookup
      </h2>
      <div className="mt-2 flex gap-2">
        <input
          value={id}
          onChange={(e) => setId(e.target.value)}
          placeholder="session uuid (or 8-char short)"
          className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-xs font-mono focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
        />
        <button
          type="button"
          onClick={() => void look()}
          disabled={!id.trim()}
          className="rounded-lg bg-gray-900 px-3 py-2 text-xs font-semibold text-white disabled:opacity-50"
        >
          Look up
        </button>
      </div>
      {err && <p className="mt-2 text-xs text-red-600">{err}</p>}
      {data && (
        <pre className="mt-2 max-h-80 overflow-auto rounded-lg bg-gray-50 p-3 text-[11px] leading-relaxed text-gray-700">
          {JSON.stringify(data, null, 2)}
        </pre>
      )}
    </>
  );
}

/**
 * Fetch the CSV with the admin token in headers (so the token never
 * appears in the URL / referer), then trigger a blob download. We
 * can't just use a plain <a download> because the endpoint requires
 * the auth header.
 */
async function downloadCsv(token: string) {
  const res = await fetch('/api/admin/sessions.csv', {
    headers: { 'x-admin-token': token },
    cache: 'no-store',
  });
  if (!res.ok) {
    alert(`CSV download failed: HTTP ${res.status}`);
    return;
  }
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `iq-sessions-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
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
