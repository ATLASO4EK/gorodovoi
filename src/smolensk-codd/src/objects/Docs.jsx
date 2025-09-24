import './../styles/Docs.css'
import Icon from '/vite.svg'

function Docs({title, file}) {
  return (
    <>
      <a href={file} target="_blank">
        <div className="square-container">
        <img src={Icon}></img>
        <p className='doc-title'>{title}</p>
      </div></a>
    </>
    
  )
}

export default Docs