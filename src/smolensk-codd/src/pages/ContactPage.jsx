import Contact from './../objects/Contact'
import vite from '/vite.svg'

function ContactPage() {
  return (
    <>
    <h1>Контакты</h1>
        <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap" }}>
      <Contact
        image={vite}
        title="Заголовок 1"
        description="Краткое описание для первого блока."
      />
      <Contact
        image={vite}
        title="Заголовок 2"
        description="Здесь текст побольше, но всё равно влезает."
      />
      <Contact
        image={vite}
        title="Заголовок 3"
        description="И третий вариант с описанием намного длиннее необходимого."
      />
    </div></>
  );
}

export default ContactPage;