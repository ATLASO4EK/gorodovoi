import './../styles/Docs.css'
import Icon from '/vite.svg'

function Docs({title, file}) {
  return (
    <a href={file} target="_blank" className="square-container">
      <img src={Icon} alt="doc icon" />
      <p className='doc-title'>{title}</p>
    </a>
  )
}

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