import React from 'react';

function Contact({ title, description, phone, email, address, hours, icon, onContact }) {
  return (
    <div 
      className="contact-card"
      onClick={onContact}
      role="button"
      tabIndex={0}
      onKeyPress={(e) => e.key === 'Enter' && onContact()}
    >
      <div className="contact-card-header">
        <div className="contact-icon">{icon}</div>
        <h3 className="contact-card-title">{title}</h3>
      </div>
      <div className="contact-card-content">
        <p className="contact-description">{description}</p>
        
        {phone && (
          <div className="contact-info">
            <span className="info-label">Телефон:</span>
            <a href={`tel:${phone}`} className="info-value phone-link">
              {phone}
            </a>
          </div>
        )}
        
        {email && (
          <div className="contact-info">
            <span className="info-label">Email:</span>
            <a href={`mailto:${email}`} className="info-value email-link">
              {email}
            </a>
          </div>
        )}
        
        {address && (
          <div className="contact-info">
            <span className="info-label">Адрес:</span>
            <span className="info-value">{address}</span>
          </div>
        )}
        
        <div className="contact-info">
          <span className="info-label">Режим работы:</span>
          <span className="info-value hours">{hours}</span>
        </div>
      </div>
    </div>
  );
}

export default Contact;