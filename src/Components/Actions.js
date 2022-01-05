import React, { useEffect } from 'react'
import store from '../store'
import { useSelector } from "react-redux"
import * as htmlToImage from 'html-to-image';
import { isMobile } from 'react-device-detect'

import translate from '../utils/translate'
import { adminUploadImages, adminUpdateImages } from '../api/admin'
import { userUpdateImages } from '../api/user'
import { randomId } from '../utils/MyUtils'


const Actions = () => {

  const images = useSelector(state => state.images.data)
  const currentImageId = useSelector(state => state.images.selected)
  const status = useSelector(state => state.status)
  const { mode } = status

  async function handleFileUpload(e) {
    store.dispatch({ type: 'SET_POPUP', mode: 'loading', payload: { message: translate('loading') } })

    try {
      const files = e.target.files
      if (!files) return

      if (mode == 'admin') {
        let photos = []
        const currentLength = Object.keys(images).length

        for (const [index, file] of Array.from(files).entries()) {

          const load = (file) => {
            return new Promise((resolve, reject) => {
              const reader = new FileReader()
              reader.readAsDataURL(file)
              reader.onload = async function () {
                resolve(await loadImage(reader.result))
              };
              reader.onerror = () => reject()
            })
          }

          const loadImage = (src) => {
            return new Promise((resolve, reject) => {
              const image = new Image()
              image.onload = function () {
                resolve({
                  id: randomId(),
                  base64: src,
                  width: this.width,
                  height: this.height,
                  order: currentLength + index
                })
              }
              image.onerror = () => reject()
              image.src = src
            })
          }

          const image = await load(file)
          photos.push({ ...image, file })
          
        }

        adminUploadImages(photos)
      }

      else if (mode == 'user' || mode == 'demo') {
        Array.from(files).forEach(file  => {

          const reader = new FileReader()
          reader.readAsDataURL(file)
          reader.onload = () => {
            const image = new Image()
            image.onload = () => {
              store.dispatch({ type:'SET_POPUP', mode:'uploadHead', payload: { image: reader.result } })
            };
            image.src = reader.result
          }
          
        })
      }

    } catch (error) {
      alert(error);
      console.log("Catch Error: ", error)
    } finally {
      e.target.value = '' // reset input file
    }
  }

  const doSave = () => {
    if (mode == 'user') {
      userUpdateImages(images) // images, isConfirm, isAutoSave
    }
    else if (mode == 'admin') {
      adminUpdateImages(images) // images, success, isAutoSave
    }
  }

  const finish = () => {

    const isAllHeadSelected = () => {
      for (const imageId in images) {
        const image = images[imageId]
        for (const id in image.heads) {
          const head = image.heads[id]
          if (head.headId == null && head.height > 0 && head.width > 0) {
            return false
          }
        }
      }
      return true
    }

    if (isAllHeadSelected()) {

      if (isMobile) 
        store.dispatch({ type: 'SET_STATUS', payload: { mode: 'saveView' } })
      else
        store.dispatch({ 
          type: 'SET_POPUP', 
          mode: 'message',
          payload: {
            message: translate('finishWarning'),
            canCancel: true,
            confirmText: translate('finishShort'),
            noNeedHide: true,
            confirm: () => {
              userUpdateImages(images, true)
            },
          }
        })
    }
    else {
      store.dispatch({ 
        type: 'SET_POPUP', 
        mode: 'message',
        payload: {
          message: translate('pleaseSelectAllFaces'),
        }
      })
    }
  }

  const demoSaveImage = () => {

    const editor = document.getElementsByClassName("editor-area")[0]
    editor.classList.add("is-saving")                                                                  

    htmlToImage.toPng(editor)
    .then(function (dataUrl) {
      const a = document.createElement('a');
      a.setAttribute('href', dataUrl)
      a.setAttribute('download', 'image.png')
      a.click()
      editor.classList.remove("is-saving")         
    })
    .catch(function (error) {
      console.error('oops, something went wrong!', error);
      editor.classList.remove("is-saving")
    })
  }

  return (
    <div className="actions">

    {(mode == 'admin' || mode == 'user' || mode == 'demo') && 
        <label 
          className='border-button' 
          htmlFor={mode == "admin" ? "upload-image" : null}
          onClick={() => {
            if (mode == 'user' || mode == 'demo')
              store.dispatch({ type:'SET_POPUP', mode:'uploadTutorial' })
            }}
        >
          {translate('uploadPhoto')}
        </label>
      }

      <input onChange={handleFileUpload} type="file" id="upload-image" name="uploadPhotoInput" accept="image/*" multiple={true} />

      {(mode == 'admin' || mode == 'user') && 
        <label 
          className='border-button' 
          onClick={doSave}
        >
          {translate('save')}
        </label>
      }

      {mode == 'demo' && 
        <label 
          className='border-button' 
          onClick={demoSaveImage}
        >
          {translate('downloadImage')}
        </label>
      }

      {mode == 'user' && 
        <label 
          className='border-button' 
          onClick={finish}
        >
            {translate('finish')}
        </label>
      }

      {(mode == 'view' || mode == "saveView") && <>
        <label 
          className='border-button' 
          htmlFor={mode == "admin" ? "upload-image" : null}
          onClick={() => {
            store.dispatch({ 
              type: 'SET_POPUP', 
              mode: 'message',
              payload: {
                message: translate('finishWarning'),
                canCancel: true,
                confirmText: translate('finishShort'),
                noNeedHide: true,
                confirm: () => {
                  userUpdateImages(images, true)
                },
              }
            })
          }}
        >
          {translate("finishShort")}
        </label>

        <label 
          className='border-button' 
          onClick={() => store.dispatch({ type: 'SET_STATUS', payload: { mode: 'user' } })}
        >
          {translate('back')}
        </label>
      </>}

    </div>
  )
}

export default Actions



