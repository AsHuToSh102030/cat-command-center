import { useEffect, useMemo, useState } from "react";
import "./Goals.css";

function Goals() {
  const [goals, setGoals] = useState(() => {
    const saved = localStorage.getItem("catGoals");

    if (saved) {
      return JSON.parse(saved);
    }

    return [];
  });

  const [goal, setGoal] = useState("");

  useEffect(() => {
    localStorage.setItem(
      "catGoals",
      JSON.stringify(goals)
    );
  }, [goals]);

  const addGoal = () => {
    if (!goal.trim()) return;

    setGoals([
      {
        id: Date.now(),
        text: goal,
        completed: false
      },
      ...goals
    ]);

    setGoal("");
  };

  const toggleGoal = (id) => {
    setGoals(
      goals.map((goal) =>
        goal.id === id
          ? {
              ...goal,
              completed:
                !goal.completed
            }
          : goal
      )
    );
  };

  const deleteGoal = (id) => {
    setGoals(
      goals.filter(
        (goal) => goal.id !== id
      )
    );
  };

  const stats = useMemo(() => {
    return {
      total: goals.length,
      completed: goals.filter(
        (goal) =>
          goal.completed
      ).length
    };
  }, [goals]);

  return (
    <div className="goals-page">

      <h1>Goals Tracker</h1>

      <div className="stats-grid">

        <div className="stat-card">
          <h3>Total Goals</h3>
          <h2>{stats.total}</h2>
        </div>

        <div className="stat-card">
          <h3>Completed</h3>
          <h2>
            {stats.completed}
          </h2>
        </div>

      </div>

      <div className="goal-form">

        <input
          placeholder="Add Goal"
          value={goal}
          onChange={(e) =>
            setGoal(
              e.target.value
            )
          }
        />

        <button
          onClick={addGoal}
        >
          Add Goal
        </button>

      </div>

      <div className="goal-list">

        {goals.map((goal) => (
          <div
            key={goal.id}
            className="goal-card"
          >

            <h3>
              {goal.text}
            </h3>

            <p>
              Status:
              {" "}
              {goal.completed
                ? "Completed"
                : "Pending"}
            </p>

            <div className="goal-actions">

              <button
                onClick={() =>
                  toggleGoal(
                    goal.id
                  )
                }
              >
                Toggle
              </button>

              <button
                className="delete-btn"
                onClick={() =>
                  deleteGoal(
                    goal.id
                  )
                }
              >
                Delete
              </button>

            </div>

          </div>
        ))}

      </div>

    </div>
  );
}

export default Goals;