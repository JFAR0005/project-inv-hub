
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import App from './App';
import './index.css';

// Pages
import Index from './pages/Index';
import Login from './pages/Login';
import Portfolio from './pages/Portfolio';
import EnhancedPortfolio from './pages/EnhancedPortfolio';
import PortfolioSearch from './pages/PortfolioSearch';
import CompanyProfile from './pages/CompanyProfile';
import SubmitUpdate from './pages/SubmitUpdate';
import Meetings from './pages/Meetings';
import Analytics from './pages/Analytics';
import Notes from './pages/Notes';
import Deals from './pages/Deals';
import Dealflow from './pages/Dealflow';
import Integrations from './pages/Integrations';
import NotFound from './pages/NotFound';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<App />}>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/portfolio" element={<Portfolio />} />
          <Route path="/enhanced-portfolio" element={<EnhancedPortfolio />} />
          <Route path="/search" element={<PortfolioSearch />} />
          <Route path="/companies/:id" element={<CompanyProfile />} />
          <Route path="/submit-update" element={<SubmitUpdate />} />
          <Route path="/meetings" element={<Meetings />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/notes" element={<Notes />} />
          <Route path="/notes/:id" element={<Notes />} />
          <Route path="/deals" element={<Deals />} />
          <Route path="/dealflow" element={<Dealflow />} />
          <Route path="/integrations" element={<Integrations />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Router>
  </React.StrictMode>
);
