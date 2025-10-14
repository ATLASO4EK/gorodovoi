// Страница Документов

import { useEffect, useState, useRef } from 'react';
import '../styles/Docs.css';
import Exception from '../Exception';

function DocsPage() {
  const [isVisible, setIsVisible] = useState(false);
  const [stats, setStats] = useState({ total: 0, updated: 0, categories: 0 });
  const [documentsData, setDocumentsData] = useState([]);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [DocsComponent, setDocsComponent] = useState(null);
  const [Icons, setIcons] = useState({});
  const categoryRefs = useRef([]);

  // === Безопасный импорт Docs.jsx ===
  useEffect(() => {
    let isMounted = true;

    const loadDocsSafely = async () => {
      try {
        const module = await import('../objects/Docs.jsx');
        if (isMounted) setDocsComponent(() => module.default);
      } catch (error) {
        console.error('Ошибка импорта Docs.jsx, используется Exception:', error);
        try {
          const fallback = await import('../Exception.jsx');
          if (isMounted) setDocsComponent(() => fallback.default);
        } catch (fallbackError) {
          console.error('Не удалось импортировать Exception.jsx:', fallbackError);
          if (isMounted)
            setDocsComponent(() => ({ message }) => (
              <div
                style={{
                  padding: '2rem',
                  textAlign: 'center',
                  color: 'red',
                  fontFamily: 'sans-serif',
                }}
              >
                <h2>{message || 'Ошибка: компонент Docs недоступен'}</h2>
              </div>
            ));
        }
      }
    };

    loadDocsSafely();
    return () => {
      isMounted = false;
    };
  }, []);

  // === Безопасный импорт иконок ===
  useEffect(() => {
    let isMounted = true;
    const loadIconsSafely = async () => {
      try {
        const iconsModule = await import('../assets/DocsIcons.jsx');
        if (isMounted) setIcons(iconsModule);
      } catch (error) {
        console.error('Ошибка импорта DocsIcons.jsx:', error);
        setIcons({});
      }
    };
    loadIconsSafely();
    return () => {
      isMounted = false;
    };
  }, []);

  // === Загрузка JSON с документами ===
  useEffect(() => {
    window.scrollTo(0, 0);
    setTimeout(() => setIsVisible(true), 100);

    fetch('/src/assets/documentsData.json')
      .then((res) => {
        if (!res.ok) throw new Error('Файл documentsData.json не найден');
        return res.json();
      })
      .then((data) => {
        if (!Array.isArray(data)) throw new Error('Некорректный формат JSON');
        setDocumentsData(data);
        setStats({
          total: data.reduce((acc, cat) => acc + cat.docs.length, 0),
          updated: 4,
          categories: data.length,
        });
      })
      .catch((err) => {
        console.error('Ошибка загрузки документов:', err.message);
        setHasError(true);
      })
      .finally(() => setIsLoading(false));
  }, []);

  // === Анимация появления категорий ===
  useEffect(() => {
    if (documentsData.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.style.animationDelay = `${entry.target.dataset.delay || 0}ms`;
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.1 }
    );

    categoryRefs.current.forEach((ref) => ref && observer.observe(ref));
    return () => observer.disconnect();
  }, [documentsData]);

  // === Состояния загрузки / ошибок ===
  if (isLoading)
    return (
      <div className="docs-container" style={{ textAlign: 'center', padding: '2rem' }}>
        <p>Загрузка документов...</p>
      </div>
    );

  if (hasError)
    return (
      <Exception message="Не удалось загрузить документы. Попробуйте позже." />
    );

  if (!DocsComponent || Object.keys(Icons).length === 0)
    return (
      <div className="docs-container" style={{ textAlign: 'center', padding: '2rem' }}>
        <p>Загрузка компонентов...</p>
      </div>
    );

  const {
    DocumentStatsIcon,
    UpdateIcon,
    FolderIcon,
    HeartIcon,
  } = Icons;

  const iconMap = {
    ...Icons,
  };

  return (
    <div className={`docs-container ${isVisible ? 'visible' : ''}`}>
      <div className="docs-header">
        <h1>Документы ЦОДД Смоленск</h1>
        <p className="docs-subtitle">
          Официальные документы и материалы Центра организации дорожного движения.
          Вся информация актуальна и регулярно обновляется для вашего удобства и прозрачности работы.
        </p>
      </div>

      {/* === Статистика === */}
      <div className="docs-stats">
        <div className="doc-stat">
          <div className="stat-icon"><DocumentStatsIcon /></div>
          <div className="stat-number">{stats.total}</div>
          <div className="stat-label">Всего документов</div>
        </div>
        <div className="doc-stat">
          <div className="stat-icon"><UpdateIcon /></div>
          <div className="stat-number">{stats.updated}</div>
          <div className="stat-label">Обновлено в 2024 году</div>
        </div>
        <div className="doc-stat">
          <div className="stat-icon"><FolderIcon /></div>
          <div className="stat-number">{stats.categories}</div>
          <div className="stat-label">Категории документов</div>
        </div>
      </div>

      {/* === Секции документов === */}
      {documentsData.map((category, i) => (
        <section
          key={i}
          ref={(el) => (categoryRefs.current[i] = el)}
          className="docs-category-section"
          data-delay={i * 200}
        >
          <div className="category-header">
            <div className="category-icon">
              {iconMap[category.icon] ? iconMap[category.icon]() : <FolderIcon />}
            </div>
            <h2 className="category-title">{category.category}</h2>
          </div>

          <div className="docs-grid">
            {category.docs.map((doc, j) => (
              <DocsComponent key={j} {...doc} />
            ))}
          </div>
        </section>
      ))}

      {/* === Миссия === */}
      <section className="docs-category-section" data-delay="600">
        <div className="category-header">
          <div className="category-icon"><HeartIcon /></div>
          <h2 className="category-title">Наша миссия</h2>
        </div>
        <div
          style={{
            background: 'linear-gradient(135deg, #f8fff8, #ffffff)',
            padding: '40px',
            borderRadius: '20px',
            textAlign: 'center',
            border: '2px solid #e8f5e8',
          }}
        >
          <p
            style={{
              fontSize: '1.3rem',
              color: '#666',
              lineHeight: '1.8',
              maxWidth: '800px',
              margin: '0 auto',
            }}
          >
            ЦОДД Смоленска работает для создания безопасной и комфортной дорожной среды.
            Наши документы отражают прозрачность работы и стремление к улучшению городской инфраструктуры
            для всех участников дорожного движения.
          </p>
        </div>
      </section>
    </div>
  );
}

export default DocsPage;
