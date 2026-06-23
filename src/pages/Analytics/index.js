import { useMemo } from "react";
import "./Analytics.css";

function Analytics() {
  const modules = JSON.parse(
    localStorage.getItem("moduleTracker") || "[]"
  );

  const mocks = JSON.parse(
    localStorage.getItem("mockTests") || "[]"
  );

  const mistakes = JSON.parse(
    localStorage.getItem("mistakeLog") || "[]"
  );

  const revisions = JSON.parse(
    localStorage.getItem("revisionQueue") || "[]"
  );

  const varcSets = JSON.parse(
    localStorage.getItem("varcSets") || "[]"
  );

  const analytics = useMemo(() => {
    let totalTopics = 0;
    let completedTopics = 0;
    let totalProgress = 0;

    const weakTopics = [];
    const strongTopics = [];

    modules.forEach((module) => {
      const allTopics = [
        ...module.qa,
        ...module.dilr,
        ...module.varc
      ];

      totalTopics += allTopics.length;

      allTopics.forEach((topic) => {
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

        const progress = Math.round(
          (completed / fields.length) * 100
        );

        totalProgress += progress;

        if (progress === 100) {
          completedTopics++;
        }

        if (progress <= 40) {
          weakTopics.push({
            name: topic.name,
            progress
          });
        }

        if (progress === 100) {
          strongTopics.push({
            name: topic.name,
            progress
          });
        }
      });
    });

    weakTopics.sort(
      (a, b) => a.progress - b.progress
    );

    strongTopics.sort(
      (a, b) => b.progress - a.progress
    );

    return {
      totalTopics,
      completedTopics,
      pendingTopics:
        totalTopics - completedTopics,
      overallProgress:
        totalTopics === 0
          ? 0
          : Math.round(
              totalProgress /
                totalTopics
            ),
      totalMocks: mocks.length,
      totalMistakes:
        mistakes.length,
      openMistakes:
        mistakes.filter(
          (m) =>
            m.status === "Open"
        ).length,
      completedRevisions:
        revisions.filter(
          (r) =>
            r.status ===
            "Completed"
        ).length,
      pendingRevisions:
        revisions.filter(
          (r) =>
            r.status ===
            "Pending"
        ).length,
      totalVarcSets:
        varcSets.length,
      weakTopics:
        weakTopics.slice(0, 5),
      strongTopics:
        strongTopics.slice(0, 5)
    };
  }, [
    modules,
    mocks,
    mistakes,
    revisions,
    varcSets
  ]);

  return (
    <div className="analytics-page">
      <h1>Analytics Center</h1>

      <div className="stats-grid">

        <div className="card">
          <h3>
            Overall Progress
          </h3>
          <h2>
            {
              analytics.overallProgress
            }
            %
          </h2>
        </div>

        <div className="card">
          <h3>Total Topics</h3>
          <h2>
            {
              analytics.totalTopics
            }
          </h2>
        </div>

        <div className="card">
          <h3>Completed</h3>
          <h2>
            {
              analytics.completedTopics
            }
          </h2>
        </div>

        <div className="card">
          <h3>Pending</h3>
          <h2>
            {
              analytics.pendingTopics
            }
          </h2>
        </div>

        <div className="card">
          <h3>Total Mocks</h3>
          <h2>
            {
              analytics.totalMocks
            }
          </h2>
        </div>

        <div className="card">
          <h3>Total Mistakes</h3>
          <h2>
            {
              analytics.totalMistakes
            }
          </h2>
        </div>

        <div className="card">
          <h3>Open Mistakes</h3>
          <h2>
            {
              analytics.openMistakes
            }
          </h2>
        </div>

        <div className="card">
          <h3>
            Pending Revisions
          </h3>
          <h2>
            {
              analytics.pendingRevisions
            }
          </h2>
        </div>

      </div>

      <div className="lists">

        <div className="list-card">

          <h2>
            Weakest Topics
          </h2>

          {analytics.weakTopics.length ===
          0 ? (
            <p>
              No weak topics yet
            </p>
          ) : (
            analytics.weakTopics.map(
              (
                topic,
                index
              ) => (
                <div
                  key={index}
                  className="topic-row"
                >
                  <span>
                    {topic.name}
                  </span>

                  <strong>
                    {
                      topic.progress
                    }
                    %
                  </strong>
                </div>
              )
            )
          )}

        </div>

        <div className="list-card">

          <h2>
            Strongest Topics
          </h2>

          {analytics
            .strongTopics
            .length === 0 ? (
            <p>
              No completed
              topics yet
            </p>
          ) : (
            analytics.strongTopics.map(
              (
                topic,
                index
              ) => (
                <div
                  key={index}
                  className="topic-row"
                >
                  <span>
                    {topic.name}
                  </span>

                  <strong>
                    {
                      topic.progress
                    }
                    %
                  </strong>
                </div>
              )
            )
          )}

        </div>

      </div>
    </div>
  );
}

export default Analytics;