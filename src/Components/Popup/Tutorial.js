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
        src={window.lang = "zh-TW" ? "https://www.youtube.com/embed/1hX6B5VB_4M" : "https://www.youtube.com/embed/f3EfWhLMLbM"}
        title="Tutorial Video" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen
      />

        <p>{translate('tutorTitle')}</p>

        <p>
          <span>1:</span>
          <p>
            {translate('tutor1.1')}
            <br/>
            {translate('tutor1.2')}
            <br/>
            {translate('tutor1.3')}
          </p>
        </p>

        <p>
          <span>2:</span>
          <p>
            {translate('tutor2.1')}
            <br/>
            {translate('tutor2.2')}
            <br/>
            {translate('tutor2.3')}
          </p>
        </p>

        <p style={{ alignItems: 'center', marginLeft: 20 }}>
          <div className='icon-wrapper'>
            <Icon path={mdiRotateLeft} size={0.9} color="white"/>
          </div>
          &nbsp;&nbsp;&nbsp;{translate('tutor2.4')}
        </p>

        <p style={{ alignItems: 'center', marginLeft: 20 }}>
          <div className='icon-wrapper'>
            <Icon path={mdiFlipHorizontal} size={0.9} color="white"/>
          </div>
          &nbsp;&nbsp;&nbsp;{translate('tutor2.5')}
        </p>

        <p>
          <span>3:</span>
          <p>{translate('tutor3.1')}</p>
        </p>

        <p>
          <span>4:</span>
          <p>
            {translate('tutor4.1')}
            <br/>
            {translate('tutor4.2')}
          </p>
        </p>
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





