import React from "react";
import { Link } from "react-router-dom";
import "../css/eventcard.css";

function getCountdown(dateStr) {
  const diff = new Date(dateStr) - new Date();
  if (diff <= 0) return "Event Started!";
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  return `${days} days left`;
}

export default function EventCard({ event }) {
  return (
    <div className="event-card">
      <img src={event.image} alt={event.title} />
      <div className="card-content">
        <h3>{event.title}</h3>
        <p>{event.date} - {event.venue}</p>
        <p>{event.shortDescription}</p>
        <p className="countdown">{getCountdown(event.date)}</p>
        <Link to={`/events/${event.id}`} className="btn">Learn More</Link>
      </div>
    </div>
  );
}
