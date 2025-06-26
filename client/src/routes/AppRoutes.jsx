import { Routes, Route } from "react-router-dom";
import NewHome from "../pages/NewHome";
import Profile from "../pages/Profile";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<NewHome />} />
      <Route path="/profile" element={<Profile />} />
      {/* Добавьте другие маршруты по мере необходимости */}
    </Routes>
  );
}

export default AppRoutes;
