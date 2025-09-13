import React, { useMemo, useState } from "react";
import eventsData from "../data/events.json";
import "../css/registration.css";
import "../css/about.css";
import UseTitle from "../hooks/UseTitle";

const NAME_RE = /^[A-Za-z][A-Za-z .']{1,39}$/;
const ROLL_RE = /^[A-Za-z0-9][A-Za-z0-9\-_/]{2,23}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_RE = /^\+[1-9]\d{7,14}$/;

function isFutureOrToday(dateISO) {
  const today = new Date();
  const t = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const d = new Date(dateISO);
  const d2 = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  return d2 >= t;
}
function niceDate(d) {
  return new Date(d).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function Registration() {
  UseTitle("CampusConnect - Register")
  const allEvents = Array.isArray(eventsData)
    ? eventsData
    : eventsData?.events || [];
  const upcomingEvents = useMemo(
    () =>
      allEvents
        .filter((e) => e?.date && isFutureOrToday(e.date))
        .sort((a, b) => new Date(a.date) - new Date(b.date)),
    [allEvents]
  );

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    roll: "",
    email: "",
    phone: "",
    eventId: "",
  });
  const [errors, setErrors] = useState({});
  const [showSuccess, setShowSuccess] = useState(false);

  const validate = (name, value) => {
    switch (name) {
      case "firstName":
      case "lastName":
        if (!value.trim()) return "Required";
        if (!NAME_RE.test(value)) return "2–40 letters only";
        return "";
      case "roll":
        if (!value.trim()) return "Required";
        if (!ROLL_RE.test(value)) return "Invalid roll number";
        return "";
      case "email":
        if (!EMAIL_RE.test(value)) return "Invalid email";
        return "";
      case "phone":
        if (!PHONE_RE.test(value)) return "Format: +923001234567";
        return "";
      case "eventId":
        if (!value) return "Select an event";
        return "";
      default:
        return "";
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    setErrors((er) => ({ ...er, [name]: validate(name, value) }));
  };

  const allValid =
    form.firstName &&
    form.lastName &&
    form.roll &&
    form.email &&
    form.phone &&
    form.eventId &&
    Object.values(errors).every((x) => !x);

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErr = {};
    Object.entries(form).forEach(([k, v]) => {
      newErr[k] = validate(k, v);
    });
    setErrors(newErr);
    if (Object.values(newErr).some((x) => x)) return;

    setForm({
      firstName: "",
      lastName: "",
      roll: "",
      email: "",
      phone: "",
      eventId: "",
    });
    setShowSuccess(true);
  };

  return (
    <div className="about-page reg-wrap">
      <section className="hero-banner hero--registration" aria-label="Event Registration">
        <div className="hero-overlay">
          <h1>Register for Campus Events</h1>
          <p>Secure your seat for upcoming activities and workshops.</p>
        </div>
      </section>

      <section className="reg-card">
        <form className="reg-form" onSubmit={handleSubmit} noValidate>
          <div className="reg-row">
            <div className="reg-field">
              <label>First Name</label>
              <input
                type="text"
                name="firstName"
                value={form.firstName}
                onChange={handleChange}
              />
              {errors.firstName && <span className="reg-error">{errors.firstName}</span>}
            </div>
            <div className="reg-field">
              <label>Last Name</label>
              <input
                type="text"
                name="lastName"
                value={form.lastName}
                onChange={handleChange}
              />
              {errors.lastName && <span className="reg-error">{errors.lastName}</span>}
            </div>
          </div>

          <div className="reg-row">
            <div className="reg-field">
              <label>Roll Number</label>
              <input
                type="text"
                name="roll"
                value={form.roll}
                onChange={handleChange}
              />
              {errors.roll && <span className="reg-error">{errors.roll}</span>}
            </div>
            <div className="reg-field">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
              />
              {errors.email && <span className="reg-error">{errors.email}</span>}
            </div>
          </div>

          <div className="reg-field">
            <label>Contact (with country code)</label>
            <input
              type="tel"
              name="phone"
              placeholder="+923001234567"
              value={form.phone}
              onChange={handleChange}
            />
            {errors.phone && <span className="reg-error">{errors.phone}</span>}
          </div>

          <div className="reg-field">
            <label>Select Event</label>
            <select name="eventId" value={form.eventId} onChange={handleChange}>
              <option value="">-- Choose upcoming event --</option>
              {upcomingEvents.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.title} — {niceDate(e.date)}
                </option>
              ))}
            </select>
            {errors.eventId && <span className="reg-error">{errors.eventId}</span>}
          </div>

          <div className="reg-actions">
            <button
              type="submit"
              className={`reg-btn primary ${!allValid ? "disabled" : ""}`}
              disabled={!allValid}
            >
              Submit Registration
            </button>
          </div>
        </form>
      </section>

      {showSuccess && (
        <div className="reg-modal">
          <div className="reg-modal__backdrop" onClick={() => setShowSuccess(false)} />
          <div className="reg-modal__panel">
            <div className="reg-modal__icon">
              <svg viewBox="0 0 64 64" width="64" height="64">
                <circle cx="32" cy="32" r="30" fill="none" stroke="#22c55e" strokeWidth="4"></circle>
                <path d="M20 33 l8 8 l16 -18" fill="none" stroke="#22c55e" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"></path>
              </svg>
            </div>
            <h3>Registration Successful</h3>
            <p>Your spot has been reserved. See you at the event!</p>
            <button className="reg-btn primary" onClick={() => setShowSuccess(false)}>
              Continue
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
