import { Routes, Route } from "react-router-dom";
import PrivateRoute from "../routes/PrivateRoute";
import AdminRoute from "../routes/AdminRoute";
import TrainerRoute from "../routes/TrainerRoute";
import NewHome from "../pages/NewHome";
import Profile from "../pages/Profile";
import AdminDashboard from "../pages/AdminDashboard";
import TrainerDashboard from "../pages/TrainerDashboard";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<NewHome />} />
      <Route
        path="/adminpanel"
        element={
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        }
      />
      <Route
        path="/trainer/dashboard"
        element={
          <TrainerRoute>
            <TrainerDashboard />
          </TrainerRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <PrivateRoute>
            <Profile />
          </PrivateRoute>
        }
      />
      {/* Add other routes as needed. */}
    </Routes>
  );
}

export default AppRoutes;
