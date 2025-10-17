import { useState } from 'react';
import '../styles/LoginModal.css';

function LoginModal({ isOpen, onClose, onLoginSuccess }) {
  const [key, setKey] = useState('');
  const [error, setError] = useState('');

  const correctKey = "czdd_zMbAEW4dhaqX2cdHEmIzLfcqlpVsRuyVI_Fd9GjyKfg"; // вот тута ключик

  const handleSubmit = (e) => {
    e.preventDefault();
    if (key === correctKey) {
      onLoginSuccess();
      setKey('');
      setError('');
    } else {
      setError('Неверный ключ доступа');
    }
  };

  const handleClose = () => {
    setKey('');
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="login-modal-overlay" onClick={handleClose}>
      <div className="login-modal" onClick={(e) => e.stopPropagation()}>
        <button className="login-modal-close" onClick={handleClose}>
          <span>×</span>
        </button>
        
        <div className="login-content">
          <h2 className="login-title">Вход для редактора</h2>
          <p className="login-subtitle">Введите ключ доступа</p>
          
          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="key-input" className="form-label">Ключ доступа</label>
              <input
                id="key-input"
                type="password"
                value={key}
                onChange={(e) => setKey(e.target.value)}
                className="key-input"
                placeholder="Введите ключ..."
                autoComplete="off"
              />
            </div>
            
            {error && <div className="error-message">{error}</div>}
            
            <button type="submit" className="login-button">
              Войти
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default LoginModal;