import { createReducer, createActions } from 'reduxsauce'

/* Types & Action Creators */

const { Types, Creators } = createActions({
  setStatus: ['payload'],
})

export const StatusTypes = Types
export default Creators

/* Initial State */

export const INITIAL_STATE = {}

/* Reducers */

const setStatus = (state, { payload } ) => {
  return {
    ...state,
    ...payload,
  }
}

/* Reducers to types */

export const reducer = createReducer(INITIAL_STATE, {
  [Types.SET_STATUS]: setStatus,
})
