import React, { useState } from 'react';
import Header from "./Header";
import './App.css';

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