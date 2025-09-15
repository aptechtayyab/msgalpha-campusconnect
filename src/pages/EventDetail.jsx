import React, { useMemo, useEffect, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import "../css/EventDetail.css";
import events from "../data/events.json";
import UseTitle from "../hooks/UseTitle";

function toDT(ev) {
  const dateStr = ev.date?.replace(/-/g, "/") || "";
  if (ev.startTime) return new Date(`${dateStr} ${ev.startTime}`);
  return new Date(dateStr);
}

function formatRange(ev) {
  const d = new Date(ev.date?.replace(/-/g, "/"));
  if (isNaN(d)) return ev.date || "";
  const dd = d.toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" });
  const t1 = ev.startTime ? new Date(`${ev.date} ${ev.startTime}`) : null;
  const t2 = ev.endTime ? new Date(`${ev.date} ${ev.endTime}`) : null;
  const fmt = (x) => x?.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }).replace(" ", "");
  if (t1 && t2) return `${dd}, ${fmt(t1)} – ${fmt(t2)}`;
  if (t1) return `${dd}, ${fmt(t1)}`;
  return dd;
}

export default function EventDetail() {
  const { id } = useParams();

  const event = useMemo(() => {
    const byNum = events.find((e) => String(e.id) === String(id));
    if (byNum) return byNum;
    return events.find((e) => (e.slug ? String(e.slug) : "") === String(id));
  }, [id]);

  UseTitle(event ? `CampusConnect - ${event.title}` : "CampusConnect - Event Details");

  if (!event) {
    return (
      <div className="event-detail">
        <div className="container">
          <div className="not-found">
            <h1>Event not found</h1>
            <p>We couldn’t find details for this event.</p>
            <div className="actions">
              <Link className="btn" to="/events">Back to Events</Link>
              <Link className="btn ghost" to="/">Go Home</Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const when = formatRange(event);
  const dt = toDT(event);
  const images = [event.image1, event.image2, event.image3, event.image4]
    .filter(Boolean)
    .filter((v, i, a) => a.indexOf(v) === i);
  const heroImg = images[0] || "/images/event-placeholder.jpg";
  const long = event.longDescription || event.description || "";

  const [lbOpen, setLbOpen] = useState(false);
  const [lbIndex, setLbIndex] = useState(0);

  const openAt = useCallback((i) => {
    setLbIndex(i);
    setLbOpen(true);
  }, []);

  const closeLb = useCallback(() => setLbOpen(false), []);

  const prev = useCallback(() => {
    setLbIndex((p) => (p - 1 + images.length) % images.length);
  }, [images.length]);

  const next = useCallback(() => {
    setLbIndex((p) => (p + 1) % images.length);
  }, [images.length]);

  useEffect(() => {
    if (!lbOpen) return;
    const onKey = (e) => {
      if (e.key === "Escape") closeLb();
      else if (e.key === "ArrowLeft") prev();
      else if (e.key === "ArrowRight") next();
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [lbOpen, closeLb, prev, next]);

  return (
    <div className="event-detail">
      <section
        className="hero"
        style={{ backgroundImage: `url(${heroImg})` }}
        aria-label={event.title}
      >
        <div className="shade">
          <div className="hero-inner container">
            <div className="badges">
              <span className={`badge cat ${String(event.category || "").toLowerCase()}`}>{event.category}</span>
              {event.department && <span className="badge dept">{event.department}</span>}
            </div>
            <h1>{event.title}</h1>
            <p className="when">{when}</p>
            {event.venue && <p className="where">Venue: <strong>{event.venue}</strong></p>}
            <div className="hero-actions">
              <Link className="btn" to="/events">Back to Events</Link>
              <a className="btn ghost" href="#details">Jump to Details</a>
            </div>
          </div>
        </div>
      </section>

      <section id="details" className="band band--light">
        <div className="container grid two">
          <article className="content">
            <h2>About this event</h2>
            <p className="lead">{event.shortDescription || ""}</p>
            {long && <p>{long}</p>}

            {images.length > 0 && (
              <>
                <h3 className="gallery-title">Image Gallery</h3>
                <div className="gallery">
                  {images.map((src, idx) => (
                    <button
                      key={idx}
                      type="button"
                      className="gallery-item"
                      onClick={() => openAt(idx)}
                      aria-label={`Open image ${idx + 1} of ${images.length}`}
                    >
                      <img src={src} alt={`${event.title} photo ${idx + 1}`} loading="lazy" />
                    </button>
                  ))}
                </div>
              </>
            )}

            <div className="info-cards">
              <div className="info">
                <span className="lbl">Date & Time</span>
                <span className="val">{when}</span>
              </div>
              {event.organizer && (
                <div className="info">
                  <span className="lbl">Organizer</span>
                  <span className="val">{event.organizer}</span>
                </div>
              )}
              {event.location && (
                <div className="info">
                  <span className="lbl">Location</span>
                  <span className="val">{event.location}</span>
                </div>
              )}
              {event.department && (
                <div className="info">
                  <span className="lbl">Department</span>
                  <span className="val">{event.department}</span>
                </div>
              )}
              {event.category && (
                <div className="info">
                  <span className="lbl">Category</span>
                  <span className="val">{event.category}</span>
                </div>
              )}
            </div>
          </article>

          <aside className="sidebar">
            <div className="card">
              <h3>Quick Links</h3>
              <ul>
                <li><Link to="/registration">Register Interest</Link></li>
                <li><Link to="/about">About the College</Link></li>
                <li><Link to="/events">Browse All Events</Link></li>
              </ul>
            </div>
          </aside>
        </div>
      </section>

      {lbOpen && images.length > 0 && (
        <div
          className="ed-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label="Image gallery"
          onClick={closeLb}
        >
          <div className="ed-lb-body" onClick={(e) => e.stopPropagation()}>
            <button className="ed-lb-close" type="button" onClick={closeLb} aria-label="Close">✕</button>
            {images.length > 1 && (
              <>
                <button className="ed-lb-prev" type="button" onClick={prev} aria-label="Previous image">‹</button>
                <button className="ed-lb-next" type="button" onClick={next} aria-label="Next image">›</button>
                <div className="ed-lb-counter">{lbIndex + 1} / {images.length}</div>
              </>
            )}
            <img className="ed-lb-img" src={images[lbIndex]} alt={`${event.title} large image`} />
          </div>
        </div>
      )}
    </div>
  );
}
