import React, { useState } from 'react';
import Header from "./Header";
import './App.css';

import HomePage from './HomePage';
import Info from './objects/info/info.jsx';
import Team from './objects/team/team.jsx';
import MonitoringPage from './objects/MonitoringPage/MonitoringPage.jsx';
import ServicesPage from './objects/ServicesPage/ServicesPage.jsx';
import ProjectsPage from './objects/ProjectsPage/ProjectsPage.jsx';
import NewsPage from './objects/NewsPage/NewsPage.jsx';
import DocumentsPage from './DocsCategory.jsx';
import VacanciesPage from './objects/VacanciesPage/VacanciesPage.jsx';
import ContactsPage from './objects/ContactsPage/ContactsPage.jsx';
import BannersPage from './objects/BannersPage/BannersPage.jsx';
import ServicesListPage from './objects/ServicesListPage/ServicesListPage.jsx';

function App() {
  const [currentPage, setCurrentPage] = useState('home');

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage />;
      case 'about':
        return <Info />;
      case 'team':
        return <Team />;
      case 'monitoring':
        return <MonitoringPage />;
      case 'services':
        return <ServicesPage />;
      case 'projects':
        return <ProjectsPage />;
      case 'news':
        return <NewsPage />;
      case 'documents':
        return <DocumentsPage />;
      case 'vacancies':
        return <VacanciesPage />;
      case 'contacts':
        return <ContactsPage />;
      case 'banners':
        return <BannersPage />;
      case 'services-list':
        return <ServicesListPage />;
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