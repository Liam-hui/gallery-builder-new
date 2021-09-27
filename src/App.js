import './styles.css'
import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from "react-redux";
import store from './store';
import Editor from './Components/Editor'
import Actions from './Components/Actions'
import Viewer from './Components/Viewer'
import ImagesList from './Components/ImagesList'
import HeadsList from './Components/HeadsList'
import Popup from './Components/Popup'

import Icon from '@mdi/react'
import { mdiCloseThick, mdiHelpCircleOutline } from '@mdi/js'

import translate from './utils/translate';
import { adminGetImages, getFonts } from './api/admin'
import { userGetImages } from './api/user'
import { demoGetImages } from './api/demo'

const App = () => {

  const status = useSelector(state => state.status)
  const { mode, display, productId, orderId, customerId } = status

  useEffect(() => {
    store.dispatch({ 
      type: 'SET_STATUS', 
      payload: { 
        mode: window.mode,
        productId: window.product_id,
        orderId: window.order_id,
        customerId: window.customer_id
      } 
    })  
  }, [])

  const [hasGotData, setHasGotData] = useState(false)
  useEffect(() => {
    if (mode) {
      initScreen()
      if (!hasGotData) {
        switch(mode) {
          case 'user':
          case 'view':
            userGetImages(orderId, productId)
            break
          case 'demo':
            demoGetImages(productId)
            break
          case 'admin':
            adminGetImages(productId)
            getFonts()
            break
        }
        setHasGotData(true)
      }
    } 
  }, [mode])

 
  const initScreen = () => {  
    const display = Math.min(window.innerWidth, window.innerHeight) > 500 ? 'large' : window.innerHeight > window.innerWidth ? 'small-port' : 'small-land'
    store.dispatch({ type: 'SET_STATUS', payload: { display } })
  }

  // resize event
  const resizeLoopRef = useRef()
  window.addEventListener("resize", () => {
    clearTimeout(resizeLoopRef.current)
    resizeLoopRef.current = setTimeout(doneResizing, 500)
  })
  const doneResizing = () => {
    initScreen()
  }
  
  return (
    <>
      <div className={`app-container${mode == "admin" ? " is-admin" : ''}${(mode == "view" || mode == "saveView") ? " is-view" : ''} is-${display}${display && display != 'large' ? ' is-small' : ''}`}>
     
        {mode == 'admin' && <>
          <div className="bottom-row">
            {display == 'large' && <Actions/>}
            <ImagesList/>
          </div> 
          <div className="main-area">
            <Editor/>
            {display != 'large' && <Actions/>}
          </div>
        </>}

        {(mode == 'user' || mode == 'demo') && <>
          {(display == 'large' || display == 'small-land')  &&
            <div className="left-column" >
              {display == 'large' && <Actions/>}
              <HeadsList/>
            </div>
          }
          <div className="main-area" >
            {display != 'small-land' &&
              <div className="bottom-row" >
                {display == 'large' ? <ImagesList/> : <HeadsList/>}
              </div>
            }
            <Editor/>
            {display != 'large' && <Actions/>}
          </div>
        </>}

        {(mode == 'view' || mode == 'saveView') && <>
          {display == 'large' ?
            <>
              <div className="bottom-row">
                <ImagesList/>
              </div> 
              <div className="main-area">
                <Viewer/>
              </div>
            </>
          : 
            <>
              <Viewer/>
              {mode == 'saveView' && <Actions/>}
            </>
          }
        </>}

        <Popup/>

        {(mode=='user' || mode =='demo') &&
          <div 
            className="tutorial-button" 
            onClick={() => store.dispatch({ type:'SET_POPUP',mode:'tutorial' })}
          >
            <Icon path={mdiHelpCircleOutline} size={1} color="black"/>
          </div>
        }

        <div className="close-app-button" 
          onClick={() => {
              if (status.mode == 'demo' || status.mode=='view') 
                window.closeApp()
              else 
                store.dispatch({ 
                  type: 'SET_POPUP', 
                  mode: 'message',
                  payload: {
                    message: translate('leaveWarning'),
                    canCancel: true,
                    confirm: window.closeApp,
                    confirmText:translate('leave')
                  }
                })
            }}
        >
          <Icon path={mdiCloseThick} size={1} color="black"/>
        </div>

      </div>
    </>
  )
}

export default App