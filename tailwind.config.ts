import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // One confident accent (calm teal) + non-alarmist verdict colors.
        accent: {
          DEFAULT: "#0f766e", // teal-700
          soft: "#ccfbf1",
          ink: "#134e4a",
        },
        // Verdict states: repair=green, borderline=amber, replace=blue (not red).
        repair: { DEFAULT: "#15803d", soft: "#dcfce7", ink: "#14532d" },
        borderline: { DEFAULT: "#b45309", soft: "#fef3c7", ink: "#78350f" },
        replace: { DEFAULT: "#1d4ed8", soft: "#dbeafe", ink: "#1e3a8a" },
        ink: "#0f172a",
        paper: "#fafaf9",
      },
      fontFamily: {
        sans: ["system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      maxWidth: {
        prose: "42rem",
      },
    },
  },
  plugins: [],
};

export default config;
