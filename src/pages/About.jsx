import React, { useEffect, useMemo, useState } from "react";
import "../css/about.css";

import events from "../data/events.json";
import sponsors from "../data/sponsors.json";
import contacts from "../data/contacts.json";
import process from "../data/process.json";
import calendar from "../data/calendar.json";
import UseTitle from "../hooks/UseTitle";

export default function About() {
  UseTitle("CampusConnect - About Us")
    const monthCounts = useMemo(() => {
    const arr = Array(12).fill(0);
    events.forEach((e) => {
      const d = new Date((e.date || "").replace(/-/g, "/"));
      if (!isNaN(d)) arr[d.getMonth()] += 1;
    });
    return arr;
  }, []);

  const categories = useMemo(() => {
    const set = new Set();
    events.forEach((e) => e.category && set.add(e.category));
    return Array.from(set);
  }, []);

  const [activeCat, setActiveCat] = useState(categories[0] || "All");

  const eventsByCategory = useMemo(() => {
    const map = {};
    events.forEach((e) => {
      const key = e.category || "General";
      if (!map[key]) map[key] = [];
      map[key].push(e);
    });

    Object.values(map).forEach(list =>
      list.sort((a, b) => new Date(a.date) - new Date(b.date))
    );
    return map;
  }, []);

  useEffect(() => {
    const sections = document.querySelectorAll(".about-page .band");
    const io = new IntersectionObserver(
      (entries) => entries.forEach((en) => en.isIntersecting && en.target.classList.add("band--in")),
      { threshold: 0.12 }
    );
    sections.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, []);

  const total = events.length;
  const departments = new Set(events.map((e) => e.department)).size;
  const organizers = new Set(events.map((e) => e.organizer)).size;

  return (
    <div className="about-page">
      <section className="hero-banner" aria-label="About CampusConnect">
        <div className="hero-overlay">
          <h1>About CampusConnect</h1>
          <p>Traditions, teams, and timelines behind our college events.</p>
        </div>
      </section>

      <section className="band band--light overview">
        <div className="container grid two">
          <div>
            <h2>Who We Are</h2>
            <p>
              <strong>XYZ College of Engineering</strong>, affiliated with <strong>ABC University</strong>, hosts a
              dynamic calendar of technical, cultural, and sports events across the year.
            </p>
            <ul className="ticks">
              <li>NAAC “A” accreditation; inter-college winners</li>
              <li>State-of-the-art labs, auditoriums, and sports arenas</li>
              <li>Vibrant student societies with industry partners</li>
            </ul>
          </div>
          <aside className="callout">
            <h3>Quick Facts</h3>
            <ul>
              <li><span>Location</span>Central City Campus</li>
              <li><span>Affiliation</span>ABC University</li>
              <li><span>Faculties</span>Engineering, Arts, Management</li>
              <li><span>Students</span>5,000+</li>
            </ul>
          </aside>
        </div>
      </section>

      <section className="band band--dark org-bodies">
        <div className="container">
          <h2>Organizing Bodies</h2>
          <p className="muted">The teams behind the experience.</p>
          <div className="grid three cards">
            <article className="card">
              <h3>Student Council</h3>
              <p>Leads flagship events, sponsors outreach, and cross-department coordination.</p>
            </article>
            <article className="card">
              <h3>Departments</h3>
              <p>Host seminars, workshops, exhibitions, and academic competitions.</p>
            </article>
            <article className="card">
              <h3>Clubs & Societies</h3>
              <p>Cultural performances, hackathons, sports leagues, media & photography, and more.</p>
            </article>
          </div>
        </div>
      </section>

      <section className="band band--light annual">
        <div className="container">
          <h2>Key Annual Events</h2>
          <div className="grid three">
            <div className="pillar">
              <h3>Technical</h3>
              <ul className="bullets">
                <li>TechFest (Mar–Apr)</li>
                <li>Hackathon 24h (Jul–Aug)</li>
                <li>Robotics Championship (Oct)</li>
                <li>Project Exhibit (Nov)</li>
              </ul>
            </div>
            <div className="pillar">
              <h3>Cultural</h3>
              <ul className="bullets">
                <li>Annual Day (Jan)</li>
                <li>Music Night (Feb)</li>
                <li>Cultural Week (Aug)</li>
                <li>Drama Night (Nov)</li>
              </ul>
            </div>
            <div className="pillar">
              <h3>Sports & Social</h3>
              <ul className="bullets">
                <li>Inter-College Sports Meet (Sep–Oct)</li>
                <li>Blood Donation Drive (May)</li>
                <li>Alumni Meet (Dec)</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="band band--dark process">
        <div className="container">
          <h2>Our Event Process</h2>
          <p className="muted">Clear stages from idea to impact.</p>

          <div className="process-track" role="list">
            {process.map((s) => (
              <article className="node" key={s.id} role="listitem">
                <div className="dot">
                  <span className="ico" aria-hidden="true">{s.icon}</span>
                </div>
                <h3 className="node-title">{s.title}</h3>
                <p className="node-text">{s.text}</p>
                <span className="node-step">{s.step}</span>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="band band--light timeline">
        <div className="container">
          <h2>Month-wise Timeline</h2>
          <p className="muted">How events are distributed across the year.</p>

          <div className="timeline-wrap">
            {["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"].map((m, i) => {
              const count = monthCounts[i];
              const pct = Math.min(100, count * 18);
              return (
                <div className="tcol" key={m}>
                  <div className="bar" style={{ height: `${Math.max(6, pct)}px` }}>
                    <span className="val">{count}</span>
                  </div>
                  <span className="lbl">{m}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="band band--dark calendar">
        <div className="container">
          <h2>Annual Event Calendar</h2>

          <div className="table-wrap">
            <table className="annual-table" role="table">
              <thead>
                <tr>
                  <th scope="col">Month</th>
                  <th scope="col">Event</th>
                  <th scope="col">Date</th>
                </tr>
              </thead>
              <tbody>
                {calendar.map((m) => {
                  const items = m.items && m.items.length ? m.items : [{ id: `${m.month}-na`, title: "—", date: "—" }];
                  const span = items.length;
                  return items.map((it, idx) => (
                    <tr key={`${m.month}-${it.id}`}>
                      {idx === 0 && (
                        <th scope="row" rowSpan={span} className="month-cell">
                          <span className="month-pill">{m.month}</span>
                        </th>
                      )}
                      <td className="title-cell">
                        <span className="title-badge">{it.title}</span>
                      </td>
                      <td className="date-cell">
                        <span className="date-chip">
                          {it.date !== "—" ? new Date(it.date.replace(/-/g, "/")).toDateString() : "—"}
                        </span>
                      </td>
                    </tr>
                  ));
                })}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="band band--light types">
        <div className="container">
          <h2>What We Host Most</h2>

          <div className="chips">
            {categories.map((cat) => (
              <button
                key={cat}
                className={`chip ${activeCat === cat ? "chip--active" : ""}`}
                onClick={() => setActiveCat(cat)}
                type="button"
              >
                {cat} ({eventsByCategory[cat]?.length || 0})
              </button>
            ))}
          </div>

          <div className="cat-list">
            {(eventsByCategory[activeCat] || []).map((ev) => {
              const d = new Date(ev.date);
              const month = d.toLocaleString("default", { month: "short" });
              return (
                <article key={ev.id} className="cat-item">
                  <div className="cat-date">
                    <span className="m">{month}</span>
                    <span className="d">{d.getDate()}</span>
                  </div>
                  <div className="cat-info">
                    <h3>{ev.title}</h3>
                    <p className="meta">{ev.department} • {ev.venue}</p>
                    <p className="desc">{ev.shortDescription || ev.description}</p>
                  </div>
                  <a className="btn tiny" href={`/events/${ev.id}`}>View</a>
                </article>
              );
            })}
            {(eventsByCategory[activeCat] || []).length === 0 && (
              <p className="muted">No events found in this category yet.</p>
            )}
          </div>
        </div>
      </section>

      <section className="band band--dark stats">
        <div className="container grid four">
          <div className="stat"><strong>{total}</strong><span>Total Events</span></div>
          <div className="stat"><strong>{departments}</strong><span>Departments</span></div>
          <div className="stat"><strong>{organizers}</strong><span>Organizers</span></div>
          <div className="stat"><strong>100%</strong><span>Student-first</span></div>
        </div>
      </section>

      <section className="band band--light partners">
        <div className="container">
          <h2>Our Partners</h2>
          <ul className="logo-row">
            {sponsors.map((s) => (
              <li key={s.id}><img src={s.logo} alt={s.name} /></li>
            ))}
          </ul>
        </div>
      </section>

      <section className="band band--light contact-slice">
        <div className="container grid two">
          <div>
            <h2>Get In Touch</h2>
            <p className="muted">For collaborations or sponsorships, reach out to our key coordinators.</p>
            <ul className="mini-contacts">
              {contacts.slice(0, 3).map((c) => (
                <li key={c.id}>
                  <strong>{c.name}</strong> • <span>{c.role}</span> •{" "}
                  <a href={`mailto:${c.email}`}>{c.email}</a>
                </li>
              ))}
            </ul>
          </div>
          <aside className="cta-card">
            <h3>Join the Experience</h3>
            <p>Showcase your brand or expertise at our flagship events.</p>
            <a href="/registration" className="btn">Register Interest</a>
          </aside>
        </div>
      </section>
    </div>
  );
}
