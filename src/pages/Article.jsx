import React, { useEffect, useState, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import "../css/article.css";
import newsData from "../data/news.json";
import UseTitle from "../hooks/UseTitle";

export default function Article() {
    UseTitle("CampusConnect - Article")
  const { id } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);

  useEffect(() => {
    const found = newsData.find((n) => String(n.id) === String(id));
    setArticle(found || null);
  }, [id]);

  const paragraphs = useMemo(() => {
    if (!article) return [];
    const t = article.title;
    return [
      `In a milestone for our campus, ${t} kicked off with an energizing start that brought students, mentors, and alumni together. Organizers shared that interest had been building for weeks, and the opening day easily surpassed expectations.`,
      `Participants were greeted with a hands-on orientation and a clear roadmap for how to get involved. The aim is simple: create a friendly, practical space where newcomers can learn quickly while experienced members push the boundaries and share their craft.`,
      `A highlight from the morning sessions was the focus on teamwork. Students formed small squads across departments, blending perspectives from computing, design, arts, and sports science. This cross-pollination led to unexpected ideas and several quick demos before lunch.`,
      `Faculty advisors emphasized that ${t} isn’t a one-day announcement but a season of activity. Weekly meetups, open work hours, and mentoring circles are planned to make contribution simple—even for those with limited availability or early-semester workloads.`,
      `Afternoon workshops were designed around short cycles: plan, prototype, and reflect. By keeping loops tight, attendees could test an idea, gather feedback, and then iterate. Several groups shared early results on stage, earning loud applause for their creativity.`,
      `Community impact was a recurring theme. Beyond headlines, the team wants to publish useful guides, starter kits, and case studies so that future batches can learn from concrete examples—not just inspirational posters or lofty goals.`,
      `Another takeaway was how inclusive the organizers want this to be. Sessions welcomed absolute beginners and offered gentle on-ramps: glossary cheat sheets, peer pairing, and a help desk channel that stays active during the week for quick questions.`,
      `Looking ahead, the roadmap includes monthly showcases where students can present progress and receive structured feedback. Judges will weigh clarity, usefulness, and collaboration just as highly as technical depth to encourage well-rounded work.`,
      `To support continuity, the council announced a public archive for docs, slide decks, and demo videos. Contributors can submit summaries so classmates who miss a session can still catch up and participate in the next sprint.`,
      `If you’re inspired by ${t}, now is the best time to jump in. Bring a friend, pick a small starter task, and share what you learn. Each contribution—no matter how small—helps the whole campus community grow stronger and more connected.`,
    ];
  }, [article]);

  if (!article) {
    return (
      <div className="article-page">
        <div className="article-not-found">
          <h1>Article Not Found</h1>
          <p>The requested article doesn’t exist or was removed.</p>
          <button className="btn-back" onClick={() => navigate(-1)}>← Go Back</button>
          <div className="nf-suggest">
            <h3>Other reads</h3>
            <ul>
              {newsData.slice(0, 3).map((n) => (
                <li key={n.id}>
                  <Link to={`/news/${n.id}`}>{n.title}</Link>
                  <span className="nf-date"> • {n.date}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <article className="article-page">
      <header className="article-header">
        <h1>{article.title}</h1>
        <p className="article-meta">
          {article.date} • {article.read} min read
        </p>
      </header>

      <div className="article-hero">
        <img src={article.image} alt={article.title} />
      </div>

      <div className="article-body">
        <p className="lead">{article.excerpt}</p>
        {paragraphs.map((p, i) => <p key={i}>{p}</p>)}

        <blockquote>
          “Campus culture grows when everyone gets the chance to build, share, and learn together.”
        </blockquote>

        <p>
          Want to stay involved? Bookmark this article for updates and check the events page for related workshops and meetups.
        </p>

        <div className="article-cta">
          <Link to="/events" className="btn-primary">Explore Events</Link>
          <Link to="/" className="btn-outline">Back to Home</Link>
        </div>
      </div>
    </article>
  );
}
