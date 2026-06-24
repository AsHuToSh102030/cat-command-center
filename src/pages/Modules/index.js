import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
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
  const [modules, setModules] = useState(DEFAULT_MODULES);
  const [selectedModule, setSelectedModule] = useState(0);
  const [expandedTopics, setExpandedTopics] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [bulkImportText, setBulkImportText] = useState("");
  const [loading, setLoading] = useState(true);
  const [supabaseId, setSupabaseId] = useState(null);

  useEffect(() => {
    loadModulesFromSupabase();
  }, []);

  const loadModulesFromSupabase = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from("modules")
        .select("*")
        .limit(1);

      if (error) {
        console.error("Error loading modules:", error);
        setLoading(false);
        return;
      }

      if (data && data.length > 0) {
        setSupabaseId(data[0].id);
        setModules(data[0].module_data || DEFAULT_MODULES);
      } else {
        const { data: insertData, error: insertError } = await supabase
          .from("modules")
          .insert([{ module_data: DEFAULT_MODULES }])
          .select();

        if (insertError) {
          console.error("Error creating default modules:", insertError);
        } else if (insertData && insertData.length > 0) {
          setSupabaseId(insertData[0].id);
          setModules(DEFAULT_MODULES);
        }
      }
    } catch (err) {
      console.error("Unexpected error loading modules:", err);
    } finally {
      setLoading(false);
    }
  };

  const saveModulesToSupabase = async (updatedModules) => {
    if (!supabaseId) return;

    try {
      const { error } = await supabase
        .from("modules")
        .update({ module_data: updatedModules })
        .eq("id", supabaseId);

      if (error) {
        console.error("Error saving modules:", error);
      }
    } catch (err) {
      console.error("Unexpected error saving modules:", err);
    }
  };

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
    const completed = TOPIC_FIELDS.filter((field) => topic[field]).length;
    return Math.round((completed / TOPIC_FIELDS.length) * 100);
  };

  const addRevisionEntries = (topicName) => {
    const existing = JSON.parse(localStorage.getItem("revisionQueue") || "[]");
    const alreadyExists = existing.some((item) => item.topic === topicName);

    if (alreadyExists) return;

    const today = new Date();
    const intervals = [1, 7, 21, 60];

    const newEntries = intervals.map((days) => {
      const revisionDate = new Date(today);
      revisionDate.setDate(revisionDate.getDate() + days);

      return {
        id: Date.now() + Math.random(),
        topic: topicName,
        type: "Auto Revision",
        createdDate: today.toISOString().split("T")[0],
        revisionDate: revisionDate.toISOString().split("T")[0],
        status: "Pending"
      };
    });

    localStorage.setItem(
      "revisionQueue",
      JSON.stringify([...existing, ...newEntries])
    );
  };

  const addTopic = (type, name) => {
    if (!name.trim()) return;

    const updated = [...modules];
    updated[selectedModule][type].push(createTopic(name));
    setModules(updated);
    saveModulesToSupabase(updated);
  };

  const bulkImportTopics = (type) => {
    if (!bulkImportText.trim()) return;

    const lines = bulkImportText.split("\n").filter((line) => line.trim());
    const updated = [...modules];

    lines.forEach((line) => {
      const topicName = line.trim();
      if (topicName) {
        updated[selectedModule][type].push(createTopic(topicName));
      }
    });

    setModules(updated);
    saveModulesToSupabase(updated);
    setBulkImportText("");
  };

  const deleteTopic = (section, topicIndex) => {
    const updated = [...modules];
    updated[selectedModule][section].splice(topicIndex, 1);
    setModules(updated);
    saveModulesToSupabase(updated);
  };

  const toggleField = (section, topicIndex, field) => {
    const updated = [...modules];
    const topic = updated[selectedModule][section][topicIndex];
    topic[field] = !topic[field];

    const progress = calculateProgress(topic);
    if (progress === 100 && !topic.revisionCreated) {
      addRevisionEntries(topic.name);
      topic.revisionCreated = true;
    }

    setModules(updated);
    saveModulesToSupabase(updated);
  };

  const calculateModuleProgress = (module) => {
    const topics = [...module.qa, ...module.dilr, ...module.varc];
    if (topics.length === 0) return 0;

    const total = topics.reduce((sum, topic) => sum + calculateProgress(topic), 0);
    return Math.round(total / topics.length);
  };

  const getTotalTopics = (module) => {
    return module.qa.length + module.dilr.length + module.varc.length;
  };

  const getCompletedTopics = (module) => {
    const topics = [...module.qa, ...module.dilr, ...module.varc];
    return topics.filter((topic) => calculateProgress(topic) === 100).length;
  };

  const toggleExpand = (key) => {
    setExpandedTopics((prev) => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const filterTopics = (topics) => {
    if (!searchQuery.trim()) return topics;
    return topics.filter((topic) =>
      topic.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const renderTopicCard = (topic, topicIndex, type) => {
    const key = `${type}-${topicIndex}`;

    return (
      <div key={topicIndex} className="topic-card">
        <div className="topic-header">
          <div className="topic-info">
            <h4>{topic.name}</h4>
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${calculateProgress(topic)}%` }}
              />
            </div>
            <div className="progress-text">{calculateProgress(topic)}%</div>
          </div>

          <div className="topic-actions">
            <button
              className="expand-btn"
              onClick={() => toggleExpand(key)}
            >
              {expandedTopics[key] ? "Collapse" : "Expand"}
            </button>
            <button
              className="delete-btn"
              onClick={() => deleteTopic(type, topicIndex)}
            >
              Delete
            </button>
          </div>
        </div>

        {expandedTopics[key] && (
          <div className="checklist">
            {TOPIC_FIELDS.map((field) => (
              <label key={field} className="checkbox-item">
                <input
                  type="checkbox"
                  checked={topic[field]}
                  onChange={() => toggleField(type, topicIndex, field)}
                />
                {field}
              </label>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderSection = (title, type) => {
    const filteredTopics = filterTopics(modules[selectedModule][type]);

    return (
      <div className="section">
        <h3>{title}</h3>
        <div className="topics-container">
          {filteredTopics.map((topic, index) => {
            const actualIndex = modules[selectedModule][type].findIndex(
              (t) => t === topic
            );
            return renderTopicCard(topic, actualIndex, type);
          })}
        </div>
      </div>
    );
  };

  if (loading) {
    return <div className="module-page"><h1>Loading...</h1></div>;
  }

  const currentModule = modules[selectedModule];

  return (
    <div className="module-page">
      <div className="module-header">
        <h1>Module Tracker</h1>
        <div className="module-selector">
          {modules.map((module, index) => (
            <button
              key={module.id}
              className={`module-btn ${selectedModule === index ? "active" : ""}`}
              onClick={() => setSelectedModule(index)}
            >
              {module.name}
            </button>
          ))}
        </div>
      </div>

      <div className="module-card">
        <h2>{currentModule.name}</h2>

        <div className="module-stats">
          <div className="stat-card">
            <span>Progress</span>
            <strong>{calculateModuleProgress(currentModule)}%</strong>
          </div>
          <div className="stat-card">
            <span>Total Topics</span>
            <strong>{getTotalTopics(currentModule)}</strong>
          </div>
          <div className="stat-card">
            <span>Completed</span>
            <strong>{getCompletedTopics(currentModule)}</strong>
          </div>
          <div className="stat-card">
            <span>Pending</span>
            <strong>
              {getTotalTopics(currentModule) - getCompletedTopics(currentModule)}
            </strong>
          </div>
        </div>

        <div className="bulk-import-section">
          <h3>Bulk Import Topics</h3>
          <textarea
            value={bulkImportText}
            onChange={(e) => setBulkImportText(e.target.value)}
            placeholder="Paste topics (one per line)&#10;Example:&#10;QA-2.1 Work Pipes & Cistern&#10;QA-2.2 Time Speed Distance"
            className="bulk-import-textarea"
          />
          <div className="bulk-import-buttons">
            <button onClick={() => bulkImportTopics("qa")}>Import To QA</button>
            <button onClick={() => bulkImportTopics("dilr")}>Import To DILR</button>
            <button onClick={() => bulkImportTopics("varc")}>Import To VARC</button>
          </div>
        </div>

        <div className="search-section">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search topics..."
            className="search-box"
          />
        </div>

        {renderSection("Quantitative Ability (QA)", "qa")}
        {renderSection("Data Interpretation & Logical Reasoning (DILR)", "dilr")}
        {renderSection("Verbal Ability & Reading Comprehension (VARC)", "varc")}
      </div>
    </div>
  );
}

export default Modules;