import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import "../css/bookmarks.css";
import { useBookmarks } from "../context/BookmarkContext.jsx";
import eventsAll from "../data/events.json";
import UseTitle from "../hooks/UseTitle.jsx";

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

const Empty = () => (
  <div className="bm-empty">
    <h2>No bookmarks yet</h2>
    <p className="muted">Tap the bookmark icon on any event card to save it for this session.</p>
    <Link to="/events" className="btn tiny">Browse Events</Link>
  </div>
);

const Card = ({ ev, onRemove }) => {
  const cover =
    ev.image ||
    ev.image1 ||
    ev.image2 ||
    ev.image3 ||
    ev.image4 ||
    "/images/event-placeholder.jpg";
  return (
    <article className="bm-card">
      <div
        className="bm-media"
        style={{ backgroundImage: `url(${cover})` }}
      />
      <div className="bm-body">
        <div className="bm-top">
          <span className={`badge cat ${ev.category?.toLowerCase()}`}>{ev.category}</span>
          <span className="badge dept">{ev.department || "General"}</span>
        </div>
        <h3 className="bm-title">{ev.title}</h3>
        <p className="bm-datetime">{formatRange(ev)}</p>
        <p className="bm-venue">Venue: <strong>{ev.venue}</strong></p>
        <p className="bm-desc">{ev.shortDescription || ev.description}</p>
        <div className="bm-actions">
          <Link className="btn tiny" to={`/events/${ev.id}`}>Open</Link>
          <button type="button" className="btn tiny" onClick={() => onRemove(ev.id)}>Remove</button>
        </div>
      </div>
    </article>
  );
};

const Bookmarks = () => {
  UseTitle("CampusConnect - Bookmarks");
  const { ids, remove, clearAll } = useBookmarks();

  const list = useMemo(() => {
    const set = ids;
    return (eventsAll || [])
      .filter((e) => set.has(e.id))
      .map((e) => ({ ...e, _dt: toDT(e) }))
      .sort((a, b) => a._dt - b._dt);
  }, [ids]);

  return (
    <div className="bookmarks-page">
      <section className="bm-hero" aria-label="Your Bookmarked Events">
        <div className="bm-hero__overlay">
          <h1>Bookmarks</h1>
          <p>Your saved events in one place.</p>
        </div>
      </section>

      <section className="band band--light">
        <div className="container">
          <header className="bm-header">
            <h2>Your Saved Events</h2>
            {list.length > 0 && (
              <button type="button" className="btn tiny" onClick={clearAll}>
                Clear All
              </button>
            )}
          </header>

          {list.length === 0 ? (
            <Empty />
          ) : (
            <section className="bm-grid">
              {list.map((ev) => (
                <Card key={ev.id} ev={ev} onRemove={remove} />
              ))}
            </section>
          )}
        </div>
      </section>
    </div>
  );
};

export default Bookmarks;
