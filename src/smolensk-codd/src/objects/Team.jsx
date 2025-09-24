import { useState } from 'react'
import Person1 from '/person1.jpg'

function Team() {  
  const [count, setCount] = useState(0)

  return (
    <div>
        <h1 className='info-title'>Наша команда</h1>  
          <div className='person-1'>
            <img src={Person1} className="Person-1" alt="Person-1" />
            <h1 className='person'>Инна Инновна</h1>
            <p>Я крутая занимаюсь крутыми делами блаблаблаблабла</p>
          </div>
          <div className='person-2'>
            <img src={Person1} className="Person-2" alt="Person-2" />
            <h1 className='person'>Инна Инновна</h1>
            <p>Я крутая занимаюсь крутыми делами блаблаблаблабла</p>
          </div>
          <div className='person-3'>
            <img src={Person1} className="Person-3" alt="Person-3" />
            <h1 className='person'>Инна Инновна</h1>
            <p>Я крутая занимаюсь крутыми делами блаблаблаблабла</p>
          </div>
          <div className='person-4'>
            <img src={Person1} className="Person-4" alt="Person-4" />
            <h1 className='person'>Инна Инновна</h1>
            <p>Я крутая занимаюсь крутыми делами блаблаблаблабла</p>
          </div>
          <div className='person-5'>
            <img src={Person1} className="Person-5" alt="Person-5" />
            <h1 className='person'>Инна Инновна</h1>
            <p>Я крутая занимаюсь крутыми делами блаблаблаблабла</p>
          </div>
          <div className='person-6'>
            <img src={Person1} className="Person-6" alt="Person-6" />
            <h1 className='person'>Инна Инновна</h1>
            <p>Я крутая занимаюсь крутыми делами блаблаблаблабла</p>
          </div>

    </div>
  )
}

export default Team