import { useMemo } from "react";

function Dashboard() {
  const catDate =
    localStorage.getItem(
      "catExamDate"
    ) || "2026-11-29";

  const targetPercentile =
    localStorage.getItem(
      "targetPercentile"
    ) || "99";

  const studyHours =
    localStorage.getItem(
      "dailyStudyHours"
    ) || "4";

  const modules = JSON.parse(
    localStorage.getItem(
      "moduleTracker"
    ) || "[]"
  );

  const revisionQueue = JSON.parse(
    localStorage.getItem(
      "revisionQueue"
    ) || "[]"
  );

  const studySessions = JSON.parse(
    localStorage.getItem(
      "studySessions"
    ) || "[]"
  );

  const dashboard = useMemo(() => {
    let totalTopics = 0;
    let completedTopics = 0;

    modules.forEach((module) => {
      const topics = [
        ...module.qa,
        ...module.dilr,
        ...module.varc
      ];

      totalTopics += topics.length;

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

        const done =
          fields.filter(
            (field) =>
              topic[field]
          ).length;

        if (
          done ===
          fields.length
        ) {
          completedTopics++;
        }
      });
    });

    const pendingTopics =
      totalTopics -
      completedTopics;

    const progress =
      totalTopics === 0
        ? 0
        : Math.round(
            (completedTopics /
              totalTopics) *
              100
          );

    return {
      totalTopics,
      completedTopics,
      pendingTopics,
      progress
    };
  }, [modules]);

  const today =
    new Date();

  const examDate =
    new Date(catDate);

  const daysLeft =
    Math.ceil(
      (examDate -
        today) /
        (1000 *
          60 *
          60 *
          24)
    );

  return (
    <div>

      <h1>
        CAT Command Center
      </h1>

      <div
        style={{
          background:
            "#1e293b",
          padding: "25px",
          borderRadius:
            "18px",
          marginBottom:
            "20px",
          border:
            "1px solid #334155"
        }}
      >
        <h2>
          Overall Progress
        </h2>

        <div
          style={{
            width: "100%",
            height: "16px",
            background:
              "#0f172a",
            borderRadius:
              "999px",
            overflow:
              "hidden",
            marginTop:
              "15px"
          }}
        >
          <div
            style={{
              width: `${dashboard.progress}%`,
              height:
                "100%",
              background:
                "#06b6d4"
            }}
          />
        </div>

        <h2
          style={{
            color:
              "#06b6d4",
            marginTop:
              "15px"
          }}
        >
          {dashboard.progress}%
        </h2>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit,minmax(220px,1fr))",
          gap: "15px"
        }}
      >
        <Card
          title="CAT Countdown"
          value={`${daysLeft} Days`}
        />

        <Card
          title="Target Percentile"
          value={targetPercentile}
        />

        <Card
          title="Daily Goal"
          value={`${studyHours} hrs`}
        />

        <Card
          title="Total Topics"
          value={
            dashboard.totalTopics
          }
        />

        <Card
          title="Completed Topics"
          value={
            dashboard.completedTopics
          }
        />

        <Card
          title="Pending Topics"
          value={
            dashboard.pendingTopics
          }
        />

        <Card
          title="Revision Queue"
          value={
            revisionQueue.length
          }
        />

        <Card
          title="Study Sessions"
          value={
            studySessions.length
          }
        />
      </div>

      <div
        style={{
          background:
            "#1e293b",
          padding: "25px",
          borderRadius:
            "18px",
          marginTop:
            "25px",
          border:
            "1px solid #334155"
        }}
      >
        <h2>
          CAT Overview
        </h2>

        <p>
          Days Remaining:
          {" "}
          {daysLeft}
        </p>

        <p>
          Topics Completed:
          {" "}
          {
            dashboard.completedTopics
          }
          /
          {" "}
          {
            dashboard.totalTopics
          }
        </p>

        <p>
          Revision Tasks:
          {" "}
          {
            revisionQueue.length
          }
        </p>

        <p>
          Study Sessions:
          {" "}
          {
            studySessions.length
          }
        </p>
      </div>

    </div>
  );
}

function Card({
  title,
  value
}) {
  return (
    <div
      style={{
        background:
          "#1e293b",
        padding: "20px",
        borderRadius:
          "16px",
        border:
          "1px solid #334155"
      }}
    >
      <h3>{title}</h3>

      <h2
        style={{
          color:
            "#06b6d4"
        }}
      >
        {value}
      </h2>
    </div>
  );
}

export default Dashboard;