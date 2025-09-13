import React, { useEffect, useMemo, useState } from "react";
import "../css/events.css";

import eventsAll from "../data/events.json";
import { useBookmarks } from "../context/BookmarkContext.jsx";
import UseTitle from "../hooks/UseTitle.jsx";

const CATS = ["All", "Academic", "Cultural", "Sports", "Departmental"];
const SORTS = [
  { value: "date-asc", label: "Date (Upcoming first)" },
  { value: "date-desc", label: "Date (Most recent first)" },
  { value: "name-asc", label: "Event Name (A → Z)" },
  { value: "name-desc", label: "Event Name (Z → A)" },
  { value: "cat-asc", label: "Category (A → Z)" }
];

function toDT(ev) {
  const dateStr = ev.date?.replace(/-/g, "/") || "";
  if (ev.startTime) return new Date(`${dateStr} ${ev.startTime}`);
  return new Date(dateStr);
}

function formatRange(ev) {
  const d = new Date(ev.date?.replace(/-/g, "/"));
  if (isNaN(d)) return ev.date || "";
  const dd = d.toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  const t1 = ev.startTime ? new Date(`${ev.date} ${ev.startTime}`) : null;
  const t2 = ev.endTime ? new Date(`${ev.date} ${ev.endTime}`) : null;
  const fmt = (x) =>
    x?.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }).replace(" ", "");
  if (t1 && t2) return `${dd}, ${fmt(t1)} – ${fmt(t2)}`;
  if (t1) return `${dd}, ${fmt(t1)}`;
  return dd;
}

function cover(ev) {
  return ev.image1 || ev.image2 || ev.image3 || ev.image4 || "/images/event-placeholder.jpg";
}

export default function Events() {
  UseTitle("CampusConnect - Events")
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState("All");
  const [sort, setSort] = useState("date-asc");
  const [mode, setMode] = useState("upcoming");
  const [isReady, setIsReady] = useState(false);

  const { isBookmarked, toggle } = useBookmarks?.() || { isBookmarked: () => false, toggle: () => {} };

  const events = useMemo(() => {
    const enriched = (eventsAll || []).map((e) => ({
      ...e,
      _dt: toDT(e),
      _range: formatRange(e),
      _cat: e.category || "Academic",
      _dept: e.department || "General",
      _q: `${(e.title || "").toLowerCase()} ${(e.venue || "").toLowerCase()} ${(e.department || "").toLowerCase()} ${(e.category || "").toLowerCase()}`
    }));
    return enriched;
  }, []);

  const filtered = useMemo(() => {
    const now = new Date();
    let list = [...events];

    if (cat !== "All") list = list.filter((e) => e._cat === cat);

    if (query.trim()) {
      const q = query.toLowerCase().trim();
      list = list.filter((e) => e._q.includes(q));
    }

    if (mode === "upcoming") list = list.filter((e) => e._dt >= now);
    if (mode === "past") list = list.filter((e) => e._dt < now);

    switch (sort) {
      case "date-asc":
        list.sort((a, b) => a._dt - b._dt);
        break;
      case "date-desc":
        list.sort((a, b) => b._dt - a._dt);
        break;
      case "name-asc":
        list.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case "name-desc":
        list.sort((a, b) => b.title.localeCompare(a.title));
        break;
      case "cat-asc":
        list.sort((a, b) => a._cat.localeCompare(b._cat) || a._dt - b._dt);
        break;
      default:
        break;
    }
    return list;
  }, [events, cat, query, sort, mode]);

  useEffect(() => {
    const secs = document.querySelectorAll(".events-page .band");
    const io = new IntersectionObserver(
      (entries) => entries.forEach((en) => en.isIntersecting && en.target.classList.add("band--in")),
      { threshold: 0.12 }
    );
    secs.forEach((s) => io.observe(s));
    setIsReady(true);
    return () => io.disconnect();
  }, []);

  return (
    <div className="events-page">
      <section className="hero-banner" aria-label="Event Catalog">
        <div className="hero-overlay">
          <h1>Event Details / Event Catalog</h1>
          <p>Browse upcoming and past events — filter, sort, and search.</p>
        </div>
      </section>

      <section className="band band--light sticky-controls">
        <div className="container controls">
          <div className="control-row">
            <div className="group">
              <label>Search</label>
              <input
                className="input"
                placeholder="Search by title, venue, department…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>

            <div className="group">
              <label>Category</label>
              <select className="input" value={cat} onChange={(e) => setCat(e.target.value)}>
                {CATS.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div className="group">
              <label>Sort</label>
              <select className="input" value={sort} onChange={(e) => setSort(e.target.value)}>
                {SORTS.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>

            <div className="group modes">
              <label>Show</label>
              <div className="seg">
                {["upcoming", "all", "past"].map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMode(m)}
                    className={`seg-btn ${mode === m ? "active" : ""}`}
                  >
                    {m[0].toUpperCase() + m.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="hint">{filtered.length} result(s)</div>
        </div>
      </section>

      <section className="band band--light">
        <div className="container grid three">
          {filtered.map((ev) => {
            const on = isBookmarked(ev.id);
            return (
              <article key={ev.id} className={`ev-card ${isReady ? "ev-in" : ""}`}>
                <button
                  type="button"
                  className={`bm-btn ${on ? "on" : ""}`}
                  aria-pressed={on}
                  aria-label={on ? "Remove bookmark" : "Add bookmark"}
                  title={on ? "Bookmarked" : "Bookmark"}
                  onClick={() => toggle(ev.id)}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      d="M6 3h12a1 1 0 0 1 1 1v17.2a.8.8 0 0 1-1.27.65L12 18.5l-5.73 3.35A.8.8 0 0 1 5 21.2V4a1 1 0 0 1 1-1z"
                      fill={on ? "currentColor" : "none"}
                      stroke="currentColor"
                      strokeWidth="1.6"
                    />
                  </svg>
                </button>

                <div
                  className="ev-media"
                  style={{ backgroundImage: `url(${cover(ev)})` }}
                />
                <div className="ev-body">
                  <div className="ev-top">
                    <span className={`badge cat ${ev._cat.toLowerCase()}`}>{ev._cat}</span>
                    <span className="badge dept">{ev._dept}</span>
                  </div>

                  <h3 className="ev-title">{ev.title}</h3>
                  <p className="ev-datetime">{ev._range}</p>
                  <p className="ev-venue">Venue: <strong>{ev.venue}</strong></p>
                  <p className="ev-desc">{ev.shortDescription || ev.description}</p>
                </div>

                <div className="ev-actions">
                  <a className="btn tiny" href={`/events/${ev.id}`}>Learn More</a>
                </div>
              </article>
            );
          })}

          {filtered.length === 0 && (
            <p className="muted" style={{ gridColumn: "1 / -1" }}>
              No events found. Try a different filter/search.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
