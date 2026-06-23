import { useEffect, useState } from "react";
import "./Mistakes.css";

function Mistakes() {
  const [mistakes, setMistakes] = useState(() => {
    const saved = localStorage.getItem(
      "mistakeLog"
    );

    if (saved) {
      return JSON.parse(saved);
    }

    return [];
  });

  const [form, setForm] = useState({
    topic: "",
    source: "",
    question: "",
    type: "",
    reason: "",
    approach: ""
  });

  useEffect(() => {
    localStorage.setItem(
      "mistakeLog",
      JSON.stringify(mistakes)
    );
  }, [mistakes]);

  const addMistake = () => {
    if (
      !form.topic ||
      !form.type
    ) {
      return;
    }

    setMistakes([
      {
        id: Date.now(),
        ...form,
        status: "Open"
      },
      ...mistakes
    ]);

    setForm({
      topic: "",
      source: "",
      question: "",
      type: "",
      reason: "",
      approach: ""
    });
  };

  const toggleStatus = (id) => {
    setMistakes(
      mistakes.map(
        (mistake) => {
          if (
            mistake.id !== id
          ) {
            return mistake;
          }

          return {
            ...mistake,
            status:
              mistake.status ===
              "Open"
                ? "Fixed"
                : "Open"
          };
        }
      )
    );
  };

  const deleteMistake = (
    id
  ) => {
    setMistakes(
      mistakes.filter(
        (mistake) =>
          mistake.id !== id
      )
    );
  };

  return (
    <div className="mistakes-page">

      <h1>Mistake Log</h1>

      <div className="mistake-form">

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

        <input
          placeholder="Mistake Type"
          value={form.type}
          onChange={(e) =>
            setForm({
              ...form,
              type:
                e.target.value
            })
          }
        />

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

              <h3>
                {
                  mistake.topic
                }
              </h3>

              <p>
                Source:
                {" "}
                {
                  mistake.source
                }
              </p>

              <p>
                Question:
                {" "}
                {
                  mistake.question
                }
              </p>

              <p>
                Type:
                {" "}
                {mistake.type}
              </p>

              <p>
                Reason:
                {" "}
                {
                  mistake.reason
                }
              </p>

              <p>
                Correct
                Approach:
                {" "}
                {
                  mistake.approach
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
                  Status
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