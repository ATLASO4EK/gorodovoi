import { useState, useEffect, useRef } from "react";
import Job from "../objects/Job";
import Exception from "../objects/Exception";
import "../styles/Job.css";

function JobPage() {
  const [jobs, setJobs] = useState([]);
  const [hasError, setHasError] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isResumeModalOpen, setIsResumeModalOpen] = useState(false);
  const jobsRef = useRef(null);

  // Статические данные (возможно вынесу в отдельный файл)
  const stats = [
    { number: "52+", label: "сотрудников в команде" },
    { number: "24/7", label: "работаем для вас" },
    { number: "100%", label: "официальное трудоустройство" },
  ];

  useEffect(() => {
    window.scrollTo(0, 0);
    setTimeout(() => setIsVisible(true), 100);

    fetch("/src/assets/jobsData.json")
      .then((res) => {
        if (!res.ok) throw new Error("Файл не найден");
        return res.json();
      })
      .then((data) => {
        if (!Array.isArray(data)) throw new Error("Некорректный формат данных");
        setJobs(data);
      })
      .catch((err) => {
        console.warn("Ошибка загрузки данных:", err.message);
        setHasError(true);
      });
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => entry.isIntersecting && setIsVisible(true),
      { threshold: 0.1 }
    );
    if (jobsRef.current) observer.observe(jobsRef.current);
    return () => jobsRef.current && observer.unobserve(jobsRef.current);
  }, []);

  const handleOpenResumeModal = () => setIsResumeModalOpen(true);

  return (
    <div className={`jobs-section ${isVisible ? "visible" : ""}`} ref={jobsRef}>
      <div className="jobs-container">
        <div className="jobs-header">
          <h1>Работа в ЦОДД Смоленска</h1>
          <p className="jobs-subtitle">
            Присоединяйтесь к нашей команде — создавайте безопасный и удобный город!
          </p>
        </div>

        {/* === СТАТИСТИКА === */}
        <div className="jobs-stats">
          {stats.map((stat, idx) => (
            <div key={idx} className="stat-item">
              <div className="stat-number">{stat.number}</div>
              <div className="stat-label">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* === ВАКАНСИИ === */}
        {hasError ? (
          <Exception message="Не удалось загрузить вакансии. Попробуйте позже." />
        ) : jobs.length > 0 ? (
          <div className="jobs-grid">
            {jobs.map((job, idx) => (
              <Job key={idx} {...job} index={idx} />
            ))}
          </div>
        ) : (
          <p>Загрузка вакансий...</p>
        )}

        {/* === "Не нашли подходящую вакансию?" === */}
        <div className="jobs-cta">
          <div className="cta-content">
            <h2>Не нашли подходящую вакансию?</h2>
            <p>Отправьте нам своё резюме, и мы рассмотрим вашу кандидатуру при появлении новых вакансий</p>
            <div className="cta-buttons">
              <button className="cta-button primary" onClick={handleOpenResumeModal}>
                Отправить резюме
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default JobPage;
