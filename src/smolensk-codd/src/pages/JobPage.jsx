import Job from './../objects/Job'

function JobPage() {
  const jobs = [
    {
      date: "Сегодня в 16:22",
      title: "Frontend Developer",
      salary: "от 120 000 ₽",
      company: "ООО АйТи",
      location: "Москва • Площадь Ильича",
      description: "Разработка клиентских интерфейсов на React. Поддержка существующих проектов.",
    },
    {
      date: "Сегодня в 15:10",
      title: "Backend Developer",
      salary: "от 150 000 ₽",
      company: "Tech Corp",
      location: "Санкт-Петербург • м. Петроградская",
      description: "Проектирование и разработка API на Node.js. Работа с базами данных.",
    },
    {
      date: "Вчера",
      title: "Designer",
      salary: "По договорённости",
      company: "Design Studio",
      location: "Казань",
      description: "Создание UI/UX макетов в Figma. Взаимодействие с разработчиками.",
    },
    {
      date: "Сегодня",
      title: "QA Engineer",
      salary: "от 90 000 ₽",
      company: "QA Systems",
      location: "Екатеринбург",
      description: "Написание автотестов, ручное тестирование, работа с CI/CD.",
    },
  ];

  return (
    <>
      <h1>Вакансии</h1>
      <div className="jobs-grid">
        {jobs.map((job, idx) => (
          <Job key={idx} {...job} />
        ))}
      </div>
    </>
  );
}

export default JobPage;
