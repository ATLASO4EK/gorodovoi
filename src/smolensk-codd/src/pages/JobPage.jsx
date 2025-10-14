import { useState, useEffect, useRef } from "react";
import Exception from "../Exception";
import "../styles/Job.css";

function JobPage() {
  const [jobs, setJobs] = useState([]);
  const [hasError, setHasError] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isResumeModalOpen, setIsResumeModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [JobComponent, setJobComponent] = useState(null);
  const [resumeFormData, setResumeFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    position: "",
    experience: "",
    message: "",
  });
  const jobsRef = useRef(null);

  // Статические данные (возможно вынесу в отдельный файл)
  const stats = [
    { number: "52+", label: "сотрудников в команде" },
    { number: "24/7", label: "работаем для вас" },
    { number: "100%", label: "официальное трудоустройство" },
  ];

  // === ДИНАМИЧЕСКИЙ ИМПОРТ КОМПОНЕНТА JOB ===
  useEffect(() => {
    let isMounted = true;

    const loadJobSafely = async () => {
      try {
        const module = await import("../objects/Job.jsx");
        if (isMounted) setJobComponent(() => module.default);
      } catch (error) {
        console.error("Не удалось импортировать Job.jsx, используется Exception.jsx:", error);
        try {
          const fallbackModule = await import("../Exception.jsx");
          if (isMounted) setJobComponent(() => fallbackModule.default);
        } catch (fallbackError) {
          console.error("Ошибка при загрузке Exception.jsx как fallback:", fallbackError);
          if (isMounted)
            setJobComponent(() => ({ message }) => (
              <div style={{ padding: "2rem", textAlign: "center", color: "red" }}>
                <h2>{message || "Ошибка: компонент Job недоступен"}</h2>
              </div>
            ));
        }
      }
    };

    loadJobSafely();
    return () => {
      isMounted = false;
    };
  }, []);

  // === ЗАГРУЗКА ДАННЫХ ВАКАНСИЙ ===
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

  // === НАБЛЮДАТЕЛЬ ДЛЯ АНИМАЦИИ ===
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => entry.isIntersecting && setIsVisible(true),
      { threshold: 0.1 }
    );
    if (jobsRef.current) observer.observe(jobsRef.current);
    return () => jobsRef.current && observer.unobserve(jobsRef.current);
  }, []);

  // === МОДАЛКА РЕЗЮМЕ ===
  const handleOpenResumeModal = () => setIsResumeModalOpen(true);
  const handleCloseResumeModal = () => {
    if (!isSubmitting) {
      setIsResumeModalOpen(false);
      setResumeFormData({
        fullName: "",
        phone: "",
        email: "",
        position: "",
        experience: "",
        message: "",
      });
    }
  };

  const handleResumeInputChange = (e) => {
    const { name, value } = e.target;
    setResumeFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleResumeSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      setTimeout(() => {
        setIsResumeModalOpen(false);
        setIsSuccess(false);
        setResumeFormData({
          fullName: "",
          phone: "",
          email: "",
          position: "",
          experience: "",
          message: "",
        });
      }, 3000);
    }, 2000);
  };

  useEffect(() => {
    document.body.style.overflow = isResumeModalOpen ? "hidden" : "unset";
    return () => (document.body.style.overflow = "unset");
  }, [isResumeModalOpen]);

  // === ЕСЛИ КОМПОНЕНТ ЕЩЁ НЕ ЗАГРУЖЕН ===
  if (!JobComponent) {
    return (
      <div className="jobs-container" style={{ textAlign: "center", padding: "2rem" }}>
        <p>Загрузка вакансий...</p>
      </div>
    );
  }

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
              <JobComponent key={idx} {...job} index={idx} />
            ))}
          </div>
        ) : (
          <p>Загрузка вакансий...</p>
        )}

        {/* === CTA === */}
        <div className="jobs-cta">
          <div className="cta-content">
            <h2>Не нашли подходящую вакансию?</h2>
            <p>
              Отправьте нам своё резюме, и мы рассмотрим вашу кандидатуру при появлении новых вакансий
            </p>
            <div className="cta-buttons">
              <button className="cta-button primary" onClick={handleOpenResumeModal}>
                Отправить резюме
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* === МОДАЛКА === */}
      {isResumeModalOpen && (
        <div className="modal-overlay" onClick={handleCloseResumeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            {!isSuccess ? (
              <>
                <div className="modal-header">
                  <h2>Отправка резюме</h2>
                  <button
                    className="modal-close"
                    onClick={handleCloseResumeModal}
                    disabled={isSubmitting}
                  >
                    ×
                  </button>
                </div>

                <form className="application-form" onSubmit={handleResumeSubmit}>
                  <div className="form-group">
                    <label htmlFor="fullName">ФИО *</label>
                    <input
                      type="text"
                      id="fullName"
                      name="fullName"
                      value={resumeFormData.fullName}
                      onChange={handleResumeInputChange}
                      required
                      disabled={isSubmitting}
                      placeholder="Иванов Иван Иванович"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="phone">Телефон *</label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={resumeFormData.phone}
                      onChange={handleResumeInputChange}
                      required
                      disabled={isSubmitting}
                      placeholder="+7 (999) 999-99-99"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="email">Email *</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={resumeFormData.email}
                      onChange={handleResumeInputChange}
                      required
                      disabled={isSubmitting}
                      placeholder="example@mail.ru"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="position">Желаемая должность *</label>
                    <input
                      type="text"
                      id="position"
                      name="position"
                      value={resumeFormData.position}
                      onChange={handleResumeInputChange}
                      required
                      disabled={isSubmitting}
                      placeholder="Например, специалист по дорожному движению"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="experience">Опыт работы *</label>
                    <select
                      id="experience"
                      name="experience"
                      value={resumeFormData.experience}
                      onChange={handleResumeInputChange}
                      required
                      disabled={isSubmitting}
                    >
                      <option value="">Выберите опыт работы</option>
                      <option value="no-experience">Без опыта</option>
                      <option value="1-3">1-3 года</option>
                      <option value="3-5">3-5 лет</option>
                      <option value="5-plus">Более 5 лет</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="message">Дополнительная информация</label>
                    <textarea
                      id="message"
                      name="message"
                      value={resumeFormData.message}
                      onChange={handleResumeInputChange}
                      disabled={isSubmitting}
                      placeholder="Расскажите о своих навыках, образовании, достижениях..."
                      rows="4"
                    />
                  </div>

                  <button
                    type="submit"
                    className="submit-button"
                    disabled={
                      isSubmitting ||
                      !resumeFormData.fullName ||
                      !resumeFormData.phone ||
                      !resumeFormData.email ||
                      !resumeFormData.position ||
                      !resumeFormData.experience
                    }
                  >
                    {isSubmitting ? "Отправка..." : "Отправить резюме"}
                  </button>
                </form>
              </>
            ) : (
              <div className="success-message">
                <div className="success-icon">✓</div>
                <h3>Резюме отправлено!</h3>
                <p>
                  Спасибо за ваше резюме! Мы рассмотрим вашу кандидатуру и свяжемся с вами при появлении подходящих вакансий.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default JobPage;
