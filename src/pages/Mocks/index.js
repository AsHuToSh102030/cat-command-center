import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabase";
import "./Mocks.css";

function Mocks() {
  const [mocks, setMocks] = useState([]);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    name: "",
    date: "",
    score: "",
    percentile: "",
    correct: "",
    incorrect: "",
    strengths: "",
    weaknesses: "",
    lessons: ""
  });

  useEffect(() => {
    loadMocks();
  }, []);

  const loadMocks = async () => {
    const { data, error } = await supabase
      .from("mocks")
      .select("*")
      .order("created_at", {
        ascending: false
      });

    if (error) {
      console.error(error);
    } else {
      setMocks(data || []);
    }

    setLoading(false);
  };

  const analytics = useMemo(() => {
    if (mocks.length === 0) {
      return {
        totalMocks: 0,
        bestScore: 0,
        bestPercentile: 0,
        averageScore: 0,
        averagePercentile: 0
      };
    }

    const scores = mocks.map(
      (mock) => Number(mock.score || 0)
    );

    const percentiles = mocks.map(
      (mock) =>
        Number(mock.percentile || 0)
    );

    return {
      totalMocks: mocks.length,

      bestScore: Math.max(
        ...scores
      ),

      bestPercentile: Math.max(
        ...percentiles
      ),

      averageScore: Math.round(
        scores.reduce(
          (sum, score) =>
            sum + score,
          0
        ) / scores.length
      ),

      averagePercentile:
        Math.round(
          percentiles.reduce(
            (sum, p) => sum + p,
            0
          ) / percentiles.length
        )
    };
  }, [mocks]);

  const addMock = async () => {
    if (!form.name || !form.date)
      return;

    const correct =
      Number(form.correct || 0);

    const incorrect =
      Number(
        form.incorrect || 0
      );

    const attempts =
      correct + incorrect;

    const accuracy =
      attempts === 0
        ? 0
        : Math.round(
            (correct /
              attempts) *
              100
          );

    const newMock = {
      id: Date.now(),

      name: form.name,
      date: form.date,

      score: Number(
        form.score || 0
      ),

      percentile: Number(
        form.percentile || 0
      ),

      correct,
      incorrect,
      attempts,
      accuracy,

      strengths:
        form.strengths,

      weaknesses:
        form.weaknesses,

      lessons:
        form.lessons
    };

    const { data, error } =
      await supabase
        .from("mocks")
        .insert([newMock])
        .select();

    console.log(
      "INSERT DATA:",
      data
    );

    console.log(
      "INSERT ERROR:",
      error
    );

    if (!error && data) {
      setMocks([
        data[0],
        ...mocks
      ]);

      setForm({
        name: "",
        date: "",
        score: "",
        percentile: "",
        correct: "",
        incorrect: "",
        strengths: "",
        weaknesses: "",
        lessons: ""
      });
    }
  };

  const deleteMock = async (
    id
  ) => {
    const { error } =
      await supabase
        .from("mocks")
        .delete()
        .eq("id", id);

    if (!error) {
      setMocks(
        mocks.filter(
          (mock) =>
            mock.id !== id
        )
      );
    }
  };

  if (loading) {
    return (
      <div className="mocks-page">
        <h1>
          🏆 Mock Tracker
        </h1>

        <h2>
          Loading...
        </h2>
      </div>
    );
  }

  return (
    <div className="mocks-page">

      <h1>
        🏆 Mock Tracker
      </h1>

      <div className="analytics-grid">

        <div className="analytics-card">
          <h3>Total Mocks</h3>
          <h2>
            {
              analytics.totalMocks
            }
          </h2>
        </div>

        <div className="analytics-card">
          <h3>Best Score</h3>
          <h2>
            {
              analytics.bestScore
            }
          </h2>
        </div>

        <div className="analytics-card">
          <h3>
            Best Percentile
          </h3>
          <h2>
            {
              analytics.bestPercentile
            }
          </h2>
        </div>

        <div className="analytics-card">
          <h3>
            Avg Score
          </h3>
          <h2>
            {
              analytics.averageScore
            }
          </h2>
        </div>

        <div className="analytics-card">
          <h3>
            Avg Percentile
          </h3>
          <h2>
            {
              analytics.averagePercentile
            }
          </h2>
        </div>

      </div>

      <div className="mock-form">

        <input
          placeholder="Mock Name"
          value={form.name}
          onChange={(e) =>
            setForm({
              ...form,
              name:
                e.target.value
            })
          }
        />

        <input
          type="date"
          value={form.date}
          onChange={(e) =>
            setForm({
              ...form,
              date:
                e.target.value
            })
          }
        />

        <input
          placeholder="Score"
          value={form.score}
          onChange={(e) =>
            setForm({
              ...form,
              score:
                e.target.value
            })
          }
        />

        <input
          placeholder="Percentile"
          value={
            form.percentile
          }
          onChange={(e) =>
            setForm({
              ...form,
              percentile:
                e.target.value
            })
          }
        />

        <input
          placeholder="Correct Questions"
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
          placeholder="Incorrect Questions"
          value={
            form.incorrect
          }
          onChange={(e) =>
            setForm({
              ...form,
              incorrect:
                e.target.value
            })
          }
        />

        <textarea
          placeholder="Strengths"
          value={
            form.strengths
          }
          onChange={(e) =>
            setForm({
              ...form,
              strengths:
                e.target.value
            })
          }
        />

        <textarea
          placeholder="Weaknesses"
          value={
            form.weaknesses
          }
          onChange={(e) =>
            setForm({
              ...form,
              weaknesses:
                e.target.value
            })
          }
        />

        <textarea
          placeholder="Lessons Learned"
          value={
            form.lessons
          }
          onChange={(e) =>
            setForm({
              ...form,
              lessons:
                e.target.value
            })
          }
        />

        <button
          onClick={addMock}
        >
          Add Mock
        </button>

      </div>

      <div className="mock-list">

        {mocks.map((mock) => (
          <div
            key={mock.id}
            className="mock-card"
          >

            <h2>
              {mock.name}
            </h2>

            <p>
              📅 {mock.date}
            </p>

            <p>
              🎯 Score:
              {" "}
              {mock.score}
            </p>

            <p>
              🏆 Percentile:
              {" "}
              {mock.percentile}
            </p>

            <p>
              ✅ Accuracy:
              {" "}
              {mock.accuracy}%
            </p>

            <p>
              💪 Strengths:
              {" "}
              {mock.strengths}
            </p>

            <p>
              ⚠️ Weaknesses:
              {" "}
              {mock.weaknesses}
            </p>

            <p>
              📘 Lessons:
              {" "}
              {mock.lessons}
            </p>

            <button
              className="delete-btn"
              onClick={() =>
                deleteMock(
                  mock.id
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

export default Mocks;