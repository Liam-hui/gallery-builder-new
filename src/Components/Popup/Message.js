import React from 'react'
import store from '../../store'
import { useSelector } from "react-redux"
import translate from '../../utils/translate'

const Message = () => {

  const { message, confirm, confirmText, canCancel, cancel, noNeedHide } = useSelector(state => state.popup)

  return (
    <div className='popup-box' style={{ width: 340, minHeight: 250 }}>

      <p style={{ whiteSpace: "pre-wrap" }}>{message}</p>

      <div style={{ display: 'flex' }}>
        <div 
          className='border-button' 
          onClick={() => {
            confirm && confirm()
            if (!noNeedHide) 
              store.dispatch({ type:'HIDE_POPUP' })
          }}
        >
          {confirmText?? translate('ok')}
        </div>
        {canCancel &&
          <div 
            className='border-button' 
            onClick={() => {
              cancel && cancel()
              store.dispatch({ type: 'HIDE_POPUP' })
            }}
          >
            {translate('cancel')}
          </div>
        }
      </div>

    </div>
  )
}

export default Message



