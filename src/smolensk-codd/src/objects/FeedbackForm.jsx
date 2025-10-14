import React, { useState } from 'react';
import './FeedbackForm.css';

const FeedbackForm = ({ isOpen, onClose }) => {
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!feedback.trim()) {
      alert('Пожалуйста, введите ваш отзыв');
      return;
    }

    setIsSubmitting(true);

    try {
      console.log('Отправка отзыва:', feedback.trim());
      
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

      console.log('Статус ответа:', response.status);
      
      if (response.ok) {
        const result = await response.json();
        console.log('Успешный ответ:', result);
        setIsSubmitted(true);
        setFeedback('');
        setTimeout(() => {
          setIsSubmitted(false);
          onClose();
        }, 2000);
      } else {
        let errorMessage = 'Ошибка при отправке отзыва';
        
        try {
          const errorData = await response.json();
          console.error('Данные ошибки:', errorData);
          errorMessage = errorData.detail || errorData.message || errorData.error || errorMessage;
        } catch (parseError) {
          console.error('Ошибка парсинга ошибки:', parseError);
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

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget && !isSubmitting) {
      onClose();
    }
  };

  const handleModalClose = () => {
    if (!isSubmitting) {
      setFeedback('');
      setIsSubmitted(false);
      onClose();
    }
  };

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
        
        {isSubmitted ? (
          <div className="feedback-success">
            <p>Спасибо за ваш отзыв!</p>
            <p>Ваше мнение очень важно для нас.</p>
          </div>
        ) : (
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