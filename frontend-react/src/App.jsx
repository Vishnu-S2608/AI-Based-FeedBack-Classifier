import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage";
import FeedbacksPage from "./pages/FeedbacksPage";
import DashboardPage from "./pages/DashboardPage";
import BatchPage from "./pages/BatchPage";

export default function App() {
  return (
    <BrowserRouter>
      <div className="app-shell">
        <div className="background" />
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/feedbacks" element={<FeedbacksPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/batch" element={<BatchPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
