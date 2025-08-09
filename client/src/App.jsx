import { useLocation } from "react-router-dom";
import "./App.css";
import AppRoutes from "./routes/AppRoutes";
import NavigationBar from "./components/NavigationBar";
import Header from "./components/Header";
import Footer from "./components/Footer";
import ScrollToTopButton from "./components/ScrollToTopButton";

function App() {
  const location = useLocation();

  // Show Header only on the main page
  const showHeader = location.pathname === "/";

  return (
    <div id="myPage" className="w3-light-grey fullscreen">
      <NavigationBar />
      {showHeader && <Header />}
      <main className="flex-grow">
        <AppRoutes />
      </main>
      <Footer />
      <ScrollToTopButton />
    </div>
  );
}

export default App;
