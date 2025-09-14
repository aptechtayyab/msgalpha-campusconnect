import { useEffect, useMemo, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "../css/Contact.css";
import directory from "../data/coordinators.json";
import UseTitle from "../hooks/UseTitle";

const DEFAULT_CENTER = [24.8607, 67.0011];
const DEFAULT_ZOOM = 13;

const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const initialForm = {
  name: "",
  email: "",
  phone: "",
  subject: "",
  category: "General",
  message: "",
  preferred: "Email",
};

export default function Contact() {
  UseTitle("CampusConnect - Contact Us")
  const [form, setForm] = useState(initialForm);
  const [touched, setTouched] = useState({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [faculty] = useState(Array.isArray(directory?.faculty) ? directory.faculty : []);
  const [students] = useState(Array.isArray(directory?.students) ? directory.students : []);

  useEffect(() => setMounted(true), []);

  const limits = { nameMin: 3, nameMax: 60, subjectMin: 5, subjectMax: 120, messageMin: 20, messageMax: 2000 };
  const errors = useMemo(() => validate(form, limits), [form]);
  const isValid = Object.keys(errors).length === 0;

  function validate(values, lim) {
    const e = {};
    const trim = (s) => s.replace(/\s+/g, " ").trim();
    const name = trim(values.name);
    if (!name) e.name = "Please enter your full name.";
    else if (name.length < lim.nameMin) e.name = `Name must be at least ${lim.nameMin} characters.`;
    else if (name.length > lim.nameMax) e.name = `Name must be under ${lim.nameMax} characters.`;
    else if (!/^[A-Za-zÀ-ÖØ-öø-ÿ' -]+$/.test(name)) e.name = "Use letters, spaces, apostrophes, or hyphens only.";
    const email = trim(values.email);
    if (!email) e.email = "Please enter your email.";
    else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email) || /\.\./.test(email))
      e.email = "Enter a valid email address.";
    const phone = trim(values.phone);
    if (phone) {
      const plain = phone.replace(/[^\d+]/g, "");
      const e164ok = /^\+?[1-9]\d{7,14}$/.test(plain);
      const localOk = /^[+\d]?(?:[\d\s().-]){7,}$/.test(phone);
      if (!(e164ok || localOk)) e.phone = "Enter a valid phone number (e.g., +923001234567).";
    }
    const subject = trim(values.subject);
    if (!subject) e.subject = "Please enter a subject.";
    else if (subject.length < lim.subjectMin) e.subject = `Subject must be at least ${lim.subjectMin} characters.`;
    else if (subject.length > lim.subjectMax) e.subject = `Subject must be under ${lim.subjectMax} characters.`;
    const message = trim(values.message);
    if (!message) e.message = "Please enter your message.";
    else if (message.length < lim.messageMin) e.message = `Message must be at least ${lim.messageMin} characters.`;
    else if (message.length > lim.messageMax) e.message = `Message must be under ${lim.messageMax} characters.`;
    if (!["Email", "Phone"].includes(values.preferred)) e.preferred = "Choose how we should contact you.";
    if (values.preferred === "Phone" && !phone) e.preferred = "Phone number required if you prefer phone contact.";
    return e;
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleBlur(e) {
    setTouched((prev) => ({ ...prev, [e.target.name]: true }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    setTouched({
      name: true, email: true, phone: true, subject: true,
      category: true, message: true, preferred: true,
    });
    if (!isValid) return;
    setForm(initialForm);
    setShowSuccess(true);
  }

  const subjectCount = form.subject.trim().length;
  const messageCount = form.message.trim().length;

  return (
    <div className="contact-page">
      <section className="contact-hero">
        <div className="hero-overlay" />
        <div className="hero-inner">
          <h1>Contact Us</h1>
          <p>We’re here to answer your questions and support your journey.</p>
        </div>
      </section>

      <div className="contact-grid">
        <section className="contact-card form-card">
          <h2 className="card-title">Send a Message</h2>
          <form className="contact-form" onSubmit={handleSubmit} noValidate>
            <div className="form-row">
              <div className={`field ${touched.name && errors.name ? "has-error" : ""}`}>
                <label htmlFor="name">Name</label>
                <input id="name" name="name" type="text" placeholder="e.g., Ayesha Khan"
                  value={form.name} onChange={handleChange} onBlur={handleBlur}
                  autoComplete="name" aria-invalid={touched.name && !!errors.name} />
                {touched.name && errors.name && <div className="error">{errors.name}</div>}
              </div>
              <div className={`field ${touched.email && errors.email ? "has-error" : ""}`}>
                <label htmlFor="email">Email</label>
                <input id="email" name="email" type="email" placeholder="e.g., ayesha.khan@example.com"
                  value={form.email} onChange={handleChange} onBlur={handleBlur}
                  autoComplete="email" aria-invalid={touched.email && !!errors.email} />
                {touched.email && errors.email && <div className="error">{errors.email}</div>}
              </div>
            </div>
            <div className="form-row">
              <div className={`field ${touched.phone && errors.phone ? "has-error" : ""}`}>
                <label htmlFor="phone">Phone (optional)</label>
                <input id="phone" name="phone" type="tel" placeholder="+92 300 1234567"
                  value={form.phone} onChange={handleChange} onBlur={handleBlur}
                  autoComplete="tel" aria-invalid={touched.phone && !!errors.phone} />
                {touched.phone && errors.phone && <div className="error">{errors.phone}</div>}
              </div>
              <div className="field">
                <label htmlFor="category">Category</label>
                <select id="category" name="category" value={form.category} onChange={handleChange} onBlur={handleBlur}>
                  <option>General</option>
                  <option>Support</option>
                  <option>Admissions</option>
                  <option>Partnerships</option>
                  <option>Events</option>
                </select>
              </div>
            </div>
            <div className={`field ${touched.subject && errors.subject ? "has-error" : ""}`}>
              <label htmlFor="subject">Subject</label>
              <input id="subject" name="subject" type="text" placeholder="Briefly describe your request"
                value={form.subject} onChange={handleChange} onBlur={handleBlur}
                aria-invalid={touched.subject && !!errors.subject} />
              <div className="counter-row">
                <span className="hint">{limits.subjectMin}–{limits.subjectMax} chars</span>
                <span className={`counter ${subjectCount > limits.subjectMax ? "over" : ""}`}>
                  {subjectCount}/{limits.subjectMax}
                </span>
              </div>
              {touched.subject && errors.subject && <div className="error">{errors.subject}</div>}
            </div>
            <div className={`field ${touched.message && errors.message ? "has-error" : ""}`}>
              <label htmlFor="message">Message</label>
              <textarea id="message" name="message" rows={7}
                placeholder="Provide details (min. 20 characters)…"
                className="white-textarea"
                style={{ background: "#fff", color: "#111827" }}
                value={form.message} onChange={handleChange} onBlur={handleBlur}
                aria-invalid={touched.message && !!errors.message} />
              <div className="counter-row">
                <span className="hint">{limits.messageMin}–{limits.messageMax} chars</span>
                <span className={`counter ${messageCount > limits.messageMax ? "over" : ""}`}>
                  {messageCount}/{limits.messageMax}
                </span>
              </div>
              {touched.message && errors.message && <div className="error">{errors.message}</div>}
            </div>
            <div className="radio-row">
              <span className="label">Preferred contact</span>
              <label className="radio">
                <input type="radio" name="preferred" value="Email"
                  checked={form.preferred === "Email"} onChange={handleChange} onBlur={handleBlur} />
                <span>Email</span>
              </label>
              <label className="radio">
                <input type="radio" name="preferred" value="Phone"
                  checked={form.preferred === "Phone"} onChange={handleChange} onBlur={handleBlur} />
                <span>Phone</span>
              </label>
              {touched.preferred && errors.preferred && <div className="error">{errors.preferred}</div>}
            </div>
            <div className="contact-actions">
              <button type="submit" className={`reg-btn primary ${!isValid ? "disabled" : ""}`} disabled={!isValid}>
                Send Message
              </button>
            </div>
          </form>
        </section>

        <aside className="contact-aside">
          <div className="contact-card info-card">
            <h3 className="card-title">Contact Us</h3>
            <p className="info-muted">Have questions about events or need assistance? Reach out to our team—we’re here to help.</p>
            <div className="info-row">
              <div className="info-icon" aria-hidden="true"></div>
              <div className="info-body">
                <div className="info-label">Email Address</div>
                <a href="mailto:info@campusconnect.edu" className="info-link">info@campusconnect.edu</a>
              </div>
            </div>
            <div className="info-row">
              <div className="info-icon" aria-hidden="true"></div>
              <div className="info-body">
                <div className="info-label">Phone Number</div>
                <a href="tel:+922112345678" className="info-link">+92 21 12345678</a>
              </div>
            </div>
          </div>

          <div className="map-card contact-card">
            <h3 className="card-title">Find us</h3>
            <div className="map-wrap" aria-label="Campus map">
              {mounted && (
                <MapContainer center={DEFAULT_CENTER} zoom={DEFAULT_ZOOM}
                  scrollWheelZoom={false} className="leaflet-map">
                  <TileLayer attribution="&copy; OpenStreetMap contributors"
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <Marker icon={markerIcon} position={DEFAULT_CENTER}>
                    <Popup>CampusConnect HQ<br/>Karachi, PK</Popup>
                  </Marker>
                </MapContainer>
              )}
            </div>
            <ul className="address">
              <li><strong>Address:</strong> University Road, Karachi 75270</li>
              <li><strong>Email:</strong> info@campusconnect.edu</li>
              <li><strong>Phone:</strong> +92 21 12345678</li>
              <li><strong>Hours:</strong> Mon–Fri, 9:00–17:00 PKT</li>
            </ul>
          </div>
        </aside>
      </div>

      <section className="team-section contact-card">
        <h3 className="card-title">Organizing Team</h3>
        <h4 className="section-heading">Faculty</h4>
        <div className="team-row">
          {faculty.length === 0 ? <p className="muted">No faculty contacts available.</p>
            : faculty.map((c) => <CoordinatorCard key={c.id || c.email} c={c} />)}
        </div>
        <h4 className="section-heading">Student Coordinators</h4>
        <div className="team-row">
          {students.length === 0 ? <p className="muted">No student contacts available.</p>
            : students.map((c) => <CoordinatorCard key={c.id || c.email} c={c} />)}
        </div>
      </section>

      {showSuccess && (
        <div className="reg-modal">
          <div className="reg-modal__backdrop" onClick={() => setShowSuccess(false)} />
          <div className="reg-modal__panel reg-modal-in">
            <div className="reg-modal__icon"></div>
            <h3>Message Sent</h3>
            <p className="reg-modal__text">Thanks for reaching out. We’ll get back to you soon!</p>
            <button className="reg-btn modal-cta" onClick={() => setShowSuccess(false)}>Continue</button>
          </div>
        </div>
      )}
    </div>
  );
}

function CoordinatorCard({ c }) {
  const initials = (c.name || "?").split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
  return (
    <div className="coordinator-card">
      <div className="cc-left">
        {c.avatar ? <img className="cc-avatar" src={c.avatar} alt={c.name} />
          : <div className="cc-avatar--fallback" aria-hidden="true">{initials}</div>}
      </div>
      <div className="cc-right">
        <div className="cc-name">{c.name}</div>
        <div className="cc-meta">
          <span className="badge">{c.designation}</span>
          {c.department && <span className="badge neutral">{c.department}</span>}
        </div>
        {c.email && <a className="cc-link" href={`mailto:${c.email}`}>{c.email}</a>}
        {c.phone && <a className="cc-link" href={`tel:${c.phone}`}>{c.phone}</a>}
      </div>
    </div>
  );
}
