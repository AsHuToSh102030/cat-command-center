import { useEffect, useMemo, useState } from "react";
import "./VARC.css";

function VARC() {
  const [sets, setSets] = useState(() => {
    const saved = localStorage.getItem("varcSets");

    if (saved) {
      return JSON.parse(saved);
    }

    return [];
  });

  const [form, setForm] = useState({
    name: "",
    type: "Reading Comprehension",
    difficulty: "Medium",
    questions: "",
    correct: "",
    incorrect: "",
    timeTaken: "",
    source: "",
    notes: ""
  });

  useEffect(() => {
    localStorage.setItem(
      "varcSets",
      JSON.stringify(sets)
    );
  }, [sets]);

  const analytics = useMemo(() => {
    if (sets.length === 0) {
      return {
        totalSets: 0,
        averageAccuracy: 0,
        averageTime: 0
      };
    }

    const totalAccuracy = sets.reduce(
      (sum, set) => sum + set.accuracy,
      0
    );

    const totalTime = sets.reduce(
      (sum, set) =>
        sum + Number(set.timeTaken || 0),
      0
    );

    return {
      totalSets: sets.length,
      averageAccuracy: Math.round(
        totalAccuracy / sets.length
      ),
      averageTime: Math.round(
        totalTime / sets.length
      )
    };
  }, [sets]);

  const addSet = () => {
    if (!form.name) return;

    const correct = Number(form.correct);
    const incorrect = Number(form.incorrect);

    const attempts =
      correct + incorrect;

    const accuracy =
      attempts === 0
        ? 0
        : Math.round(
            (correct / attempts) * 100
          );

    const newSet = {
      id: Date.now(),
      ...form,
      accuracy
    };

    setSets([newSet, ...sets]);

    setForm({
      name: "",
      type: "Reading Comprehension",
      difficulty: "Medium",
      questions: "",
      correct: "",
      incorrect: "",
      timeTaken: "",
      source: "",
      notes: ""
    });
  };

  const deleteSet = (id) => {
    setSets(
      sets.filter(
        (set) => set.id !== id
      )
    );
  };

  return (
    <div className="varc-page">
      <h1>VARC Tracker</h1>

      <div className="analytics-grid">
        <div className="analytics-card">
          <h3>Total Sets</h3>
          <h2>
            {analytics.totalSets}
          </h2>
        </div>

        <div className="analytics-card">
          <h3>Average Accuracy</h3>
          <h2>
            {analytics.averageAccuracy}%
          </h2>
        </div>

        <div className="analytics-card">
          <h3>Average Time</h3>
          <h2>
            {analytics.averageTime} min
          </h2>
        </div>
      </div>

      <div className="varc-form">
        <input
          placeholder="Set Name"
          value={form.name}
          onChange={(e) =>
            setForm({
              ...form,
              name: e.target.value
            })
          }
        />

        <select
          value={form.type}
          onChange={(e) =>
            setForm({
              ...form,
              type: e.target.value
            })
          }
        >
          <option>
            Reading Comprehension
          </option>
          <option>
            Critical Reasoning
          </option>
          <option>
            Para Jumble
          </option>
          <option>
            Para Summary
          </option>
          <option>
            Odd One Out
          </option>
        </select>

        <select
          value={form.difficulty}
          onChange={(e) =>
            setForm({
              ...form,
              difficulty:
                e.target.value
            })
          }
        >
          <option>Easy</option>
          <option>Medium</option>
          <option>Hard</option>
        </select>

        <input
          placeholder="Questions"
          value={form.questions}
          onChange={(e) =>
            setForm({
              ...form,
              questions:
                e.target.value
            })
          }
        />

        <input
          placeholder="Correct"
          value={form.correct}
          onChange={(e) =>
            setForm({
              ...form,
              correct:
                e.target.value
            })
          }
        />

        <input
          placeholder="Incorrect"
          value={form.incorrect}
          onChange={(e) =>
            setForm({
              ...form,
              incorrect:
                e.target.value
            })
          }
        />

        <input
          placeholder="Time (minutes)"
          value={form.timeTaken}
          onChange={(e) =>
            setForm({
              ...form,
              timeTaken:
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

        <button onClick={addSet}>
          Add VARC Set
        </button>
      </div>

      <div className="set-list">
        {sets.map((set) => (
          <div
            key={set.id}
            className="set-card"
          >
            <h3>{set.name}</h3>

            <p>
              Type: {set.type}
            </p>

            <p>
              Difficulty:
              {" "}
              {set.difficulty}
            </p>

            <p>
              Accuracy:
              {" "}
              {set.accuracy}%
            </p>

            <p>
              Time:
              {" "}
              {set.timeTaken} min
            </p>

            <p>
              Source:
              {" "}
              {set.source}
            </p>

            <p>
              Notes:
              {" "}
              {set.notes}
            </p>

            <button
              className="delete-btn"
              onClick={() =>
                deleteSet(set.id)
              }
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default VARC;