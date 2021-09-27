import { createReducer, createActions } from 'reduxsauce'

/* Types & Action Creators */

const { Types, Creators } = createActions({
  addHead: ['id', 'data'],
  selectHeadStart: ['selecting'],
  selectHeadEnd: []
})

export const HeadsTypes = Types
export default Creators

/* Initial State */

export const INITIAL_STATE = {
  data: {},
  isSelecting: false
}

/* Reducers */

const addHead = (state, { id, data } ) => {
  return {
    ...state,
    data: {
      ...state.data,
      [id]: data
    },
  }
}

const selectHeadStart = (state, { selecting }) => {
  return {
    ...state,
    isSelecting: true,
    selecting
  }
}

const selectHeadEnd = (state) => {
  return {
    data: { ...state }.data,
    isSelecting: false,
  }
}

/* Reducers to types */

export const reducer = createReducer(INITIAL_STATE, {
  [Types.ADD_HEAD]: addHead,
  [Types.SELECT_HEAD_START]: selectHeadStart,
  [Types.SELECT_HEAD_END]: selectHeadEnd,
})
