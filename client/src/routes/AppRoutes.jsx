import { Routes, Route } from "react-router-dom";
import PrivateRoute from "../routes/PrivateRoute";
import NewHome from "../pages/NewHome";
import Profile from "../pages/Profile";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<NewHome />} />
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
