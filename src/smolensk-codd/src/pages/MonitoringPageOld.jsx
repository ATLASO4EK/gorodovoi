import { useState, useEffect } from 'react';
import './../styles/MonitoringPage.css'
import URL from './../config';

function MonitoringPage() {
  const [jams, setJams] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await fetch(URL + 'jams');
        const data = await result.json();
        console.log(data); // посмотри в консоли
        setJams(data);
      } catch (error) {
        console.error('Ошибка загрузки данных:', error);
      }
    };
    fetchData();
  }, []);

  return (
    <div>
      <h1>Мониторинг и аналитика</h1>
      <MPC/>
      <ul>
        {jams.map((item, index) => (
          <div className='jamCard' key={index}>
            {item[0]}:00 - {item[1]} балл(-ов)
          </div>
        ))}
      </ul>
    </div>
  );
}

export default MonitoringPage;
