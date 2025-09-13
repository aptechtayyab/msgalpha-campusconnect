import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import "../css/home.css";

import eventsData from "../data/events.json";
import bannersData from "../data/banners.json";
import contacts from "../data/contacts.json";
import testimonials from "../data/testimonials.json";
import news from "../data/news.json";
import sponsors from "../data/sponsors.json";
import faqs from "../data/faqs.json";

import Banner from "../components/Banner.jsx";
import UpcomingEvents from "../components/UpcomingEvents.jsx";
import UseTitle from "../hooks/UseTitle.jsx";

function cover(ev) {
  return ev.image1 || ev.image2 || ev.image3 || ev.image4 || "/images/placeholder.jpg";
}

export default function Home() {
  UseTitle("CampusConnect - Home");

  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [sortBy, setSortBy] = useState("date-asc");
  const [filtered, setFiltered] = useState([]);

  const d = (v) => {
    if (!v) return new Date(NaN);
    const [yy, mm, dd] = String(v).split(/[/-]/).map(Number);
    return new Date(yy, (mm || 1) - 1, dd || 1, 0, 0, 0, 0);
  };

  const categories = useMemo(() => {
    const set = new Set(eventsData.map((e) => (e.category || "").toString()));
    return ["All", ...Array.from(set).filter(Boolean)];
  }, []);

  const departments = useMemo(() => {
    const map = new Map();
    eventsData.forEach((e) => {
      const k = e.department || "General";
      if (!map.has(k)) map.set(k, 0);
      map.set(k, map.get(k) + 1);
    });
    return Array.from(map.entries()).map(([name, count]) => ({ name, count }));
  }, []);

  useEffect(() => {
    let list = [...eventsData];

    if (category !== "All") {
      list = list.filter((e) => (e.category || "") === category);
    }

    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter((e) => {
        const blob = [
          e.title,
          e.description,
          e.shortDescription,
          e.department,
          e.category,
          e.venue,
          e.organizer,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return blob.includes(q);
      });
    }

    if (sortBy === "date-asc") list.sort((a, b) => d(a.date) - d(b.date));
    else if (sortBy === "date-desc") list.sort((a, b) => d(b.date) - d(a.date));
    else if (sortBy === "title-asc") list.sort((a, b) => (a.title || "").localeCompare(b.title || ""));
    else if (sortBy === "title-desc") list.sort((a, b) => (b.title || "").localeCompare(a.title || ""));

    setFiltered(list.slice(0, 12));
  }, [query, category, sortBy]);

  const upcoming = useMemo(() => {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    return [...eventsData]
      .filter((e) => d(e.date) >= startOfToday)
      .sort((a, b) => d(a.date) - d(b.date));
  }, []);

  const nextEvent = upcoming[0];
  const totalEvents = eventsData.length;
  const uniqueDepts = new Set(eventsData.map((e) => e.department)).size;
  const organizers = new Set(eventsData.map((e) => e.organizer)).size;

  return (
    <div className="home-page">
      <section className="section container no-pad">
        <Banner slides={bannersData} />
      </section>

      <section className="section trusted">
        <div className="container">
          <ul className="trusted-logos">
            {sponsors.slice(0, 8).map((s) => (
              <li key={s.id} title={s.name}>
                <img src={s.logo} alt={s.name} loading="lazy" />
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section categories">
        <div className="container">
          <h2>Our Event Categories</h2>
          <p className="muted">Filter by interest and find the perfect event for you.</p>

          <div className="category-pills">
            {categories.map((c) => (
              <button
                key={c}
                className={`pill ${category === c ? "active" : ""}`}
                onClick={() => setCategory(c)}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Explore Events */}
      <section className="section explore">
        <div className="container">
          <div className="explore-head">
            <h2>Explore Events</h2>
            <div className="explore-controls">
              <input
                className="input"
                placeholder="Search title, dept, venue…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <select
                className="input"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="date-asc">Date ↑</option>
                <option value="date-desc">Date ↓</option>
                <option value="title-asc">Title A–Z</option>
                <option value="title-desc">Title Z–A</option>
              </select>
            </div>
          </div>

          <div className="grid cards">
            {filtered.map((ev, i) => (
              <article
                key={ev.id}
                className="card fade-in"
                style={{ animationDelay: `${i * 40}ms` }}
              >
                <img src={cover(ev)} alt={ev.title} className="card-img" />
                <div className="card-body">
                  <h3>{ev.title}</h3>
                  <p className="meta">
                    {ev.date} • {ev.venue}
                  </p>
                  <p className="desc">{ev.shortDescription || ev.description}</p>
                  <a href={`/events/${ev.id}`} className="btn tiny ghost">
                    Learn More
                  </a>
                </div>
              </article>
            ))}
          </div>

          <div className="center">
            <a href="/events" className="btn brand">
              View full catalog
            </a>
          </div>
        </div>
      </section>

      <hr className="section-divider" />

      <section className="section">
        <div className="container">
          <div className="section-head">
            <h2>Upcoming Highlights</h2>
            <p className="muted">Happening soon — plan ahead and register on time.</p>
          </div>
          <UpcomingEvents limit={6} />
        </div>
      </section>

      <hr className="section-divider" />

      <section className="section departments">
        <div className="container">
          <h2>Serving Diverse Departments</h2>
          <div className="grid dept-grid">
            {departments.slice(0, 6).map((dpt, i) => {
              const sample = eventsData.find((e) => e.department === dpt.name);
              return (
                <article
                  key={dpt.name}
                  className="dept-card fade-in"
                  style={{ animationDelay: `${i * 50}ms` }}
                >
                  <img
                    src={(sample && cover(sample)) || "/images/placeholder.jpg"}
                    alt={dpt.name}
                  />
                  <div className="dept-overlay">
                    <h3>{dpt.name}</h3>
                    <span>{dpt.count} events</span>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <hr className="section-divider" />

      <section className="section about-teaser">
        <div className="container about-wrap">
          <div className="about-copy">
            <h2>About CampusConnect</h2>
            <p>
              A centralized portal for students & faculty to browse, bookmark, and experience
              everything the campus has to offer.
            </p>
            <a href="/about" className="btn brand">
              Learn more
            </a>
          </div>

          {nextEvent && (
            <div className="about-card">
              <h3>Next up</h3>
              <p className="next-title">{nextEvent.title}</p>
              <p className="next-meta">
                {nextEvent.date} • {nextEvent.venue}
              </p>
              <p className="muted">{nextEvent.shortDescription || nextEvent.description}</p>
              <a href={`/events/${nextEvent.id}`} className="btn tiny ghost">
                View details
              </a>
            </div>
          )}
        </div>
      </section>

      <hr className="section-divider" />

      <section className="section home-testimonials">
        <div className="container">
          <h2>Testimonials</h2>
          <div className="hfb-row">
            {testimonials.slice(0, 3).map((t, i) => (
              <article
                className="hfb-card fade-in"
                key={t.id || i}
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <div className="hfb-avatar-wrap">
                  <img
                    className="hfb-avatar"
                    src={t.avatar || "/images/profile-pic.png"}
                    alt={t.name}
                  />
                </div>
                <div className="hfb-quote">
                  <span className="hfb-ql">“</span>
                  <p>{t.quote}</p>
                  <span className="hfb-qr">”</span>
                </div>
                <div className="hfb-person">
                  <strong className="hfb-name">{t.name}</strong>
                  <div className="hfb-role">{t.role}</div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <hr className="section-divider" />

      <section className="section news">
        <div className="container">
          <h2>Latest News & Articles</h2>
          <ul className="news-list">
            {news.map((n, i) => (
              <li
                key={n.id}
                className="news-item fade-in"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <img src={n.image} alt={n.title} />
                <div className="news-copy">
                  <h3>
                    <Link to={`/news/${n.id}`}>{n.title}</Link>
                  </h3>
                  <p className="news-excerpt">{n.excerpt}</p>
                  <p className="news-meta">
                    {n.date} • {n.read} min read
                  </p>
                </div>
                <Link className="btn tiny ghost" to={`/news/${n.id}`}>
                  Read more
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <hr className="section-divider" />

      <section className="section faq">
        <div className="container">
          <h2>Frequently Asked Questions</h2>
          {faqs.map((f) => (
            <details key={f.id} className="faq-item">
              <summary>{f.q}</summary>
              <p>{f.a}</p>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}
