import React from 'react'
import store from '../../store'
import translate from '../../utils/translate'
import Icon from '@mdi/react'
import { mdiRotateLeft, mdiFlipHorizontal } from '@mdi/js'

const Tutorial = () => {

  return (
    <div className='popup-box tutorial-container'>

      <div className='scroll-container'>

        <iframe 
          src={window.lang == "zh-TW" ? "https://www.youtube.com/embed/7l8qnjQfl6M" : "https://www.youtube.com/embed/nzZRMmHBpmA"}
          title="Tutorial Video" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen
        />

        <div className="para">{translate('tutorTitle')}</div>

        <div className="para">
          <span>1:</span>
          <div>
            {translate('tutor1.1')}
            <br/>
            {translate('tutor1.2')}
            <br/>
            {translate('tutor1.3')}
          </div>
        </div>

        <div className="para">
          <span>2:</span>
          <div>
            {translate('tutor2.1')}
            <br/>
            {translate('tutor2.2')}
            <br/>
            {translate('tutor2.3')}
            <div className='row'>
              <div className='icon-wrapper'>
                <Icon path={mdiRotateLeft} size={0.9} color="white"/>
              </div>
              &nbsp;&nbsp;&nbsp;{translate('tutor2.4')}
            </div>
            <div className='row'>
              <div className='icon-wrapper'>
                <Icon path={mdiFlipHorizontal} size={0.9} color="white"/>
              </div>
              &nbsp;&nbsp;&nbsp;{translate('tutor2.5')}
            </div>
          </div>
        </div>

        <div className="para">
          <span>3:</span>
          <div>{translate('tutor3.1')}</div>
        </div>

        <div className="para">
          <span>4:</span>
          <div>
            {translate('tutor4.1')}
            <br/>
            {translate('tutor4.2')}
          </div>
        </div>
      </div>

      <div 
        className='border-button' 
        onClick={() => store.dispatch({ type:'HIDE_POPUP' })}
      >
        {translate('ok')}
      </div>

    </div>
  )
}

export default Tutorial





