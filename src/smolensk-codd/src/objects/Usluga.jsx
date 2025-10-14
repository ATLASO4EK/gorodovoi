
import { useState } from 'react';
import './../styles/UslugiPage.css';

const ProjectIcon = () => (
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="#62a744">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
    <path d="M16 13H8"/>
    <path d="M16 17H8"/>
    <path d="M10 9H9H8"/>
  </svg>
);

const CraneIcon = () => (
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="#62a744">
    <path d="M6 21V3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v18"/>
    <path d="M6 15H4a2 2 0 0 1-2-2v-2a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h-2"/>
    <circle cx="12" cy="12" r="1"/>
    <circle cx="12" cy="16" r="1"/>
    <circle cx="12" cy="8" r="1"/>
  </svg>
);

const TowTruckIcon = () => (
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="#62a744">
    <path d="M10 17V4a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v13"/>
    <path d="M10 17H2v-4h8"/>
    <circle cx="16" cy="17" r="2"/>
    <circle cx="6" cy="17" r="2"/>
    <path d="M14 7h4"/>
    <path d="M14 11h4"/>
    <path d="M14 15h4"/>
  </svg>
);

const CloseIcon = () => (
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

function Usluga({ title, description, price, features, icon, onOrder, index }) {
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    service: title,
    message: ""
  });

  const handleOrderClick = (e) => {
    e.preventDefault();
    setShowModal(true);
    setIsSuccess(false);
  };

  const handleCloseModal = () => {
    if (!isSubmitting) {
      setShowModal(false);
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
        setShowModal(false);
        setFormData({
          fullName: "",
          phone: "",
          email: "",
          service: title,
          message: ""
        });
        setIsSuccess(false);
      }, 3000);
    }, 2000);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape' && !isSubmitting) {
      handleCloseModal();
    }
  };

  return (
    <>
      <div className="usluga-card" style={{ animationDelay: `${index * 0.1}s` }}>
        <div className="usluga-card-content">
          <div className="usluga-icon">
            {icon}
          </div>
          <div className="usluga-info">
            <h3 className="usluga-title">{title}</h3>
            <div className="usluga-price">{price}</div>
            <p className="usluga-description">{description}</p>
            <ul className="usluga-features">
              {features.map((feature, idx) => (
                <li key={idx}>{feature}</li>
              ))}
            </ul>
            <div className="usluga-actions">
              <button 
                className="usluga-order" 
                onClick={handleOrderClick}
                aria-label={`Заказать услугу: ${title}`}
              >
                Заказать услугу
              </button>
            </div>
          </div>
        </div>
      </div>

      {showModal && (
        <div 
          className="usluga-modal-overlay" 
          onClick={handleCloseModal}
          onKeyDown={handleKeyDown}
          tabIndex={-1}
        >
          <div 
            className="usluga-modal-content" 
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-labelledby="modal-title"
            aria-modal="true"
          >
            {!isSuccess ? (
              <>
                <div className="modal-header">
                  <div className="modal-title-section">
                    <h2 id="modal-title">Заказ услуги</h2>
                    <p className="modal-subtitle">{title}</p>
                  </div>
                  <button 
                    className="modal-close" 
                    onClick={handleCloseModal}
                    disabled={isSubmitting}
                    aria-label="Закрыть окно заказа"
                  >
                    <CloseIcon />
                  </button>
                </div>

                <form className="order-form" onSubmit={handleSubmit}>
                  <div className="form-row">
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
                        autoComplete="name"
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
                        autoComplete="tel"
                      />
                    </div>
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
                      autoComplete="email"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="service">Выбранная услуга</label>
                    <div className="service-display">
                      {title}
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="message">
                      Дополнительная информация
                      <span className="optional-label"> (необязательно)</span>
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      disabled={isSubmitting}
                      placeholder="Опишите детали заказа, особые требования или задайте вопросы..."
                      rows="4"
                    />
                  </div>

                  <div className="form-footer">
                    <div className="form-notes">
                      <p>* Обязательные поля для заполнения</p>
                    </div>
                    <button 
                      type="submit" 
                      className="submit-button"
                      disabled={isSubmitting || !formData.fullName || !formData.phone || !formData.email}
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
                <p>Спасибо за ваш заказ! Мы свяжемся с вами в ближайшее время для уточнения деталей.</p>
                <div className="success-details">
                  <div className="detail-item">
                    <strong>Услуга:</strong> 
                    <span>{title}</span>
                  </div>
                  <div className="detail-item">
                    <strong>Контактное лицо:</strong> 
                    <span>{formData.fullName}</span>
                  </div>
                  <div className="detail-item">
                    <strong>Телефон:</strong> 
                    <span>{formData.phone}</span>
                  </div>
                  <div className="detail-item">
                    <strong>Время обработки:</strong> 
                    <span>1-2 рабочих дня</span>
                  </div>
                </div>
                <button 
                  className="success-close"
                  onClick={() => setShowModal(false)}
                  autoFocus
                >
                  Закрыть окно
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default Usluga;