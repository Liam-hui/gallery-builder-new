import React from 'react'
import { useSelector } from "react-redux"

import Loading from './Loading'
import UploadHead from './UploadHead'
import Message from './Message'
import Tutorial from './Tutorial'
import UploadTutorial from './UploadTutorial'
import EnterBabyName from './EnterBabyName'
import TitleEditor from '../TitleEditor'
import ChooseHead from './ChooseHead'

export default function Popup() {

  const data = useSelector(state => state.popup)
  const { mode } = data

  if (mode != null ) return (
    <div 
      className='popup'
      style={data.isSelectingHead && { backgroundColor: 'rgba(0, 0, 0, 0.3)' }}
    >

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

      {mode == 'chooseHead' &&
        <ChooseHead/>
      }

    </div>
  )
  else return null
}





