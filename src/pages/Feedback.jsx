import React, { useEffect, useMemo, useRef, useState } from "react";
import eventsData from "../data/events.json";
import testiData from "../data/testimonials.json";
import "../css/feedback.css";
import UseTitle from "../hooks/UseTitle";

const NAME_RE = /^[A-Za-z][A-Za-z .']{1,39}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const todayNoTime = () => {
  const t = new Date();
  return new Date(t.getFullYear(), t.getMonth(), t.getDate());
};
const dateNoTime = (d) => {
  const x = new Date(d);
  return new Date(x.getFullYear(), x.getMonth(), x.getDate());
};
const withinPastMonth = (iso) => {
  const today = todayNoTime();
  const target = dateNoTime(iso);
  const monthAgo = new Date(today);
  monthAgo.setDate(today.getDate() - 30);
  return target <= today && target >= monthAgo;
};
const niceDate = (iso) =>
  new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

export default function Feedback() {
  UseTitle("CampusConnect - Feedback");
  const allEvents = Array.isArray(eventsData) ? eventsData : eventsData?.events || [];
  const recentPastEvents = useMemo(
    () =>
      allEvents
        .filter((e) => e?.date && withinPastMonth(e.date))
        .sort((a, b) => new Date(b.date) - new Date(a.date)),
    [allEvents]
  );

  const testiItems = Array.isArray(testiData) ? testiData : [];
  const testiPages = useMemo(() => {
    const out = [];
    for (let i = 0; i < testiItems.length; i += 3) out.push(testiItems.slice(i, i + 3));
    return out.length ? out : [[]];
  }, [testiItems]);

  const [form, setForm] = useState({
    name: "",
    email: "",
    userType: "",
    eventId: "",
    rating: 0,
    comments: "",
  });

  const [errors, setErrors] = useState({
    name: "",
    email: "",
    userType: "",
    eventId: "",
    rating: "",
    comments: "",
  });

  const validateField = (name, value) => {
    switch (name) {
      case "name":
        if (!value.trim()) return "Name is required.";
        if (!NAME_RE.test(value)) return "Use 2–40 letters (spaces, . and ' allowed).";
        return "";
      case "email":
        if (!value.trim()) return "Email is required.";
        if (!EMAIL_RE.test(value)) return "Enter a valid email address.";
        return "";
      case "userType":
        if (!value) return "Please choose your user type.";
        return "";
      case "eventId":
        if (!value) return "Select an event from the past month.";
        return "";
      case "rating":
        if (!value || Number(value) < 1 || Number(value) > 5) return "Rate between 1 and 5.";
        return "";
      case "comments":
        if (value && value.trim().length < 5) return "Add a bit more detail (min 5 chars).";
        return "";
      default:
        return "";
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
    setErrors((s) => ({ ...s, [name]: validateField(name, value) }));
  };

  const handleRatingClick = (n) => {
    setForm((s) => ({ ...s, rating: n }));
    setErrors((s) => ({ ...s, rating: validateField("rating", n) }));
  };

  const allValid =
    form.name &&
    form.email &&
    form.userType &&
    form.eventId &&
    form.rating >= 1 &&
    Object.values(errors).every((x) => !x);

  const [showDemoModal, setShowDemoModal] = useState(false);
  const onSubmit = (e) => {
    e.preventDefault();
    const newErrors = Object.fromEntries(Object.entries(form).map(([k, v]) => [k, validateField(k, v)]));
    setErrors(newErrors);
    if (Object.values(newErrors).some((x) => x)) return;
    setForm({ name: "", email: "", userType: "", eventId: "", rating: 0, comments: "" });
    setShowDemoModal(true);
  };

  const [slide, setSlide] = useState(0);
  const totalSlides = Math.max(1, testiPages.length);
  const trackRef = useRef(null);

  useEffect(() => {
    const timer = setInterval(() => setSlide((s) => (s + 1) % totalSlides), 5000);
    return () => clearInterval(timer);
  }, [totalSlides]);

  useEffect(() => {
    if (trackRef.current) trackRef.current.style.transform = `translateX(${-(slide * 100)}%)`;
  }, [slide]);

  const charCount = form.comments.length;

  return (
    <div className="fb-wrap">
      <section className="fb-hero-banner" aria-label="Event Feedback">
        <div className="fb-hero-overlay">
          <h1>Event Feedback</h1>
          <p>Share your experience to help us improve the next one.</p>
        </div>
      </section>

      <section className="fb-card">
        <div className="fb-titlebar">
          <h2 className="fb-title">Your Feedback</h2>
          <div className="fb-badge">{form.rating ? `${form.rating}/5` : "Rate"}</div>
        </div>

        <form className="fb-form" onSubmit={onSubmit} noValidate>
          <div className="fb-row">
            <div className={`fb-field ${errors.name ? "invalid" : ""}`}>
              <label htmlFor="fb-name">Name</label>
              <input
                id="fb-name"
                name="name"
                type="text"
                placeholder="Your full name"
                value={form.name}
                onChange={handleChange}
                aria-invalid={!!errors.name}
                autoComplete="name"
              />
              {errors.name ? <span className="fb-error">{errors.name}</span> : <span className="fb-hint">2–40 letters</span>}
            </div>

            <div className={`fb-field ${errors.email ? "invalid" : ""}`}>
              <label htmlFor="fb-email">Email</label>
              <input
                id="fb-email"
                name="email"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                aria-invalid={!!errors.email}
                autoComplete="email"
              />
              {errors.email ? <span className="fb-error">{errors.email}</span> : <span className="fb-hint">We won't store it</span>}
            </div>
          </div>

          <div className="fb-row">
            <div className={`fb-field ${errors.userType ? "invalid" : ""}`}>
              <label htmlFor="fb-type">User Type</label>
              <select
                id="fb-type"
                name="userType"
                value={form.userType}
                onChange={handleChange}
                aria-invalid={!!errors.userType}
              >
                <option value="">Choose user type…</option>
                <option value="Student">Student</option>
                <option value="Faculty">Faculty</option>
                <option value="Staff">Staff</option>
                <option value="Guest">Guest</option>
              </select>
              {errors.userType && <span className="fb-error">{errors.userType}</span>}
            </div>

            <div className={`fb-field ${errors.eventId ? "invalid" : ""}`}>
              <label htmlFor="fb-event">Event Attended (past month)</label>
              <select
                id="fb-event"
                name="eventId"
                value={form.eventId}
                onChange={handleChange}
                aria-invalid={!!errors.eventId}
              >
                <option value="">Select an event…</option>
                {recentPastEvents.length === 0 && <option disabled>No recent events</option>}
                {recentPastEvents.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.title} — {niceDate(e.date)}
                  </option>
                ))}
              </select>
              {errors.eventId && <span className="fb-error">{errors.eventId}</span>}
            </div>
          </div>

          <div className={`fb-field ${errors.rating ? "invalid" : ""}`}>
            <label>Rating</label>
            <div className="fb-stars">
              {[1, 2, 3, 4, 5].map((n) => (
                <label key={n} className={`fb-star ${form.rating >= n ? "on" : ""}`}>
                  <input
                    type="radio"
                    name="rating"
                    value={n}
                    checked={String(form.rating) === String(n)}
                    onChange={() => handleRatingClick(n)}
                  />
                  ★
                </label>
              ))}
            </div>
            {errors.rating && <span className="fb-error">{errors.rating}</span>}
          </div>

          <div className={`fb-field ${errors.comments ? "invalid" : ""}`}>
            <label htmlFor="fb-comments">Comments</label>
            <textarea
              id="fb-comments"
              name="comments"
              rows="6"
              placeholder="Your remarks, suggestions, or highlights…"
              value={form.comments.slice(0, 500)}
              onChange={handleChange}
              aria-invalid={!!errors.comments}
            />
            <div className="m1-fieldbar">
              {errors.comments ? <span className="fb-error">{errors.comments}</span> : <span className="fb-hint"></span>}
              <span className={"m1-count" + (charCount > 420 ? " warn" : "")}>{charCount}/500</span>
            </div>
          </div>

          <div className="fb-actions">
            <button type="submit" className={`fb-btn primary ${!allValid ? "disabled" : ""}`} disabled={!allValid}>
              Submit Feedback
            </button>
            <button
              type="reset"
              className="fb-btn ghost"
              onClick={() => (
                setForm({ name: "", email: "", userType: "", eventId: "", rating: 0, comments: "" }),
                setErrors({ name: "", email: "", userType: "", eventId: "", rating: "", comments: "" })
              )}
            >
              Clear
            </button>
          </div>
        </form>
      </section>

      <section className="fb-testi-section">
        <div className="fb-sec-head">
          <h2>Testimonials</h2>
          <div className="fb-slider-ctrls">
            <button
              className="fb-btn ghost"
              aria-label="Previous"
              onClick={() => setSlide((s) => (s - 1 + totalSlides) % totalSlides)}
            >
              ‹
            </button>
            <button
              className="fb-btn ghost"
              aria-label="Next"
              onClick={() => setSlide((s) => (s + 1) % totalSlides)}
            >
              ›
            </button>
          </div>
        </div>

        <div className="fb-testi-slider">
          <div className="fb-testi-track" ref={trackRef} style={{ width: `${totalSlides * 100}%` }}>
            {testiPages.map((group, gi) => (
              <div className="fb-testi-slide" key={gi}>
                <div className="fb-testi-grid">
                  {group.map((t) => (
                    <article className="fb-testi-card" key={t.id}>
                      <div className="fb-testi-avatarWrap">
                        <img
                          className="fb-testi-avatar"
                          src={t.avatar || "https://api.dicebear.com/7.x/initials/svg?seed=" + encodeURIComponent(t.name)}
                          alt={t.name}
                        />
                      </div>
                      <div className="fb-testi-stars">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <span key={i} className="fb-testi-star on">★</span>
                        ))}
                      </div>
                      <p className="fb-testi-quote">“{t.quote}”</p>
                      <div className="fb-testi-person">
                        <strong className="fb-testi-name">{t.name}</strong>
                        <div className="fb-testi-role">{t.role}</div>
                      </div>
                    </article>
                  ))}
                  {Array.from({ length: Math.max(0, 3 - group.length) }).map((_, k) => (
                    <div className="fb-testi-card fb-testi-empty" key={`pad-${k}`} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {totalSlides > 1 && (
          <div className="fb-dots">
            {Array.from({ length: totalSlides }).map((_, i) => (
              <button
                key={i}
                className={"fb-dot" + (i === slide ? " on" : "")}
                onClick={() => setSlide(i)}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        )}
      </section>

      {showDemoModal && (
        <div className="fb-modal" role="dialog" aria-modal="true" aria-labelledby="fb-demo-title">
          <div className="fb-modal__backdrop" onClick={() => setShowDemoModal(false)} />
          <div className="fb-modal__panel fb-frost fb-modal-in">
            <h3 id="fb-demo-title">Feedback Recieved</h3>
            <p className="fb-modal__text">Thanks for giving your valuable feedback!</p>
            <button className="fb-btn cta" onClick={() => setShowDemoModal(false)}>Continue</button>
          </div>
        </div>
      )}
    </div>
  );
}
