import { createReducer, createActions } from 'reduxsauce'

/* Types & Action Creators */

const { Types, Creators } = createActions({
  setFonts: ['fonts'],
})

export const FontsTypes = Types
export default Creators

/* Initial State */

export const INITIAL_STATE = {}

/* Reducers */

const setFonts = (state, { fonts } ) => {
  return fonts
}

/* Reducers to types */

export const reducer = createReducer(INITIAL_STATE, {
  [Types.SET_FONTS]: setFonts,
})
