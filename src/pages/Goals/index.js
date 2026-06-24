```jsx
import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabase";
import "./Goals.css";

function Goals() {
  const [goals, setGoals] = useState([]);
  const [goal, setGoal] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadGoals();
  }, []);

  const loadGoals = async () => {
    try {
      setLoading(true);

      const {
        data: { user }
      } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("goals")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", {
          ascending: false
        });

      if (!error) {
        setGoals(data || []);
      }
    } catch (error) {
      console.error(
        "Goals Load Error:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  const addGoal = async () => {
    if (!goal.trim()) return;

    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user) return;

    const newGoal = {
      user_id: user.id,
      text: goal,
      completed: false
    };

    const { data, error } = await supabase
      .from("goals")
      .insert([newGoal])
      .select();

    if (!error && data) {
      setGoals([
        data[0],
        ...goals
      ]);

      setGoal("");
    }
  };

  const toggleGoal = async (id) => {
    const currentGoal = goals.find(
      (goal) => goal.id === id
    );

    if (!currentGoal) return;

    const updatedValue =
      !currentGoal.completed;

    const { error } = await supabase
      .from("goals")
      .update({
        completed: updatedValue
      })
      .eq("id", id);

    if (!error) {
      setGoals(
        goals.map((goal) =>
          goal.id === id
            ? {
                ...goal,
                completed:
                  updatedValue
              }
            : goal
        )
      );
    }
  };

  const deleteGoal = async (id) => {
    const { error } = await supabase
      .from("goals")
      .delete()
      .eq("id", id);

    if (!error) {
      setGoals(
        goals.filter(
          (goal) => goal.id !== id
        )
      );
    }
  };

  const stats = useMemo(() => {
    return {
      total: goals.length,
      completed:
        goals.filter(
          (goal) =>
            goal.completed
        ).length
    };
  }, [goals]);

  if (loading) {
    return (
      <div className="goals-page">
        <h1>🎯 Goals Tracker</h1>
        <h2>Loading...</h2>
      </div>
    );
  }

  return (
    <div className="goals-page">

      <h1>🎯 Goals Tracker</h1>

      <div className="stats-grid">

        <div className="stat-card">
          <h3>Total Goals</h3>
          <h2>{stats.total}</h2>
        </div>

        <div className="stat-card">
          <h3>Completed</h3>
          <h2>{stats.completed}</h2>
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

        {goals.length === 0 && (
          <div className="goal-card">
            <h3>No Goals Yet</h3>
            <p>
              Add your first CAT goal.
            </p>
          </div>
        )}

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
                ? "✅ Completed"
                : "⏳ Pending"}
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
```
