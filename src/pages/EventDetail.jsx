import React, { useMemo } from "react";
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
  return (
    <div className="event-detail">
      <section
        className="hero"
        style={{
          backgroundImage: `url(${heroImg})`,
        }}
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
                    <a key={idx} href={src} className="gallery-item" target="_blank" rel="noreferrer">
                      <img src={src} alt={`${event.title} photo ${idx + 1}`} loading="lazy" />
                    </a>
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
                <li><a href="/registration">Register Interest</a></li>
                <li><a href="/about">About the College</a></li>
                <li><Link to="/events">Browse All Events</Link></li>
              </ul>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}
