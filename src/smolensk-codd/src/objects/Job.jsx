import { useState, useEffect, useRef } from "react";
import "./../styles/Job.css";

function Job({ date, title, salary, company, location, description, onOpenResumeModal, index }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    experience: "",
    message: ""
  });

  const jobCardRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      },
      { threshold: 0.1 }
    );

    if (jobCardRef.current) {
      observer.observe(jobCardRef.current);
    }

    return () => {
      if (jobCardRef.current) {
        observer.unobserve(jobCardRef.current);
      }
    };
  }, []);

  const handleApplyClick = () => {
    setIsModalOpen(true);
    setIsSuccess(false);
  };

  const handleCloseModal = () => {
    if (!isSubmitting) {
      setIsModalOpen(false);
      setFormData({
        fullName: "",
        phone: "",
        email: "",
        experience: "",
        message: ""
      });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      
 
      setTimeout(() => {
        setIsModalOpen(false);
        setFormData({
          fullName: "",
          phone: "",
          email: "",
          experience: "",
          message: ""
        });
        setIsSuccess(false);
      }, 3000);
    }, 2000);
  };

  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isModalOpen]);

  return (
    <>
      <div className="job-card" ref={jobCardRef} style={{ animationDelay: `${index * 0.1}s` }}>
        <div className="job-card-content">
          <div className="job-header">
            <span className="job-date">{date}</span>
          </div>

          <div className="job-main">
            <h3 className="job-title">
              {title}
              <span className="job-salary">{salary}</span>
            </h3>
            <p className="job-company">{company}</p>
            <p className="job-location">{location}</p>
          </div>

          <p className="job-description">{description}</p>

          <div className="job-footer">
            <button className="job-apply" onClick={handleApplyClick}>
              Откликнуться
            </button>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>

            {!isSuccess ? (
              <>
                <div className="modal-header">
                  <h2>Отклик на вакансию: {title}</h2>
                  <button 
                    className="modal-close" 
                    onClick={handleCloseModal}
                    disabled={isSubmitting}
                  >
                    ×
                  </button>
                </div>

                <form className="application-form" onSubmit={handleSubmit}>
                  <div className="form-group">
                    <label htmlFor="fullName">ФИО *</label>
                    <input
                      type="text"
                      id="fullName"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      required
                      disabled={isSubmitting}
                      placeholder="Иванов Иван Иванович"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="phone">Номер телефона *</label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
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
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      disabled={isSubmitting}
                      placeholder="example@mail.ru"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="experience">Опыт работы *</label>
                    <select
                      id="experience"
                      name="experience"
                      value={formData.experience}
                      onChange={handleInputChange}
                      required
                      disabled={isSubmitting}
                    >
                      <option value="">Выберите опыт работы</option>
                      <option value="no-experience">Без опыта</option>
                      <option value="less-1">До 1 года</option>
                      <option value="1-3">1-3 года</option>
                      <option value="3-5">3-5 лет</option>
                      <option value="5-plus">Более 5 лет</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="message">Сопроводительное письмо</label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      disabled={isSubmitting}
                      placeholder="Расскажите о своих навыках и почему вы подходите для этой должности..."
                      rows="4"
                    />
                  </div>

                  <div className="form-footer">
                    <button 
                      type="submit" 
                      className="submit-button"
                      disabled={isSubmitting || !formData.fullName || !formData.phone || !formData.email || !formData.experience}
                    >
                      {isSubmitting ? (
                        <>
                          <div className="spinner"></div>
                          Отправка...
                        </>
                      ) : (
                        "Отправить заявку"
                      )}
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div className="success-message">
                <div className="success-icon">✓</div>
                <h3>Заявка отправлена!</h3>
                <p>Спасибо за ваш отклик! Мы рассмотрим вашу заявку в ближайшее время и свяжемся с вами.</p>
                <div className="success-details">
                  <p><strong>Вакансия:</strong> {title}</p>
                  <p><strong>Опыт работы:</strong> {
                    formData.experience === "no-experience" ? "Без опыта" :
                    formData.experience === "less-1" ? "До 1 года" :
                    formData.experience === "1-3" ? "1-3 года" :
                    formData.experience === "3-5" ? "3-5 лет" :
                    formData.experience === "5-plus" ? "Более 5 лет" : ""
                  }</p>
                  <p><strong>Ваши данные:</strong> {formData.fullName}, {formData.phone}</p>
                </div>
                <button 
                  className="success-close"
                  onClick={() => setIsModalOpen(false)}
                >
                  Закрыть
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

function JobsList() {
  const [isResumeModalOpen, setIsResumeModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [resumeFormData, setResumeFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    position: "",
    experience: "",
    message: ""
  });

  const [isVisible, setIsVisible] = useState(false);
  const jobsContainerRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (jobsContainerRef.current) {
      observer.observe(jobsContainerRef.current);
    }

    return () => {
      if (jobsContainerRef.current) {
        observer.unobserve(jobsContainerRef.current);
      }
    };
  }, []);

  const jobs = [
    {
      date: "Сегодня в 16:22",
      title: "Специалист по организации дорожного движения",
      salary: "от 45 000 ₽",
      company: "ЦОДД Смоленска",
      location: "Смоленск • Центр",
      description: "Организация и контроль дорожного движения, работа с системами мониторинга, взаимодействие с городскими службами.",
    },
    {
      date: "Сегодня в 15:10",
      title: "Инженер-проектировщик",
      salary: "от 55 000 ₽",
      company: "ЦОДД Смоленска",
      location: "Смоленск • Офис",
      description: "Разработка проектов организации дорожного движения, подготовка технической документации.",
    },
    {
      date: "Вчера",
      title: "Специалист call-центра",
      salary: "от 35 000 ₽",
      company: "ЦОДД Смоленска",
      location: "Смоленск • Дистанционно",
      description: "Консультирование граждан по вопросам дорожного движения, прием обращений.",
    },
    {
      date: "2 дня назад",
      title: "Системный администратор",
      salary: "от 60 000 ₽",
      company: "ЦОДД Смоленска",
      location: "Смоленск • Технический отдел",
      description: "Обслуживание IT-инфраструктуры, обеспечение работоспособности систем видеонаблюдения.",
    },
  ];


  const handleOpenResumeModal = () => {
    setIsResumeModalOpen(true);
    setIsSuccess(false);
  };

  const handleCloseResumeModal = () => {
    if (!isSubmitting) {
      setIsResumeModalOpen(false);
      setResumeFormData({
        fullName: "",
        phone: "",
        email: "",
        position: "",
        experience: "",
        message: ""
      });
    }
  };

  const handleResumeInputChange = (e) => {
    const { name, value } = e.target;
    setResumeFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleResumeSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);


    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      
      setTimeout(() => {
        setIsResumeModalOpen(false);
        setResumeFormData({
          fullName: "",
          phone: "",
          email: "",
          position: "",
          experience: "",
          message: ""
        });
        setIsSuccess(false);
      }, 3000);
    }, 2000);
  };

  useEffect(() => {
    if (isResumeModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isResumeModalOpen]);

  return (
    <div 
      className={`jobs-section ${isVisible ? 'visible' : ''}`} 
      ref={jobsContainerRef}
    >
      <div className="jobs-container">


        <div className="jobs-header">
          <h1>Работа в ЦОДД Смоленска</h1>
          <p className="jobs-subtitle">Присоединяйтесь к нашей команде и помогайте делать городскую среду безопаснее и комфортнее для всех смолян</p>
        </div>

        <div className="jobs-stats">
          <div className="stat-item">
            <div className="stat-number">50+</div>
            <div className="stat-label">сотрудников в команде</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">24/7</div>
            <div className="stat-label">работаем для вас</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">100%</div>
            <div className="stat-label">официальное трудоустройство</div>
          </div>
        </div>

        <div className="jobs-grid">
          {jobs.map((job, idx) => (
            <Job key={idx} {...job} onOpenResumeModal={handleOpenResumeModal} index={idx} />
          ))}
        </div>

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


        {isResumeModalOpen && (
          <div className="modal-overlay" onClick={handleCloseResumeModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>

              {!isSuccess ? (
                <>
                  <div className="modal-header">
                    <h2>Отправить резюме в ЦОДД Смоленска</h2>
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
                      <label htmlFor="resume-fullName">ФИО *</label>
                      <input
                        type="text"
                        id="resume-fullName"
                        name="fullName"
                        value={resumeFormData.fullName}
                        onChange={handleResumeInputChange}
                        required
                        disabled={isSubmitting}
                        placeholder="Иванов Иван Иванович"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="resume-phone">Номер телефона *</label>
                      <input
                        type="tel"
                        id="resume-phone"
                        name="phone"
                        value={resumeFormData.phone}
                        onChange={handleResumeInputChange}
                        required
                        disabled={isSubmitting}
                        placeholder="+7 (999) 999-99-99"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="resume-email">Email *</label>
                      <input
                        type="email"
                        id="resume-email"
                        name="email"
                        value={resumeFormData.email}
                        onChange={handleResumeInputChange}
                        required
                        disabled={isSubmitting}
                        placeholder="example@mail.ru"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="resume-position">Желаемая должность *</label>
                      <input
                        type="text"
                        id="resume-position"
                        name="position"
                        value={resumeFormData.position}
                        onChange={handleResumeInputChange}
                        required
                        disabled={isSubmitting}
                        placeholder="Например, специалист по дорожному движению"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="resume-experience">Опыт работы *</label>
                      <select
                        id="resume-experience"
                        name="experience"
                        value={resumeFormData.experience}
                        onChange={handleResumeInputChange}
                        required
                        disabled={isSubmitting}
                      >
                        <option value="">Выберите опыт работы</option>
                        <option value="no-experience">Без опыта</option>
                        <option value="less-1">До 1 года</option>
                        <option value="1-3">1-3 года</option>
                        <option value="3-5">3-5 лет</option>
                        <option value="5-plus">Более 5 лет</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label htmlFor="resume-message">Дополнительная информация</label>
                      <textarea
                        id="resume-message"
                        name="message"
                        value={resumeFormData.message}
                        onChange={handleResumeInputChange}
                        disabled={isSubmitting}
                        placeholder="Расскажите о своих навыках, образовании и почему вы хотите работать в ЦОДД Смоленска..."
                        rows="4"
                      />
                    </div>

                    <div className="form-footer">
                      <button 
                        type="submit" 
                        className="submit-button"
                        disabled={isSubmitting || !resumeFormData.fullName || !resumeFormData.phone || !resumeFormData.email || !resumeFormData.position || !resumeFormData.experience}
                      >
                        {isSubmitting ? (
                          <>
                            <div className="spinner"></div>
                            Отправка...
                          </>
                        ) : (
                          "Отправить резюме"
                        )}
                      </button>
                    </div>
                  </form>
                </>
              ) : (
                <div className="success-message">
                  <div className="success-icon">✓</div>
                  <h3>Резюме отправлено!</h3>
                  <p>Спасибо за ваше резюме! Мы сохраним его в нашей базе и свяжемся с вами при появлении подходящих вакансий.</p>
                  <div className="success-details">
                    <p><strong>Желаемая должность:</strong> {resumeFormData.position}</p>
                    <p><strong>Опыт работы:</strong> {
                      resumeFormData.experience === "no-experience" ? "Без опыта" :
                      resumeFormData.experience === "less-1" ? "До 1 года" :
                      resumeFormData.experience === "1-3" ? "1-3 года" :
                      resumeFormData.experience === "3-5" ? "3-5 лет" :
                      resumeFormData.experience === "5-plus" ? "Более 5 лет" : ""
                    }</p>
                    <p><strong>Ваши данные:</strong> {resumeFormData.fullName}, {resumeFormData.phone}</p>
                  </div>
                  <button 
                    className="success-close"
                    onClick={() => setIsResumeModalOpen(false)}
                  >
                    Закрыть
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default JobsList;