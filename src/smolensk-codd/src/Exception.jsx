// Заглушка на случай ошибки

import './styles/Exception.css';

function Exception({ message }) {
  return (
    <div className="exception-screen">
      <div className="exception-container error-animation">
        <span className="exception-emoji">🚧</span>
        <h2 className="exception-title">Увы, произошла ошибка</h2>
        <p className="exception-message">{message}</p>
        <button
          onClick={() => window.location.reload()}
          className="exception-button"
        >
          Попробовать снова
        </button>
      </div>
    </div>
  );
}

export default Exception;