import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabase";
import "./Goals.css";

function Goals() {
  const [goals, setGoals] = useState([]);
  const [goal, setGoal] = useState("");
  const [loading, setLoading] = useState(true);
  const [expandedDates, setExpandedDates] = useState({});

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

  const toggleExpandDate =
    (date) => {
      setExpandedDates(
        (prev) => ({
          ...prev,
          [date]: !prev[date]
        })
      );
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

  const groupedGoals = useMemo(() => {
    const grouped = {};

    goals.forEach((goal) => {
      const date =
        new Date(goal.created_at)
          .toISOString()
          .split("T")[0];

      if (!grouped[date]) {
        grouped[date] = [];
      }

      grouped[date].push(goal);
    });

    const sorted =
      Object.entries(grouped)
        .sort(
          ([dateA], [dateB]) =>
            new Date(dateB) -
            new Date(dateA)
        );

    return sorted.map(
      ([date, goalsForDate]) => {
        const completed =
          goalsForDate.filter(
            (g) =>
              g.completed
          ).length;

        return {
          date,
          goals: goalsForDate,
          total:
            goalsForDate.length,
          completed,
          pending:
            goalsForDate.length -
            completed
        };
      }
    );
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

        {groupedGoals.length === 0 && (
          <div className="goal-card">
            <h3>No Goals Yet</h3>
            <p>
              Add your first CAT goal.
            </p>
          </div>
        )}

        {groupedGoals.map(
          (dayGroup) => (
            <div
              key={dayGroup.date}
              className="day-group-card"
            >

              <div
                className="day-group-header"
                onClick={() =>
                  toggleExpandDate(
                    dayGroup.date
                  )
                }
              >

                <div className="day-group-info">
                  <h3>
                    📅{" "}
                    {
                      dayGroup.date
                    }
                  </h3>

                  <div className="day-group-stats">
                    <span>
                      {
                        dayGroup.total
                      }
                      {" "}
                      goals
                    </span>

                    <span>
                      •
                    </span>

                    <span>
                      {
                        dayGroup.completed
                      }
                      {" "}
                      completed
                    </span>

                    <span>
                      •
                    </span>

                    <span>
                      {
                        dayGroup.pending
                      }
                      {" "}
                      pending
                    </span>
                  </div>
                </div>

                <div className="expand-icon">
                  {
                    expandedDates[
                      dayGroup.date
                    ]
                      ? "▼"
                      : "▶"
                  }
                </div>

              </div>

              {expandedDates[
                dayGroup.date
              ] && (
                <div className="day-group-goals">

                  {dayGroup.goals.map(
                    (goal) => (
                      <div
                        key={goal.id}
                        className="grouped-goal-item"
                      >

                        <div className="goal-details">
                          <h4>
                            {goal.text}
                          </h4>

                          <p>
                            Status:
                            {" "}
                            {goal.completed
                              ? "✅ Completed"
                              : "⏳ Pending"}
                          </p>
                        </div>

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
                    )
                  )}

                </div>
              )}

            </div>
          )
        )}

      </div>

    </div>
  );
}

export default Goals;