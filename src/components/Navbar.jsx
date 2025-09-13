import React, { useRef, useState } from "react";
import { Link } from "react-router-dom";
import "../css/navbar.css";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [submenuOpen, setSubmenuOpen] = useState(false);
  const closeTimer = useRef(null);

  const closeAll = () => {
    setOpen(false);
    setSubmenuOpen(false);
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  };

  const openSubmenu = () => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
    setSubmenuOpen(true);
  };

  const scheduleCloseSubmenu = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => {
      setSubmenuOpen(false);
      closeTimer.current = null;
    }, 250);
  };

  return (
    <nav className="navbar" role="navigation" aria-label="Main Navigation">
      <div className="logo">
        <Link to="/" onClick={closeAll} className="logo-link" aria-label="CampusConnect Home">
          <span className="logo-mark"><img src="./logo.png" width={50} alt="" /></span>
          <span>CampusConnect</span>
        </Link>
      </div>

      <button
        className={`toggle ${open ? "open" : ""}`}
        onClick={() => setOpen((v) => !v)}
        aria-label="Toggle menu"
        aria-expanded={open ? "true" : "false"}
        aria-controls="primary-nav"
        type="button"
      >
        <span className="bar" />
        <span className="bar" />
        <span className="bar" />
      </button>

      <ul id="primary-nav" className={`nav-links ${open ? "open" : ""}`}>
        <li><Link to="/" onClick={closeAll}>Home</Link></li>
        <li><Link to="/about" onClick={closeAll}>About Us</Link></li>
        <li><Link to="/events" onClick={closeAll}>Event Details</Link></li>
        <li><Link to="/calendar" onClick={closeAll}>Event Calendar</Link></li>
        <li><Link to="/gallery" onClick={closeAll}>Gallery</Link></li>
        <li><Link to="/feedback" onClick={closeAll}>Feedback</Link></li>
        <li><Link to="/bookmarks" onClick={closeAll}>Bookmarks</Link></li>
        <li><Link to="/contact" onClick={closeAll}>Contact Us</Link></li>

        <li className="hide-on-desktop mobile-bottom">
          <Link to="/registration" className="cta" onClick={closeAll}>Registration</Link>
        </li>
      </ul>

      <div className="nav-cta">
        <Link to="/registration" className="cta">Registration</Link>
      </div>
    </nav>
  );
}
