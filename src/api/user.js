import api from './index'
import store from '../store'
import translate from '../utils/translate'

import { toArrayOrderBySequence, randomId, convertDataURIToBlob, getTitle } from '../utils/MyUtils'
import { getTitleImage } from './misc'

export const userGetImages = (orderId, productId) => {
  store.dispatch({ type: 'SET_POPUP', mode: 'loading', payload: { message: translate('loading') } })

  api.get('album/customer/customerCurrentEditing/' + orderId)
  .then(async (response) => {

    // add images
    const images = toArrayOrderBySequence(response.data.data.photo_details[productId])

    let count = 0
    for (const image of images) {

      const { id, sequence, details } = image

      const img = new Image()
      img.onload = async function () {

        const heads = {}
        const titles = {}
  
        for (const head of details.heads) {
          let x = parseFloat(head.position[0])
          let y = parseFloat(head.position[1])
          heads[randomId()] = {
            headId: head.photo ?? null,
            height: parseFloat(head.size[0]),
            width: parseFloat(head.size[1]),
            x: Math.max(0, Math.min(x, this.width)),
            y: Math.max(0, Math.min(y, this.height)),
            rot: parseFloat(head.rotate),
            scale: 1,
            flip: head.flip
          }
        }

        if (details.title) {
          let id, base64
          if (details.title.title) {
            id = details.title.title
            base64 = await api.get('album/getPhotoBase64/customer/' + details.title.title)
            base64 = base64.data.data
          }
          else {
            const titleImage = await getTitleImage(image.id, getTitle(image.admin_title, 'test'))
            id = titleImage.id
            base64 = titleImage.base64
          }
          base64 = base64.includes("data:image") ? base64 : 'data:image/jpg;base64,' + base64

          titles[randomId()] = {
            id,
            url: base64,
            adminTitle: image.admin_title,
            height: parseFloat(details.title.size[0]),
            width: parseFloat(details.title.size[1]),
            x: parseFloat(details.title.position[0]),
            y: parseFloat(details.title.position[1]),
            rot: parseFloat(details.title.rotate),
            scale: 1,
          }
        }

        const data = {
          heads,
          titles,
          url: this.src,
          height: this.height,
          width: this.width,
          order: sequence,
        }

        store.dispatch({ type: 'ADD_IMAGE', id, data })

        // all images added
        count ++
        if (count == images.length) {
          store.dispatch({ type: 'HIDE_POPUP' })
          if (window.isFirst == "1" || window.isFirst == 1) {
            store.dispatch({ type: 'SET_POPUP', mode: 'enterBabyName' })
          }
        }
      }

      const base64 = await api.get('album/getPhotoBase64/base/' + id)
      img.src = base64.data.data ?? null
    }

    // add heads
    const heads = response.data.data.cus_photos[productId]
    for (const id of heads) {

      const img = new Image()
      img.onload = async function () {
        store.dispatch({
          type: 'ADD_HEAD',
          id: id,
          data: {  
            url: convertDataURIToBlob(this.src),
            height: this.height,
            width: this.width,
          }
        })
      }

      let base64 = await api.get('album/getPhotoBase64/customer/' + id)
      base64 = base64.data.data
      img.src = base64
    }

  }, (error) => {
    if (error && error.response) 
      console.log(error.response)
    store.dispatch({ type: 'HIDE_POPUP' })
  })
}

export const userUpdateImages = (images, isConfirm, isAutoSave) => {
  if (!isAutoSave) {
    store.dispatch({ type: 'SET_POPUP', mode: 'loading', payload: { message: translate('loading') } })
  }

  let fakeHeadId;
  if (isConfirm) {
    fakeHeadId = Object.keys(store.getState().heads.data)[0];
  }

  const data = {}
  for (const id in images) {
    const image = images[id]
    
    const heads = Object.values(image.heads).map(head => { 
      return {
        position: [
          head.x,
          head.y
        ],
        size: [
          head.height * head.scale,
          head.width * head.scale,
        ],
        rotate: head.rot,
        flip: head.flip,
        photo: head.headId ?? (isConfirm ? fakeHeadId : null)
      }
    })

    data[id] = {
      details: {
        heads,
        ... Object.values(image.titles).length > 0 && { title: Object.values(image.titles)[0].id }
      }
    }
  }
  
  const body = {
    "product": store.getState().status.productId,
    "customer": store.getState().status.customerId,
    "order": store.getState().status.orderId,
    "confirm": isConfirm ? 1 : 0,
    "photo_details": data,
  }

  api.post('album/customerUpdatePhoto', body)
  .then((response) => {
    console.log(response.data)
    if (!isAutoSave) {
      if (response.status == 200) {
        store.dispatch({ type: 'SET_POPUP', mode: 'message', payload: { confirm: isConfirm ? window.closeApp : null, message: isConfirm ? translate('finishSuccessMsg') : translate('saveSuccessMsg') } })
      }
      else store.dispatch({ type: 'SET_POPUP', mode: 'message', payload: { message: response.data.message } })
    }
  }, (error) => {
    if (error && error.response) 
      console.log(error.response)
    if (!isAutoSave)
      store.dispatch({ 
        type: 'SET_POPUP', 
        mode: 'message',
        payload: {
          message: error.response.data.message,
        }
      })
  })
}

export const userGetHead = async (id) => {
  let photoBase64 = await api.get('album/getPhotoBase64/customer/' + id)
  photoBase64 = photoBase64.data.data
  if (!photoBase64.includes("data:image")) 
    photoBase64 = 'data:image/jpg;base64,' + photoBase64

  const image = new Image()
  image.onload = function () {
    if (!store.getState().icons.data.hasOwnProperty(id)) {
      const data = {
        url: this.src,
        height: this.height,
        width: this.width,
      }
      store.dispatch({ type:'ADD_ICON', id, data });
    }
  }

  image.src = photoBase64
}

export const userUploadHead = (base64, isUseOriginal) => {
  const isDemo = store.getState().status.mode == 'demo'

  api.post('customer/saveCustomerPhoto', {
    "customer": isDemo ? null : store.getState().status.customerId,
    "order_item": store.getState().status.productId,
    "img_base64": base64,
    "isTest": isDemo ? 1 : 0,
    "useOriginal": isUseOriginal,
  })
  .then((response) => {
    if (response.data.status == 200) {
      console.log(response.data)
      
      const img = new Image()
      img.onload = async function () {
        store.dispatch({
          type: 'ADD_HEAD',
          id: isDemo ? Math.random().toString(36).substr(2, 9) : response.data.data.img_uuid,
          data: {  
            url: convertDataURIToBlob(this.src),
            height: this.height,
            width: this.width,
          }
        })
        store.dispatch({ type: 'HIDE_POPUP' })
      }

      let base64 = response.data.data.img_base64
      base64 = base64.includes("data:image") ? base64 : 'data:image/jpg;base64,' + base64
      img.src = base64
    }
  }, (error) => {
    store.dispatch({ 
      type:'SET_POPUP', 
      mode: 'message', 
      payload: {
        message: error.response.data.message, 
        canCancel: true
      }
    })
  })
}


const saveToLocalText = ( data ) => {
  const a = document.createElement('a');
  a.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent( JSON.stringify(data, null, 2) ));
  a.setAttribute('download', 'data.json');
  a.click()
}