import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabase";
import "./Achievements.css";

function Achievements() {
  const [modules, setModules] = useState([]);
  const [mocks, setMocks] = useState([]);
  const [mistakes, setMistakes] = useState([]);
  const [revisions, setRevisions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAchievementsData();
  }, []);

  const loadAchievementsData = async () => {
    try {
      setLoading(true);

      const [
        modulesResponse,
        mocksResponse,
        mistakesResponse,
        revisionsResponse
      ] = await Promise.all([
        supabase
          .from("modules")
          .select("*")
          .limit(1),

        supabase
          .from("mocks")
          .select("*"),

        supabase
          .from("mistakes")
          .select("*"),

        supabase
          .from("revisions")
          .select("*")
      ]);

      if (
        modulesResponse.data &&
        modulesResponse.data.length > 0
      ) {
        setModules(
          modulesResponse.data[0]
            .module_data || []
        );
      }

      setMocks(
        mocksResponse.data || []
      );

      setMistakes(
        mistakesResponse.data || []
      );

      setRevisions(
        revisionsResponse.data || []
      );
    } catch (error) {
      console.error(
        "Achievements Load Error:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  const achievements = useMemo(() => {
    let completedTopics = 0;

    modules.forEach((module) => {
      const topics = [
        ...(module.qa || []),
        ...(module.dilr || []),
        ...(module.varc || [])
      ];

      topics.forEach((topic) => {
        const fields = [
          "theory",
          "classDone",
          "practice",
          "basic",
          "advanced",
          "formula",
          "notes",
          "revision1",
          "revision2"
        ];

        const completed =
          fields.filter(
            (field) => topic[field]
          ).length;

        if (
          completed ===
          fields.length
        ) {
          completedTopics++;
        }
      });
    });

    const fixedMistakes =
      mistakes.filter(
        (m) =>
          m.status === "Fixed"
      ).length;

    const completedRevisions =
      revisions.filter(
        (r) =>
          r.status ===
          "Completed"
      ).length;

    return [
      {
        icon: "🎯",
        name: "First Topic",
        current: completedTopics,
        target: 1
      },
      {
        icon: "🥉",
        name: "Topic Crusher",
        current: completedTopics,
        target: 10
      },
      {
        icon: "🥈",
        name: "Topic Master",
        current: completedTopics,
        target: 25
      },
      {
        icon: "🥇",
        name: "Topic Legend",
        current: completedTopics,
        target: 50
      },
      {
        icon: "🏆",
        name: "Mock Warrior",
        current: mocks.length,
        target: 5
      },
      {
        icon: "⚔️",
        name: "Mock Monster",
        current: mocks.length,
        target: 20
      },
      {
        icon: "🔍",
        name: "Mistake Hunter",
        current: fixedMistakes,
        target: 10
      },
      {
        icon: "📚",
        name: "Revision Master",
        current: completedRevisions,
        target: 25
      },
      {
        icon: "👑",
        name: "CAT Machine",
        current:
          completedTopics +
          mocks.length,
        target: 70
      }
    ];
  }, [
    modules,
    mocks,
    mistakes,
    revisions
  ]);

  const unlockedCount =
    achievements.filter(
      (a) =>
        a.current >= a.target
    ).length;

  if (loading) {
    return (
      <div className="achievements-page">
        <h1>🏆 Achievements</h1>
        <h2>Loading...</h2>
      </div>
    );
  }

  return (
    <div className="achievements-page">

      <h1>
        🏆 Achievements
      </h1>

      <div className="achievement-summary">

        <h2>
          {unlockedCount}
          {" / "}
          {achievements.length}
          {" "}
          Achievements Unlocked
        </h2>

        <p>
          Track your CAT journey
          through completed topics,
          mocks, revisions and
          mistake fixing.
        </p>

      </div>

      <div className="achievement-grid">

        {achievements.map(
          (
            achievement,
            index
          ) => {
            const unlocked =
              achievement.current >=
              achievement.target;

            const progress =
              Math.min(
                100,
                Math.round(
                  (achievement.current /
                    achievement.target) *
                    100
                )
              );

            return (
              <div
                key={index}
                className={
                  unlocked
                    ? "achievement unlocked"
                    : "achievement locked"
                }
              >

                <div className="achievement-icon">
                  {
                    achievement.icon
                  }
                </div>

                <div className="achievement-badge">
                  {unlocked
                    ? "🏆"
                    : "🔒"}
                </div>

                <h2>
                  {
                    achievement.name
                  }
                </h2>

                <p>
                  Progress:
                  {" "}
                  {
                    achievement.current
                  }
                  {" / "}
                  {
                    achievement.target
                  }
                </p>

                <div className="progress-container">

                  <div className="progress-track">

                    <div
                      className="progress-fill"
                      style={{
                        width:
                          `${progress}%`
                      }}
                    />

                  </div>

                  <div className="progress-text">
                    {progress}%
                  </div>

                </div>

              </div>
            );
          }
        )}

      </div>

    </div>
  );
}

export default Achievements;