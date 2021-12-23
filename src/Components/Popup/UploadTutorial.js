import React from 'react'
import store from '../../store'
import translate from '../../utils/translate'
import Icon from '@mdi/react'
import { mdiCloseThick } from '@mdi/js'
import boyImage from '../../boy.jpg'

const UploadTutorial = () => {

  return (
    <div className='popup-box upload-tutorial-container'>

      <div className="scroll-container" >
        <img src={boyImage} style={{ width:140, height:'auto' }}/>

        <div>
          <p>{translate('imgTutor1')}</p>
          <p>{translate('imgTutor2')}<br/>{translate('imgTutor3')}<br/>{translate('imgTutor4')}</p>
          <p>{translate('imgTutor5')}</p>
        </div>
      </div>

      <label className='border-button' style={{ padding: 10, marginTop: 10, marginBottom: 15 }} htmlFor="upload-image">{translate('uploadPhoto')}</label>

      <div style={{ position: 'absolute', top: 0, left: 0, padding: 10, cursor: 'pointer' }} onClick={() => store.dispatch({ type:'HIDE_POPUP' })}>
        <Icon path={mdiCloseThick} style={{ transform:`translate(0.5px, 0.5px)` }} size={0.9} color="black"/>   
      </div>

    </div>
  )
}

export default UploadTutorial





