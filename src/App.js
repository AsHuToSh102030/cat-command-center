import "./App.css";
import { useEffect, useState } from "react";

import {
  BrowserRouter,
  Routes,
  Route,
  NavLink
} from "react-router-dom";

import { supabase } from "./lib/supabase";

import Login from "./pages/Login";

import Dashboard from "./pages/Dashboard";
import Modules from "./pages/Modules";
import StudySessions from "./pages/StudySessions";
import Goals from "./pages/Goals";
import DILR from "./pages/DILR";
import VARC from "./pages/VARC";
import Mocks from "./pages/Mocks";
import Mistakes from "./pages/Mistakes";
import Revision from "./pages/Revision";
import Analytics from "./pages/Analytics";
import Achievements from "./pages/Achievements";
import Backup from "./pages/Backup";
import Settings from "./pages/Settings";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user }
      } =
        await supabase.auth.getUser();

      setUser(user);
      setLoading(false);
    };

    getUser();

    const {
      data: { subscription }
    } =
      supabase.auth.onAuthStateChange(
        (_event, session) => {
          setUser(
            session?.user ?? null
          );
        }
      );

    return () =>
      subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent:
            "center",
          alignItems:
            "center",
          height: "100vh"
        }}
      >
        <h1>Loading...</h1>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  return (
    <BrowserRouter>
      <div className="app-layout">

        <aside className="sidebar">

          <div className="logo-section">

            <div className="logo-icon">
              🐱
            </div>

            <div>
              <h2>CAT</h2>
              <span>
                Command Center
              </span>
            </div>

          </div>

          <nav>
            <ul>

              <li>
                <NavLink
                  to="/"
                  end
                >
                  <span>🏠</span>
                  Dashboard
                </NavLink>
              </li>

              <li>
                <NavLink to="/modules">
                  <span>📚</span>
                  Modules
                </NavLink>
              </li>

              <li>
                <NavLink to="/study">
                  <span>⏰</span>
                  Study Sessions
                </NavLink>
              </li>

              <li>
                <NavLink to="/goals">
                  <span>🎯</span>
                  Goals
                </NavLink>
              </li>

              <li>
                <NavLink to="/dilr">
                  <span>🧩</span>
                  DILR
                </NavLink>
              </li>

              <li>
                <NavLink to="/varc">
                  <span>📖</span>
                  VARC
                </NavLink>
              </li>

              <li>
                <NavLink to="/mocks">
                  <span>🏆</span>
                  Mock Tests
                </NavLink>
              </li>

              <li>
                <NavLink to="/mistakes">
                  <span>❌</span>
                  Mistakes
                </NavLink>
              </li>

              <li>
                <NavLink to="/revision">
                  <span>🔄</span>
                  Revision
                </NavLink>
              </li>

              <li>
                <NavLink to="/analytics">
                  <span>📊</span>
                  Analytics
                </NavLink>
              </li>

              <li>
                <NavLink to="/achievements">
                  <span>🏅</span>
                  Achievements
                </NavLink>
              </li>

              <li>
                <NavLink to="/backup">
                  <span>💾</span>
                  Backup
                </NavLink>
              </li>

              <li>
                <NavLink to="/settings">
                  <span>⚙️</span>
                  Settings
                </NavLink>
              </li>

            </ul>
          </nav>

          <div className="sidebar-footer">

            <div className="footer-card">

              <p>
                {user?.email}
              </p>

              <strong>
                CAT 2026
              </strong>

              <button
                style={{
                  marginTop: "10px"
                }}
                onClick={async () => {
                  await supabase.auth.signOut();
                }}
              >
                Logout
              </button>

            </div>

          </div>

        </aside>

        <main className="content">

          <Routes>

            <Route
              path="/"
              element={
                <Dashboard />
              }
            />

            <Route
              path="/modules"
              element={
                <Modules />
              }
            />

            <Route
              path="/study"
              element={
                <StudySessions />
              }
            />

            <Route
              path="/goals"
              element={
                <Goals />
              }
            />

            <Route
              path="/dilr"
              element={<DILR />}
            />

            <Route
              path="/varc"
              element={<VARC />}
            />

            <Route
              path="/mocks"
              element={<Mocks />}
            />

            <Route
              path="/mistakes"
              element={
                <Mistakes />
              }
            />

            <Route
              path="/revision"
              element={
                <Revision />
              }
            />

            <Route
              path="/analytics"
              element={
                <Analytics />
              }
            />

            <Route
              path="/achievements"
              element={
                <Achievements />
              }
            />

            <Route
              path="/backup"
              element={
                <Backup />
              }
            />

            <Route
              path="/settings"
              element={
                <Settings />
              }
            />

          </Routes>

        </main>

      </div>
    </BrowserRouter>
  );
}

export default App;