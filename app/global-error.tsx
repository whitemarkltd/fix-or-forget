"use client";

// Catches errors thrown in the root layout itself. Must render its own
// <html>/<body> because it replaces the whole document.
export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          fontFamily: "system-ui, sans-serif",
          maxWidth: "28rem",
          margin: "0 auto",
          padding: "5rem 1rem",
          textAlign: "center",
        }}
      >
        <h1 style={{ fontSize: "1.5rem", fontWeight: 700 }}>Something went wrong</h1>
        <p style={{ color: "#64748b", marginTop: "0.5rem" }}>
          Please reload the page.
        </p>
        <button
          onClick={reset}
          style={{
            marginTop: "1.5rem",
            background: "#0f766e",
            color: "white",
            border: 0,
            borderRadius: "0.5rem",
            padding: "0.6rem 1rem",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Try again
        </button>
      </body>
    </html>
  );
}
