import React, { useEffect, useMemo, useState } from "react";
import "../css/about.css";
import "../css/eventsCalendar.css";
import events from "../data/events.json";
import calendar from "../data/calendar.json";
import UseTitle from "../hooks/UseTitle";

export default function EventsCalendar() {
    UseTitle("CampusConnect - EventCalendar")
    useEffect(() => {
        const sections = document.querySelectorAll(".about-page .band");
        const io = new IntersectionObserver(
            (entries) => entries.forEach((en) => en.isIntersecting && en.target.classList.add("band--in")),
            { threshold: 0.12 }
        );
        sections.forEach((s) => io.observe(s));
        return () => io.disconnect();
    }, []);

    const monthCounts = useMemo(() => {
        const arr = Array(12).fill(0);
        events.forEach((e) => {
            const d = new Date((e.date || "").replace(/-/g, "/"));
            if (!isNaN(d)) arr[d.getMonth()] += 1;
        });
        return arr;
    }, []);

    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    const availableYears = useMemo(() => {
        const yrs = new Set();
        events.forEach((e) => {
            if (!e.date) return;
            const d = new Date(e.date.replace(/-/g, "/"));
            if (!isNaN(d)) yrs.add(d.getFullYear());
        });
        yrs.add(new Date().getFullYear());
        return Array.from(yrs).sort((a, b) => a - b);
    }, []);

    const [selectedYear, setSelectedYear] = useState(() => {
        const y = new Date().getFullYear();
        return availableYears.includes(y) ? y : availableYears[availableYears.length - 1] || y;
    });

    const palette = [
        "#FEBF08", "#FA6803", "#3B82F6", "#10B981", "#EC4899", "#8B5CF6",
        "#F59E0B", "#F43F5E", "#14B8A6", "#A855F7", "#22C55E", "#2563EB"
    ];

    const eventsByMonth = useMemo(() => {
        const acc = Array.from({ length: 12 }, () => []);
        events.forEach((e) => {
            if (!e.date) return;
            const d = new Date(e.date.replace(/-/g, "/"));
            if (!isNaN(d) && d.getFullYear() === selectedYear) {
                acc[d.getMonth()].push({ title: e.title, day: d.getDate() });
            }
        });
        return acc.map((list) =>
            list
                .sort((a, b) => a.day - b.day)
                .map((ev, i) => ({ ...ev, color: palette[i % palette.length] }))
        );
    }, [selectedYear]);

    const dateColorMap = useMemo(() => {
        const map = new Map();
        eventsByMonth.forEach((list, mIdx) => {
            list.forEach((ev) => {
                const key = `${selectedYear}-${String(mIdx + 1).padStart(2, "0")}-${String(ev.day).padStart(2, "0")}`;
                map.set(key, ev.color);
            });
        });
        return map;
    }, [eventsByMonth, selectedYear]);

    const isLight = (hex) => {
        const h = hex.replace("#", "");
        const r = parseInt(h.slice(0, 2), 16);
        const g = parseInt(h.slice(2, 4), 16);
        const b = parseInt(h.slice(4, 6), 16);
        const L = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
        return L > 0.6;
    };

    const buildMonthGrid = (year, monthIndex) => {
        const first = new Date(year, monthIndex, 1);
        const startDay = first.getDay();
        const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
        const cells = Array(42).fill(null);
        for (let d = 1; d <= daysInMonth; d++) cells[startDay + d - 1] = d;
        return cells;
    };

    return (
        <div className="about-page">
            <section className="hero-banner" aria-label="Event Calendar">
                <div className="hero-overlay">
                    <h1>Event Calendar</h1>
                    <p>Plan ahead with a month-wise view of campus happenings.</p>
                </div>
            </section>

            <section className="band band--light">
                <div className="container grid two">
                    <div>
                        <h2>Your year at a glance</h2>
                        <p>
                            This calendar shows everything scheduled for <strong>{selectedYear}</strong>.
                            Browse the month-wise chart, then scan the table for exact dates.
                            <br /><br />
                            You can browse the month-by-month calendar to quickly see what’s coming up and plan ahead with ease.
                            Alongside the calendar, we’ve included a detailed event table that lists all key activities with their exact dates,
                            making it simple to track and prepare for the events that matter most to you.
                            <br /><br />
                            Whether you want a quick snapshot of the year or a closer look at specific events,
                            this page brings everything together in a clear and organized way.
                        </p>

                    </div>
                    <div>
                        <img src="/images/events-calendar-banner.png" alt="Campus events preview" style={{ width: "100%", borderRadius: 14 }} />
                    </div>
                </div>
            </section>

            <section className="band band--light calcards" aria-label="Calendar Cards">
                <div className="container">
                    <div className="calcards-head">
                        <h2 className="calcards-title">Calendar</h2>
                        <div className="year-select-wrap">
                            <label htmlFor="yearSel" className="muted">Year</label>
                            <select
                                id="yearSel"
                                className="year-select"
                                value={selectedYear}
                                onChange={(e) => setSelectedYear(parseInt(e.target.value, 10))}
                            >
                                {availableYears.map((y) => (
                                    <option key={y} value={y}>{y}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="calcards-grid">
                        {monthNames.map((mName, idx) => {
                            const cells = buildMonthGrid(selectedYear, idx);
                            const legends = eventsByMonth[idx];
                            return (
                                <article className="cal-card" key={`${selectedYear}-${mName}`} aria-label={`${mName} ${selectedYear}`}>
                                    <header className="cal-card__head">
                                        <span className="cal-card__month">{mName}</span>
                                        <span className="cal-card__year">{selectedYear}</span>
                                    </header>

                                    <div className="cal-card__grid cal-card__grid--labels" aria-hidden="true">
                                        <span>Sun</span><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span>
                                    </div>

                                    <div className="cal-card__grid">
                                        {cells.map((d, i) => {
                                            const key = `${selectedYear}-${String(idx + 1).padStart(2, "0")}-${String(d || 0).padStart(2, "0")}`;
                                            const color = d != null ? dateColorMap.get(key) : null;
                                            const style = color
                                                ? { background: color, borderColor: color, color: isLight(color) ? "#111" : "#fff" }
                                                : undefined;
                                            return (
                                                <div
                                                    key={i}
                                                    className={`cal-cell ${d ? "" : "cal-cell--empty"} ${color ? "cal-cell--event" : ""}`}
                                                    style={style}
                                                >
                                                    {d ?? ""}
                                                </div>
                                            );
                                        })}
                                    </div>

                                    <footer className="cal-card__legend">
                                        {legends.length === 0 ? (
                                            <span className="muted">No events</span>
                                        ) : (
                                            <ul className="legend-list">
                                                {legends.map((ev, i) => (
                                                    <li key={`${ev.title}-${i}`}>
                                                        <span className="dot" style={{ background: ev.color }}></span>
                                                        <span className="legend-text">{ev.title}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </footer>
                                </article>
                            );
                        })}
                    </div>
                </div>
            </section>

            <section className="band band--dark timeline">
                <div className="container">
                    <h2>Events per month</h2>
                    <p className="muted">Count of events recorded in each month.</p>
                    <div className="timeline-wrap">
                        {["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].map((m, i) => {
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
                    <h2 style={{ textAlign: "center", marginBottom: 10 }}>EVENTS {selectedYear}</h2>
                </div>
                <div className="container">
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
        </div>
    );
}
