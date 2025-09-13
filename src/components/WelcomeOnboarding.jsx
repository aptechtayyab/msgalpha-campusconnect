import React, { useContext, useEffect, useRef, useState } from "react";
import "../css/WelcomeOnboarding.css";
import onboardingData from "../data/onboarding.json";
import { BannerContext } from "../context/BannerContext.jsx";

const NAME_KEY = "cc_user_name";
const ROLE_KEY = "cc_user_role";
const SESSION_KEY = "cc_onboarding_shown_session";

function normalizeName(v) {
  return v.trim().replace(/\s+/g, " ").replace(/(^|\s)\S/g, (m) => m.toUpperCase());
}
function isValidName(v) {
  const t = v.trim();
  if (t.length < 2 || t.length > 40) return false;
  return /^[A-Za-z][A-Za-z\s.'-]*$/.test(t);
}
function initialOpen() {
  try {
    const nav = performance.getEntriesByType("navigation")?.[0];
    const isTopLoad = nav ? (nav.type === "navigate" || nav.type === "reload" || nav.type === "back_forward") : true;
    if (!isTopLoad) return false;
    if (window.__cc_onboarding_seen_runtime) return false;
    window.__cc_onboarding_seen_runtime = true;
    const shownThisTab = sessionStorage.getItem(SESSION_KEY) === "1";
    if (shownThisTab) return false;
    return true;
  } catch {
    return true;
  }
}

export default function WelcomeOnboarding({ onClose }) {
  const { setUser } = useContext(BannerContext) || {};
  const [open, setOpen] = useState(initialOpen);
  const [step, setStep] = useState(1);
  const [role, setRole] = useState(null);
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const dialogRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e) => {
      if (e.key === "Tab") {
        const nodes = dialogRef.current?.querySelectorAll(
          "button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])"
        );
        if (!nodes?.length) return;
        const first = nodes[0];
        const last = nodes[nodes.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    (dialogRef.current?.querySelector("[data-autofocus]") || dialogRef.current)?.focus?.();
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, step]);

  function close() {
    try {
      sessionStorage.setItem(SESSION_KEY, "1");
    } catch {}
    setOpen(false);
    onClose?.();
  }

  function submit() {
    if (!role) {
      setError("Please choose your role.");
      return;
    }
    if (!isValidName(name)) {
      setError("Please enter a valid name (letters, spaces, . ' - only).");
      return;
    }
    const cleaned = normalizeName(name);
    try {
      localStorage.setItem(NAME_KEY, cleaned);
      localStorage.setItem(ROLE_KEY, role);
    } catch {}
    setUser?.(cleaned, role);
    setError("");
    setStep(2);
  }

  const roleLabel = onboardingData.roles.find((r) => r.id === role)?.label || "";
  const greeting = (() => {
    const n = normalizeName(name || "there");
    return roleLabel ? `Welcome, ${n}! (${roleLabel})` : `Welcome, ${n}!`;
  })();

  if (!open) return null;

  return (
    <div className="wo2-overlay" aria-hidden={!open}>
      <div className="wo2-glow tl" aria-hidden="true" />
      <div className="wo2-glow br" aria-hidden="true" />
      <section
        className="wo2-dialog wo2-in"
        role="dialog"
        aria-modal="true"
        aria-labelledby="wo2-title"
        aria-describedby="wo2-desc"
        ref={dialogRef}
        tabIndex={-1}
      >
        <header className="wo2-header">
          <h2 id="wo2-title">{onboardingData.headline}</h2>
          <p id="wo2-desc" className="wo2-sub">
            {step === 1 && onboardingData.subtitle}
            {step === 2 && "All set — have a great time!"}
          </p>
          <div className="wo2-steps">
            <span className={`dot ${step >= 1 ? "active" : ""}`} />
            <span className={`dot ${step >= 2 ? "active" : ""}`} />
          </div>
        </header>
        <div className="wo2-body">
          {step === 1 && (
            <div data-autofocus>
              <form
                className="wo2-form"
                onSubmit={(e) => {
                  e.preventDefault();
                  submit();
                }}
              >
                <label htmlFor="wo-role" className="wo2-label">Your role</label>
                <select
                  id="wo-role"
                  className="wo2-input"
                  value={role ?? ""}
                  onChange={(e) => {
                    setRole(e.target.value || null);
                    setError("");
                  }}
                >
                  <option value="" disabled>
                    Select your role…
                  </option>
                  {onboardingData.roles.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.label}
                    </option>
                  ))}
                </select>
                <label htmlFor="wo-name" className="wo2-label">Your name</label>
                <input
                  id="wo-name"
                  className="wo2-input"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Type your name…"
                  autoComplete="name"
                />
                {error && <div className="wo2-error" role="alert">{error}</div>}
                <div className="wo2-actions">
                  <button type="submit" className="wo2-btn primary">Continue</button>
                </div>
                <p className="wo2-hint">Tip: Pick a role, type your name, and press Enter</p>
              </form>
            </div>
          )}
          {step === 2 && (
            <div className="wo2-final">
              <div className="wo2-emoji" aria-hidden="true">🎉</div>
              <h3 className="wo2-final-title">{greeting}</h3>
              <p className="wo2-final-sub">You’re good to go — explore events, galleries and more.</p>
              <button className="wo2-btn big primary" onClick={close} data-autofocus>
                Explore Campus
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
