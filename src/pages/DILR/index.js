import { useEffect, useMemo, useState } from "react";
import "./DILR.css";

function DILR() {
  const [sets, setSets] = useState(() => {
    const saved = localStorage.getItem("dilrSets");

    if (saved) {
      return JSON.parse(saved);
    }

    return [];
  });

  const [form, setForm] = useState({
    name: "",
    type: "Arrangement",
    difficulty: "Medium",
    source: "",
    timeTaken: "",
    accuracy: "",
    solved: true,
    notes: ""
  });

  useEffect(() => {
    localStorage.setItem(
      "dilrSets",
      JSON.stringify(sets)
    );
  }, [sets]);

  const analytics = useMemo(() => {
    if (sets.length === 0) {
      return {
        totalSets: 0,
        averageAccuracy: 0,
        averageTime: 0,
        easySets: 0,
        mediumSets: 0,
        hardSets: 0
      };
    }

    const totalAccuracy = sets.reduce(
      (sum, set) =>
        sum + Number(set.accuracy),
      0
    );

    const totalTime = sets.reduce(
      (sum, set) =>
        sum +
        Number(set.timeTaken || 0),
      0
    );

    return {
      totalSets: sets.length,
      averageAccuracy: Math.round(
        totalAccuracy / sets.length
      ),
      averageTime: Math.round(
        totalTime / sets.length
      ),
      easySets: sets.filter(
        (s) =>
          s.difficulty === "Easy"
      ).length,
      mediumSets: sets.filter(
        (s) =>
          s.difficulty ===
          "Medium"
      ).length,
      hardSets: sets.filter(
        (s) =>
          s.difficulty === "Hard"
      ).length
    };
  }, [sets]);

  const addSet = () => {
    if (!form.name) return;

    const newSet = {
      id: Date.now(),
      ...form
    };

    setSets([newSet, ...sets]);

    setForm({
      name: "",
      type: "Arrangement",
      difficulty: "Medium",
      source: "",
      timeTaken: "",
      accuracy: "",
      solved: true,
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
    <div className="dilr-page">

      <h1>DILR Set Tracker</h1>

      <div className="analytics-grid">

        <div className="analytics-card">
          <h3>Total Sets</h3>
          <h2>
            {analytics.totalSets}
          </h2>
        </div>

        <div className="analytics-card">
          <h3>
            Average Accuracy
          </h3>
          <h2>
            {
              analytics.averageAccuracy
            }
            %
          </h2>
        </div>

        <div className="analytics-card">
          <h3>Average Time</h3>
          <h2>
            {
              analytics.averageTime
            }
            min
          </h2>
        </div>

        <div className="analytics-card">
          <h3>Hard Sets</h3>
          <h2>
            {analytics.hardSets}
          </h2>
        </div>

      </div>

      <div className="dilr-form">

        <input
          placeholder="Set Name"
          value={form.name}
          onChange={(e) =>
            setForm({
              ...form,
              name:
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
            Arrangement
          </option>
          <option>
            Tournament
          </option>
          <option>
            Venn Diagram
          </option>
          <option>
            Distribution
          </option>
          <option>
            Games & Strategy
          </option>
          <option>
            Data Interpretation
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
          placeholder="Time Taken (minutes)"
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
          placeholder="Accuracy %"
          value={form.accuracy}
          onChange={(e) =>
            setForm({
              ...form,
              accuracy:
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
          onClick={addSet}
        >
          Add DILR Set
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
              Type:
              {" "}
              {set.type}
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
              {set.timeTaken}
              min
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

export default DILR;