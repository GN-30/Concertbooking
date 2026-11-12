// src/context/ThemeContext.jsx
// SwarSetu Theme Manager — Toggle between Royal Dark and Palace Light Themes
import React, { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    try {
      const stored = localStorage.getItem("swarsethu_theme");
      if (stored === "light" || stored === "dark") return stored;
      return "dark"; // Default theme
    } catch {
      return "dark";
    }
  });

  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;

    if (theme === "light") {
      root.classList.add("light");
      root.classList.remove("dark");
      body.classList.add("light");
      body.classList.remove("dark");
      body.style.backgroundColor = "#faf7f2";
      body.style.color = "#1e112a";
    } else {
      root.classList.remove("light");
      root.classList.add("dark");
      body.classList.remove("light");
      body.classList.add("dark");
      body.style.backgroundColor = "#05020c";
      body.style.color = "#ffffff";
    }

    try {
      localStorage.setItem("swarsethu_theme", theme);
    } catch (e) {}

    try {
      window.dispatchEvent(
        new CustomEvent("swarsethu:themeChanged", { detail: { theme } })
      );
    } catch (e) {}
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        toggleTheme,
        isLight: theme === "light",
        setTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    return {
      theme: "dark",
      toggleTheme: () => {},
      isLight: false,
      setTheme: () => {},
    };
  }
  return context;
}

