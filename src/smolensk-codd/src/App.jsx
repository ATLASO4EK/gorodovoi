/* Основная логика - САМЫЙ ВАЖНЫЙ ОБЪЕКТ */
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { useState, useEffect } from 'react';
import './index.css';
import './App.css';
import Exception from './objects/Exception';
import TrafficJams from './objects/TrafficJams';

function App() {
  const [components, setComponents] = useState({});
  const [currentPage, setCurrentPage] = useState('home');
  const [news, setNews] = useState([]);
  const [newsUpdateTrigger, setNewsUpdateTrigger] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);

  const safeImport = async (path) => {
    try {
      const mod = await import(/* @vite-ignore */ path);
      return mod.default || mod;
    } catch (err) {
      console.warn(`Не удалось импортировать ${path}`, err);
      return Exception;
    }
  };

  /* Импорты */
  useEffect(() => {
    (async () => {
      const componentsList = [
        'Header', 
        'Footer', 
        'HomePage', 
        'InfoPage', 
        'TeamPage', 
        'MonitoringPage', 
        'ServicesPage', 
        'ProjectsPage', 
        'NewsPage',
        'DocsPage', 
        'JobPage', 
        'ContactsPage', 
        'BannerPage', 
        'UslugiPage' 
      ];
      
      const comps = {};
      let loaded = 0;
      
      for (const compName of componentsList) {
        const path = compName === 'Header' || compName === 'Footer' 
          ? `./${compName}.jsx` 
          : `./pages/${compName}.jsx`;
        
        comps[compName] = await safeImport(path);
        loaded++;
        setLoadingProgress(Math.round((loaded / componentsList.length) * 100));
        
        
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      setComponents(comps);
      setIsLoading(false);
    })();
  }, []);

  const loadNews = async () => {
    try {
      const URL = import.meta.env.VITE_API_BASE || '';
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
      console.error('Ошибка загрузки новостей:', error);
    }
  };

  useEffect(() => {
    if (!isLoading) {
      loadNews();
    }
  }, [newsUpdateTrigger, isLoading]);

  const handleNewsUpdate = () => {
    setNewsUpdateTrigger(prev => prev + 1);
  };

  // Экран загрузки
  if (isLoading) {
    return (
      <div className="loading-screen">
        <div className="loading-container">
          <div className="loading-logo">
            <img src="/public/logogreen.png" alt="Логотип" className="logo-image" />
          </div>
          <div className="loading-content">
            <h1 className="loading-title">ЦОДД Смоленской области</h1>
            <p className="loading-subtitle">Центр организации дорожного движения</p>
            <div className="loading-progress">
              <div className="loading-progress-bar">
                <div 
                  className="loading-progress-fill"
                  style={{ width: `${loadingProgress}%` }}
                ></div>
              </div>
              <span className="loading-text">Загрузка компонентов... {loadingProgress}%</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!Object.keys(components).length) {
    return (
      <Exception message="Не удалось загрузить необходимые компоненты приложения. Пожалуйста, проверьте подключение к интернету и попробуйте снова." />
    );
  }

  const {
    Header,
    Footer,
    HomePage,
    InfoPage,
    TeamPage,
    MonitoringPage,
    ServicesPage,
    ProjectsPage,
    NewsPage,
    DocsPage,
    JobPage,
    ContactsPage,
    BannerPage, 
    UslugiPage,
  } = components;

  const renderPage = () => {
    switch (currentPage) {
      case 'home': return <HomePage setCurrentPage={setCurrentPage} news={news} />;
      case 'monitoring': return <MonitoringPage />;
      case 'services': return <ServicesPage />;
      case 'about': return <InfoPage />;
      case 'team': return <TeamPage />;
      case 'projects': return <ProjectsPage />;
      case 'news': return <NewsPage onNewsUpdate={handleNewsUpdate} news={news} />;
      case 'documents': return <DocsPage />;
      case 'vacancies': return <JobPage />;
      case 'contacts': return <ContactsPage />;
      case 'banners': return <BannerPage />; 
      case 'services-list': return <UslugiPage />;
      default: return <HomePage setCurrentPage={setCurrentPage} news={news} />;
    }
  };

  return (
    <div className="app">
      <Header setCurrentPage={setCurrentPage} news={news} />
      <main className="app-content">{renderPage()}</main>
      <TrafficJams />
      <Footer />
    </div>
  );
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);

export default App;