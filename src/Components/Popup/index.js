import React from 'react'
import { useSelector } from "react-redux"

import Loading from './Loading'
import UploadHead from './UploadHead'
import Message from './Message'
import Tutorial from './Tutorial'
import UploadTutorial from './UploadTutorial'
import EnterBabyName from './EnterBabyName'
import TitleEditor from '../TitleEditor'

export default function Popup() {

  const data = useSelector(state => state.popup)
  const { mode } = data

  if (mode != null ) return (
    <div className='popup'>

      {mode == 'loading' &&
        <Loading/>
      }

      {mode == 'uploadHead' &&
        <UploadHead/>
      }

      {mode == 'message' &&
        <Message/>
      } 

      {mode == 'titleEditor' &&
        <TitleEditor {...data} />
      } 

      {mode == 'tutorial' &&
        <Tutorial/>
      } 

      {mode == 'uploadTutorial' &&
        <UploadTutorial/>
      } 

      {mode == 'enterBabyName' &&
        <EnterBabyName/>
      }

    </div>
  )
  else return null
}





