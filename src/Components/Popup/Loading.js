import React from 'react'
import { useSelector } from "react-redux"

const Loading = (props) => {

  const { message } = useSelector(state => state.popup)

  return (
    <div className='loading'>
      {message && <p>{message}</p>}
      <div className="lds-spinner"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div>
    </div>
  )
}

export default Loading





