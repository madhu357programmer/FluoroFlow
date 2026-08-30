import { Routes, Route } from "react-router-dom";
import NavBar from "./components/NavBar.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import AnalyzeSample from "./pages/AnalyzeSample.jsx";
import AnalysisResult from "./pages/AnalysisResult.jsx";
import History from "./pages/History.jsx";
import Architecture from "./pages/Architecture.jsx";

export default function App() {
  return (
    <div className="app-shell">
      <NavBar />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/analyze" element={<AnalyzeSample />} />
        <Route path="/result/:id" element={<AnalysisResult />} />
        <Route path="/history" element={<History />} />
        <Route path="/architecture" element={<Architecture />} />
      </Routes>
    </div>
  );
}
