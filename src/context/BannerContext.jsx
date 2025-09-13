import React, { createContext, useEffect, useState } from "react";

export const BannerContext = createContext(null);

const NAME_KEY = "cc_user_name";
const ROLE_KEY = "cc_user_role";

export function BannerProvider({ children }) {
  const [banners, setBanners] = useState([]);
  const [name, setName] = useState(localStorage.getItem(NAME_KEY) || "");
  const [role, setRole] = useState(localStorage.getItem(ROLE_KEY) || "");

  useEffect(() => {
    fetch("/data/banners.json")
      .then((res) => res.json())
      .then((data) => Array.isArray(data) && setBanners(data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === NAME_KEY) setName(e.newValue || "");
      if (e.key === ROLE_KEY) setRole(e.newValue || "");
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const setUser = (n, r) => {
    setName(n || "");
    setRole(r || "");
    try {
      if (typeof n === "string") localStorage.setItem(NAME_KEY, n);
      if (typeof r === "string") localStorage.setItem(ROLE_KEY, r);
    } catch {}
  };

  const value = { banners, setBanners, name, role, setUser };
  return <BannerContext.Provider value={value}>{children}</BannerContext.Provider>;
}
