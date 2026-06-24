import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabase";
import "./Dashboard.css";

function Dashboard() {
  const [modules, setModules] = useState([]);
  const [mocks, setMocks] = useState([]);
  const [mistakes, setMistakes] = useState([]);
  const [revisions, setRevisions] = useState([]);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);

      const [
        modulesRes,
        mocksRes,
        mistakesRes,
        revisionsRes,
        settingsRes
      ] = await Promise.all([
        supabase
          .from("modules")
          .select("*")
          .limit(1),

        supabase
          .from("mocks")
          .select("*")
          .order("created_at", {
            ascending: false
          }),

        supabase
          .from("mistakes")
          .select("*"),

        supabase
          .from("revisions")
          .select("*"),

        supabase
          .from("settings")
          .select("*")
          .limit(1)
      ]);

      if (
        modulesRes.data &&
        modulesRes.data.length > 0
      ) {
        setModules(
          modulesRes.data[0]
            .module_data || []
        );
      }

      setMocks(
        mocksRes.data || []
      );

      setMistakes(
        mistakesRes.data || []
      );

      setRevisions(
        revisionsRes.data || []
      );

      if (
        settingsRes.data &&
        settingsRes.data.length > 0
      ) {
        setSettings(
          settingsRes.data[0]
        );
      }
    } catch (error) {
      console.error(
        "Dashboard Error:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  const dashboard = useMemo(() => {
    let totalTopics = 0;
    let completedTopics = 0;

    modules.forEach((module) => {
      const topics = [
        ...(module.qa || []),
        ...(module.dilr || []),
        ...(module.varc || [])
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

    return {
      totalTopics,

      completedTopics,

      pendingTopics:
        totalTopics -
        completedTopics,

      progress:
        totalTopics === 0
          ? 0
          : Math.round(
              (completedTopics /
                totalTopics) *
                100
            ),

      mocks:
        mocks.length,

      mistakes:
        mistakes.filter(
          (m) =>
            m.status ===
            "Open"
        ).length,

      revisions:
        revisions.filter(
          (r) =>
            r.status ===
            "Pending"
        ).length,

      latestMock:
        mocks.length > 0
          ? mocks[0]
          : null
    };
  }, [
    modules,
    mocks,
    mistakes,
    revisions
  ]);

  const catDate =
    settings?.cat_exam_date ||
    "2026-11-29";

  const targetPercentile =
    settings?.target_percentile ||
    99;

  const studyHours =
    settings?.daily_study_hours ||
    4;

  const daysLeft =
    Math.ceil(
      (new Date(catDate) -
        new Date()) /
        (1000 *
          60 *
          60 *
          24)
    );

  if (loading) {
    return (
      <div className="dashboard-page">
        <h1>Loading...</h1>
      </div>
    );
  }

  return (
    <div className="dashboard-page">

      <div className="hero">

        <div>

          <h1>
            🐱 CAT Command Center
          </h1>

          <p>
            Target:
            {" "}
            {targetPercentile}
            %
            {" • "}
            {daysLeft}
            {" "}
            days remaining
          </p>

        </div>

        <div className="hero-score">
          {dashboard.progress}%
        </div>

      </div>

      <div className="progress-section">

        <div className="progress-header">
          Overall Preparation
        </div>

        <div className="progress-track">

          <div
            className="progress-fill"
            style={{
              width:
                `${dashboard.progress}%`
            }}
          />

        </div>

      </div>

      <div className="dashboard-grid">

        <Card
          title="Topics"
          value={
            dashboard.totalTopics
          }
        />

        <Card
          title="Completed"
          value={
            dashboard.completedTopics
          }
        />

        <Card
          title="Pending"
          value={
            dashboard.pendingTopics
          }
        />

        <Card
          title="Mocks"
          value={
            dashboard.mocks
          }
        />

        <Card
          title="Mistakes"
          value={
            dashboard.mistakes
          }
        />

        <Card
          title="Revisions"
          value={
            dashboard.revisions
          }
        />

        <Card
          title="Daily Goal"
          value={`${studyHours}h`}
        />

        <Card
          title="Days Left"
          value={daysLeft}
        />

      </div>

      <div className="dashboard-panels">

        <div className="panel">

          <h2>
            Performance Snapshot
          </h2>

          <div className="snapshot-row">
            <span>
              Completion Rate
            </span>
            <strong>
              {
                dashboard.progress
              }
              %
            </strong>
          </div>

          <div className="snapshot-row">
            <span>
              Open Mistakes
            </span>
            <strong>
              {
                dashboard.mistakes
              }
            </strong>
          </div>

          <div className="snapshot-row">
            <span>
              Pending Revisions
            </span>
            <strong>
              {
                dashboard.revisions
              }
            </strong>
          </div>

        </div>

        <div className="panel">

          <h2>
            Latest Mock
          </h2>

          {dashboard.latestMock ? (
            <>
              <div className="snapshot-row">
                <span>Name</span>
                <strong>
                  {
                    dashboard
                      .latestMock
                      .name
                  }
                </strong>
              </div>

              <div className="snapshot-row">
                <span>Score</span>
                <strong>
                  {
                    dashboard
                      .latestMock
                      .score
                  }
                </strong>
              </div>

              <div className="snapshot-row">
                <span>Percentile</span>
                <strong>
                  {
                    dashboard
                      .latestMock
                      .percentile
                  }
                </strong>
              </div>
            </>
          ) : (
            <p>
              No mocks recorded yet.
            </p>
          )}

        </div>

      </div>

    </div>
  );
}

function Card({
  title,
  value
}) {
  return (
    <div className="dashboard-card">
      <span>{title}</span>
      <h2>{value}</h2>
    </div>
  );
}

export default Dashboard;