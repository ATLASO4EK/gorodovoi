/* Основная логика - САМЫЙ ВАЖНЫЙ ОБЪЕКТ */
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { useState, useEffect } from 'react';
import './index.css';
import './styles/App.css';
import Exception from './Exception';

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

  /* Импорты с ограничением времени и контролем плавности */
  useEffect(() => {
    const loadComponents = async () => {
      const startTime = Date.now();
      const MAX_LOAD_TIME = 1500; // макс. время загрузки 1.5с

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
        'UslugiPage',
        'TrafficJams'
      ];
      
      const comps = {};
      let loaded = 0;

      const updateProgress = (count) => {
        loaded = count;
        const progress = Math.round((loaded / componentsList.length) * 100);
        setLoadingProgress(progress);
      };

      const loadPromises = componentsList.map(async (compName) => {
        const path = compName === 'Header' || compName === 'Footer' 
          ? `./${compName}.jsx` 
          : compName === 'TrafficJams'
            ? `./objects/${compName}.jsx`
            : `./pages/${compName}.jsx`;

        try {
          const component = await Promise.race([
            safeImport(path),
            new Promise((_, reject) =>
              setTimeout(() => reject(new Error('Timeout')), MAX_LOAD_TIME)
            )
          ]);
          comps[compName] = component;
          updateProgress(loaded + 1);
          return true;
        } catch (error) {
          console.warn(`Ошибка загрузки ${compName}:`, error);
          comps[compName] = Exception;
          updateProgress(loaded + 1);
          return false;
        }
      });

      await Promise.allSettled(loadPromises);

      // Минимальное время загрузки для плавности
      const elapsedTime = Date.now() - startTime;
      const remainingTime = Math.max(800 - elapsedTime, 0);
      if (remainingTime > 0) {
        await new Promise(resolve => setTimeout(resolve, remainingTime));
      }

      setComponents(comps);
      setIsLoading(false);
    };

    loadComponents();
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

  if (isLoading) {
    return (
      <div className="loading-screen">
        <div className="loading-container">
          <div className="loading-logo">
            <img src='public/logogreen.svg' alt="Логотип" className="logo-image" />
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
    TrafficJams
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
