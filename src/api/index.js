/**
 * src/api/index.js
 *
 * WHAT CHANGED vs uploaded version:
 *   1. baseURL is built correctly — no /api duplication risk.
 *   2. detectSubdomain imported from AuthContext (single source of truth).
 *   3. 401 interceptor avoids redirect loops on /, /login, /signup,
 *      /verify-otp, /onboarding, /pricing (all public signup routes).
 *   4. Error message normalisation covers both FastAPI default shape
 *      { detail: string } and our envelope { detail: { message } }.
 */

import axios from 'axios';
import { detectSubdomain } from '@/contexts/AuthContext';

// ─── Storage keys — must match AuthContext.js ────────────────────────────────
const TOKEN_KEY = 'growcad_token';
const USER_KEY  = 'growcad_user';
const INST_KEY  = 'growcad_institute';

// ─── Public routes — 401 on these should NOT trigger a redirect ──────────────
const PUBLIC_PATHS = [
  '/',
  '/login',
  '/signup',
  '/verify-otp',
  '/onboarding',
  '/pricing',
  '/payment-success',
  '/pending-approval',
];

// ─── Axios instance ───────────────────────────────────────────────────────────
const API = axios.create({
  // REACT_APP_BACKEND_URL = "https://api.growcad.in"  (no trailing slash, no /api)
  baseURL: `${process.env.REACT_APP_BACKEND_URL}/api`,
  timeout: 15_000,
  headers: { 'Content-Type': 'application/json' },
});

// ─── Request interceptor ──────────────────────────────────────────────────────
API.interceptors.request.use(
  (config) => {
    // 1. Attach JWT
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // 2. Attach X-Institute-Slug when on a subdomain.
    //    Backend TenantMiddleware + /auth/subdomain-login both read this header.
    //    Frontend never needs to put slug in the request body.
    const slug = detectSubdomain();
    if (slug) {
      config.headers['X-Institute-Slug'] = slug;
    }

    return config;
  },
  (err) => Promise.reject(err),
);

// ─── Response interceptor ─────────────────────────────────────────────────────
API.interceptors.response.use(
  (res) => res,

  (err) => {
    const status = err.response?.status;
    const detail = err.response?.data?.detail;

    // ── Normalise error message ───────────────────────────────────────────────
    // FastAPI raises:  { detail: "plain string" }
    // Our routes raise: { detail: { status, message } }
    let message = 'An unexpected error occurred.';
    if (typeof detail === 'string') {
      message = detail;
    } else if (detail?.message) {
      message = detail.message;
    } else if (err.message && err.message !== 'Network Error') {
      message = err.message;
    }
    err.message = message;

    // ── 401 — clear auth state and redirect to correct login ──────────────────
    if (status === 401) {
      try {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        localStorage.removeItem(INST_KEY);
      } catch {}

      const isPublicPage = PUBLIC_PATHS.some(
        (p) => window.location.pathname === p || window.location.pathname.startsWith(p + '/'),
      );

      if (!isPublicPage) {
        const slug = detectSubdomain();
        window.location.href = slug ? '/' : '/login';
      }
    }

    // ── 403 — let the component show the error; don't redirect ────────────────

    return Promise.reject(err);
  },
);

export default API;
