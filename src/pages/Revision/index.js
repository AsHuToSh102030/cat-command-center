import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabase";
import "./Revision.css";

function Revision() {
  const [revisions, setRevisions] = useState([]);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    topic: "",
    type: "Topic Revision",
    priority: "Medium",
    revisionDate: ""
  });

  useEffect(() => {
    fetchRevisions();
  }, []);

  const fetchRevisions = async () => {
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
          .from("revisions")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", {
            ascending: false
          });

      if (error) {
        console.error(error);
        alert(error.message);
        setLoading(false);
        return;
      }

      setRevisions(data || []);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const analytics = useMemo(() => {
    const today =
      new Date()
        .toISOString()
        .split("T")[0];

    return {
      dueToday: revisions.filter(
        (item) =>
          item.revision_date ===
            today &&
          item.status === "Pending"
      ).length,

      overdue: revisions.filter(
        (item) =>
          item.revision_date <
            today &&
          item.status === "Pending"
      ).length,

      completed: revisions.filter(
        (item) =>
          item.status ===
          "Completed"
      ).length,

      pending: revisions.filter(
        (item) =>
          item.status ===
          "Pending"
      ).length
    };
  }, [revisions]);

  const addRevision = async () => {
    if (!form.topic.trim()) {
      alert("Enter topic");
      return;
    }

    if (!form.revisionDate) {
      alert("Select revision date");
      return;
    }

    try {
      const {
        data: { user }
      } = await supabase.auth.getUser();

      if (!user) {
        alert("User not authenticated");
        return;
      }

      const revisionData = {
        user_id: user.id,
        topic: form.topic,
        type: form.type,
        priority: form.priority,
        created_date:
          new Date()
            .toISOString()
            .split("T")[0],
        revision_date:
          form.revisionDate,
        status: "Pending"
      };

      const { data, error } =
        await supabase
          .from("revisions")
          .insert([revisionData])
          .select();

      if (error) {
        console.error(error);
        alert(error.message);
        return;
      }

      setRevisions([
        data[0],
        ...revisions
      ]);

      setForm({
        topic: "",
        type: "Topic Revision",
        priority: "Medium",
        revisionDate: ""
      });
    } catch (err) {
      console.error(err);
      alert(
        "Failed to add revision"
      );
    }
  };

  const toggleStatus = async (
    id
  ) => {
    const current =
      revisions.find(
        (item) =>
          item.id === id
      );

    if (!current) return;

    const newStatus =
      current.status ===
      "Pending"
        ? "Completed"
        : "Pending";

    try {
      const { error } =
        await supabase
          .from("revisions")
          .update({
            status: newStatus
          })
          .eq("id", id);

      if (error) {
        console.error(error);
        alert(error.message);
        return;
      }

      setRevisions(
        revisions.map((item) =>
          item.id === id
            ? {
                ...item,
                status:
                  newStatus
              }
            : item
        )
      );
    } catch (err) {
      console.error(err);
      alert(
        "Failed to update status"
      );
    }
  };

  const deleteRevision = async (
    id
  ) => {
    try {
      const { error } =
        await supabase
          .from("revisions")
          .delete()
          .eq("id", id);

      if (error) {
        console.error(error);
        alert(error.message);
        return;
      }

      setRevisions(
        revisions.filter(
          (item) =>
            item.id !== id
        )
      );
    } catch (err) {
      console.error(err);
      alert(
        "Failed to delete revision"
      );
    }
  };

  if (loading) {
    return (
      <div className="revision-page">
        <h2>
          Loading...
        </h2>
      </div>
    );
  }

  return (
    <div className="revision-page">

      <h1>
        🔄 Revision Queue
      </h1>

      <div className="analytics-grid">

        <div className="analytics-card">
          <h3>Due Today</h3>

          <h2>
            {
              analytics.dueToday
            }
          </h2>
        </div>

        <div className="analytics-card">
          <h3>Overdue</h3>

          <h2>
            {
              analytics.overdue
            }
          </h2>
        </div>

        <div className="analytics-card">
          <h3>Pending</h3>

          <h2>
            {
              analytics.pending
            }
          </h2>
        </div>

        <div className="analytics-card">
          <h3>Completed</h3>

          <h2>
            {
              analytics.completed
            }
          </h2>
        </div>

      </div>

      <div className="revision-form">

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
            Topic Revision
          </option>

          <option>
            Mock Revision
          </option>

          <option>
            Mistake Revision
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
          <option>
            Low
          </option>

          <option>
            Medium
          </option>

          <option>
            High
          </option>
        </select>

        <input
          type="date"
          value={
            form.revisionDate
          }
          onChange={(e) =>
            setForm({
              ...form,
              revisionDate:
                e.target.value
            })
          }
        />

        <button
          onClick={
            addRevision
          }
        >
          Add Revision
        </button>

      </div>

      <div className="revision-list">

        {revisions.map(
          (item) => (
            <div
              key={item.id}
              className="revision-card"
            >

              <h2>
                {item.topic}
              </h2>

              <p>
                📚 Type:{" "}
                {item.type}
              </p>

              <p>
                🎯 Priority:{" "}
                {item.priority}
              </p>

              <p>
                📅 Created:{" "}
                {
                  item.created_date
                }
              </p>

              <p>
                ⏰ Revision:{" "}
                {
                  item.revision_date
                }
              </p>

              <p>
                Status:{" "}
                {item.status}
              </p>

              <div className="actions">

                <button
                  onClick={() =>
                    toggleStatus(
                      item.id
                    )
                  }
                >
                  Toggle Status
                </button>

                <button
                  className="delete-btn"
                  onClick={() =>
                    deleteRevision(
                      item.id
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

export default Revision;