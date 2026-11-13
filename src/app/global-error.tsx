"use client";

export default function GlobalError({ retry }: { error: unknown; retry: () => void }) {
  return (
    <html lang="en">
      <body
        style={{
          background: "#f8fafc",
          color: "#0f172a",
          fontFamily: "ui-sans-serif, system-ui, sans-serif",
          margin: 0,
        }}
      >
        <main
          style={{
            display: "grid",
            minHeight: "100vh",
            padding: "24px",
            placeItems: "center",
          }}
        >
          <section style={{ maxWidth: "560px", textAlign: "center" }}>
            <title>Something went wrong | OpenAP</title>
            <h1>OpenAP could not finish loading</h1>
            <p>Please try again. Public learning content remains available once the page recovers.</p>
            <button
              onClick={retry}
              style={{
                background: "#2563eb",
                border: 0,
                borderRadius: "10px",
                color: "white",
                cursor: "pointer",
                fontWeight: 700,
                marginTop: "16px",
                padding: "12px 18px",
              }}
              type="button"
            >
              Try again
            </button>
          </section>
        </main>
      </body>
    </html>
  );
}
