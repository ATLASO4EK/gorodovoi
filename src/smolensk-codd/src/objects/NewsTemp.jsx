import './../styles/NewsPage.css'

function NewsTemp({ title, author, time, onOpen }) {
  return (
    <div 
      className="news-card"
      onClick={onOpen}
      role="button"
      tabIndex={0}
      onKeyPress={(e) => e.key === 'Enter' && onOpen()}
    >
      <div className="news-image-container">
        <div className="news-image-placeholder">
          <span className="news-emoji">🚗</span>
          <span className="news-category">Дорожная безопасность</span>
        </div>
      </div>
      <div className="news-card-content">
        <h3 className="news-card-title">{title}</h3>
        <div className="news-meta">
          <span className="news-author">
            <span className="author-icon">👤</span>
            {author}
          </span>
          <span className="news-time">
            <span className="time-icon">🕒</span>
            {time}
          </span>
        </div>
      </div>
    </div>
  )
}

function NewsCategory({ category, NewsTemp, onNewsOpen }) {
  return (
    <div className="news-category">
      <h2 className="category-title">{category}</h2>
      <div className="news-grid">
        {NewsTemps.map((news, index) => (
          <NewsTemp 
            key={index} 
            title={news.title}
            author={news.author}
            time={news.time}
            onOpen={() => onNewsOpen(news)}
          />
        ))}
      </div>
    </div>
  )
}

export default NewsCategory