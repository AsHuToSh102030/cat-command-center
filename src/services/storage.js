const STORAGE_KEYS = {
  DASHBOARD: "dashboard",
  QUANT: "quantTopics",
  DILR: "dilrData",
  VARC: "varcData",
  MOCKS: "mockTests",
  MISTAKES: "mistakeLog",
  REVISIONS: "revisionQueue",
  ACHIEVEMENTS: "achievements",
  XP: "xpData"
};

export function saveData(key, data) {
  localStorage.setItem(
    key,
    JSON.stringify(data)
  );
}

export function loadData(key, defaultValue) {
  const data = localStorage.getItem(key);

  if (!data) {
    return defaultValue;
  }

  try {
    return JSON.parse(data);
  } catch {
    return defaultValue;
  }
}

export function removeData(key) {
  localStorage.removeItem(key);
}

export { STORAGE_KEYS };