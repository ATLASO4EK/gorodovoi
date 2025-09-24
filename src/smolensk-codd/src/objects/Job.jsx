import "./../styles/Job.css"

function Job({image, title, description }) {
  return (
    <div className="info-card">
      <img src={image} alt={title} className="info-card-image" />
      <div className="info-card-content">
        <h3 className="info-card-title">{title}</h3>
        <p className="info-card-description">{description}</p>
      </div>
    </div>
  );
}

export default Job;
