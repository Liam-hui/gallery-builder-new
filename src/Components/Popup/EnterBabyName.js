import React, { useState } from 'react'
import store from '../../store'
import { useSelector } from "react-redux"
import Icon from '@mdi/react'
import { mdiCloseThick } from '@mdi/js'
import translate from '../../utils/translate'

import { getTitle } from '../../utils/MyUtils'
import { getTitleImage } from '..//../api/misc'

const EnterBabyName = () => {

  const images = useSelector(state => state.images.data)
  const [text,setText] = useState('');

  return (
    <div className='popup-box' style={{ width: 340, height: 250 }}>

      <p style={{ marginBottom: 20 }}>{translate('enterText')}</p>
      <textarea style={{ marginBottom: 20 }} wrap="off" value={text} onChange={(event)=>setText(event.target.value)} className='babyname-input'/>

      <div style={{ display: 'flex' }}>
        <div 
          className='border-button' 
          onClick={async () => {
            for (const id in images) {
              const image = images[id]
              if (image.titles) {
                for (const titleId in image.titles) {
                  const title = image.titles[titleId]
                  if (title.adminTitle) {
                    const titleImage = await getTitleImage(id, getTitle(title.adminTitle, text))
                    store.dispatch({ type: 'UPDATE_IMAGE_TITLE', id: titleId, imageId: id, data: { id: titleImage.id, url: titleImage.base64 } })
                  }
                }
              }
            }
            store.dispatch({ type:'SET_POPUP',mode:'tutorial' })
          }}
        >
          {translate('ok')}
        </div>
      </div>

      <div style={{ position: 'absolute', top: 0, right: 0, padding: 10, cursor: 'pointer' }} onClick={() => store.dispatch({ type:'SET_POPUP',mode:'tutorial' })}>
        <Icon path={mdiCloseThick} style={{ transform:`translate(0.5px,0.5px)` }} size={0.9} color="black"/>   
      </div>

    </div>
  )
}

export default EnterBabyName



