import React from 'react'
import store from '../../store'
import { useSelector } from "react-redux"
import translate from '../../utils/translate'
import Icon from '@mdi/react'
import { mdiCloseThick } from '@mdi/js'

import { userUploadHead } from '../../api/user'

const UploadHead = () => {

  const { image } = useSelector(state => state.popup)

  return (
    <div className='popup-box'>

      <div style={{ flex: 1, overflow: 'hidden', marginBottom: 15 }}>
        <img style={{ width: '100%', height: '100%', objectFit: 'contain' }} src={image}/>
      </div>

      <div style={{ display: 'flex' }}>
        <div 
          className='border-button' 
          onClick={() => {
            store.dispatch({ type: 'SET_POPUP', mode: 'loading', payload: { message: translate('loading') } })
            userUploadHead(image, true)
          }}
        >
          {translate('useOriginal')}
        </div>
        <div 
          className='border-button' 
          onClick={() => {
            store.dispatch({ type: 'SET_POPUP', mode: 'loading', payload: { message: translate('loading') } })
            userUploadHead(image, false)
          }}
        >
          {translate('removeBg')}
        </div>
      </div>

      <div style={{ position: 'absolute', top: 0, right: 0, padding: 10, cursor: 'pointer' }} onClick={() => store.dispatch({ type:'HIDE_POPUP' })}>
        <Icon path={mdiCloseThick} style={{ transform:`translate(0.5px,0.5px)` }} size={0.9} color="black"/>   
      </div>

    </div>
  )
}

export default UploadHead



