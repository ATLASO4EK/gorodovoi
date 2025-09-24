import React, { useState } from 'react';
import Header from "./Header";
import './App.css';

import HomePage from './pages/HomePage.jsx';
import InfoPage from './pages/InfoPage.jsx';
import TeamPage from './pages/TeamPage.jsx';
import MonitoringPage from './pages/MonitoringPage.jsx';
import ServicesPage from './pages/ServicesPage.jsx';
import ProjectsPage from './pages/ProjectsPage.jsx';
import NewsPage from './pages/NewsPage.jsx';
import DocumentsPage from './pages/DocsPage.jsx';
import JobPage from './pages/JobPage.jsx';
import ContactsPage from './pages/ContactPage.jsx';
import BannersPage from './pages/BannerPage.jsx';
import UslugiPage from './pages/UslugiPage'

function App() {
  const [currentPage, setCurrentPage] = useState('home');

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage />;
      case 'monitoring':
        return <MonitoringPage />;
      case 'services':
        return <ServicesPage />;
      case 'about':
        return <InfoPage />;
      case 'team':
        return <TeamPage />;
      case 'projects':
        return <ProjectsPage />;
      case 'news':
        return <NewsPage />;
      case 'documents':
        return <DocumentsPage />;
      case 'vacancies':
        return <JobPage />;
      case 'contacts':
        return <ContactsPage />;
      case 'banners':
        return <BannersPage />;
      case 'services-list':
        return <UslugiPage />;
      default:
        return <HomePage />;
    }
  };

  return (
    <div className="app">
      <Header setCurrentPage={setCurrentPage} />
      <main className="app-content"> 
        {renderPage()}
      </main>
    </div>
  );
}

export default App;