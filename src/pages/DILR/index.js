import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabase";
import "./DILR.css";

const DEFAULT_TYPES = [
  "Arrangement",
  "Tournament",
  "Venn Diagram",
  "Distribution",
  "Games & Strategy",
  "Data Interpretation"
];

function DILR() {
  const [sets, setSets] = useState([]);
  const [loading, setLoading] = useState(true);

  const [types, setTypes] = useState(() => {
    const saved = localStorage.getItem("dilrTypes");
    return saved
      ? JSON.parse(saved)
      : DEFAULT_TYPES;
  });

  const [newType, setNewType] =
    useState("");

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
    loadSets();
  }, []);

  useEffect(() => {
    localStorage.setItem(
      "dilrTypes",
      JSON.stringify(types)
    );
  }, [types]);

  const loadSets = async () => {
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
          .from("dilr_sets")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", {
            ascending: false
          });

      if (!error) {
        setSets(data || []);
      }

      setLoading(false);
    } catch (err) {
      console.error("Error loading sets:", err);
      setLoading(false);
    }
  };

  const analytics = useMemo(() => {
    if (sets.length === 0) {
      return {
        totalSets: 0,
        averageAccuracy: 0,
        averageTime: 0,
        hardSets: 0
      };
    }

    const totalAccuracy =
      sets.reduce(
        (sum, set) =>
          sum +
          Number(
            set.accuracy || 0
          ),
        0
      );

    const totalTime =
      sets.reduce(
        (sum, set) =>
          sum +
          Number(
            set.time_taken || 0
          ),
        0
      );

    return {
      totalSets: sets.length,

      averageAccuracy:
        Math.round(
          totalAccuracy /
            sets.length
        ),

      averageTime:
        Math.round(
          totalTime /
            sets.length
        ),

      hardSets:
        sets.filter(
          (s) =>
            s.difficulty ===
            "Hard"
        ).length
    };
  }, [sets]);

  const addType = () => {
    if (!newType.trim())
      return;

    if (
      types.includes(
        newType.trim()
      )
    )
      return;

    setTypes([
      ...types,
      newType.trim()
    ]);

    setNewType("");
  };

  const addSet = async () => {
    if (!form.name.trim())
      return;

    try {
      const {
        data: { user }
      } = await supabase.auth.getUser();

      if (!user) return;

      const newSet = {
        user_id: user.id,

        name: form.name,
        type: form.type,
        difficulty: form.difficulty,
        source: form.source,

        time_taken: Number(
          form.timeTaken || 0
        ),

        accuracy: Number(
          form.accuracy || 0
        ),

        solved: true,
        notes: form.notes
      };

      const { data, error } =
        await supabase
          .from("dilr_sets")
          .insert([newSet])
          .select();

      if (!error && data) {
        setSets([
          data[0],
          ...sets
        ]);

        setForm({
          name: "",
          type: types[0],
          difficulty: "Medium",
          source: "",
          timeTaken: "",
          accuracy: "",
          solved: true,
          notes: ""
        });
      }
    } catch (err) {
      console.error("Error adding set:", err);
    }
  };

  const deleteSet = async (
    id
  ) => {
    try {
      const { error } =
        await supabase
          .from("dilr_sets")
          .delete()
          .eq("id", id);

      if (!error) {
        setSets(
          sets.filter(
            (set) =>
              set.id !== id
          )
        );
      }
    } catch (err) {
      console.error("Error deleting set:", err);
    }
  };

  const getDifficultyClass =
    (
      difficulty
    ) => {
      if (
        difficulty ===
        "Easy"
      )
        return "easy";

      if (
        difficulty ===
        "Hard"
      )
        return "hard";

      return "medium";
    };

  if (loading) {
    return (
      <div className="dilr-page">
        <h1>
          🧩 DILR Tracker
        </h1>
        <h2>
          Loading...
        </h2>
      </div>
    );
  }

  return (
    <div className="dilr-page">

      <h1>
        🧩 DILR Tracker
      </h1>

      <div className="analytics-grid">

        <div className="analytics-card">
          <h3>Total Sets</h3>
          <h2>
            {
              analytics.totalSets
            }
          </h2>
        </div>

        <div className="analytics-card">
          <h3>
            Avg Accuracy
          </h3>
          <h2>
            {
              analytics.averageAccuracy
            }
            %
          </h2>
        </div>

        <div className="analytics-card">
          <h3>
            Avg Time
          </h3>
          <h2>
            {
              analytics.averageTime
            }
            min
          </h2>
        </div>

        <div className="analytics-card">
          <h3>
            Hard Sets
          </h3>
          <h2>
            {
              analytics.hardSets
            }
          </h2>
        </div>

      </div>

      <div className="type-manager">

        <h3>
          Add Custom DILR Type
        </h3>

        <div className="type-row">

          <input
            value={newType}
            placeholder="Supply Chain Puzzle"
            onChange={(e) =>
              setNewType(
                e.target.value
              )
            }
          />

          <button
            onClick={
              addType
            }
          >
            Add Type
          </button>

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
          {types.map(
            (type) => (
              <option
                key={
                  type
                }
              >
                {type}
              </option>
            )
          )}
        </select>

        <select
          value={
            form.difficulty
          }
          onChange={(e) =>
            setForm({
              ...form,
              difficulty:
                e.target.value
            })
          }
        >
          <option>
            Easy
          </option>
          <option>
            Medium
          </option>
          <option>
            Hard
          </option>
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
          placeholder="Time Taken"
          value={
            form.timeTaken
          }
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
          value={
            form.accuracy
          }
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
          onClick={
            addSet
          }
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

            <div className="set-header">

              <h3>
                {set.name}
              </h3>

              <span
                className={`difficulty-badge ${getDifficultyClass(
                  set.difficulty
                )}`}
              >
                {
                  set.difficulty
                }
              </span>

            </div>

            <p>
              🧩 Type:
              {" "}
              {set.type}
            </p>

            <p>
              🎯 Accuracy:
              {" "}
              {set.accuracy}%
            </p>

            <p>
              ⏱ Time:
              {" "}
              {set.time_taken}
              {" "}min
            </p>

            <p>
              📚 Source:
              {" "}
              {set.source}
            </p>

            <p>
              📝 Notes:
              {" "}
              {set.notes}
            </p>

            <button
              className="delete-btn"
              onClick={() =>
                deleteSet(
                  set.id
                )
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