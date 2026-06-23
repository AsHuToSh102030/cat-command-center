import { useEffect, useMemo, useState } from "react";
import "./Mocks.css";

function Mocks() {
  const [mocks, setMocks] = useState(() => {
    const saved = localStorage.getItem("mockTests");

    if (saved) {
      return JSON.parse(saved);
    }

    return [];
  });

  const [form, setForm] = useState({
    name: "",
    date: "",
    score: "",
    percentile: "",
    correct: "",
    incorrect: ""
  });

  useEffect(() => {
    localStorage.setItem(
      "mockTests",
      JSON.stringify(mocks)
    );
  }, [mocks]);

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
      (mock) => Number(mock.score)
    );

    const percentiles = mocks.map(
      (mock) =>
        Number(mock.percentile)
    );

    const averageScore =
      scores.reduce(
        (sum, value) =>
          sum + value,
        0
      ) / scores.length;

    const averagePercentile =
      percentiles.reduce(
        (sum, value) =>
          sum + value,
        0
      ) / percentiles.length;

    return {
      totalMocks: mocks.length,
      bestScore: Math.max(
        ...scores
      ),
      bestPercentile: Math.max(
        ...percentiles
      ),
      averageScore:
        Math.round(
          averageScore * 10
        ) / 10,
      averagePercentile:
        Math.round(
          averagePercentile *
            10
        ) / 10
    };
  }, [mocks]);

  const addMock = () => {
    if (
      !form.name ||
      !form.date
    ) {
      return;
    }

    const correct =
      Number(form.correct);

    const incorrect =
      Number(form.incorrect);

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
      ...form,
      attempts,
      accuracy
    };

    setMocks([
      newMock,
      ...mocks
    ]);

    setForm({
      name: "",
      date: "",
      score: "",
      percentile: "",
      correct: "",
      incorrect: ""
    });
  };

  const deleteMock = (id) => {
    setMocks(
      mocks.filter(
        (mock) =>
          mock.id !== id
      )
    );
  };

  return (
    <div className="mocks-page">

      <h1>Mock Test Tracker</h1>

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
            Average Score
          </h3>
          <h2>
            {
              analytics.averageScore
            }
          </h2>
        </div>

        <div className="analytics-card">
          <h3>
            Average Percentile
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

            <h3>{mock.name}</h3>

            <p>
              Date:
              {" "}
              {mock.date}
            </p>

            <p>
              Score:
              {" "}
              {mock.score}
            </p>

            <p>
              Percentile:
              {" "}
              {
                mock.percentile
              }
            </p>

            <p>
              Attempts:
              {" "}
              {mock.attempts}
            </p>

            <p>
              Accuracy:
              {" "}
              {mock.accuracy}%
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