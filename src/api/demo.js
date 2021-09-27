import api from './index'
import store from '../store'
import translate from '../utils/translate'

import { toArrayOrderBySequence, randomId, convertDataURIToBlob, getTitle } from '../utils/MyUtils'
import { getTitleImage } from './misc'

export const demoGetImages = (productId) => {
  store.dispatch({ type: 'SET_POPUP', mode: 'loading', payload: { message: translate('loading') } })

  api.get('album/getDemo/' + productId)
  .then(async (response) => {

    const base64 =  response.data.data.img_base64
    const details = JSON.parse(response.data.data.photo_details)
    const imageId = response.data.data.uuid

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
          flip: 0
        }
      }

      if (details.title) {
        const { base64 } = await getTitleImage(imageId, getTitle(details.title.title, 'test'))

        titles[randomId()] = {
          url: base64,
          adminTitle: details.title.title,
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
        order: 0,
      }

      store.dispatch({ type: 'ADD_IMAGE', id: imageId, data })
      store.dispatch({ type: 'HIDE_POPUP' })
    }

    img.src = base64
    

  }, (error) => {
    if (error && error.response) 
      console.log(error.response.data)
    store.dispatch({ type: 'HIDE_POPUP' })
  })
}


const saveToLocalText = ( data ) => {
  const a = document.createElement('a');
  a.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent( JSON.stringify(data, null, 2) ));
  a.setAttribute('download', 'data.json');
  a.click()
}