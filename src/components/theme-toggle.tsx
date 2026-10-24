"use client";

import { useEffect, useState } from "react";

type Theme = "dark" | "light";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    const saved = window.localStorage.getItem("ev-omsi-theme");
    const next: Theme = saved === "light" ? "light" : "dark";
    setTheme(next);
    document.documentElement.dataset.theme = next;
  }, []);

  function toggleTheme() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.dataset.theme = next;
    window.localStorage.setItem("ev-omsi-theme", next);
  }

  return <button className="theme-toggle" type="button" onClick={toggleTheme} aria-label={theme === "dark" ? "Ativar modo normal claro" : "Ativar modo escuro"} title={theme === "dark" ? "Modo normal" : "Modo escuro"}>
    <span className="theme-toggle-icon" aria-hidden="true">{theme === "dark" ? "☀" : "◐"}</span>
    <span>{theme === "dark" ? "Modo normal" : "Modo escuro"}</span>
  </button>;
}
