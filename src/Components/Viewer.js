import React, { useState, useEffect, useCallback, useRef} from 'react'
import { useSelector } from "react-redux"
import store from '../store'
import { isMobile } from 'react-device-detect';

import ObjectItem from './Object'

import translate from '../utils/translate'

const Viewer = () => {

  const images = useSelector(state => state.images.data)
  const currentImageId = useSelector(state => state.images.selected)
  const currentImage = images[currentImageId]

  const status = useSelector(state => state.status)
  const { display } = status

  return (
    <div className="viewer">
      {display == 'large' ?
        <ViewerImage imageId={currentImageId} image={currentImage} />
      :  
        <>
          {images && Object.entries(images).map(([id, image]) =>
            <>
              <ViewerImage imageId={id} image={image} />
              <div className='image-label'>{image.order == 0 ? translate('cover') : window.lang =='en' ? 'Page '+ image.order : '第'+ image.order+  '頁' }</div>
            </>
          )}
        </>
      }
    </div>
  )
}
const ViewerImage = ({ imageId, image }) => {

  const status = useSelector(state => state.status)
  const { display } = status

  const viewerWrapperRef = useRef() 
  const [scale, setScale] = useState(1)
  const [viewerImageStyle, setViewerImageStyle] = useState({})
  const updateViewerImageStyle = () => {
    if (display == 'large') {
      if (viewerWrapperRef.current) {
        const style = getComputedStyle(viewerWrapperRef.current)
        let width = parseInt(style.getPropertyValue("width"))
        let height = parseInt(style.getPropertyValue("height"))
        const imageRatio = image.width / image.height

        if (imageRatio > width / height) {
          height = width / imageRatio
        }
        else {
          width = height * imageRatio
        }

        setScale(width / image.width)
        setViewerImageStyle({
          width,
          height,
          backgroundImage: `url(${image.url})`,
        })
      }
    }
    else {
      const style = getComputedStyle(viewerWrapperRef.current)
      let width = parseInt(style.getPropertyValue("width"))
      const imageRatio = image.width / image.height
      setScale(width / image.width)
      setViewerImageStyle({
        width,
        height: width / imageRatio,
        backgroundImage: `url(${image.url})`,
      })
    }
  }

  useEffect(() => {
    if (image != null)
      updateViewerImageStyle()
    else
      setViewerImageStyle({})
  }, [image])

  // resize event
  const resizeLoopRef = useRef()
  if (!isMobile) window.addEventListener("resize", () => {
    clearTimeout(resizeLoopRef.current)
    resizeLoopRef.current = setTimeout(doneResizing, 500)
  })
  const doneResizing = () => {
    updateViewerImageStyle()
  }

  return (
    <div className="viewer-image-wrapper" ref={viewerWrapperRef}>
      <div className="viewer-image" style={viewerImageStyle}>

          {image?.heads && Object.entries(image.heads).map(([id, head]) =>
            <ObjectItem isView key={`${imageId}${id}`} id={id} imageId={imageId} data={head} type='head' editorScale={scale} /> 
          )}

          {image?.titles && Object.entries(image.titles).map(([id, title]) =>
            <ObjectItem isView key={`${imageId}${id}`} id={id} imageId={imageId} data={title} type='title' editorScale={scale}  /> 
          )}

      </div>
    </div>
  )
 
}

export default Viewer
