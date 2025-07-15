import { Routes, Route } from "react-router-dom";
import PrivateRoute from "../routes/PrivateRoute";
import NewHome from "../pages/NewHome";
import Profile from "../pages/Profile";
import AdminDashboard from "../pages/AdminDashboard";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<NewHome />} />
      <Route path="/adminpanel" element={<AdminDashboard />} />
      <Route
        path="/profile"
        element={
          <PrivateRoute>
            <Profile />
          </PrivateRoute>
        }
      />
      {/* Добавьте другие маршруты по мере необходимости */}
    </Routes>
  );
}

export default AppRoutes;
