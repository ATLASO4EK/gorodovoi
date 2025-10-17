import { useState, useEffect } from 'react';
import './../styles/NewsEditor.css';

const URL = import.meta.env.VITE_API_BASE || "";

function NewsEditor({ news, onSave, onClose, isAdmin, onNewsUpdate }) {
  const [selectedNews, setSelectedNews] = useState(null);
  const [formData, setFormData] = useState({
    id: '',
    title: '',
    author: '',
    time: '',
    image: '',
    imageAlt: '',
    fullText: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [wordCount, setWordCount] = useState(0);

  useEffect(() => {
    if (selectedNews) {
      setFormData({
        id: selectedNews.id || '',
        title: selectedNews.title || '',
        author: selectedNews.author || '',
        time: selectedNews.time || '',
        image: selectedNews.image || '',
        imageAlt: selectedNews.imageAlt || '',
        fullText: selectedNews.fullText || ''
      });
    } else {
      setFormData({
        id: '',
        title: '',
        author: '',
        time: '',
        image: '',
        imageAlt: '',
        fullText: ''
      });
    }
  }, [selectedNews]);

  useEffect(() => {
    // Подсчет слов при изменении полного текста
    const words = formData.fullText.trim().split(/\s+/).filter(word => word.length > 0);
    setWordCount(words.length);
  }, [formData.fullText]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const newsData = {
        ...formData,
        id: formData.id || Date.now().toString(),
        time: formData.time || new Date().toLocaleString('ru-RU'),
        image: formData.image || '#'
      };


      const params = new URLSearchParams();
      params.append('author', newsData.author);
      params.append('header', newsData.title);
      params.append('short_text', newsData.fullText.substring(0, 100) + '...');
      params.append('full_text', newsData.fullText);
      params.append('image', newsData.image);

      const apiUrl = `${URL}api/v1/News`;
      let response;

      if (selectedNews) {
    
        params.append('id_int', newsData.id);
        response = await fetch(`${apiUrl}?${params.toString()}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          }
        });
      } else {
 
        response = await fetch(`${apiUrl}?${params.toString()}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          }
        });
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Ошибка HTTP: ${response.status} - ${errorText}`);
      }


      if (onNewsUpdate) {
        onNewsUpdate();
      }

      onSave();
      setSelectedNews(null);
      setFormData({
        id: '',
        title: '',
        author: '',
        time: '',
        image: '',
        imageAlt: '',
        fullText: ''
      });

      setError('');

    } catch (error) {
      setError('Ошибка при сохранении новости: ' + error.message);
      console.error('Error saving news:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    console.log('=== ДЕТАЛИ УДАЛЕНИЯ ===');
    console.log('Полученный ID:', id);
    console.log('Тип ID:', typeof id);
    console.log('Все новости:', news);
    console.log('Найденная новость для удаления:', news.find(item => item.id == id));
    console.log('========================');

    if (window.confirm('Вы уверены, что хотите удалить эту новость?')) {
      setLoading(true);
      setError('');

      try {
        console.log('Пытаемся удалить новость с ID:', id);
        console.log('Base URL:', URL);
        
        const params = new URLSearchParams();
        params.append('id_int', id);

        const response = await fetch(`${URL}api/v1/News?${params.toString()}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          }
        });
        
        console.log('Response status:', response.status);
        console.log('Response headers:', response.headers);
        
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Ошибка HTTP: ${response.status} - ${errorText}`);
        }

        const result = await response.text();
        console.log('Response body:', result);

       
        if (result.includes('success') || response.status === 200) {
          console.log('Удаление успешно!');
          

          const updatedNews = news.filter(item => item.id !== id);
          
         
          if (onNewsUpdate) {
            console.log('Вызываем onNewsUpdate для обновления списка новостей');
            onNewsUpdate();
          }

         
          if (selectedNews && selectedNews.id === id) {
            setSelectedNews(null);
          }

       
          setError('Новость успешно удалена');

          
          setTimeout(() => {
            setError('');
          }, 2000);
        } else {
          throw new Error('Сервер не подтвердил удаление: ' + result);
        }

      } catch (error) {
        setError('Ошибка при удалении новости: ' + error.message);
        console.error('Error deleting news:', error);
        
        
        console.log('ID для удаления:', id);
        console.log('Тип ID:', typeof id);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleNewNews = () => {
    setSelectedNews(null);
    setFormData({
      id: '',
      title: '',
      author: '',
      time: '',
      image: '',
      imageAlt: '',
      fullText: ''
    });
  };

  return (
    <div className="news-editor-overlay">
      <div className="news-editor">
        <button className="editor-close" onClick={onClose}>
          <span>×</span>
        </button>
        
        <h2 className="editor-title">Редактор новостей</h2>
        
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
        
        <div className="editor-content">
          <div className="news-list-panel">
            <div className="panel-header">
              <h3>Существующие новости</h3>
              <button 
                className="add-new-button" 
                onClick={handleNewNews}
                disabled={loading}
              >
                + Новая новость
              </button>
            </div>
            
            <div className="news-list">
              {news.map(item => (
                <div 
                  key={item.id}
                  className={`news-list-item ${selectedNews?.id === item.id ? 'selected' : ''}`}
                  onClick={() => setSelectedNews(item)}
                >
                  <div className="news-item-preview">
                    <h4>{item.title}</h4>
                    <span className="news-item-meta">{item.time}</span>
                  </div>
                  <button 
                    className="delete-button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(item.id);
                    }}
                    disabled={loading}
                  >
                    {loading ? 'Удаление...' : 'Удалить'}
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="edit-form-panel">
            <h3>{selectedNews ? 'Редактировать новость' : 'Создать новость'}</h3>
            
            <form onSubmit={handleSubmit} className="news-form">
              <div className="form-group">
                <label>Заголовок новости</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  placeholder="Введите заголовок..."
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label>Автор </label>
                <input
                  type="text"
                  name="author"
                  value={formData.author}
                  onChange={handleInputChange}
                  required
                  placeholder="Имя автора..."
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label>Дата и время</label>
                <input
                  type="text"
                  name="time"
                  value={formData.time}
                  onChange={handleInputChange}
                  placeholder="Например: 15.05.2025 14:30"
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label>URL изображения</label>
                <input
                  type="text"
                  name="image"
                  value={formData.image}
                  onChange={handleInputChange}
                  placeholder="https://example.com/image.jpg"
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label>Альтернативный текст изображения</label>
                <input
                  type="text"
                  name="imageAlt"
                  value={formData.imageAlt}
                  onChange={handleInputChange}
                  placeholder="Описание изображения для доступности"
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label>
                  Полный текст новости 
                  <span className="word-counter">({wordCount} слов)</span>
                </label>
                <textarea
                  name="fullText"
                  value={formData.fullText}
                  onChange={handleInputChange}
                  rows="8"
                  required
                  placeholder="Полный текст новости..."
                  disabled={loading}
                />
              </div>

              <div className="form-actions">
                <button 
                  type="submit" 
                  className="save-button"
                  disabled={loading}
                >
                  {loading ? 'Сохранение...' : (selectedNews ? 'Обновить ' : 'Создать ') + ' новость'}
                </button>
                {selectedNews && (
                  <button 
                    type="button" 
                    className="cancel-button"
                    onClick={handleNewNews}
                    disabled={loading}
                  >
                    Отмена
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NewsEditor;