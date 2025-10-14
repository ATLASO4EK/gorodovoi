import { useState, useEffect, useRef } from 'react';
import Docs from '../objects/Docs';
import '../styles/Docs.css';

//необходимо убрать эти импорты
const DocumentStatsIcon = () => (
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
    <line x1="16" y1="13" x2="8" y2="13"/>
    <line x1="16" y1="17" x2="8" y2="17"/>
    <line x1="10" y1="9" x2="8" y2="9"/>
  </svg>
);

const UpdateIcon = () => (
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10"/>
    <polyline points="12 6 12 12 16 14"/>
  </svg>
);

const FolderIcon = () => (
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
  </svg>
);

const CategoryDocumentIcon = () => (
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
    <line x1="16" y1="13" x2="8" y2="13"/>
    <line x1="16" y1="17" x2="8" y2="17"/>
  </svg>
);

const BuildingIcon = () => (
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
    <line x1="9" y1="3" x2="9" y2="21"/>
    <line x1="15" y1="3" x2="15" y2="21"/>
    <line x1="3" y1="9" x2="21" y2="9"/>
    <line x1="3" y1="15" x2="21" y2="15"/>
  </svg>
);

const UsersIcon = () => (
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);

const HeartIcon = () => (
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
  </svg>
);

function DocsPage() {
  const [isVisible, setIsVisible] = useState(false);
  const [stats, setStats] = useState({ total: 0, updated: 0, categories: 0 });
  const categoryRefs = useRef([]);

  useEffect(() => {
    window.scrollTo(0, 0);
    setTimeout(() => setIsVisible(true), 100);

    setStats({
      total: 9,
      updated: 4,
      categories: 3
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.style.animationDelay = `${entry.target.dataset.delay || 0}ms`;
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.1 }
    );

    categoryRefs.current.forEach(ref => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, []);

  const documentsData = [
    {
      category: "Учредительные документы",
      icon: <CategoryDocumentIcon />,
      docs: [
        {
          title: "Устав ЦОДД Смоленск",
          description: "Основной документ, определяющий порядок деятельности и полномочия центра организации дорожного движения",
          type: "PDF",
          size: "2.4 МБ",
          date: "2024 г.",
          file: "https://codd67.ru/wp-content/uploads/2023/09/1_ustav-1.pdf"
        },
        {
          title: "Распоряжение о реорганизации",
          description: "Документ о создании и реорганизации центра организации дорожного движения города Смоленска",
          type: "PDF",
          size: "1.8 МБ",
          date: "2023 г.",
          file: "https://codd67.ru/wp-content/uploads/2023/09/1_1_rasporyazhenie-o-reorganizatsii-2.pdf"
        },
        {
          title: "Распоряжение о внесении изменений в Устав",
          description: "Актуальные изменения и дополнения в учредительные документы организации",
          type: "PDF",
          size: "1.2 МБ",
          date: "2024 г.",
          file: "https://codd67.ru/wp-content/uploads/2024/08/5_Распоряжение-о-внесении-изменений-в-Устав.pdf"
        }
      ]
    },
    {
      category: "Регистрационные документы",
      icon: <BuildingIcon />,
      docs: [
        {
          title: "Свидетельство ИНН",
          description: "Идентификационный номер налогоплательщика организации для налогового учёта",
          type: "PDF",
          size: "1.1 МБ",
          date: "2023 г.",
          file: "https://codd67.ru/wp-content/uploads/2023/09/2_ИНН_ЦОДД.pdf"
        },
        {
          title: "Свидетельство ОГРН",
          description: "Основной государственный регистрационный номер юридического лица",
          type: "PDF",
          size: "1.3 МБ",
          date: "2023 г.",
          file: "https://codd67.ru/wp-content/uploads/2023/09/3_ОГРН_Свидетельство-о-регистрации-ЦОДД.pdf"
        }
      ]
    },
    {
      category: "Кадровые и нормативные документы",
      icon: <UsersIcon />,
      docs: [
        {
          title: "Распоряжение о назначении директора",
          description: "Документ о назначении руководителя центра организации дорожного движения города Смоленска",
          type: "PDF",
          size: "1.5 МБ",
          date: "2023 г.",
          file: "https://codd67.ru/wp-content/uploads/2023/09/4_Распоряжение-о-назначении-директора.pdf"
        },
        {
          title: "Сводная ведомость оценки условий труда",
          description: "Результаты специальной оценки условий труда сотрудников центра за отчётный период",
          type: "PDF",
          size: "3.2 МБ",
          date: "2024 г.",
          file: "https://codd67.ru/wp-content/uploads/2024/02/сводная-ведомость-результатов-проведения-специальной-оценки-условий-труда.pdf"
        },
        {
          title: "Закон о ЦОДД",
          description: "Нормативный правовой акт, регулирующий деятельность центра организации дорожного движения",
          type: "PDF",
          size: "2.1 МБ",
          date: "2023 г.",
          file: "https://codd67.ru/wp-content/uploads/2023/09/Law-1.pdf"
        },
        {
          title: "Памятка о ЦОДД",
          description: "Информационный материал о деятельности, возможностях и услугах центра для граждан",
          type: "PDF",
          size: "0.9 МБ",
          date: "2023 г.",
          file: "https://codd67.ru/wp-content/uploads/2023/09/Memo-2.pdf"
        }
      ]
    }
  ];

  return (
    <div className={`docs-container ${isVisible ? 'visible' : ''}`}>
      <div className="docs-header">
        <h1>Документы ЦОДД Смоленск</h1>
        <p className="docs-subtitle">
          Официальные документы и материалы Центра организации дорожного движения. 
          Вся информация актуальна и регулярно обновляется для вашего удобства и прозрачности работы.
        </p>
      </div>

      <div className="docs-stats">
        <div className="doc-stat">
          <div className="stat-icon">
            <DocumentStatsIcon />
          </div>
          <div className="stat-number">{stats.total}</div>
          <div className="stat-label">Всего документов</div>
        </div>
        <div className="doc-stat">
          <div className="stat-icon">
            <UpdateIcon />
          </div>
          <div className="stat-number">{stats.updated}</div>
          <div className="stat-label">Обновлено в 2024 году</div>
        </div>
        <div className="doc-stat">
          <div className="stat-icon">
            <FolderIcon />
          </div>
          <div className="stat-number">{stats.categories}</div>
          <div className="stat-label">Категории документов</div>
        </div>
      </div>

      {documentsData.map((category, categoryIndex) => (
        <section 
          key={categoryIndex}
          ref={el => categoryRefs.current[categoryIndex] = el}
          className="docs-category-section"
          data-delay={categoryIndex * 200}
        >
          <div className="category-header">
            <div className="category-icon">{category.icon}</div>
            <h2 className="category-title">{category.category}</h2>
          </div>
          
          <div className="docs-grid">
            {category.docs.map((doc, docIndex) => (
              <Docs 
                key={docIndex}
                title={doc.title}
                description={doc.description}
                type={doc.type}
                size={doc.size}
                date={doc.date}
                file={doc.file}
              />
            ))}
          </div>
        </section>
      ))}

      <section className="docs-category-section" data-delay="600">
        <div className="category-header">
          <div className="category-icon">
            <HeartIcon />
          </div>
          <h2 className="category-title">Наша миссия</h2>
        </div>
        <div style={{
          background: 'linear-gradient(135deg, #f8fff8, #ffffff)',
          padding: '40px',
          borderRadius: '20px',
          textAlign: 'center',
          border: '2px solid #e8f5e8'
        }}>
          <p style={{
            fontSize: '1.3rem',
            color: '#666',
            lineHeight: '1.8',
            maxWidth: '800px',
            margin: '0 auto'
          }}>
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