import api from './index'
import store from '../store'
import translate from '../utils/translate'

import { toArrayOrderBySequence, randomId, getTitle } from '../utils/MyUtils'
import { getTitleImage } from './misc'

export const adminGetImages = (productId) => {
  store.dispatch({ type: 'SET_POPUP', mode: 'loading', payload: { message: translate('loading') } })

  api.get('album/admin/currentEditing/' + productId)
  .then(async (response) => {

    const images = toArrayOrderBySequence(response.data.data)
    if (images.length == 0)
      store.dispatch({ type: 'HIDE_POPUP' })

    let count = 0
    for (const image of images) {

      const { id, sequence, details } = image

      const img = new Image()
      img.onload = async function () {

        const heads = {}
        const titles = {}
  
        if (details?.heads)
          for (const head of details.heads) {
            let x = parseFloat(head.position[0])
            let y = parseFloat(head.position[1])
            heads[randomId()] = {
              height: parseFloat(head.size[0]),
              width: parseFloat(head.size[1]),
              x: Math.max(0, Math.min(x, this.width)),
              y: Math.max(0, Math.min(y, this.height)),
              rot: parseFloat(head.rotate),
              scale: 1,
              flip: 0
            }
          }

        if (details?.title) {
          let { base64 } = await getTitleImage(image.id, getTitle(details.title.title, `Baby`))
          base64 = base64.includes("data:image") ? base64 : 'data:image/jpg;base64,' + base64

          titles[randomId()] = {
            url: base64,
            title: details.title.title,
            color:  details.title.color,
            align: details.title.align,
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
        if (count == images.length) 
          store.dispatch({ type: 'HIDE_POPUP' })
      }

      const base64 = await api.get('album/getPhotoBase64/base/' + id)
      img.src = base64.data.data?? null
    }
  }, (error) => {
    if (error && error.response) 
      console.log(error.response.data)
    store.dispatch({ type: 'HIDE_POPUP' })
  })
}

export const adminUploadImages = (images) => {
  const body = new FormData()
  body.append('product', store.getState().status.productId)

  images.forEach((image, index) => {
    const { id, order, file } = image

    body.append(`photos[${index}][type]`, 'new')
    body.append(`photos[${index}][id]`, id)
    body.append(`photos[${index}][sequence]`, order)
    body.append(`photos[${index}][image]`, file)
    body.append(`photos[${index}][photo_details]`, '')
  })

  api.post('album/adminAddPhotoForm', body, { headers: { 'Content-Type': 'multipart/form-data' } })
  .then((response) => {
    for (const image of images) {
      const { id, base64, width, height, order } = image
      store.dispatch({ 
        type: 'ADD_IMAGE',
        id: response.data.data[id],
        data: {
          url: base64,
          height,
          width,
          order,
          heads: [],
          titles: []
        }
      })
    }
    store.dispatch({ type: 'HIDE_POPUP' })
  }, (error) => {
    console.log(error.response.data)
    store.dispatch({ type: 'HIDE_POPUP' })
  })
}

export const adminDeleteImage = (id) => {
  store.dispatch({ type: 'SET_POPUP', mode: 'loading', payload: { message: translate('loading') } })

  const body = new FormData()
  body.append('product', store.getState().status.productId)
  body.append(`photos[0][type]`, 'delete')
  body.append(`photos[0][id]`, id)
  
  api.post('album/adminAddPhotoForm', body, { headers: { 'Content-Type': 'multipart/form-data' } })
  .then((response) => {
    store.dispatch({ type: 'DELETE_IMAGE', id: id })
    store.dispatch({ type: 'HIDE_POPUP' })
  }, (error) => {
    console.log(error.response.data)
    store.dispatch({ type: 'HIDE_POPUP' })
  })
}

export const adminUpdateImages = (images, success, isAutoSave) => {
  if (!success && !isAutoSave)
    store.dispatch({ type: 'SET_POPUP', mode: 'loading', payload: { message: translate('loading') } })

  const data = []
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
      }
    })

    let title = null
    if (Object.values(image.titles).length > 0) {
      title = Object.values(image.titles)[0]
      title = {
        position: [
          title.x,
          title.y
        ],
        size: [
          title.height * title.scale,
          title.width * title.scale,
        ],
        rotate: title.rot,
        title: title.title,
        align: title.align,
        color: title.color,
        ...title.fonts && {
          fonts: title.fonts
        }
      }
    }

    data.push({
      type: "update",
      id,
      sequence: image.order,
      photo_details: {
        heads,
        ...title && { title }
      }
    })
  }
  
  const body = {
    "product": window.product_id,
    "photos": data,
  }

  api.post('album/adminAddPhotoForm', body)
  .then((response) => {
    console.log(response.data)
    if (success)
      success()
    else if (!isAutoSave)
      store.dispatch({ type: 'SET_POPUP', mode: 'message', payload: { message: response.data.message } })
  }, (error) => {
    console.log(error.response.data)
  })

}

export const adminUpdateTitle = (id, imageId, image) => {

  if (!image)
    image = store.getState().images.data[imageId]

  const updateTitleImage = async () => {
    const { base64 } = await getTitleImage(imageId, getTitle(image.titles[id].title, 'Baby'))
    store.dispatch({ type: 'UPDATE_IMAGE_TITLE', id, imageId, data: { url: base64 } })
  }

  adminUpdateImages({ [imageId]: image }, updateTitleImage)
}

export const getFonts = () => {
  api.get('fonts')
  .then((response) => {
    if (response.data.status == 200) {
      store.dispatch({ type:"SET_FONTS", fonts: response.data.data })
    }
  }, (error) => {
  })
}
