import "./../styles/Job.css"

function Job({ date, title, salary, company, location, description }) {
  return (
    <div className="job-card">
      <div className="job-header">
        <span className="job-date">{date}</span>
      </div>

      <div className="job-main">
        <h3 className="job-title">
          {title}
          <span className="job-salary">{salary}</span>
        </h3>
        <p className="job-company">{company}</p>
        <p className="job-location">{location}</p>
      </div>

      <p className="job-description">{description}</p>

      <div className="job-footer">
        <button className="job-apply">Откликнуться</button>
        <div className="job-actions">
        </div>
      </div>
    </div>
  )
}

export default Job
