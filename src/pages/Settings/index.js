import { useState, useEffect } from "react";
import "./Settings.css";

function Settings() {
  const [catDate, setCatDate] = useState(() => {
    return (
      localStorage.getItem("catExamDate") ||
      "2026-11-29"
    );
  });

  const [targetPercentile, setTargetPercentile] =
    useState(() => {
      return (
        localStorage.getItem(
          "targetPercentile"
        ) || "99"
      );
    });

  const [dailyStudyHours, setDailyStudyHours] =
    useState(() => {
      return (
        localStorage.getItem(
          "dailyStudyHours"
        ) || "4"
      );
    });

  useEffect(() => {
    localStorage.setItem(
      "catExamDate",
      catDate
    );

    localStorage.setItem(
      "targetPercentile",
      targetPercentile
    );

    localStorage.setItem(
      "dailyStudyHours",
      dailyStudyHours
    );
  }, [
    catDate,
    targetPercentile,
    dailyStudyHours
  ]);

  return (
    <div className="settings-page">

      <h1>Settings</h1>

      <div className="settings-card">

        <label>
          CAT Exam Date
        </label>

        <input
          type="date"
          value={catDate}
          onChange={(e) =>
            setCatDate(
              e.target.value
            )
          }
        />

        <label>
          Target Percentile
        </label>

        <input
          type="number"
          value={targetPercentile}
          onChange={(e) =>
            setTargetPercentile(
              e.target.value
            )
          }
        />

        <label>
          Daily Study Hours Goal
        </label>

        <input
          type="number"
          value={dailyStudyHours}
          onChange={(e) =>
            setDailyStudyHours(
              e.target.value
            )
          }
        />

        <div className="saved-box">
          Settings are
          automatically saved.
        </div>

      </div>

    </div>
  );
}

export default Settings;