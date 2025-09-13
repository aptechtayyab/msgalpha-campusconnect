import React, { useEffect, useMemo, useState } from "react";
import eventsAll from "../data/events.json";

const cover = (e) =>
  e.image1 || e.image2 || e.image3 || e.image4 || "/images/placeholder.jpg";

export default function UpcomingEvents({ limit = 6 }) {
  const [search, setSearch] = useState("");
  const [dept, setDept] = useState("All");
  const [sort, setSort] = useState("date");

  const toDate = (v) => new Date((v || "").replace(/-/g, "/"));

  const departments = useMemo(() => {
    const set = new Set(eventsAll.map((e) => e.department));
    return ["All", ...Array.from(set)];
  }, []);

  const filtered = useMemo(() => {
    let list = [...eventsAll]
      .filter((e) => toDate(e.date) >= new Date())
      .sort((a, b) => toDate(a.date) - toDate(b.date));

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((e) => (e.title || "").toLowerCase().includes(q));
    }
    if (dept !== "All") list = list.filter((e) => e.department === dept);

    if (sort === "date") list.sort((a, b) => toDate(a.date) - toDate(b.date));
    else if (sort === "name") list.sort((a, b) => (a.title || "").localeCompare(b.title || ""));
    else if (sort === "category") list.sort((a, b) => (a.category || "").localeCompare(b.category || ""));

    return list.slice(0, Math.max(limit, 6));
  }, [search, dept, sort, limit]);

  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const countdown = (dateStr) => {
    const diff = new Date(dateStr).getTime() - now;
    if (diff <= 0) return "Event started!";
    const dd = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hh = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const mm = Math.floor((diff / (1000 * 60)) % 60);
    const ss = Math.floor((diff / 1000) % 60);
    return `${dd}d ${hh}h ${mm}m ${ss}s`;
  };

  return (
    <div className="upcoming-wrap">
      <div className="controls">
        <input
          className="input"
          placeholder="Search events…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select className="input" value={dept} onChange={(e) => setDept(e.target.value)}>
          {departments.map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
        <select className="input" value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="date">Sort by Date</option>
          <option value="name">Sort by Name</option>
          <option value="category">Sort by Category</option>
        </select>
      </div>

      <div className="grid cards">
        {filtered.map((ev) => (
          <article key={ev.id} className="card">
            <img src={cover(ev)} alt={ev.title} className="card-img" />
            <div className="card-body">
              <h3>{ev.title}</h3>
              <p className="meta">{new Date(ev.date).toDateString()} • {ev.department}</p>
              <p className="desc">{ev.description}</p>
              <p className="countdown">{countdown(ev.date)}</p>
              <a href={`/events/${ev.id}`} className="btn tiny">Learn More</a>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
