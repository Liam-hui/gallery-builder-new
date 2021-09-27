import { createReducer, createActions } from 'reduxsauce'

/* Types & Action Creators */

const { Types, Creators } = createActions({
  setPopup: ['mode', 'message'],
  hidePopup: [],
})

export const PopupTypes = Types
export default Creators

/* Initial State */

export const INITIAL_STATE = {
  mode: null,
}

/* Reducers */

const setPopup = (state, { mode, payload } ) => {
  return {
    mode,
    ...payload
  }
}

const hidePopup = (state) => {
  return {
    mode: null,
  }
}

/* Reducers to types */

export const reducer = createReducer(INITIAL_STATE, {
  [Types.SET_POPUP]: setPopup,
  [Types.HIDE_POPUP]: hidePopup,
})
