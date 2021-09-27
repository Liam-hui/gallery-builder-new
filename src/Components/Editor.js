import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { useSelector } from "react-redux"
import store from '../store'
import { isMobile } from 'react-device-detect'

import Icon from '@mdi/react'
import { mdiRedoVariant, mdiPlusThick, mdiArrowLeftBold, mdiMagnifyPlusOutline, mdiMagnifyMinusOutline } from '@mdi/js'

import translate from '../utils/translate'
import ObjectItem from './Object'

const Editor = () => {

  const editorRef = useRef()

  const status = useSelector(state => state.status)
  const { mode, display } = status

  const images = useSelector(state => state.images.data)
  const currentImageId = useSelector(state => state.images.selected)
  const currentImage = images[currentImageId]
  const history = currentImage?.history

  const [editorScale, setEditorScale] = useState(1)
  const editorAreaWrapperRef = useRef()
  const [editorAreaStyle, setEditorAreaStyle] = useState({})
  const updateEditorAreaStyle = () => {
    if (editorAreaWrapperRef.current) {
      const style = getComputedStyle(editorAreaWrapperRef.current)
      let width = parseInt(style.getPropertyValue("width"))
      let height = parseInt(style.getPropertyValue("height"))
      const imageRatio = currentImage.width / currentImage.height

      if (imageRatio > width / height) {
        height = width / imageRatio
      }
      else {
        width = height * imageRatio
      }

      setEditorScale(width / currentImage.width)
      setEditorAreaStyle({
        width,
        height,
        backgroundImage: `url(${currentImage.url})`,
      })
    }
  }
  useEffect(() => {
    if (currentImage != null)
      updateEditorAreaStyle()
    else
      setEditorAreaStyle({})
    
    store.dispatch({ type: 'SELECT_HEAD_END' })
  }, [currentImage])

  // resize event
  const resizeLoopRef = useRef()
  if (!isMobile) window.addEventListener("resize", () => {
    clearTimeout(resizeLoopRef.current)
    resizeLoopRef.current = setTimeout(doneResizing, 500)
  })
  const doneResizing = () => {
    updateEditorAreaStyle()
  }

  // force re-render
  const forceUpdate = useSelector(state => state.images.forceUpdate)

  const [selectedItem, setSelectedItem] = useState(null)

  // transform
  const transformAction = useRef(null)
  const endAction = useRef(null)

  const transformStart = (transformAction_, endAction_) => {
    transformAction.current = transformAction_
    endAction.current = endAction_
  }

  const transformMove = (e) => {
    if (!e.target.closest('.object'))
      setSelectedItem(null)

    if (transformAction.current) {
      const action = transformAction.current
      if (e.targetTouches) e = e.targetTouches[0]
      action(e)
    }
  }

  const transformEnd = () => {
    if (transformAction.current && endAction.current) {
      const action = endAction.current
      action()
      transformAction.current = null
      endAction.current = null
    }
  }

  // add new object
  const addNewHead = () => {
    store.dispatch({ type: 'ADD_IMAGE_HEAD', id: currentImageId })
  }

  const addNewText = () => {
    store.dispatch({ type: 'ADD_IMAGE_TITLE', id: currentImageId })
  }

  // undo and redo
  const undo = () => {
    store.dispatch({ type: 'IMAGE_UNDO', id: currentImageId })
  }

  const redo = () => {
    store.dispatch({ type: 'IMAGE_REDO', id: currentImageId })
  }

  // message
  const isSelectingHead = useSelector(state => state.heads.isSelecting)
  const [message, setMessage] = useState('')
  useEffect(() => {
    if (isMobile)
      setMessage(isSelectingHead ? translate('chooseFace') : '')
  }, [isSelectingHead])

  // zoom
  const [object, setobject] = useState(null)
  const [isZoomed, setIsZoomed] = useState(false)
  const [zoomScale, setZoomScale] = useState(1)
  const [zoomOffset, setZoomOffset] = useState({ x: 0, y: 0 })
  const doZoom = () => {
    if (isZoomed) {
      setZoomScale(1)
      setZoomOffset({ x: 0, y: 0 })
    }
    else if (selectedItem) {
      const editorWidth = editorAreaWrapperRef.current.clientWidth
      const editorHeight = editorAreaWrapperRef.current.clientHeight
      const editorSize = Math.min(editorHeight, editorWidth)

      const object = currentImage[selectedItem.type == 'head' ? 'heads' : 'titles'][selectedItem.id]
      const objectSize = Math.hypot(object.width, object.height) * object.scale * editorScale

      const scale = editorSize / objectSize * 0.75
      let maxX = Math.abs(currentImage.width * 0.5 * editorScale * scale - editorWidth * 0.5)
      let maxY = Math.abs(currentImage.height * 0.5 * editorScale * scale - editorHeight * 0.5)

      let x = (currentImage.width * 0.5 - object.x) * editorScale * scale
      if (x < 0) 
        x = Math.max(x, -maxX)
      else if (x > 0) 
        x = Math.min(x, maxX)

      let y = (currentImage.height * 0.5 - object.y) * editorScale * scale
      if (y < 0) 
        y = Math.max(y, -maxY)
      else if (y > 0) 
        y = Math.min(y, maxY)

      setZoomScale(scale)
      setZoomOffset({ x, y })
    }

    setIsZoomed(!isZoomed)
  }

  useEffect(() => {
    if (selectedItem == null)
      store.dispatch({ type: 'SELECT_HEAD_END' })
  }, [selectedItem])
  
  return (
    <div 
      ref={editorRef}
      className="editor"
      onMouseMove={!isMobile ? transformMove : null} 
      onTouchMove={isMobile ? transformMove : null} 
      onMouseUp={isMobile ? null : transformEnd}
      onTouchEnd={isMobile ? transformEnd : null} 
      onClick={(e) => {
        if (isMobile) {
          if (!e.target.closest('.object') && !e.target.closest('.zoom-button'))
            setSelectedItem(null)
        }
      }}
    >

      <div className='editor-top-bar'>
        {/* undo and redo */}
        <div className={`editor-top-bar-button${history && history.undo.length > 0 ? '' : ' is-disabled'}`} onClick={undo} >
          <Icon path={mdiRedoVariant} size={0.8} style={{ transform: `scaleX(-1)` }} color="grey"/>
          {translate('undo')}
        </div>
        <div className={`editor-top-bar-button${history && history.redo.length > 0 ? '' : ' is-disabled'}`} onClick={redo} >
          <Icon path={mdiRedoVariant} size={0.8} color="grey"/>
          {translate('redo')}
        </div>

        {/* add new object */}
        {mode == 'admin' && <>
          <div className={`editor-top-bar-button`} onClick={addNewHead} >
            <Icon path={mdiPlusThick} size={0.8} color="grey"/>
            新增頭像
          </div>
          {currentImage?.titles && Object.keys(currentImage.titles).length == 0 &&
            <div className={`editor-top-bar-button`} onClick={addNewText} >
              <Icon path={mdiPlusThick} size={0.8} color="grey"/>
              新增文字
            </div>
          }
        </>}

        {/* zoom */}
        {isMobile && mode != 'admin' && (selectedItem != null || isZoomed) &&
          <div className="zoom-button" onClick={doZoom}>
            <Icon path={isZoomed ? mdiMagnifyMinusOutline : mdiMagnifyPlusOutline} size={1.8} color="grey" />
          </div>
        }
      </div>

      <div className="editor-area-wrapper" ref={editorAreaWrapperRef}>
        <div className="editor-area" style={{ ...editorAreaStyle, transform: `translate(${zoomOffset.x}px, ${zoomOffset.y}px) scale(${zoomScale})`, overflow: selectedItem ? 'visible' : 'hidden' }} >

          {currentImage?.heads && Object.entries(currentImage.heads).map(([id, head]) =>
            <ObjectItem key={`${currentImageId}${id}`} id={id} imageId={currentImageId} data={head} imageSize={{ width: currentImage.width, height: currentImage.height }} type='head' isSelected={selectedItem?.id == id} setSelectedItem={setSelectedItem} transformStart={transformStart} editorScale={editorScale} setMessage={setMessage} /> 
          )}

          {currentImage?.titles && Object.entries(currentImage.titles).map(([id, title]) =>
            <ObjectItem key={`${currentImageId}${id}`} id={id} imageId={currentImageId} data={title} imageSize={{ width: currentImage.width, height: currentImage.height }} type='title' isSelected={selectedItem?.id == id} setSelectedItem={setSelectedItem} transformStart={transformStart} editorScale={editorScale} setMessage={setMessage} /> 
          )}

        </div>
      </div>

      {/* page number */}
      {currentImage && mode == 'user' && display != 'large' &&
        <div className='editor-page'>
          <div 
            className={`page-arrow${currentImage.order > 0 ? '' : ' is-disabled'}`} 
            onClick={() => {
              if (currentImage.order > 0) 
                store.dispatch({ 
                  type: 'SELECT_IMAGE', 
                  id: Object.entries(images).find(([id, image]) => image.order == currentImage.order - 1)[0]
                })
            }}
          >
            <Icon path={mdiArrowLeftBold} size={0.8} color="#DDDDDD" style={{ transform:`translate(0px,0.5px)` }}/>
          </div>

          <div className='page-number border-box'>
            {window.lang == 'en' ?
              `Page ${currentImage.order + 1}`
            :
              `第 ${currentImage.order + 1} 張`
            }
          </div>
          
          <div 
            className={`page-arrow${currentImage.order < Object.keys(images).length - 1 ? '' : ' is-disabled'}`} 
            onClick={() => {
              if (currentImage.order < Object.keys(images).length - 1) 
                store.dispatch({ 
                  type: 'SELECT_IMAGE', 
                  id: Object.entries(images).find(([id, image]) => image.order == currentImage.order + 1)[0]
                })
            }}
          >
            <Icon path={mdiArrowLeftBold} size={0.8} color="#DDDDDD" style={{ transform:`translate(0px,0.5px) rotate(180deg)` }}/>
          </div>
        </div>
      }

      {/* message */}
      {isMobile && message != '' &&
        <div className="editor-message">
          {message}
        </div>
      }
      
    </div>
  )
}

export default Editor
