import "./App.css";

import {
  BrowserRouter,
  Routes,
  Route,
  NavLink
} from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import Modules from "./pages/Modules";
import DILR from "./pages/DILR";
import VARC from "./pages/VARC";
import Mocks from "./pages/Mocks";
import Mistakes from "./pages/Mistakes";
import Revision from "./pages/Revision";
import Analytics from "./pages/Analytics";
import Achievements from "./pages/Achievements";
import Backup from "./pages/Backup";
import Settings from "./pages/Settings";
import StudySessions from "./pages/StudySessions";
import Goals from "./pages/Goals";

function App() {
  return (
    <BrowserRouter>
      <div className="app-layout">

        <aside className="sidebar">

          <div className="logo">
            CAT Command Center
          </div>

          <nav>
            <ul>

              <li>
                <NavLink to="/">
                  Dashboard
                </NavLink>
              </li>

              <li>
                <NavLink to="/modules">
                  Module Tracker
                </NavLink>
              </li>

              <li>
                <NavLink to="/study">
                  Study Sessions
                </NavLink>
              </li>

              <li>
                <NavLink to="/goals">
                  Goals
                </NavLink>
              </li>

              <li>
                <NavLink to="/dilr">
                  DILR Tracker
                </NavLink>
              </li>

              <li>
                <NavLink to="/varc">
                  VARC Tracker
                </NavLink>
              </li>

              <li>
                <NavLink to="/mocks">
                  Mock Tests
                </NavLink>
              </li>

              <li>
                <NavLink to="/mistakes">
                  Mistake Log
                </NavLink>
              </li>

              <li>
                <NavLink to="/revision">
                  Revision Queue
                </NavLink>
              </li>

              <li>
                <NavLink to="/analytics">
                  Analytics
                </NavLink>
              </li>

              <li>
                <NavLink to="/achievements">
                  Achievements
                </NavLink>
              </li>

              <li>
                <NavLink to="/backup">
                  Backup
                </NavLink>
              </li>

              <li>
                <NavLink to="/settings">
                  Settings
                </NavLink>
              </li>

            </ul>
          </nav>

        </aside>

        <main className="content">

          <Routes>

            <Route
              path="/"
              element={<Dashboard />}
            />

            <Route
              path="/modules"
              element={<Modules />}
            />

            <Route
              path="/study"
              element={<StudySessions />}
            />

            <Route
              path="/goals"
              element={<Goals />}
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
              element={<Mistakes />}
            />

            <Route
              path="/revision"
              element={<Revision />}
            />

            <Route
              path="/analytics"
              element={<Analytics />}
            />

            <Route
              path="/achievements"
              element={<Achievements />}
            />

            <Route
              path="/backup"
              element={<Backup />}
            />

            <Route
              path="/settings"
              element={<Settings />}
            />

          </Routes>

        </main>

      </div>
    </BrowserRouter>
  );
}

export default App;