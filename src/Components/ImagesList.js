import React from 'react'
import { useSelector } from "react-redux"
import store from '../store'
import translate from '../utils/translate'

import Slider from './Slider'
import { adminDeleteImage } from '../api/admin'

function ImagesList() {

  const status = useSelector(state => state.status)
  const { mode, display } = status

  const images = useSelector(state => state.images.data)
  const currentImageId = useSelector(state => state.images.selected)

  return (
    <Slider 
      images={images} 
      mode='image' 
      canDelete={mode == 'admin'} 
      canDrag={mode == 'admin'} 
      isVertical={display == 'small-land'} 
      selectedText={mode == 'view' ? translate('selected') : translate('editingPage')} 
      selectedId={currentImageId} 
      selectItem={(id) => {
        store.dispatch({ type: 'SELECT_IMAGE', id: id })
        if (mode == 'user' && images[id].order == Object.keys(images).length - 1) {
          store.dispatch({ 
            type: 'SET_POPUP', 
            mode: 'message',
            payload: {
              message: translate('finishReminder'),
            }
          })
        }
      }}
      deleteItem={(id) => adminDeleteImage(id)}  
    />
  )
}

export default ImagesList
