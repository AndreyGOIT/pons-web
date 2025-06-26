import { useLocation } from "react-router-dom";
import "./App.css";
import AppRoutes from "./routes/AppRoutes";
import NavigationBar from "./components/NavigationBar";
import Header from "./components/Header";
import Footer from "./components/Footer";

function App() {
  const location = useLocation();

  // Показываем Header только на главной странице и на страницах, начинающихся с /excursions
  const showHeader = location.pathname === "/";

  return (
    <div id="myPage" className="w3-light-grey min-h-screen flex flex-col">
      <NavigationBar />
      {showHeader && <Header />}
      <main className="flex-grow">
        <AppRoutes />
      </main>
      <Footer />
    </div>
  );
}

export default App;
