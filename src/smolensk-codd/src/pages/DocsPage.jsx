import Docs from './../objects/DocsCategory'

function DocsPage() {
  return (
    <>
    <h1>Документы</h1>
    <Docs
    category="Вторая категория Документов"
            docs={[
              { title: "Отчёт штрафов там дороги и налоги", file: placeholder },
              { title: "Количество трупов пенгуинов за 2008 год", file: placeholder },
              { title: "Длинноеназвание документа которое я не буду писать", file: placeholder },
              { title: "🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏", file: placeholder }
            ]}
    />
    </>
  );
}

export default DocsPage;