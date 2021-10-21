import React from 'react'
import store from '../store'
import { useSelector } from "react-redux"
import { isMobile } from 'react-device-detect'
import Slider from './Slider'

function HeadsList() {

  const status = useSelector(state => state.status)
  const { display } = status

  const heads = useSelector(state => state.heads.data)
  const isSelecting = useSelector(state => state.heads.isSelecting)
  const selecting = useSelector(state => state.heads.selecting)

  const selectHead = (id) => {
    if (isSelecting) {
      store.dispatch({ type: 'UPDATE_IMAGE_HEAD', id: selecting.id, imageId: selecting.imageId, data: { headId: id, width: heads[id].width, height: heads[id].height } })
      store.dispatch({ type: 'SELECT_HEAD_END' })
      store.dispatch({ type: 'HIDE_POPUP' })
    }
  }

  return (
    <Slider 
      images={heads} 
      mode='head' 
      canDelete={false} 
      canDrag={false} 
      isVertical={display == 'large' || display == 'small-land'} 
      isHighlightAll={isSelecting}
      selectItem={selectHead}
      deleteItem={(id)=>{
        // if(!images.some(image=>image.iconId==id)) store.dispatch({type:'DELETE_ICON',id:id});
      }}
      style={isSelecting ? { zIndex: 9999999999 } : {}}
    />
  )
}

export default HeadsList



