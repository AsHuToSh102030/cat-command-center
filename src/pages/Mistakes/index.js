import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabase";
import "./Mistakes.css";

function Mistakes() {
  const [mistakes, setMistakes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedDates, setExpandedDates] = useState({});

  const [form, setForm] = useState({
    subject: "QA",
    topic: "",
    source: "",
    question: "",
    type: "Conceptual Error",
    priority: "Medium",
    reason: "",
    approach: ""
  });

  const getISTDateString = () => {
    const now = new Date();
    return now.toLocaleDateString(
      "en-CA",
      {
        timeZone: "Asia/Kolkata"
      }
    );
  };

  const getISTDateFromTimestamp = (
    timestamp
  ) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString(
      "en-CA",
      {
        timeZone: "Asia/Kolkata"
      }
    );
  };

  useEffect(() => {
    loadMistakes();
  }, []);

  const loadMistakes = async () => {
    try {
      const {
        data: { user }
      } = await supabase.auth.getUser();

      console.log(
        "Current user:",
        user
      );

      if (!user) {
        console.log(
          "No user found in loadMistakes"
        );
        setLoading(false);
        return;
      }

      const { data, error } =
        await supabase
          .from("mistakes")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", {
            ascending: false
          });

      console.log(
        "Mistakes loaded:",
        data
      );
      console.log(
        "Load error:",
        error
      );

      if (!error) {
        setMistakes(
          (data || []).map(
            (item) => ({
              ...item,
              revisionCount:
                item.revision_count || 0
            })
          )
        );
      }

      setLoading(false);
    } catch (err) {
      console.error(
        "Unexpected error in loadMistakes:",
        err
      );
      setLoading(false);
    }
  };

  const analytics = useMemo(() => {
    return {
      total: mistakes.length,

      open: mistakes.filter(
        (m) =>
          m.status === "Open"
      ).length,

      fixed: mistakes.filter(
        (m) =>
          m.status === "Fixed"
      ).length,

      highPriority:
        mistakes.filter(
          (m) =>
            m.priority ===
            "High"
        ).length
    };
  }, [mistakes]);

  const toggleExpandDate =
    (date) => {
      setExpandedDates(
        (prev) => ({
          ...prev,
          [date]: !prev[date]
        })
      );
    };

  const groupedMistakes = useMemo(() => {
    const grouped = {};

    mistakes.forEach((mistake) => {
      const date =
        getISTDateFromTimestamp(
          mistake.created_at
        );

      if (!grouped[date]) {
        grouped[date] = [];
      }

      grouped[date].push(mistake);
    });

    const sorted =
      Object.entries(grouped)
        .sort(
          ([dateA], [dateB]) => {
            const dateAObj =
              new Date(dateA);
            const dateBObj =
              new Date(dateB);
            return dateBObj - dateAObj;
          }
        );

    return sorted.map(
      ([date, mistakesForDate]) => {
        const openCount =
          mistakesForDate.filter(
            (m) =>
              m.status === "Open"
          ).length;

        const fixedCount =
          mistakesForDate.filter(
            (m) =>
              m.status === "Fixed"
          ).length;

        return {
          date,
          mistakes:
            mistakesForDate,
          total:
            mistakesForDate.length,
          open: openCount,
          fixed: fixedCount
        };
      }
    );
  }, [mistakes]);

  const addMistake = async () => {
    if (
      !form.topic ||
      !form.reason
    ) {
      console.warn(
        "Form incomplete: topic or reason missing"
      );
      alert(
        "Please fill in topic and reason"
      );
      return;
    }

    try {
      const {
        data: { user }
      } = await supabase.auth.getUser();

      console.log(
        "Current user:",
        user
      );

      if (!user) {
        console.error(
          "No user found in addMistake"
        );
        alert("User not authenticated");
        return;
      }

      const istDateString =
        getISTDateString();

      const newMistake = {
        user_id: user.id,
        subject:
          form.subject,
        topic: form.topic,
        source:
          form.source,
        question:
          form.question,
        type: form.type,
        priority:
          form.priority,
        reason:
          form.reason,
        approach:
          form.approach,
        status: "Open",
        revision_count: 0,
        ist_date: istDateString
      };

      console.log(
        "Mistake being inserted:",
        newMistake
      );

      const { data, error } =
        await supabase
          .from("mistakes")
          .insert([newMistake])
          .select();

      console.log(
        "INSERT DATA:",
        data
      );
      console.log(
        "INSERT ERROR:",
        error
      );

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
        "Mistake added successfully:",
        data[0]
      );

      setMistakes([
        {
          ...data[0],
          revisionCount:
            data[0].revision_count || 0
        },
        ...mistakes
      ]);

      setForm({
        subject: "QA",
        topic: "",
        source: "",
        question: "",
        type:
          "Conceptual Error",
        priority:
          "Medium",
        reason: "",
        approach: ""
      });

      alert(
        "Mistake added successfully"
      );
    } catch (err) {
      console.error(
        "Unexpected error in addMistake:",
        err
      );
      alert(
        "Unexpected error: " +
          err.message
      );
    }
  };

  const toggleStatus =
    async (id) => {
      try {
        console.log(
          "Toggling status for id:",
          id
        );

        const current =
          mistakes.find(
            (m) =>
              m.id === id
          );

        if (!current) {
          console.error(
            "Mistake not found"
          );
          return;
        }

        const newStatus =
          current.status ===
          "Open"
            ? "Fixed"
            : "Open";

        console.log(
          "New status:",
          newStatus
        );

        const { error } =
          await supabase
            .from(
              "mistakes"
            )
            .update({
              status:
                newStatus
            })
            .eq("id", id);

        console.log(
          "Update error:",
          error
        );

        if (!error) {
          setMistakes(
            mistakes.map(
              (m) =>
                m.id === id
                  ? {
                      ...m,
                      status:
                        newStatus
                    }
                  : m
            )
          );
        }
      } catch (err) {
        console.error(
          "Unexpected error in toggleStatus:",
          err
        );
      }
    };

  const increaseRevision =
    async (id) => {
      try {
        console.log(
          "Increasing revision for id:",
          id
        );

        const current =
          mistakes.find(
            (m) =>
              m.id === id
          );

        if (!current) {
          console.error(
            "Mistake not found"
          );
          return;
        }

        const newCount =
          current.revisionCount +
          1;

        console.log(
          "New revision count:",
          newCount
        );

        const { error } =
          await supabase
            .from(
              "mistakes"
            )
            .update({
              revision_count:
                newCount
            })
            .eq("id", id);

        console.log(
          "Update error:",
          error
        );

        if (!error) {
          setMistakes(
            mistakes.map(
              (m) =>
                m.id === id
                  ? {
                      ...m,
                      revisionCount:
                        newCount
                    }
                  : m
            )
          );
        }
      } catch (err) {
        console.error(
          "Unexpected error in increaseRevision:",
          err
        );
      }
    };

  const deleteMistake =
    async (id) => {
      try {
        console.log(
          "Deleting mistake with id:",
          id
        );

        const { error } =
          await supabase
            .from(
              "mistakes"
            )
            .delete()
            .eq("id", id);

        console.log(
          "Delete error:",
          error
        );

        if (!error) {
          console.log(
            "Mistake deleted successfully"
          );

          setMistakes(
            mistakes.filter(
              (m) =>
                m.id !== id
            )
          );
        }
      } catch (err) {
        console.error(
          "Unexpected error in deleteMistake:",
          err
        );
      }
    };

  if (loading) {
    return (
      <div className="mistakes-page">
        <h1>
          ❌ Mistake Log
        </h1>

        <h2>
          Loading...
        </h2>
      </div>
    );
  }

  return (
    <div className="mistakes-page">

      <h1>
        ❌ Mistake Log
      </h1>

      <div className="analytics-grid">

        <div className="analytics-card">
          <h3>
            Total Mistakes
          </h3>
          <h2>
            {analytics.total}
          </h2>
        </div>

        <div className="analytics-card">
          <h3>Open</h3>
          <h2>
            {analytics.open}
          </h2>
        </div>

        <div className="analytics-card">
          <h3>Fixed</h3>
          <h2>
            {analytics.fixed}
          </h2>
        </div>

        <div className="analytics-card">
          <h3>
            High Priority
          </h3>
          <h2>
            {
              analytics.highPriority
            }
          </h2>
        </div>

      </div>

      <div className="mistake-form">

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
          placeholder="Source"
          value={form.source}
          onChange={(e) =>
            setForm({
              ...form,
              source:
                e.target.value
            })
          }
        />

        <input
          placeholder="Question Number"
          value={form.question}
          onChange={(e) =>
            setForm({
              ...form,
              question:
                e.target.value
            })
          }
        />

        <select
          value={form.type}
          onChange={(e) =>
            setForm({
              ...form,
              type:
                e.target.value
            })
          }
        >
          <option>
            Conceptual Error
          </option>
          <option>
            Calculation Error
          </option>
          <option>
            Reading Error
          </option>
          <option>
            Silly Mistake
          </option>
          <option>
            Time Management
          </option>
        </select>

        <select
          value={form.priority}
          onChange={(e) =>
            setForm({
              ...form,
              priority:
                e.target.value
            })
          }
        >
          <option>Low</option>
          <option>
            Medium
          </option>
          <option>High</option>
        </select>

        <textarea
          placeholder="Why mistake happened"
          value={form.reason}
          onChange={(e) =>
            setForm({
              ...form,
              reason:
                e.target.value
            })
          }
        />

        <textarea
          placeholder="Correct approach"
          value={
            form.approach
          }
          onChange={(e) =>
            setForm({
              ...form,
              approach:
                e.target.value
            })
          }
        />

        <button
          onClick={addMistake}
        >
          Add Mistake
        </button>

      </div>

      <div className="mistake-list">

        {groupedMistakes.length === 0 && (
          <div className="mistake-card">
            <h3>No Mistakes Yet</h3>
            <p>
              Log your first mistake to track and improve.
            </p>
          </div>
        )}

        {groupedMistakes.map(
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
                        dayGroup.total
                      }
                      {" "}
                      mistakes
                    </span>

                    <span>
                      •
                    </span>

                    <span>
                      {
                        dayGroup.open
                      }
                      {" "}
                      open
                    </span>

                    <span>
                      •
                    </span>

                    <span>
                      {
                        dayGroup.fixed
                      }
                      {" "}
                      fixed
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
                <div className="day-group-mistakes">

                  {dayGroup.mistakes.map(
                    (mistake) => (
                      <div
                        key={mistake.id}
                        className="grouped-mistake-item"
                      >

                        <div className="mistake-details">
                          <h4>
                            {
                              mistake.topic
                            }
                          </h4>

                          <p>
                            📚 Subject:
                            {" "}
                            {
                              mistake.subject
                            }
                          </p>

                          <p>
                            ⚠ Type:
                            {" "}
                            {
                              mistake.type
                            }
                          </p>

                          <p>
                            🎯 Priority:
                            {" "}
                            {
                              mistake.priority
                            }
                          </p>

                          <p>
                            📝 Reason:
                            {" "}
                            {
                              mistake.reason
                            }
                          </p>

                          <p>
                            ✅ Fix:
                            {" "}
                            {
                              mistake.approach
                            }
                          </p>

                          <p>
                            🔄 Revisions:
                            {" "}
                            {
                              mistake.revisionCount
                            }
                          </p>

                          <p>
                            Status:
                            {" "}
                            {
                              mistake.status
                            }
                          </p>
                        </div>

                        <div className="mistake-actions">

                          <button
                            onClick={() =>
                              toggleStatus(
                                mistake.id
                              )
                            }
                          >
                            Toggle
                          </button>

                          <button
                            onClick={() =>
                              increaseRevision(
                                mistake.id
                              )
                            }
                          >
                            + Revision
                          </button>

                          <button
                            className="delete-btn"
                            onClick={() =>
                              deleteMistake(
                                mistake.id
                              )
                            }
                          >
                            Delete
                          </button>

                        </div>

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

export default Mistakes;