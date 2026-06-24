import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabase";
import "./StudySessions.css";

function StudySessions() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedDates, setExpandedDates] = useState({});

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
    try {
      const {
        data: { user }
      } = await supabase.auth.getUser();

      console.log("Current user:", user);

      if (!user) {
        console.log("No user found in loadSessions");
        setLoading(false);
        return;
      }

      const { data, error } =
        await supabase
          .from("study_sessions")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", {
            ascending: false
          });

      console.log("Sessions loaded:", data);
      console.log("Load error:", error);

      if (!error) {
        setSessions(data || []);
      }

      setLoading(false);
    } catch (err) {
      console.error(
        "Unexpected error in loadSessions:",
        err
      );
      setLoading(false);
    }
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

  const groupedSessions = useMemo(() => {
    const grouped = {};

    sessions.forEach((session) => {
      const date = session.date;

      if (!grouped[date]) {
        grouped[date] = [];
      }

      grouped[date].push(session);
    });

    const sorted =
      Object.entries(grouped)
        .sort(
          ([dateA], [dateB]) =>
            new Date(dateB) -
            new Date(dateA)
        );

    return sorted.map(
      ([date, sessionsForDate]) => {
        const totalMinutes =
          sessionsForDate.reduce(
            (sum, session) =>
              sum +
              Number(
                session.duration || 0
              ),
            0
          );

        const totalHours =
          Math.round(
            (totalMinutes / 60) * 10
          ) / 10;

        const averageProductivity =
          Math.round(
            sessionsForDate.reduce(
              (sum, session) =>
                sum +
                Number(
                  session.productivity ||
                    0
                ),
              0
            ) / sessionsForDate.length
          );

        return {
          date,
          sessions:
            sessionsForDate,
          totalMinutes,
          totalHours,
          averageProductivity,
          sessionCount:
            sessionsForDate.length
        };
      }
    );
  }, [sessions]);

  const toggleExpandDate =
    (date) => {
      setExpandedDates(
        (prev) => ({
          ...prev,
          [date]: !prev[date]
        })
      );
    };

  const addSession = async () => {
    if (
      !form.topic ||
      !form.duration
    ) {
      console.warn(
        "Form incomplete: topic or duration missing"
      );
      alert(
        "Please fill in topic and duration"
      );
      return;
    }

    try {
      const {
        data: { user }
      } = await supabase.auth.getUser();

      console.log("Current user:", user);

      if (!user) {
        console.error(
          "No user found in addSession"
        );
        alert("User not authenticated");
        return;
      }

      const newSession = {
        user_id: user.id,
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

      console.log(
        "Session being inserted:",
        newSession
      );

      const { data, error } =
        await supabase
          .from("study_sessions")
          .insert([newSession])
          .select();

      console.log("INSERT DATA:", data);
      console.log("INSERT ERROR:", error);

      if (error) {
        console.error(
          "Supabase insert error:",
          error
        );
        alert(
          JSON.stringify(error)
        );
        return;
      }

      if (!data) {
        console.error(
          "No data returned from insert"
        );
        alert(
          "No data returned from insert"
        );
        return;
      }

      console.log(
        "Session added successfully:",
        data[0]
      );

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

      alert(
        "Session added successfully"
      );
    } catch (err) {
      console.error(
        "Unexpected error in addSession:",
        err
      );
      alert(
        "Unexpected error: " +
          err.message
      );
    }
  };

  const deleteSession = async (
    id
  ) => {
    try {
      console.log(
        "Deleting session with id:",
        id
      );

      const { error } =
        await supabase
          .from("study_sessions")
          .delete()
          .eq("id", id);

      console.log(
        "Delete error:",
        error
      );

      if (error) {
        console.error(
          "Supabase delete error:",
          error
        );
        alert(
          "Failed to delete session: " +
            JSON.stringify(error)
        );
        return;
      }

      console.log(
        "Session deleted successfully"
      );

      setSessions(
        sessions.filter(
          (session) =>
            session.id !== id
        )
      );

      alert(
        "Session deleted successfully"
      );
    } catch (err) {
      console.error(
        "Unexpected error in deleteSession:",
        err
      );
      alert(
        "Unexpected error: " +
          err.message
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

        {groupedSessions.map(
          (dayGroup) => (
            <div
              key={dayGroup.date}
              className="day-group-card"
            >

              <div
                className="day-group-header"
                onClick={() =>
                  toggleExpandDate(
                    dayGroup.date
                  )
                }
              >

                <div className="day-group-info">
                  <h3>
                    📅{" "}
                    {
                      dayGroup.date
                    }
                  </h3>

                  <div className="day-group-stats">
                    <span>
                      {
                        dayGroup.sessionCount
                      }
                      {" "}
                      sessions
                    </span>

                    <span>
                      •
                    </span>

                    <span>
                      {
                        dayGroup.totalHours
                      }
                      h
                    </span>

                    <span>
                      •
                    </span>

                    <span>
                      ⭐
                      {" "}
                      {
                        dayGroup.averageProductivity
                      }
                      /10
                    </span>
                  </div>
                </div>

                <div className="expand-icon">
                  {
                    expandedDates[
                      dayGroup.date
                    ]
                      ? "▼"
                      : "▶"
                  }
                </div>

              </div>

              {expandedDates[
                dayGroup.date
              ] && (
                <div className="day-group-sessions">

                  {dayGroup.sessions.map(
                    (session) => (
                      <div
                        key={
                          session.id
                        }
                        className="grouped-session-item"
                      >

                        <div className="session-details">
                          <h4>
                            {
                              session.topic
                            }
                          </h4>

                          <p>
                            📚{" "}
                            {
                              session.subject ||
                              session.module
                            }
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

                          {session.notes && (
                            <p>
                              📝{" "}
                              {
                                session.notes
                              }
                            </p>
                          )}
                        </div>

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
              )}

            </div>
          )
        )}

      </div>

    </div>
  );
}

export default StudySessions;