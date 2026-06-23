import { useEffect, useMemo, useState } from "react";
import "./StudySessions.css";

function StudySessions() {
  const [sessions, setSessions] = useState(() => {
    const saved = localStorage.getItem(
      "studySessions"
    );

    if (saved) {
      return JSON.parse(saved);
    }

    return [];
  });

  const [form, setForm] = useState({
    module: "",
    topic: "",
    duration: "",
    notes: ""
  });

  useEffect(() => {
    localStorage.setItem(
      "studySessions",
      JSON.stringify(sessions)
    );
  }, [sessions]);

  const analytics = useMemo(() => {
    if (sessions.length === 0) {
      return {
        totalHours: 0,
        totalSessions: 0,
        averageHours: 0
      };
    }

    const totalHours =
      sessions.reduce(
        (sum, session) =>
          sum +
          Number(session.duration),
        0
      ) / 60;

    return {
      totalHours:
        Math.round(
          totalHours * 10
        ) / 10,
      totalSessions:
        sessions.length,
      averageHours:
        Math.round(
          (totalHours /
            sessions.length) *
            10
        ) / 10
    };
  }, [sessions]);

  const addSession = () => {
    if (
      !form.module ||
      !form.topic ||
      !form.duration
    ) {
      return;
    }

    const newSession = {
      id: Date.now(),
      date:
        new Date()
          .toISOString()
          .split("T")[0],
      ...form
    };

    setSessions([
      newSession,
      ...sessions
    ]);

    setForm({
      module: "",
      topic: "",
      duration: "",
      notes: ""
    });
  };

  const deleteSession = (
    id
  ) => {
    setSessions(
      sessions.filter(
        (session) =>
          session.id !== id
      )
    );
  };

  return (
    <div className="study-page">

      <h1>
        Study Session Tracker
      </h1>

      <div className="stats-grid">

        <div className="stat-card">
          <h3>Total Hours</h3>
          <h2>
            {
              analytics.totalHours
            }
          </h2>
        </div>

        <div className="stat-card">
          <h3>
            Total Sessions
          </h3>
          <h2>
            {
              analytics.totalSessions
            }
          </h2>
        </div>

        <div className="stat-card">
          <h3>
            Avg Hours /
            Session
          </h3>
          <h2>
            {
              analytics.averageHours
            }
          </h2>
        </div>

      </div>

      <div className="study-form">

        <input
          placeholder="Module"
          value={form.module}
          onChange={(e) =>
            setForm({
              ...form,
              module:
                e.target.value
            })
          }
        />

        <input
          placeholder="Topic"
          value={form.topic}
          onChange={(e) =>
            setForm({
              ...form,
              topic:
                e.target.value
            })
          }
        />

        <input
          placeholder="Minutes Studied"
          value={form.duration}
          onChange={(e) =>
            setForm({
              ...form,
              duration:
                e.target.value
            })
          }
        />

        <textarea
          placeholder="Notes"
          value={form.notes}
          onChange={(e) =>
            setForm({
              ...form,
              notes:
                e.target.value
            })
          }
        />

        <button
          onClick={
            addSession
          }
        >
          Log Session
        </button>

      </div>

      <div className="session-list">

        {sessions.map(
          (session) => (
            <div
              key={
                session.id
              }
              className="session-card"
            >

              <h3>
                {
                  session.topic
                }
              </h3>

              <p>
                Module:
                {" "}
                {
                  session.module
                }
              </p>

              <p>
                Date:
                {" "}
                {
                  session.date
                }
              </p>

              <p>
                Duration:
                {" "}
                {
                  session.duration
                }
                min
              </p>

              <p>
                Notes:
                {" "}
                {
                  session.notes
                }
              </p>

              <button
                className="delete-btn"
                onClick={() =>
                  deleteSession(
                    session.id
                  )
                }
              >
                Delete
              </button>

            </div>
          )
        )}

      </div>

    </div>
  );
}

export default StudySessions;