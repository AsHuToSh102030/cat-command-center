import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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

  const [userId, setUserId] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    const initializeSettings =
      async () => {
        try {
          const {
            data: { user }
          } = await supabase.auth.getUser();

          if (!user) {
            console.log(
              "No user found, redirecting to login"
            );
            navigate("/login");
            setLoading(false);
            return;
          }

          console.log(
            "Current user:",
            user.id
          );
          setUserId(user.id);

          await loadSettings(user.id);
        } catch (err) {
          console.error(
            "Error initializing settings:",
            err
          );
          setLoading(false);
        }
      };

    initializeSettings();
  }, [navigate]);

  const loadSettings = async (
    currentUserId
  ) => {
    try {
      console.log(
        "Loading settings for user:",
        currentUserId
      );

      const { data, error } =
        await supabase
          .from("settings")
          .select("*")
          .eq("user_id", currentUserId)
          .single();

      if (
        error &&
        error.code !==
          "PGRST116"
      ) {
        console.error(
          "Error loading settings:",
          error
        );
        setLoading(false);
        return;
      }

      if (data) {
        console.log(
          "Settings found:",
          data
        );

        setSettingsId(data.id);

        setCatDate(
          data.cat_exam_date ||
            "2026-11-29"
        );

        setTargetPercentile(
          String(
            data.target_percentile ||
              99
          )
        );

        setDailyStudyHours(
          String(
            data.daily_study_hours ||
              4
          )
        );

        setLoading(false);
      } else {
        console.log(
          "No settings found, creating default settings"
        );

        const { data: newData, error: insertError } =
          await supabase
            .from("settings")
            .insert([
              {
                user_id:
                  currentUserId,
                cat_exam_date:
                  "2026-11-29",
                target_percentile:
                  99,
                daily_study_hours:
                  4
              }
            ])
            .select()
            .single();

        if (insertError) {
          console.error(
            "Error creating default settings:",
            insertError
          );
          setLoading(false);
          return;
        }

        console.log(
          "Default settings created:",
          newData
        );

        setSettingsId(newData.id);

        setCatDate(
          newData.cat_exam_date
        );

        setTargetPercentile(
          String(
            newData.target_percentile
          )
        );

        setDailyStudyHours(
          String(
            newData.daily_study_hours
          )
        );

        setLoading(false);
      }
    } catch (err) {
      console.error(
        "Unexpected error in loadSettings:",
        err
      );
      setLoading(false);
    }
  };

  const saveSettings =
    async () => {
      if (!settingsId) {
        console.error(
          "No settingsId available"
        );
        alert(
          "Failed to save settings: No settings ID"
        );
        return;
      }

      if (!userId) {
        console.error(
          "No userId available"
        );
        alert(
          "Failed to save settings: No user ID"
        );
        return;
      }

      try {
        console.log(
          "Saving settings for user:",
          userId
        );

        console.log(
          "Update payload:",
          {
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
          }
        );

        const { data, error } =
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
            .eq("id", settingsId)
            .eq("user_id", userId)
            .select()
            .single();

        if (error) {
          console.error(
            "Error saving settings:",
            error
          );
          alert(
            "Failed to save settings"
          );
          return;
        }

        console.log(
          "Settings saved successfully:",
          data
        );

        setCatDate(
          data.cat_exam_date
        );

        setTargetPercentile(
          String(
            data.target_percentile
          )
        );

        setDailyStudyHours(
          String(
            data.daily_study_hours
          )
        );

        alert(
          "Settings saved successfully"
        );
      } catch (err) {
        console.error(
          "Unexpected error saving settings:",
          err
        );
        alert(
          "Failed to save settings"
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
        const {
          data: { user }
        } = await supabase.auth.getUser();

        if (!user) {
          console.error(
            "No user found for reset"
          );
          alert(
            "User not authenticated"
          );
          return;
        }

        console.log(
          "Deleting all data for user:",
          user.id
        );

        const deletePromises = [
          supabase
            .from("mocks")
            .delete()
            .eq("user_id", user.id),

          supabase
            .from("mistakes")
            .delete()
            .eq("user_id", user.id),

          supabase
            .from("revisions")
            .delete()
            .eq("user_id", user.id),

          supabase
            .from("varc_sets")
            .delete()
            .eq("user_id", user.id),

          supabase
            .from("dilr_sets")
            .delete()
            .eq("user_id", user.id),

          supabase
            .from(
              "study_sessions"
            )
            .delete()
            .eq("user_id", user.id)
        ];

        const results =
          await Promise.all(
            deletePromises
          );

        const hasErrors =
          results.some(
            (result) =>
              result.error
          );

        if (hasErrors) {
          console.error(
            "Some deletions failed:",
            results
          );
          alert(
            "Some data could not be deleted"
          );
          return;
        }

        console.log(
          "All data deleted successfully"
        );

        alert(
          "Data deleted successfully"
        );

        window.location.reload();
      } catch (err) {
        console.error(
          "Unexpected error in resetEverything:",
          err
        );
        alert(
          "Failed to reset data"
        );
      }
    };

  const handleLogout =
    async () => {
      try {
        console.log(
          "Logging out user"
        );

        const { error } =
          await supabase.auth.signOut();

        if (error) {
          console.error(
            "Error logging out:",
            error
          );
          alert(
            "Failed to logout"
          );
          return;
        }

        console.log(
          "User logged out successfully"
        );

        navigate("/login");
      } catch (err) {
        console.error(
          "Unexpected error logging out:",
          err
        );
        alert(
          "Failed to logout"
        );
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
        <h1>
          Loading...
        </h1>
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

        <button
          className="logout-btn-mobile"
          onClick={
            handleLogout
          }
        >
          Logout
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