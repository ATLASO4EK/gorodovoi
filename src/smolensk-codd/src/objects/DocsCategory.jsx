import Docs from "./Docs.jsx"
import "./../styles/DocsCategory.css"

function DocsCategory({ category, docs }) {
  return (
    <div className="docs-category">
      <h2 className="category-title">{category}</h2>
      <div className="docs-row">
        {docs.map((doc, index) => (
          <Docs key={index} title={doc.title} file={doc.file} />
        ))}
      </div>
    </div>
  )
}

export default DocsCategory
