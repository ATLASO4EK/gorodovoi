import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import React, { useState, useEffect } from 'react';
import Header from "./Header";
import Footer from "./Footer"; 
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
  const [news, setNews] = useState([]);
  const [newsUpdateTrigger, setNewsUpdateTrigger] = useState(0);

 
  const loadNews = async () => {
    try {
      const URL = import.meta.env.VITE_API_BASE || "";
      const response = await fetch(URL + 'api/v1/News');
      const data = await response.json();

      const mappedNews = data.map(item => ({
        id: item[0].toString(),
        time: item[1],
        author: item[2],
        title: item[3],
        shortText: item[4],
        fullText: item[5],
        image: item[6],
        imageAlt: item[3],
      }));

      setNews(mappedNews);
    } catch (error) {
      console.error("Ошибка загрузки новостей:", error);
    }
  };

  useEffect(() => {
    loadNews();
  }, [newsUpdateTrigger]);


const handleNewsUpdate = () => {
  console.log('App: handleNewsUpdate вызван, обновляем новости');
  setNewsUpdateTrigger(prev => prev + 1);
};
  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage setCurrentPage={setCurrentPage} news={news} />;
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
        return <NewsPage onNewsUpdate={handleNewsUpdate} news={news} />;
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
        return <HomePage setCurrentPage={setCurrentPage} news={news} />;
    }
  };

  return (
    <div className="app">
      <Header setCurrentPage={setCurrentPage} news={news} />
      <main className="app-content"> 
        {renderPage()}
      </main>
      <Footer /> 
    </div>
  );
}


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
)

export default App;