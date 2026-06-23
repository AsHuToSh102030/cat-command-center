import { useEffect, useState } from "react";
import "./Revision.css";

function Revision() {
  const [revisions, setRevisions] = useState(() => {
    const saved = localStorage.getItem(
      "revisionQueue"
    );

    if (saved) {
      return JSON.parse(saved);
    }

    return [];
  });

  const [form, setForm] = useState({
    topic: "",
    type: "Topic Revision",
    revisionDate: ""
  });

  useEffect(() => {
    localStorage.setItem(
      "revisionQueue",
      JSON.stringify(revisions)
    );
  }, [revisions]);

  const addRevision = () => {
    if (
      !form.topic ||
      !form.revisionDate
    ) {
      return;
    }

    const item = {
      id: Date.now(),
      topic: form.topic,
      type: form.type,
      createdDate:
        new Date()
          .toISOString()
          .split("T")[0],
      revisionDate:
        form.revisionDate,
      status: "Pending"
    };

    setRevisions([
      item,
      ...revisions
    ]);

    setForm({
      topic: "",
      type: "Topic Revision",
      revisionDate: ""
    });
  };

  const toggleStatus = (id) => {
    setRevisions(
      revisions.map((item) =>
        item.id === id
          ? {
              ...item,
              status:
                item.status ===
                "Pending"
                  ? "Completed"
                  : "Pending"
            }
          : item
      )
    );
  };

  const deleteRevision = (
    id
  ) => {
    setRevisions(
      revisions.filter(
        (item) =>
          item.id !== id
      )
    );
  };

  const today =
    new Date()
      .toISOString()
      .split("T")[0];

  const dueToday =
    revisions.filter(
      (item) =>
        item.revisionDate ===
          today &&
        item.status ===
          "Pending"
    ).length;

  const overdue =
    revisions.filter(
      (item) =>
        item.revisionDate <
          today &&
        item.status ===
          "Pending"
    ).length;

  const completed =
    revisions.filter(
      (item) =>
        item.status ===
        "Completed"
    ).length;

  return (
    <div className="revision-page">

      <h1>Revision Queue</h1>

      <div className="revision-stats">

        <div className="stat-card">
          <h3>Due Today</h3>
          <h2>{dueToday}</h2>
        </div>

        <div className="stat-card">
          <h3>Overdue</h3>
          <h2>{overdue}</h2>
        </div>

        <div className="stat-card">
          <h3>Completed</h3>
          <h2>{completed}</h2>
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

              <h3>
                {item.topic}
              </h3>

              <p>
                Type:
                {" "}
                {item.type}
              </p>

              <p>
                Created:
                {" "}
                {
                  item.createdDate
                }
              </p>

              <p>
                Revision:
                {" "}
                {
                  item.revisionDate
                }
              </p>

              <p>
                Status:
                {" "}
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
                  Toggle
                  Status
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