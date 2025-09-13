import React, { Suspense, lazy } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { BookmarkProvider } from "./context/BookmarkContext.jsx";
import Loader from "./components/Loader.jsx";
import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";
import WelcomeOnboarding from "./components/WelcomeOnboarding.jsx";
import ScrollToTop from "./components/ScrollToTop.jsx";

const navEntry = performance.getEntriesByType?.("navigation")?.[0];
const navType = navEntry?.type || "navigate";
const IS_HARD_LOAD = navType === "reload" || navType === "navigate";

const Home = lazy(() => import("./pages/Home.jsx"));
const Events = lazy(() => import("./pages/Events.jsx"));
const EventDetail = lazy(() => import("./pages/EventDetail.jsx"));
const Gallery = lazy(() => import("./pages/Gallery.jsx"));
const Contact = lazy(() => import("./pages/Contact.jsx"));
const About = lazy(() => import("./pages/About.jsx"));
const Feedback = lazy(() => import("./pages/Feedback.jsx"));
const Registration = lazy(() => import("./pages/Registration.jsx"));
const Bookmarks = lazy(() => import("./pages/Bookmarks.jsx"));
const EventsCalendar = lazy(() => import("./pages/EventsCalendar.jsx"));
const Article = lazy(() => import("./pages/Article.jsx"));

function AppShell() {
  const location = useLocation();
  const onHome = location.pathname === "/";

  return (
    <BookmarkProvider>
      {IS_HARD_LOAD && onHome && <WelcomeOnboarding />}
    <ScrollToTop smooth/>
      <Navbar />

      <main className="app-main">
        <Suspense fallback={<Loader />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/events" element={<Events />} />
            <Route path="/events/:id" element={<EventDetail />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/feedback" element={<Feedback />} />
            <Route path="/registration" element={<Registration />} />
            <Route path="/bookmarks" element={<Bookmarks />} />
            <Route path="/calendar" element={<EventsCalendar />} />
            <Route path="/news/:id" element={<Article />} />
          </Routes>
        </Suspense>
      </main>

      <Footer />
    </BookmarkProvider>
  );
}

export default function App() {
  return <AppShell />;
}
