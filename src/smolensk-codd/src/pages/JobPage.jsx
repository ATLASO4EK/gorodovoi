import Job from './../objects/Job'
import placeholder from '/vite.svg'

function JobPage() {
  const jobs = [
    { title: "Frontend Developer", image: placeholder, description: "React, Tailwind, JS" },
    { title: "Backend Developer", image: placeholder, description: "Node.js, Express, MongoDB" },
    { title: "Designer", image: placeholder, description: "Figma, UI/UX" },
    { title: "QA Engineer", image: placeholder, description: "Автотесты, Selenium" },
    { title: "QA Engineer", image: placeholder, description: "Автотесты, Selenium" },
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
