/*Объект-Шаблон Контакта*/

  /*
  Принимает:          Пример:
  title: str;         title: 'Единый справочный телефон',
  description: str;   description: 'По этому номеру вы можете получить информацию о дорожной ситуации, работе светофоров и общественного транспорта',
  phone: str;         phone: '+7 (4812) 12-34-56',
  email: str;         email: 'reception@codd-smolensk.ru',
  address: str;       address: 'г. Смоленск, ул. Ленина, д. 15, офис 304',
  hours: str;         hours: 'Круглосуточно',
  icon: str;          icon: '🏛️'

  Использование: pages/ContactPage.jsx => contactsData (assets/contactsData.json)
  */

function Contact({ title, description, phone, email, address, hours, icon }) {
  return (
    <div className="contact-card">
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
        
        {hours && (
          <div className="contact-info">
            <span className="info-label">Режим работы:</span>
            <span className="info-value hours">{hours}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default Contact;