import React, { useState } from 'react';
import './FeedbackForm.css';

const FeedbackForm = ({ isOpen, onClose }) => {
  // Состояния компонента
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Валидация пустого отзыва
    if (!feedback.trim()) {
      alert('Пожалуйста, введите ваш отзыв');
      return;
    }

    setIsSubmitting(true);

    try {
      // Отправка данных на сервер
      const response = await fetch('http://127.0.0.1:8000/api/v1/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          text: feedback.trim()
        })
      });
      
      // Обработка успешного ответа
      if (response.ok) {
        const result = await response.json();
        setIsSubmitted(true);
        setFeedback('');
        // Автоматическое закрытие после успешной отправки
        setTimeout(() => {
          setIsSubmitted(false);
          onClose();
        }, 2000);
      } else {
        // Обработка ошибок сервера
        let errorMessage = 'Ошибка при отправке отзыва';
        
        try {
          const errorData = await response.json();
          errorMessage = errorData.detail || errorData.message || errorData.error || errorMessage;
        } catch (parseError) {
          errorMessage = `HTTP ошибка: ${response.status} ${response.statusText}`;
        }
        
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error('Ошибка отправки отзыва:', error);
      alert(`Произошла ошибка при отправке отзыва: ${error.message}. Пожалуйста, попробуйте позже.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Закрытие модального окна при клике на оверлей
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget && !isSubmitting) {
      onClose();
    }
  };

  // Сброс состояния при закрытии модалки
  const handleModalClose = () => {
    if (!isSubmitting) {
      setFeedback('');
      setIsSubmitted(false);
      onClose();
    }
  };

  // Рендер компонента только если isOpen = true
  if (!isOpen) return null;

  return (
    <div className="feedback-overlay" onClick={handleOverlayClick}>
      <div className="feedback-modal">
        <button 
          className="feedback-close" 
          onClick={handleModalClose}
          disabled={isSubmitting}
        >
          ×
        </button>
        
        <h2 className="feedback-title">Обратная связь</h2>
        
        {/*==СОСТОЯНИЕ УСПЕШНОЙ ОТПРАВКИ==*/}
        {isSubmitted ? (
          <div className="feedback-success">
            <p>Спасибо за ваш отзыв!</p>
            <p>Ваше мнение очень важно для нас.</p>
          </div>
        ) : (
          /*==ФОРМА ВВОДА ОТЗЫВА== */
          <form onSubmit={handleSubmit} className="feedback-form">
            <div className="feedback-field">
              <label htmlFor="feedback-text" className="feedback-label">
                Напишите свой отзыв или предложения для улучшения сервисов ЦОДД:
              </label>
              <textarea
                id="feedback-text"
                className="feedback-textarea"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Ваш отзыв или предложение..."
                rows="6"
                required
                disabled={isSubmitting}
              />
            </div>
            
            <div className="feedback-actions">
              <button
                type="button"
                className="feedback-cancel"
                onClick={handleModalClose}
                disabled={isSubmitting}
              >
                Отмена
              </button>
              <button
                type="submit"
                className="feedback-submit"
                disabled={isSubmitting || !feedback.trim()}
              >
                {isSubmitting ? 'Отправка...' : 'Отправить отзыв'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default FeedbackForm;