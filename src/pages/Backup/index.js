import { useRef } from "react";

function Backup() {
  const fileInputRef = useRef(null);

  const exportData = () => {
    const data = {
      moduleTracker: JSON.parse(
        localStorage.getItem(
          "moduleTracker"
        ) || "[]"
      ),

      mockTests: JSON.parse(
        localStorage.getItem(
          "mockTests"
        ) || "[]"
      ),

      mistakeLog: JSON.parse(
        localStorage.getItem(
          "mistakeLog"
        ) || "[]"
      ),

      revisionQueue: JSON.parse(
        localStorage.getItem(
          "revisionQueue"
        ) || "[]"
      ),

      varcSets: JSON.parse(
        localStorage.getItem(
          "varcSets"
        ) || "[]"
      ),

      dilrSets: JSON.parse(
        localStorage.getItem(
          "dilrSets"
        ) || "[]"
      ),

      studySessions: JSON.parse(
        localStorage.getItem(
          "studySessions"
        ) || "[]"
      ),

      catGoals: JSON.parse(
        localStorage.getItem(
          "catGoals"
        ) || "[]"
      )
    };

    const blob = new Blob(
      [JSON.stringify(data, null, 2)],
      {
        type: "application/json"
      }
    );

    const url =
      URL.createObjectURL(blob);

    const a =
      document.createElement("a");

    a.href = url;
    a.download =
      "cat-command-center-backup.json";

    a.click();
  };

  const importData = (
    event
  ) => {
    const file =
      event.target.files[0];

    if (!file) return;

    const reader =
      new FileReader();

    reader.onload = (e) => {
      try {
        const data =
          JSON.parse(
            e.target.result
          );

        Object.keys(data).forEach(
          (key) => {
            localStorage.setItem(
              key,
              JSON.stringify(
                data[key]
              )
            );
          }
        );

        alert(
          "Backup restored successfully. Refresh page."
        );
      } catch {
        alert(
          "Invalid backup file."
        );
      }
    };

    reader.readAsText(file);
  };

  return (
    <div>

      <h1>
        Backup & Restore
      </h1>

      <div
        style={{
          display: "flex",
          gap: "15px",
          marginTop: "20px",
          flexWrap: "wrap"
        }}
      >

        <button
          onClick={exportData}
        >
          Export Backup
        </button>

        <button
          onClick={() =>
            fileInputRef.current.click()
          }
        >
          Import Backup
        </button>

      </div>

      <input
        type="file"
        accept=".json"
        ref={fileInputRef}
        onChange={importData}
        style={{
          display: "none"
        }}
      />

    </div>
  );
}

export default Backup;