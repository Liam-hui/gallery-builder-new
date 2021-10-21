import api from './index'
import store from '../store'

export const getTitleImage = (id, title) => {

  const mode = store.getState().status.mode

  return new Promise((resolve, reject) => {
    api.post('album/textToImg', {
      "customer": (mode == 'demo' || mode == 'admin') ? null : store.getState().status.customerId,
      "order_item": store.getState().status.productId,
      "photo_uuid": id,
      "title": title,
      "mode": mode == 'demo' ? 0 : (mode == 'admin' ? 1 : 2),
    })
    .then((response) => {
      if (response.data.status == 200) {
        let base64 = response.data.data.img_base64;
        if (!base64.includes("data:image")) 
          base64 = 'data:image/jpg;base64,' + base64
  
        resolve({ id: response.data.data.img_uuid, base64: base64 })
      }
    }, (error) => {
      if (error && error.response) 
        console.log(error.response.data)
      reject()
    })
  })
}
