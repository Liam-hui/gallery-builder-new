import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { useSelector } from "react-redux"
import store from '../store'
import { isMobile } from 'react-device-detect'

import Icon from '@mdi/react'
import { mdiCloseThick, mdiCursorMove } from '@mdi/js'
import translate from '../utils/translate'

const SliderItem = ({ index, mode, isVertical, size, item, isSelected, isHighlightAll, canDelete, canDrag, drag, dragStart, selectedText, selectItem, deleteItem }) => {

  if (item.order == undefined) item.order = index

  // set image width and height
  const sliderImageStyle = useMemo(() => {
    let { width, height } = size
    const imageRatio = item.width / item.height
    if (imageRatio > width / height) {
      height = width / imageRatio
    }
    else {
      width = height * imageRatio
    }

    return { width, height }
  }, [item])

  // set image drag
  const myDrag = useMemo(() => {
    let myDrag = { x: 0, y: 0 }
    if (drag != null) {
      if (drag.id == item.id) 
        myDrag = { x: drag.x, y: drag.y }
      else {
        let dif = item.order - drag.order

        if (isVertical) {
          if (dif > 0 && drag.y > (size.height + size.margin) * dif ) 
            myDrag.y = -size.height
          else if (dif < 0 && drag.y < (size.height + size.margin) * (dif + 0.5) ) 
            myDrag.y = size.height
        }
        else {
          if (dif > 0 && drag.x > (size.width + size.margin) * dif ) 
            myDrag.x = -size.width
          else if (dif < 0 && drag.x < (size.width + size.margin) * (dif + 0.5) ) 
            myDrag.x = size.width
        }
      }
    }
    return myDrag
  }, [drag])

  const [isHover, setIsHover] = useState(false)
  const isDragging = drag?.id == item.id

  return (
    <div 
      className={`slider-item${isSelected ? ' is-selected' : ''}${isDragging ? ' is-dragging' : ''}${isHover || isHighlightAll ? ' is-hover' : ''}`}  
      draggable="false"
      style={ 
        isVertical ? 
          { transform: `translate(${myDrag.x}px, ${item.order * (size.height + size.margin) + myDrag.y}px)`, width: size.width, height: size.height }
        : 
          { transform: `translate(${item.order * (size.width + size.margin) + myDrag.x}px, ${myDrag.y}px)`, width: size.width, height: size.height }
      }
      onMouseEnter={() => setIsHover(true)}
      onMouseLeave={() => setIsHover(false)}
    >

      <div className="slider-image-wrapper" style={sliderImageStyle}>
        <img className="slider-image" src={item.url} onClick={() => selectItem(item.id)}  />
        {(isHover || isDragging) && <>
          {/* drag icon */}
          {canDrag && 
            <div 
              className='slider-item-button top-left' 
              draggable="false"
              onMouseDown={!isMobile ? (e) => dragStart(e, item.id, item.order) : null}
              onTouchStart={isMobile ? (e) => dragStart(e, item.id, item.order) : null}
            >
              <Icon path={mdiCursorMove} size={0.7} color="white"/>
            </div>
          }
          {/* delete icon */}
          {canDelete && 
            <div 
              className='slider-item-button top-right' 
              draggable="false"
              onClick={() => deleteItem(item.id)}
            >
              <Icon path={mdiCloseThick} size={0.7} color="white"/>
            </div>
          }
        </>}
      </div>

      {isSelected &&
        <div className="slider-item-status">
          {selectedText}
        </div>
      }

      {!isSelected && mode == 'image' && isHover &&
        <div className="slider-item-status">
          {translate('select')}
        </div>
      }

      {!isSelected && mode == 'head' && isHighlightAll &&
        <div className="slider-item-status">
          {translate('select')}
        </div>
      }

      {item.order == 0 && mode == 'image' &&
        <div className="slider-item-cover-text">{translate('cover')}</div>
      }
      
    </div>
  )
}

const Slider = ({ style, images, mode, canDelete, canDrag, isVertical, isHighlightAll, selectedText, selectedId, selectItem, deleteItem }) => {

  const display = useSelector(state => state.status.display)
  const size = useMemo(() => {
    if (display == 'large') return { width: 200, height: 100, margin: 15 }
    else if (display == 'small-port') return { width: 100, height: 100, margin: 15 }
    else if (display == 'small-land') return { width: 100, height: 100, margin: 5 }
    return { width: 0, height: 0, margin: 0 }
  }, [display])

  const items = useMemo(() => 
    Object.entries(images).map( ([id, item]) => { return { ...item, id: id } } )
  , [images])

  const [drag, setDrag] = useState(null)
  const [temp, setTemp] = useState(null)

  const preventDefault = useCallback((e) => { e.preventDefault(); }, [])

  const dragStart = (e, id, order) => {   
    window.addEventListener('touchmove', preventDefault, { passive: false })
    if (e.targetTouches) e = e.targetTouches[0] 
    setDrag({ id, order, x: 0, y: 0 })
    setTemp({
        x: e.clientX,
        y: e.clientY
    })
  }

  const dragMove = (e) => {
    if (e.targetTouches) e = e.targetTouches[0] 
    if (temp)
      setDrag({ ...drag, x: e.clientX - temp.x, y: e.clientY - temp.y })
  }

  const dragEnd = () => {
    window.removeEventListener('touchmove', preventDefault)
    if (drag != null && temp != null) {

      let dif = 0
      if (isVertical) {
        if (drag.y > 0)
          dif = Math.floor(drag.y / (size.height + size.margin))
        else
          dif = Math.ceil( (drag.y - (size.height + size.margin) * 0.5) / (size.height + size.margin) )
      }
      else {
        if (drag.x > 0)
          dif = Math.floor(drag.x / (size.width + size.margin))
        else
          dif = Math.ceil( (drag.x - (size.width + size.margin) * 0.5) / (size.width + size.margin) )
      }

      if (drag.order + dif < 0 || drag.order + dif > items.length - 1) dif = 0
      
      if (dif != 0)
        store.dispatch({ type: 'CHANGE_IMAGES_ORDER', id: drag.id, dif })

      setDrag(null)
      setTemp(null)
    }
  }

  return (
    <div 
      className={`slider${isVertical ? ' is-vertical' : ''}${mode == 'head' ? ' is-transparent' : ''}`}
      onMouseMove={canDrag && !isMobile? dragMove : null} 
      onTouchMove={canDrag && isMobile ? dragMove : null} 
      onMouseUp={canDrag && isMobile ? null: dragEnd}
      onTouchEnd={canDrag && isMobile ? dragEnd: null} 
      style={style}
    >
      <div className="slider-scroll-container">
        <div 
          className="slider-items-wrapper" 
          style={ 
            isVertical ? 
              { height: items.length * (size.height + size.margin), width: size.width }
            : 
              { width: items.length * (size.width + size.margin), height: size.height } 
          }
        >
          {items.map((item, index) => 
            <SliderItem 
              key={item.id} 
              isSelected={selectedId == item.id}
              {... {
                item,
                index,
                size,
                mode,
                canDelete,
                canDrag, 
                isVertical, 
                isHighlightAll,
                selectedText, 
                selectedId, 
                selectItem, 
                deleteItem,
                drag,
                dragStart,
              }}
            /> 
          )}
        </div>
      </div>
  
    </div>
  )
}

export default Slider
