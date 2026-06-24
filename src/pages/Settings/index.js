import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import "./Settings.css";

function Settings() {
  const [catDate, setCatDate] =
    useState("2026-11-29");

  const [
    targetPercentile,
    setTargetPercentile
  ] = useState("99");

  const [
    dailyStudyHours,
    setDailyStudyHours
  ] = useState("4");

  const [settingsId, setSettingsId] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const { data, error } =
        await supabase
          .from("settings")
          .select("*")
          .limit(1);

      if (error) {
        console.error(error);
        return;
      }

      if (
        data &&
        data.length > 0
      ) {
        const settings =
          data[0];

        setSettingsId(
          settings.id
        );

        setCatDate(
          settings.cat_exam_date ||
            "2026-11-29"
        );

        setTargetPercentile(
          settings.target_percentile ||
            "99"
        );

        setDailyStudyHours(
          settings.daily_study_hours ||
            "4"
        );
      } else {
        const {
          data: newData
        } = await supabase
          .from("settings")
          .insert([
            {
              cat_exam_date:
                "2026-11-29",
              target_percentile:
                99,
              daily_study_hours:
                4
            }
          ])
          .select();

        if (
          newData &&
          newData.length > 0
        ) {
          setSettingsId(
            newData[0].id
          );
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings =
    async () => {
      if (!settingsId)
        return;

      const { error } =
        await supabase
          .from("settings")
          .update({
            cat_exam_date:
              catDate,
            target_percentile:
              Number(
                targetPercentile
              ),
            daily_study_hours:
              Number(
                dailyStudyHours
              )
          })
          .eq(
            "id",
            settingsId
          );

      if (error) {
        console.error(error);
        alert(
          "Failed to save settings"
        );
      } else {
        alert(
          "Settings saved successfully"
        );
      }
    };

  const resetEverything =
    async () => {
      const confirmReset =
        window.confirm(
          "Delete ALL CAT data?"
        );

      if (!confirmReset)
        return;

      try {
        await Promise.all([
          supabase
            .from("mocks")
            .delete()
            .neq("id", 0),

          supabase
            .from("mistakes")
            .delete()
            .neq("id", 0),

          supabase
            .from("revisions")
            .delete()
            .neq("id", 0),

          supabase
            .from("varc_sets")
            .delete()
            .neq("id", 0),

          supabase
            .from("dilr_sets")
            .delete()
            .neq("id", 0),

          supabase
            .from(
              "study_sessions"
            )
            .delete()
            .neq("id", 0)
        ]);

        alert(
          "Data deleted successfully"
        );

        window.location.reload();
      } catch (err) {
        console.error(err);
      }
    };

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
      <div className="settings-page">
        <h1>Loading...</h1>
      </div>
    );
  }

  return (
    <div className="settings-page">

      <h1>
        ⚙️ Settings
      </h1>

      <div className="settings-grid">

        <div className="settings-card">

          <h2>
            CAT Targets
          </h2>

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
            value={
              targetPercentile
            }
            onChange={(e) =>
              setTargetPercentile(
                e.target.value
              )
            }
          />

          <label>
            Daily Study Hours
          </label>

          <input
            type="number"
            value={
              dailyStudyHours
            }
            onChange={(e) =>
              setDailyStudyHours(
                e.target.value
              )
            }
          />

          <button
            className="export-btn"
            onClick={
              saveSettings
            }
          >
            Save Settings
          </button>

        </div>

        <div className="settings-card">

          <h2>
            Current Status
          </h2>

          <div className="setting-stat">
            <span>
              Days Left
            </span>
            <strong>
              {daysLeft}
            </strong>
          </div>

          <div className="setting-stat">
            <span>
              Target Percentile
            </span>
            <strong>
              {
                targetPercentile
              }
            </strong>
          </div>

          <div className="setting-stat">
            <span>
              Daily Goal
            </span>
            <strong>
              {
                dailyStudyHours
              }
              h
            </strong>
          </div>

        </div>

      </div>

      <div className="settings-actions">

        <button
          className="danger-btn"
          onClick={
            resetEverything
          }
        >
          Reset All Data
        </button>

      </div>

      <div className="saved-box">
        ☁️ Settings stored in
        Supabase
      </div>

    </div>
  );
}

export default Settings;