import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabase";
import "./VARC.css";

const DEFAULT_TYPES = [
  "Reading Comprehension",
  "Critical Reasoning",
  "Para Jumble",
  "Para Summary",
  "Odd One Out"
];

function VARC() {
  const [sets, setSets] = useState([]);
  const [loading, setLoading] = useState(true);

  const [customTypes, setCustomTypes] = useState(() => {
    const saved = localStorage.getItem("varcCustomTypes");
    return saved ? JSON.parse(saved) : [];
  });

  const [newType, setNewType] = useState("");

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
    loadSets();
  }, []);

  useEffect(() => {
    localStorage.setItem(
      "varcCustomTypes",
      JSON.stringify(customTypes)
    );
  }, [customTypes]);

  const loadSets = async () => {
    const { data, error } = await supabase
      .from("varc_sets")
      .select("*")
      .order("created_at", {
        ascending: false
      });

    console.log("VARC DATA:", data);
    console.log("VARC ERROR:", error);

    if (!error) {
      setSets(data || []);
    }

    setLoading(false);
  };

  const analytics = useMemo(() => {
    if (!sets.length) {
      return {
        totalSets: 0,
        averageAccuracy: 0,
        averageTime: 0,
        bestAccuracy: 0
      };
    }

    return {
      totalSets: sets.length,

      averageAccuracy: Math.round(
        sets.reduce(
          (sum, set) =>
            sum + Number(set.accuracy || 0),
          0
        ) / sets.length
      ),

      averageTime: Math.round(
        sets.reduce(
          (sum, set) =>
            sum +
            Number(
              set.time_taken || 0
            ),
          0
        ) / sets.length
      ),

      bestAccuracy: Math.max(
        ...sets.map(
          (set) =>
            Number(set.accuracy || 0)
        )
      )
    };
  }, [sets]);

  const addCustomType = () => {
    if (
      !newType.trim() ||
      customTypes.includes(newType)
    )
      return;

    setCustomTypes([
      ...customTypes,
      newType
    ]);

    setNewType("");
  };

  const addSet = async () => {
    if (!form.name) return;

    const correct =
      Number(form.correct || 0);

    const incorrect =
      Number(form.incorrect || 0);

    const attempts =
      correct + incorrect;

    const accuracy =
      attempts === 0
        ? 0
        : Math.round(
            (correct / attempts) * 100
          );

    const newSet = {
      name: form.name,
      type: form.type,
      difficulty: form.difficulty,
      questions: Number(
        form.questions || 0
      ),
      correct,
      incorrect,
      accuracy,
      time_taken: Number(
        form.timeTaken || 0
      ),
      source: form.source,
      notes: form.notes
    };

    const { data, error } =
      await supabase
        .from("varc_sets")
        .insert([newSet])
        .select();

    console.log(data);
    console.log(error);

    if (!error && data) {
      setSets([
        data[0],
        ...sets
      ]);

      setForm({
        name: "",
        type:
          "Reading Comprehension",
        difficulty:
          "Medium",
        questions: "",
        correct: "",
        incorrect: "",
        timeTaken: "",
        source: "",
        notes: ""
      });
    }
  };

  const deleteSet = async (
    id
  ) => {
    const { error } =
      await supabase
        .from("varc_sets")
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
  };

  if (loading) {
    return (
      <div className="varc-page">
        <h1>📖 VARC Tracker</h1>
        <h2>Loading...</h2>
      </div>
    );
  }

  return (
    <div className="varc-page">

      <h1>📖 VARC Tracker</h1>

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
            {
              analytics.averageAccuracy
            }
            %
          </h2>
        </div>

        <div className="analytics-card">
          <h3>Average Time</h3>
          <h2>
            {analytics.averageTime}
            min
          </h2>
        </div>

        <div className="analytics-card">
          <h3>Best Accuracy</h3>
          <h2>
            {analytics.bestAccuracy}
            %
          </h2>
        </div>

      </div>
      <div className="custom-type-box">

        <input
          placeholder="Add Custom VARC Type"
          value={newType}
          onChange={(e) =>
            setNewType(
              e.target.value
            )
          }
        />

        <button
          onClick={addCustomType}
        >
          Add Type
        </button>

      </div>

      <div className="varc-form">

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
          {[
            ...DEFAULT_TYPES,
            ...customTypes
          ].map((type) => (
            <option
              key={type}
            >
              {type}
            </option>
          ))}
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

        <button
          onClick={addSet}
        >
          Add VARC Set
        </button>

      </div>

      <div className="set-list">

        {sets.map((set) => (
          <div
            key={set.id}
            className="set-card"
          >

            <h2>{set.name}</h2>

            <p>
              📚 {set.type}
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
              min
            </p>

            <p>
              🔥 Difficulty:
              {" "}
              {set.difficulty}
            </p>

            <p>
              📖 Source:
              {" "}
              {set.source}
            </p>

            <p>
              📝 {set.notes}
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