import React, { useEffect, useMemo, useState } from "react";
export default function Filters({ events = [], onFilter = () => {} }) {
  const [filters, setFilters] = useState({
    category: "All",
    department: "All",
    search: "",
  });
  const [sortBy, setSortBy] = useState("date-asc");

  const categories = useMemo(() => {
    const set = new Set(events.map((e) => (e.category || "").toString()));
    return ["All", ...Array.from(set).filter(Boolean)];
  }, [events]);

  const departments = useMemo(() => {
    const set = new Set(events.map((e) => (e.department || "").toString()));
    return ["All", ...Array.from(set).filter(Boolean)];
  }, [events]);

  useEffect(() => {
    applyFilters();
  }, [events, filters, sortBy]);

  function update(key, value) {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }

  function safeDate(v) {
    const raw = (v || "").replace(/-/g, "/");
    const d = new Date(raw);
    return isNaN(d.getTime()) ? new Date(0) : d;
  }

  function applyFilters() {
    let list = [...events];

    if (filters.category && filters.category !== "All") {
      list = list.filter(
        (e) => (e.category || "").toString() === filters.category
      );
    }
    if (filters.department && filters.department !== "All") {
      list = list.filter(
        (e) => (e.department || "").toString() === filters.department
      );
    }

    if (filters.search?.trim()) {
      const q = filters.search.trim().toLowerCase();
      list = list.filter((e) => {
        const blob = [
          e.title,
          e.description,
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

    list.sort((a, b) => {
      switch (sortBy) {
        case "date-asc":
          return safeDate(a.date || a.startDate) - safeDate(b.date || b.startDate);
        case "date-desc":
          return safeDate(b.date || b.startDate) - safeDate(a.date || a.startDate);
        case "title-asc":
          return (a.title || "").localeCompare(b.title || "");
        case "title-desc":
          return (b.title || "").localeCompare(a.title || "");
        default:
          return 0;
      }
    });

    onFilter(list);
  }

  return (
    <div className="controls" style={{ display: "flex", gap: ".6rem", flexWrap: "wrap" }}>
      <select
        className="input"
        value={filters.category}
        onChange={(e) => update("category", e.target.value)}
      >
        {categories.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>

      <select
        className="input"
        value={filters.department}
        onChange={(e) => update("department", e.target.value)}
      >
        {departments.map((d) => (
          <option key={d} value={d}>
            {d}
          </option>
        ))}
      </select>

      <input
        className="input"
        placeholder="Search events…"
        value={filters.search}
        onChange={(e) => update("search", e.target.value)}
      />

      <select
        className="input"
        aria-label="Sort"
        value={sortBy}
        onChange={(e) => setSortBy(e.target.value)}
      >
        <option value="date-asc">Date ↑</option>
        <option value="date-desc">Date ↓</option>
        <option value="title-asc">Title A–Z</option>
        <option value="title-desc">Title Z–A</option>
      </select>
    </div>
  );
}
