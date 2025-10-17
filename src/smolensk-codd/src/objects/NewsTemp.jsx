import './../styles/NewsPage.css'

function NewsTemp({ id, author, title, time, onOpen, image, imageAlt, fullText }) {
  return (
    <div 
      className="news-card"
      onClick={onOpen}
      role="button"
      tabIndex={0} 
      onKeyPress={(e) => e.key === 'Enter' && onOpen()} 
    >
      <div className="news-image-container">
        {image && image !== '#' && image !== '' ? (
          <img 
            src={image} 
            alt={imageAlt || title} 
            className="news-image"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
        ) : null}

        <div className="news-image-placeholder" style={{ 
          display: (image && image !== '#' && image !== '') ? 'none' : 'flex' 
        }}>
          <span className="news-emoji">📰</span>
          <span className="news-category">Новость ЦОДД</span>
        </div>
      </div>
      
      <div className="news-card-content">
        <h3 className="news-card-title">{title}</h3> 
        <div className="news-meta">
          <span className="news-author">
            <span className="author-icon">👤</span>
            {author || 'Неизвестный автор'} 
          </span>
  
          <span className="news-time">
            <span className="time-icon">🕒</span>
            {time || 'Дата не указана'}
          </span>
        </div>
      </div>
    </div>
  )
}

function NewsCategory({ category, NewsTemps, onNewsOpen }) {
  return (
    <div className="news-category">
      <h2 className="category-title">{category}</h2> 
      <div className="news-grid">
        {NewsTemps.map((news) => (
          <NewsTemp 
            key={news.id}
            id={news.id}
            title={news.title}
            author={news.author}
            time={news.time}
            image={news.image}
            imageAlt={news.imageAlt || news.title}
            fullText={news.fullText}
            onOpen={() => onNewsOpen(news)} 
          />
        ))}
      </div>
    </div>
  )
}

export default NewsCategory;