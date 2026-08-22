// Owl Vision PM Portal — App shell  v0.1
//
// Task 0 scaffold. Deliberately blank: the only thing here is the
// connection probe from TASKS.md, so David can confirm the client
// reaches Supabase and the schema is seeded before anything is built
// on top of it. Replaced by the dashboard in task 2.

import { useEffect, useState } from "react";

const HAVE_ENV =
  !!import.meta.env.VITE_SUPABASE_URL && !!import.meta.env.VITE_SUPABASE_ANON_KEY;

export default function App() {
  const [probe, setProbe] = useState("Checking the connection.");

  useEffect(() => {
    let alive = true;
    const say = (msg) => alive && setProbe(msg);

    if (!HAVE_ENV) {
      const msg =
        "No Supabase credentials. Put VITE_SUPABASE_URL and " +
        "VITE_SUPABASE_ANON_KEY in .env.local, then restart the dev server.";
      console.error(msg);
      say(msg);
      return;
    }

    // Imported lazily so a missing or wrong URL surfaces as this message
    // rather than a blank white page from createClient throwing on load.
    import("./lib/supabase.js")
      .then(({ supabase }) => supabase.from("positions").select("*"))
      .then(({ data, error }) => {
        if (error) throw error;
        console.log("positions:", data);
        if (!data?.length) {
          say(
            "Connected, but positions is empty. The schema has not been run. " +
              "Paste supabase/migrations/0001_schema.sql into the SQL editor."
          );
          return;
        }
        say(`Connected. positions returned ${data.length} rows.`);
      })
      .catch((err) => {
        console.error("positions probe failed", err);
        say(`Could not read positions. ${err.message || err}`);
      });

    return () => {
      alive = false;
    };
  }, []);

  return (
    <main
      style={{
        maxWidth: 460,
        margin: "0 auto",
        minHeight: "100%",
        padding: "48px 20px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 20,
      }}
    >
      <img
        src="/owl-vision-mark.svg"
        alt=""
        width={64}
        height={64}
        style={{ opacity: 0.9 }}
      />
      <p
        style={{
          margin: 0,
          fontFamily: "var(--mono)",
          fontSize: 13,
          lineHeight: 1.6,
          textAlign: "center",
        }}
      >
        {probe}
      </p>
    </main>
  );
}
