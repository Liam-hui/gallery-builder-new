import { combineReducers } from 'redux'
import { reducer as status } from './status'
import { reducer as popup } from './popup'
import { reducer as images } from './images'
import { reducer as heads } from './heads'
import { reducer as fonts } from './fonts'

const reducers = combineReducers({
  default: () => [],
  status,
  popup,
  images,
  heads,
  fonts
})

export default reducers

