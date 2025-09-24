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

export default Docs
