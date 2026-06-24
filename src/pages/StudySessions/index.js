import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabase";
import "./StudySessions.css";

function StudySessions() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    subject: "QA",
    topic: "",
    duration: "",
    productivity: "8",
    notes: ""
  });

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    const { data, error } = await supabase
      .from("study_sessions")
      .select("*")
      .order("created_at", {
        ascending: false
      });

    console.log(data);
    console.log(error);

    if (!error) {
      setSessions(data || []);
    }

    setLoading(false);
  };

  const analytics = useMemo(() => {
    if (!sessions.length) {
      return {
        totalHours: 0,
        totalSessions: 0,
        averageHours: 0,
        streak: 0
      };
    }

    const totalMinutes =
      sessions.reduce(
        (sum, session) =>
          sum +
          Number(session.duration || 0),
        0
      );

    return {
      totalHours:
        Math.round(
          (totalMinutes / 60) * 10
        ) / 10,

      totalSessions:
        sessions.length,

      averageHours:
        Math.round(
          (
            totalMinutes /
            60 /
            sessions.length
          ) * 10
        ) / 10,

      streak:
        new Set(
          sessions.map(
            (session) =>
              session.date
          )
        ).size
    };
  }, [sessions]);

  const addSession = async () => {
    if (
      !form.topic ||
      !form.duration
    )
      return;

    const newSession = {
      id: Date.now(),
      module: form.subject,
      subject: form.subject,
      topic: form.topic,
      duration: Number(
        form.duration
      ),
      productivity:
        form.productivity,
      notes: form.notes,
      date:
        new Date()
          .toISOString()
          .split("T")[0]
    };

    const { data, error } =
      await supabase
        .from("study_sessions")
        .insert([newSession])
        .select();

    console.log(data);
    console.log(error);

    if (!error) {
      setSessions([
        data[0],
        ...sessions
      ]);

      setForm({
        subject: "QA",
        topic: "",
        duration: "",
        productivity: "8",
        notes: ""
      });
    }
  };

  const deleteSession = async (
    id
  ) => {
    const { error } =
      await supabase
        .from("study_sessions")
        .delete()
        .eq("id", id);

    if (!error) {
      setSessions(
        sessions.filter(
          (session) =>
            session.id !== id
        )
      );
    }
  };

  if (loading) {
    return (
      <div className="study-page">
        <h1>
          📚 Study Sessions
        </h1>

        <h2>
          Loading...
        </h2>
      </div>
    );
  }

  return (
    <div className="study-page">

      <h1>
        📚 Study Sessions
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
          <h3>Sessions</h3>
          <h2>
            {
              analytics.totalSessions
            }
          </h2>
        </div>

        <div className="stat-card">
          <h3>
            Avg Hours
          </h3>
          <h2>
            {
              analytics.averageHours
            }
          </h2>
        </div>

        <div className="stat-card">
          <h3>
            Active Days
          </h3>
          <h2>
            {
              analytics.streak
            }
          </h2>
        </div>

      </div>

      <div className="study-form">

        <select
          value={form.subject}
          onChange={(e) =>
            setForm({
              ...form,
              subject:
                e.target.value
            })
          }
        >
          <option>QA</option>
          <option>DILR</option>
          <option>VARC</option>
        </select>

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

        <select
          value={
            form.productivity
          }
          onChange={(e) =>
            setForm({
              ...form,
              productivity:
                e.target.value
            })
          }
        >
          <option value="10">
            10/10
          </option>

          <option value="9">
            9/10
          </option>

          <option value="8">
            8/10
          </option>

          <option value="7">
            7/10
          </option>

          <option value="6">
            6/10
          </option>

          <option value="5">
            5/10
          </option>
        </select>

        <textarea
          placeholder="Session Notes"
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

              <h2>
                {
                  session.topic
                }
              </h2>

              <p>
                📚{" "}
                {session.subject ||
                  session.module}
              </p>

              <p>
                ⏱{" "}
                {
                  session.duration
                }
                min
              </p>

              <p>
                ⭐{" "}
                {
                  session.productivity
                }
                /10
              </p>

              <p>
                📅{" "}
                {
                  session.date
                }
              </p>

              <p>
                📝{" "}
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