import { useEffect, useState } from "react";
import "./Modules.css";

const DEFAULT_MODULES = [
  { id: 1, name: "Module 1", qa: [], dilr: [], varc: [] },
  { id: 2, name: "Module 2", qa: [], dilr: [], varc: [] },
  { id: 3, name: "Module 3", qa: [], dilr: [], varc: [] },
  { id: 4, name: "Module 4", qa: [], dilr: [], varc: [] }
];

const TOPIC_FIELDS = [
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

function Modules() {
  const [modules, setModules] = useState(() => {
    const saved = localStorage.getItem("moduleTracker");

    if (saved) {
      return JSON.parse(saved);
    }

    return DEFAULT_MODULES;
  });

  const [selectedModule, setSelectedModule] = useState(0);

  const [newQa, setNewQa] = useState("");
  const [newDilr, setNewDilr] = useState("");
  const [newVarc, setNewVarc] = useState("");

  const [expandedTopics, setExpandedTopics] =
    useState({});

  useEffect(() => {
    localStorage.setItem(
      "moduleTracker",
      JSON.stringify(modules)
    );
  }, [modules]);

  const createTopic = (name) => ({
    name,
    theory: false,
    classDone: false,
    practice: false,
    basic: false,
    advanced: false,
    formula: false,
    notes: false,
    revision1: false,
    revision2: false,
    revisionCreated: false
  });

  const calculateProgress = (topic) => {
    const completed =
      TOPIC_FIELDS.filter(
        (field) => topic[field]
      ).length;

    return Math.round(
      (completed / TOPIC_FIELDS.length) * 100
    );
  };

  const addRevisionEntries = (
    topicName
  ) => {
    const existing =
      JSON.parse(
        localStorage.getItem(
          "revisionQueue"
        ) || "[]"
      );

    const alreadyExists =
      existing.some(
        (item) =>
          item.topic === topicName
      );

    if (alreadyExists) {
      return;
    }

    const today = new Date();

    const intervals = [
      1,
      7,
      21,
      60
    ];

    const newEntries =
      intervals.map((days) => {
        const revisionDate =
          new Date(today);

        revisionDate.setDate(
          revisionDate.getDate() +
            days
        );

        return {
          id:
            Date.now() +
            Math.random(),
          topic: topicName,
          type:
            "Auto Revision",
          createdDate:
            today
              .toISOString()
              .split("T")[0],
          revisionDate:
            revisionDate
              .toISOString()
              .split("T")[0],
          status: "Pending"
        };
      });

    localStorage.setItem(
      "revisionQueue",
      JSON.stringify([
        ...existing,
        ...newEntries
      ])
    );
  };

  const addTopic = (
    type,
    value
  ) => {
    if (!value.trim()) return;

    const updated = [...modules];

    updated[selectedModule][type].push(
      createTopic(value)
    );

    setModules(updated);

    if (type === "qa") setNewQa("");
    if (type === "dilr") setNewDilr("");
    if (type === "varc") setNewVarc("");
  };

  const deleteTopic = (
    section,
    topicIndex
  ) => {
    const updated = [...modules];

    updated[selectedModule][section].splice(
      topicIndex,
      1
    );

    setModules(updated);
  };

  const toggleField = (
    section,
    topicIndex,
    field
  ) => {
    const updated = [...modules];

    const topic =
      updated[selectedModule][section][
        topicIndex
      ];

    topic[field] =
      !topic[field];

    const progress =
      calculateProgress(topic);

    if (
      progress === 100 &&
      !topic.revisionCreated
    ) {
      addRevisionEntries(
        topic.name
      );

      topic.revisionCreated =
        true;
    }

    setModules(updated);
  };

  const calculateModuleProgress =
    (module) => {
      const topics = [
        ...module.qa,
        ...module.dilr,
        ...module.varc
      ];

      if (
        topics.length === 0
      ) {
        return 0;
      }

      const total =
        topics.reduce(
          (sum, topic) =>
            sum +
            calculateProgress(
              topic
            ),
          0
        );

      return Math.round(
        total / topics.length
      );
    };

  const getTotalTopics = (
    module
  ) => {
    return (
      module.qa.length +
      module.dilr.length +
      module.varc.length
    );
  };

  const getCompletedTopics =
    (module) => {
      const topics = [
        ...module.qa,
        ...module.dilr,
        ...module.varc
      ];

      return topics.filter(
        (topic) =>
          calculateProgress(
            topic
          ) === 100
      ).length;
    };

  const toggleExpand = (
    key
  ) => {
    setExpandedTopics(
      (prev) => ({
        ...prev,
        [key]:
          !prev[key]
      })
    );
  };

  const currentModule =
    modules[selectedModule];

  const renderSection = (
    title,
    type,
    value,
    setValue
  ) => (
    <div className="section">
      <h3>{title}</h3>

      <div className="input-row">
        <input
          value={value}
          onChange={(e) =>
            setValue(
              e.target.value
            )
          }
          placeholder={`Add ${title} Topic`}
        />

        <button
          onClick={() =>
            addTopic(
              type,
              value
            )
          }
        >
          Add
        </button>
      </div>

      {currentModule[type].map(
        (
          topic,
          topicIndex
        ) => {
          const key = `${type}-${topicIndex}`;

          return (
            <div
              key={topicIndex}
              className="topic-card"
            >
              <div className="topic-header">

                <div>
                  <h4>
                    {topic.name}
                  </h4>

                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{
                        width: `${calculateProgress(
                          topic
                        )}%`
                      }}
                    />
                  </div>

                  <div className="progress-text">
                    {calculateProgress(
                      topic
                    )}
                    %
                  </div>
                </div>

                <div className="topic-actions">

                  <button
                    className="expand-btn"
                    onClick={() =>
                      toggleExpand(
                        key
                      )
                    }
                  >
                    {expandedTopics[
                      key
                    ]
                      ? "Collapse"
                      : "Expand"}
                  </button>

                  <button
                    className="delete-btn"
                    onClick={() =>
                      deleteTopic(
                        type,
                        topicIndex
                      )
                    }
                  >
                    Delete
                  </button>

                </div>

              </div>

              {expandedTopics[
                key
              ] && (
                <div className="checklist">

                  {TOPIC_FIELDS.map(
                    (field) => (
                      <label
                        key={field}
                        className="checkbox-item"
                      >
                        <input
                          type="checkbox"
                          checked={
                            topic[
                              field
                            ]
                          }
                          onChange={() =>
                            toggleField(
                              type,
                              topicIndex,
                              field
                            )
                          }
                        />

                        {field}
                      </label>
                    )
                  )}

                </div>
              )}

            </div>
          );
        }
      )}
    </div>
  );

  return (
    <div className="module-page">

      <h1>Module Tracker</h1>

      <div className="module-selector">

        {modules.map(
          (
            module,
            index
          ) => (
            <button
              key={module.id}
              className={
                selectedModule ===
                index
                  ? "module-btn active"
                  : "module-btn"
              }
              onClick={() =>
                setSelectedModule(
                  index
                )
              }
            >
              {module.name}
            </button>
          )
        )}

      </div>

      <div className="module-card">

        <h2>
          {currentModule.name}
        </h2>

        <div className="module-stats">

          <div className="stat-card">
            <span>
              Progress
            </span>

            <strong>
              {calculateModuleProgress(
                currentModule
              )}
              %
            </strong>
          </div>

          <div className="stat-card">
            <span>
              Total Topics
            </span>

            <strong>
              {getTotalTopics(
                currentModule
              )}
            </strong>
          </div>

          <div className="stat-card">
            <span>
              Completed
            </span>

            <strong>
              {getCompletedTopics(
                currentModule
              )}
            </strong>
          </div>

          <div className="stat-card">
            <span>
              Pending
            </span>

            <strong>
              {getTotalTopics(
                currentModule
              ) -
                getCompletedTopics(
                  currentModule
                )}
            </strong>
          </div>

        </div>

        {renderSection(
          "Quantitative Ability",
          "qa",
          newQa,
          setNewQa
        )}

        {renderSection(
          "DILR",
          "dilr",
          newDilr,
          setNewDilr
        )}

        {renderSection(
          "VARC",
          "varc",
          newVarc,
          setNewVarc
        )}

      </div>

    </div>
  );
}

export default Modules;