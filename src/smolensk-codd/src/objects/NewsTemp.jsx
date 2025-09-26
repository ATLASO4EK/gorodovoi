import './../styles/NewsPage.css'

function NewsTemp({ id, date, author, title, desc, onOpen, image }) {
  return (
    <div 
      className="news-card"
      onClick={onOpen}
      role="button"
      tabIndex={0}
      onKeyPress={(e) => e.key === 'Enter' && onOpen()}
    >
      <div className="news-image-container">
        {image && image !== '#' ? (
          <img 
            src={image} 
            alt={imageAlt} 
            className="news-image"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
        ) : null}
        <div className="news-image-placeholder" style={{ display: image && image !== '#' ? 'none' : 'flex' }}>
          <span className="news-emoji">📰</span>
          <span className="news-category">Новость ЦОДД</span>
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

function NewsCategory({ category, NewsTemps, onNewsOpen }) {
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
            image={news.image}
            imageAlt={news.imageAlt}
            onOpen={() => onNewsOpen(news)}
          />
        ))}
      </div>
    </div>
  )
}

export default NewsCategory