import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../css/banner.css";

const NAME_KEY = "cc_user_name";
const ROLE_KEY = "cc_user_role";

const ROLE_LABELS = {
  student: "Student",
  staff: "Staff",
  guest: "Guest",
};

function readUser() {
  const rawName = localStorage.getItem(NAME_KEY) || "";
  const roleId = localStorage.getItem(ROLE_KEY) || "";
  const name = rawName.trim();
  const role = ROLE_LABELS[roleId] || "";
  return { name, role };
}

export default function Banner({ slides }) {
  const [banners, setBanners] = useState(Array.isArray(slides) ? slides : []);
  const [idx, setIdx] = useState(0);
  const [user, setUser] = useState(readUser());

  useEffect(() => {
    if (Array.isArray(slides) && slides.length) {
      setBanners(slides);
      return;
    }
    fetch("/data/banners.json")
      .then((r) => r.json())
      .then((d) => setBanners(Array.isArray(d) ? d : []))
      .catch(() => {});
  }, [slides]);

  useEffect(() => {
    const update = () => setUser(readUser());
    update();
    const onCustom = () => update();
    window.addEventListener("cc-user-updated", onCustom);
    return () => window.removeEventListener("cc-user-updated", onCustom);
  }, []);

  useEffect(() => {
    setUser(readUser());
  }, [idx]);

  useEffect(() => {
    if (!banners.length || banners.length < 2) return;
    const t = setTimeout(() => setIdx((p) => (p + 1) % banners.length), 6000);
    return () => clearTimeout(t);
  }, [idx, banners.length]);

  if (!banners.length) return null;

  return (
    <section className="banner-split">
      {banners.map((b, i) => {
        const isFirst = i === 0;
        const showGreeting =
          isFirst && user.name
            ? `Welcome ${user.name}${user.role ? ` (${user.role})` : ""} to CampusConnect`
            : null;

        return (
          <div key={b.id || i} className={`bs-slide ${i === idx ? "on" : ""}`}>
            <div className="bs-left">
              <div className="bs-glass">
                <p className="bs-eyebrow">Welcome to CampusConnect</p>
                <h2 className="bs-title">
                  {showGreeting || b.caption || "Stay Updated, Stay Involved!"}
                </h2>
                <p className="bs-sub">Event Hub – discover tech fests, cultural nights and more.</p>
                <Link to="/events" className="bs-cta">Explore Events</Link>
              </div>
            </div>
            <div className="bs-right">
              <img src={b.image} alt={b.caption || "Campus banner"} />
            </div>
          </div>
        );
      })}

      <div className="bs-dots" aria-label="Banner pagination">
        {banners.map((_, i) => (
          <button
            key={i}
            className={`bs-dot ${i === idx ? "active" : ""}`}
            onClick={() => setIdx(i)}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
