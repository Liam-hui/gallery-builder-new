import React, { useState } from 'react'
import store from '../../store'
import { useSelector } from "react-redux"
import Icon from '@mdi/react'
import { mdiCloseThick } from '@mdi/js'
import translate from '../../utils/translate'

import { getTitle } from '../../utils/MyUtils'
import { getTitleImage } from '..//../api/misc'

const ChooseHead = () => {

  const { id, imageId, headId } = useSelector(state => state.popup)

  const heads = useSelector(state => state.heads.data)
  const [selected, setSelected] = useState(headId)

  const selectHead = () => {
    store.dispatch({ type: 'UPDATE_IMAGE_HEAD', id, imageId, data: { headId: selected, width: heads[selected].width, height: heads[selected].height } })
    store.dispatch({ type: 'HIDE_POPUP' })
  }

  return (
    <div className='popup-box' style={{ width: 400, height: "unset" }}>

      <p style={{ marginBottom: 20 }}>{translate('chooseFace')}</p>

      <div className="choose-head-list">
        {Object.entries(heads).map(([id, head]) =>
          <div 
            className={selected == id ? 'is-selected' : ''}
            onClick={() => setSelected(id)}
          >
            <img key={id} src={head.url} />
            <div>
              <div>{selected == id ? translate('selected') : translate('select')}</div>
            </div>
          </div>
        )}
      </div>

      <div 
        className='border-button' 
        onClick={async () => {
          selectHead()
        }}
      >
        {translate('ok')}
      </div>

      <div style={{ position: 'absolute', top: 0, right: 0, padding: 10, cursor: 'pointer' }} onClick={() => store.dispatch({ type:'HIDE_POPUP' })}>
        <Icon path={mdiCloseThick} style={{ transform:`translate(0.5px,0.5px)` }} size={0.9} color="black"/>   
      </div>

    </div>
  )
}

export default ChooseHead



