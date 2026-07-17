import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Dashboard from './pages/Dashboard.jsx';
import GraphExplorer from './pages/GraphExplorer.jsx';
import AIChat from './pages/AIChat.jsx';
import Governance from './pages/Governance.jsx';

export default function App() {
  return (
    <Router>
      <Navbar />
      <main className="page">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/graph" element={<GraphExplorer />} />
          <Route path="/chat" element={<AIChat />} />
          <Route path="/governance" element={<Governance />} />
        </Routes>
      </main>
    </Router>
  );
}
