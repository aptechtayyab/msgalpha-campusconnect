import React, { useEffect, useMemo, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import "../css/gallery.css";
import eventsData from "../data/events.json";
import UseTitle from "../hooks/UseTitle";

function getAcademicYear(dateStr) {
    const d = new Date(dateStr);
    const y = d.getFullYear();
    const m = d.getMonth() + 1;
    const start = m >= 7 ? y : y - 1;
    const endShort = String((start + 1)).slice(-2);
    return { key: start, label: `${start}–${endShort}` };
}

export default function Gallery() {
    UseTitle("CampusConnect - Gallery")
    const [events, setEvents] = useState([]);

    const [groupBy, setGroupBy] = useState("year");
    const [selectedYearKey, setSelectedYearKey] = useState("All");
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [search, setSearch] = useState("");

    const [cardImageIndex, setCardImageIndex] = useState({});

    const [lbOpen, setLbOpen] = useState(false);
    const [activeEventIdx, setActiveEventIdx] = useState(0);
    const [activeImgIdx, setActiveImgIdx] = useState(0);

    const location = useLocation();

    useEffect(() => {
        setEvents(eventsData);
    }, []);

    const normalized = useMemo(() => {
        return events.map((ev) => {
            const imgs = [];
            for (let i = 1; i <= 4; i++) {
                const k = `image${i}`;
                if (ev[k]) imgs.push(ev[k]);
            }
            if (!imgs.length && ev.image) imgs.push(ev.image);
            const ay = getAcademicYear(ev.date);
            return { ...ev, _images: imgs, _ayKey: ay.key, _ayLabel: ay.label };
        });
    }, [events]);

    const yearOptions = useMemo(() => {
        const map = new Map();
        normalized.forEach((e) => map.set(e._ayKey, e._ayLabel));
        const arr = Array.from(map.entries())
            .sort((a, b) => b[0] - a[0])
            .map(([key, label]) => ({ key, label }));
        return [{ key: "All", label: "All Years" }, ...arr];
    }, [normalized]);

    const categoryOptions = useMemo(() => {
        const set = new Set(normalized.map((e) => e.category).filter(Boolean));
        const arr = Array.from(set).sort((a, b) => String(a).localeCompare(String(b)));
        return ["All", ...arr];
    }, [normalized]);

    const filtered = useMemo(() => {
        let list = [...normalized];

        if (selectedYearKey !== "All") {
            list = list.filter((e) => String(e._ayKey) === String(selectedYearKey));
        }
        if (selectedCategory !== "All") {
            list = list.filter((e) => e.category === selectedCategory);
        }
        if (search.trim()) {
            const q = search.toLowerCase();
            list = list.filter(
                (e) =>
                    e.title.toLowerCase().includes(q) ||
                    (e.description || "").toLowerCase().includes(q) ||
                    (e.department || "").toLowerCase().includes(q) ||
                    (e.location || "").toLowerCase().includes(q)
            );
        }

        list.sort((a, b) => {
            if (b._ayKey !== a._ayKey) return b._ayKey - a._ayKey;
            return String(a.title).localeCompare(String(b.title));
        });

        return list;
    }, [normalized, selectedYearKey, selectedCategory, search]);

    const grouped = useMemo(() => {
        const map = new Map();
        if (groupBy === "year") {
            for (const e of filtered) {
                const key = e._ayKey;
                const label = e._ayLabel;
                if (!map.has(key)) map.set(key, { label, items: [] });
                map.get(key).items.push(e);
            }
            return Array.from(map.entries())
                .sort((a, b) => b[0] - a[0])
                .map(([, v]) => v);
        } else {
            for (const e of filtered) {
                const key = e.category || "General";
                if (!map.has(key)) map.set(key, { label: key, items: [] });
                map.get(key).items.push(e);
            }
            return Array.from(map.values()).sort((a, b) =>
                String(a.label).localeCompare(String(b.label))
            );
        }
    }, [filtered, groupBy]);

    const filteredFlat = filtered;

    function lockScroll() {
        document.body.classList.add("no-scroll");
        document.documentElement.classList.add("no-scroll");
    }
    function unlockScroll() {
        document.body.classList.remove("no-scroll");
        document.documentElement.classList.remove("no-scroll");
    }

    function cardNext(ev) {
        const imgs = ev._images || [];
        if (!imgs.length) return;
        setCardImageIndex((prev) => {
            const cur = prev[ev.id] ?? 0;
            return { ...prev, [ev.id]: (cur + 1) % imgs.length };
        });
    }
    function cardPrev(ev) {
        const imgs = ev._images || [];
        if (!imgs.length) return;
        setCardImageIndex((prev) => {
            const cur = prev[ev.id] ?? 0;
            return { ...prev, [ev.id]: (cur - 1 + imgs.length) % imgs.length };
        });
    }

    function openLightboxByEvent(ev, imgIdx = 0) {
        const idx = filteredFlat.findIndex((x) => x.id === ev.id);
        if (idx < 0) return;
        setActiveEventIdx(idx);
        setActiveImgIdx(imgIdx);
        setLbOpen(true);
        lockScroll();
    }
    function closeLightbox() {
        setLbOpen(false);
        unlockScroll();
    }

    useEffect(() => () => unlockScroll(), []);
    useEffect(() => {
        if (lbOpen) closeLightbox();
    }, [location.pathname]);

    useEffect(() => {
        if (!lbOpen) return;
        const onKey = (e) => {
            if (e.key === "Escape") closeLightbox();
            if (e.key === "ArrowRight") nextImg();
            if (e.key === "ArrowLeft") prevImg();
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [lbOpen, activeEventIdx, activeImgIdx, filteredFlat]);

    function nextImg() {
        const imgs = filteredFlat[activeEventIdx]?._images || [];
        if (!imgs.length) return;
        setActiveImgIdx((i) => (i + 1) % imgs.length);
    }
    function prevImg() {
        const imgs = filteredFlat[activeEventIdx]?._images || [];
        if (!imgs.length) return;
        setActiveImgIdx((i) => (i - 1 + imgs.length) % imgs.length);
    }

    useEffect(() => {
        if (!filteredFlat.length) {
            setLbOpen(false);
            unlockScroll();
        } else if (activeEventIdx > filteredFlat.length - 1) {
            setActiveEventIdx(0);
            setActiveImgIdx(0);
        }
    }, [filteredFlat.length]);

    return (
        <div className="gallery-page">
            <section className="gal-hero">
                <div className="gal-overlay">
                    <h1>Event Gallery</h1>
                    <p className="muted">Grouped by academic year (e.g., 2024–25) or category.</p>
                </div>
            </section>

            <div className="gal-controls">
                <div className="container">
                    <div className="ctrl-row">
                        <div className="group">
                            <label>Search</label>
                            <input
                                className="input"
                                placeholder="Search by title, department, location..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>

                        <div className="group">
                            <label>Filter</label>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                                <select
                                    className="input"
                                    value={selectedYearKey}
                                    onChange={(e) => setSelectedYearKey(e.target.value)}
                                >
                                    {yearOptions.map((o) => (
                                        <option key={o.key} value={o.key}>
                                            {o.label}
                                        </option>
                                    ))}
                                </select>

                                <select
                                    className="input"
                                    value={selectedCategory}
                                    onChange={(e) => setSelectedCategory(e.target.value)}
                                >
                                    {categoryOptions.map((c) => (
                                        <option key={c} value={c}>
                                            {c === "All" ? "All Categories" : c}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="group">
                            <label>Group by</label>
                            <div className="seg">
                                <button
                                    className={`seg-btn ${groupBy === "year" ? "active" : ""}`}
                                    onClick={() => setGroupBy("year")}
                                >
                                    Year
                                </button>
                                <button
                                    className={`seg-btn ${groupBy === "category" ? "active" : ""}`}
                                    onClick={() => setGroupBy("category")}
                                >
                                    Category
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="group hint">Tip: July–June academic year (e.g., 2024–25).</div>
                </div>
            </div>

            <div className="container" style={{ padding: "24px 0 40px" }}>
                {grouped.map((group) => (
                    <section key={group.label} style={{ marginBottom: 28 }}>
                        <h2 className="group-title">{group.label}</h2>
                        <div className="grid three">
                            {group.items.map((ev) => {
                                const imgs = ev._images;
                                const curIdx = cardImageIndex[ev.id] ?? 0;
                                const currentSrc = imgs[curIdx] || imgs[0];

                                return (
                                    <article key={ev.id} className="gal-card">
                                        <div className="gal-thumb-row single">
                                            {imgs.length > 1 && (
                                                <button
                                                    className="card-nav left"
                                                    onClick={() => cardPrev(ev)}
                                                    aria-label="Previous photo"
                                                >
                                                    ‹
                                                </button>
                                            )}

                                            <button
                                                className="thumb card-slide"
                                                style={{ backgroundImage: `url(${currentSrc})` }}
                                                onClick={() => openLightboxByEvent(ev, curIdx)}
                                                aria-label={`Open ${ev.title} image`}
                                            />

                                            {imgs.length > 1 && (
                                                <button
                                                    className="card-nav right"
                                                    onClick={() => cardNext(ev)}
                                                    aria-label="Next photo"
                                                >
                                                    ›
                                                </button>
                                            )}
                                        </div>

                                        <div className="gal-body">
                                            <div className="top">
                                                <span className={`badge cat ${String(ev.category).toLowerCase()}`}>
                                                    {ev.category || "General"}
                                                </span>
                                                <span className="badge year">{ev._ayLabel}</span>
                                                {ev.department ? <span className="badge dept">{ev.department}</span> : null}
                                            </div>

                                            <h3 className="title">{ev.title}</h3>
                                            {ev.location ? <p className="meta">{ev.location}</p> : null}

                                            <div className="actions">
                                                <button
                                                    className="btn tiny"
                                                    onClick={() => openLightboxByEvent(ev, cardImageIndex[ev.id] ?? 0)}
                                                >
                                                    View Photos
                                                </button>

                                                <Link to={`/events/${ev.id}`} className="btn tiny outline">
                                                    View Event
                                                </Link>
                                            </div>
                                        </div>
                                    </article>
                                );
                            })}
                        </div>
                    </section>
                ))}
            </div>

            {lbOpen && filteredFlat[activeEventIdx] && (
                <div className="lb-backdrop" onClick={closeLightbox}>
                    <div className="lb-stage" onClick={(e) => e.stopPropagation()}>
                        <button className="lb-prev" onClick={prevImg} aria-label="Previous image">‹</button>
                        <img
                            className="lb-img"
                            src={filteredFlat[activeEventIdx]._images[activeImgIdx]}
                            alt={filteredFlat[activeEventIdx].title}
                        />
                        <button className="lb-next" onClick={nextImg} aria-label="Next image">›</button>
                        <button className="lb-x" onClick={closeLightbox} aria-label="Close">✕</button>
                    </div>
                </div>
            )}
        </div>
    );
}
