/**
 * src/contexts/AuthContext.js
 *
 * WHAT CHANGED vs uploaded version:
 *   1. login() calls POST /auth/login (was /auth/admin-login).
 *      Also stores token + institute returned by the login endpoint.
 *   2. subdomainLogin() no longer puts slug in the body.
 *      The Axios interceptor injects X-Institute-Slug header from detectSubdomain().
 *   3. After /institute/create the token returned is stored immediately so
 *      the next API call (/institute/select-plan) is authenticated.
 *      createInstitute() now accepts the full response and stores token + user.
 *   4. logout() redirects to the correct page (subdomain → '/', main → '/login').
 *   5. All localStorage keys are in one KEYS object — no typo risk.
 *   6. extractErrorMessage() is exported so page components don't need to
 *      hand-parse error shapes.
 */

import {
  createContext, useContext, useState, useEffect, useCallback,
} from 'react';
import API from '@/api';

// ─── Storage keys ─────────────────────────────────────────────────────────────
const KEYS = {
  token:     'growcad_token',
  user:      'growcad_user',
  institute: 'growcad_institute',
};

const ROOT_DOMAIN = process.env.REACT_APP_ROOT_DOMAIN || 'growcad.in';
const RESERVED_MAIN_SUBDOMAINS = new Set(['app', 'www']);

// ─── Subdomain detection — exported so api/index.js can import it ─────────────
/**
 * Returns the institute slug when on a subdomain, null otherwise.
 *
 * Production examples:
 *   growcad.in           → null
 *   demo.growcad.in      → "demo"
 *
 * Dev examples (add entries to /etc/hosts or use a reverse proxy):
 *   localhost            → null
 *   demo.localhost       → "demo"
 */
export function detectSubdomain() {
  const host = window.location.hostname;

  if (host === 'localhost' || host === '127.0.0.1') return null;
  if (host.endsWith('.localhost')) {
    const slug = host.replace('.localhost', '');
    return slug || null;
  }
  if (host === ROOT_DOMAIN || host === `www.${ROOT_DOMAIN}`) return null;
  if (host.endsWith(`.${ROOT_DOMAIN}`)) {
    const slug = host.slice(0, host.length - ROOT_DOMAIN.length - 1);
    if (RESERVED_MAIN_SUBDOMAINS.has(slug)) return null;
    return slug || null;
  }
  return null;
}

export const isMainDomain = () => detectSubdomain() === null;
export const isSubdomain  = () => detectSubdomain() !== null;

// ─── Storage helpers ──────────────────────────────────────────────────────────
const persist  = (key, val)  => { try { localStorage.setItem(key, JSON.stringify(val)); } catch {} };
const retrieve = (key)       => { try { const r = localStorage.getItem(key); return r ? JSON.parse(r) : null; } catch { return null; } };
const erase    = (...keys)   => { try { keys.forEach(k => localStorage.removeItem(k)); } catch {} };

// ─── Error normalisation — exported for use in page components ────────────────
export function extractErrorMessage(err, fallback = 'Something went wrong.') {
  // err.message is already normalised by the Axios interceptor in api/index.js
  if (err?.message && err.message !== 'Network Error') return err.message;
  const detail = err?.response?.data?.detail;
  if (!detail) return fallback;
  if (typeof detail === 'string') return detail;
  if (typeof detail?.message === 'string') return detail.message;
  return fallback;
}

// ─── Context ──────────────────────────────────────────────────────────────────
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user,         setUser]        = useState(() => retrieve(KEYS.user));
  const [institute,    setInstitute]   = useState(() => retrieve(KEYS.institute));
  const [loading,      setLoading]     = useState(true);
  const [loginLoading, setLoginLoading] = useState(false);

  const subdomain = detectSubdomain();

  // ── Validate stored token on mount ─────────────────────────────────────────
  useEffect(() => {
    const token = localStorage.getItem(KEYS.token);
    if (!token) {
      setLoading(false);
      return;
    }
    API.get('/auth/me')
      .then((res) => {
        setUser(res.data);
        persist(KEYS.user, res.data);
      })
      .catch(() => {
        erase(KEYS.token, KEYS.user, KEYS.institute);
        setUser(null);
        setInstitute(null);
      })
      .finally(() => setLoading(false));
  }, []);

  // ── Fetch institute when instituteId is known ──────────────────────────────
  useEffect(() => {
    if (!user?.instituteId) return;
    // Only fetch if we don't already have fresh data
    if (institute?.id === user.instituteId) return;
    API.get(`/institute/by-id/${user.instituteId}`)
      .then((res) => {
        setInstitute(res.data);
        persist(KEYS.institute, res.data);
      })
      .catch(() => {}); // non-fatal — cached value remains
  }, [user?.instituteId]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Admin login — main domain ───────────────────────────────────────────────
  const login = useCallback(async (email, password) => {
    setLoginLoading(true);
    try {
      const { data } = await API.post('/auth/login', { email, password });

      // Store token FIRST so subsequent calls are authenticated
      localStorage.setItem(KEYS.token, data.token);
      persist(KEYS.user,      data.user);
      if (data.institute) persist(KEYS.institute, data.institute);

      setUser(data.user);
      if (data.institute) setInstitute(data.institute);

      return data;
    } finally {
      setLoginLoading(false);
    }
  }, []);

  // ── OTP login — subdomain ──────────────────────────────────────────────────
  // Slug is intentionally NOT in the body — Axios interceptor adds the header.
  const subdomainLogin = useCallback(async (mobile, otp) => {
    setLoginLoading(true);
    try {
      const { data } = await API.post('/auth/subdomain-login', { mobile, otp });

      localStorage.setItem(KEYS.token, data.token);
      persist(KEYS.user,      data.user);
      if (data.institute) persist(KEYS.institute, data.institute);

      setUser(data.user);
      if (data.institute) setInstitute(data.institute);

      return data;
    } finally {
      setLoginLoading(false);
    }
  }, []);

  // ── Logout ─────────────────────────────────────────────────────────────────
  const logout = useCallback(() => {
    erase(KEYS.token, KEYS.user, KEYS.institute);
    setUser(null);
    setInstitute(null);
    window.location.href = subdomain ? '/' : '/login';
  }, [subdomain]);

  // ── OTP helpers ────────────────────────────────────────────────────────────
  const sendOtp = useCallback(
    (target, channel = 'mobile') => API.post('/auth/send-otp', { target, channel }),
    [],
  );

  const verifyOtp = useCallback(
    (target, otp, channel = 'mobile') =>
      API.post('/auth/verify-otp', { target, otp, channel }),
    [],
  );

  // ── Institute helpers ──────────────────────────────────────────────────────
  const checkSlug = useCallback(async (slug) => {
    const { data } = await API.get(`/institute/check-slug?slug=${encodeURIComponent(slug)}`);
    return data.available; // boolean
  }, []);

  /**
   * createInstitute — called from OnboardingPage.
   * The backend returns { token, user, institute }.
   * We store the token here so PlanSelectionPage's API call is authenticated.
   */
  const createInstitute = useCallback(async (payload) => {
    const { data } = await API.post('/institute/create', payload);

    // Store token + user returned by /institute/create
    localStorage.setItem(KEYS.token, data.token);
    persist(KEYS.user,      data.user);
    persist(KEYS.institute, data.institute);

    setUser(data.user);
    setInstitute(data.institute);

    return data;
  }, []);

  const selectPlan = useCallback(
    (payload) => API.post('/institute/select-plan', payload),
    [],
  );

  // ── Context value ──────────────────────────────────────────────────────────
  return (
    <AuthContext.Provider
      value={{
        user,
        institute,
        loading,
        loginLoading,
        isAuthenticated: !!user,
        role:        user?.role        ?? null,
        instituteId: user?.instituteId ?? null,

        subdomain,
        isMainDomain: subdomain === null,
        isSubdomain:  subdomain !== null,

        login,
        subdomainLogin,
        logout,
        sendOtp,
        verifyOtp,
        checkSlug,
        createInstitute,
        selectPlan,

        extractErrorMessage, // convenience export
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
};
