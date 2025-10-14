/* Объект-Шаблон Вакансии */

  /*
  Принимает:          Пример:
  date: str;          "date": "Сегодня в 10:30",
  title: str;         "title": "Специалист по организации дорожного движения",
  salary: str;        "salary": "от 45 000 ₽",
  company: str;       "company": "ЦОДД Смоленска",
  location: str;      "location": "Смоленск • Центр",
  description: str;   "description": "Организация и контроль дорожного движения, взаимодействие с городскими службами."

  Использование: pages/JobPage.jsx => jobsData (assets/jobsData.json)
  */
import { useState, useEffect, useRef } from "react";
import "./../styles/Job.css";

function Job({ date, title, salary, company, location, description, index }) {
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
        if (entry.isIntersecting) entry.target.classList.add("visible");
      },
      { threshold: 0.1 }
    );
    if (jobCardRef.current) observer.observe(jobCardRef.current);
    return () => jobCardRef.current && observer.unobserve(jobCardRef.current);
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
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      setTimeout(() => {
        setIsModalOpen(false);
        setIsSuccess(false);
      }, 3000);
    }, 2000);
  };

  useEffect(() => {
    document.body.style.overflow = isModalOpen ? "hidden" : "unset";
    return () => (document.body.style.overflow = "unset");
  }, [isModalOpen]);

  return (
    <>
      <div
        className="job-card"
        ref={jobCardRef}
        style={{ animationDelay: `${index * 0.1}s` }}
      >
        <div className="job-card-content">
          <div className="job-header">
            <span className="job-date">{date}</span>
          </div>
          <div className="job-main">
            <h3 className="job-title">
              {title} <span className="job-salary">{salary}</span>
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

      {/* === ФОРМА === */}
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
                    <label htmlFor="phone">Телефон *</label>
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
                      <option value="1-3">1-3 года</option>
                      <option value="3-5">3-5 лет</option>
                      <option value="5-plus">Более 5 лет</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="message">Комментарий</label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      disabled={isSubmitting}
                      placeholder="Расскажите о себе..."
                      rows="4"
                    />
                  </div>

                  <button
                    type="submit"
                    className="submit-button"
                    disabled={
                      isSubmitting ||
                      !formData.fullName ||
                      !formData.phone ||
                      !formData.email ||
                      !formData.experience
                    }
                  >
                    {isSubmitting ? "Отправка..." : "Отправить заявку"}
                  </button>
                </form>
              </>
            ) : (
              <div className="success-message">
                <div className="success-icon">✓</div>
                <h3>Заявка отправлена!</h3>
                <p>
                  Спасибо за ваш отклик! Мы рассмотрим вашу заявку и свяжемся с
                  вами.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default Job;
