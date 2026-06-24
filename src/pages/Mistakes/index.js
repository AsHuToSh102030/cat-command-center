import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabase";
import "./Mistakes.css";

function Mistakes() {
  const [mistakes, setMistakes] = useState([]);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    loadMistakes();
  }, []);

  const loadMistakes = async () => {
    try {
      const {
        data: { user }
      } = await supabase.auth.getUser();

      if (!user) {
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
      console.error("Error loading mistakes:", err);
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

  const addMistake = async () => {
    if (
      !form.topic ||
      !form.reason
    ) {
      return;
    }

    try {
      const {
        data: { user }
      } = await supabase.auth.getUser();

      if (!user) return;

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
        revision_count: 0
      };

      const { data, error } =
        await supabase
          .from("mistakes")
          .insert([newMistake])
          .select();

      if (!error && data) {
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
      }
    } catch (err) {
      console.error("Error adding mistake:", err);
    }
  };

  const toggleStatus =
    async (id) => {
      try {
        const current =
          mistakes.find(
            (m) =>
              m.id === id
          );

        const newStatus =
          current.status ===
          "Open"
            ? "Fixed"
            : "Open";

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
        console.error("Error toggling status:", err);
      }
    };

  const increaseRevision =
    async (id) => {
      try {
        const current =
          mistakes.find(
            (m) =>
              m.id === id
          );

        const newCount =
          current.revisionCount +
          1;

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
        console.error("Error increasing revision:", err);
      }
    };

  const deleteMistake =
    async (id) => {
      try {
        const { error } =
          await supabase
            .from(
              "mistakes"
            )
            .delete()
            .eq("id", id);

        if (!error) {
          setMistakes(
            mistakes.filter(
              (m) =>
                m.id !== id
            )
          );
        }
      } catch (err) {
        console.error("Error deleting mistake:", err);
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

        {mistakes.map(
          (mistake) => (
            <div
              key={mistake.id}
              className="mistake-card"
            >

              <h2>
                {
                  mistake.topic
                }
              </h2>

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

              <div className="actions">

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

    </div>
  );
}

export default Mistakes;