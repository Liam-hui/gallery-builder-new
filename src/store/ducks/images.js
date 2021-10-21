import { createReducer, createActions } from 'reduxsauce'
import { adminUpdateImages } from '../../api/admin'

import { randomId } from '../../utils/MyUtils'

/* Types & Action Creators */

const { Types, Creators } = createActions({
  addImage: ['id', 'data'],
  selectImage: ['id'],
  deleteImage: ['id'],
  changeImagesOrder: ['id', 'dif'],
  addImageHead: ['id'],
  addImageTitle: ['id'],
  updateImageHead: ['data', 'id', 'imageId'],
  updateImageTitle: ['data', 'id', 'imageId'],
  deleteImageHead: ['id', 'imageId'],
  deleteImageTitle: ['id', 'imageId'],
  resetImageHead: ['id', 'imageId'],
  imageUndo: ['id'],
  imageRedo: ['id'],
})

export const ImagesTypes = Types
export default Creators

/* Initial State */

export const INITIAL_STATE = {
  data: {},
  count: 0,
  selected: null,
  forceUpdate: 0
}

/* Reducers */

const addImage = (state, { id, data } ) => {

  return {
    ...state,
    data: {
      ...state.data,
      [id]: {
        ...data,
        history: {
          undo: [],
          redo: [],
        }
      }
    },
    ...data.order == 0 && state.selected == null && { selected: id } // select image if is first
  }
}

const selectImage = (state, { id } ) => {
  console.log(id)
  return {
    ...state,
    selected: id 
  }
}

const deleteImage = (state, { id } ) => {

  const newData = { ...state.data }
  const deletedOrder = state.data[id].order // order of the image that is getting deleted
  let selected = state.selected == id ? null : state.selected

  for (const imageId in newData) {
    if (newData[imageId].order > deletedOrder) 
      newData[imageId].order -= 1
    if (selected == null && id != imageId)
      selected = imageId
  }

  delete newData[id]

  adminUpdateImages(newData, null, true) // update after delete image, otherwise wrong sequence

  return {
    ...state,
    data: newData,
    selected: selected
  }
}

const changeImagesOrder = (state, { id, dif } ) => {

  const newData = { ...state.data }
  const selectedOrder = state.data[id].order // order of the image that is dragged

  for (const id in newData) {
    const order = newData[id].order

    if (dif > 0) {
      if (order > selectedOrder && order <= selectedOrder + dif) 
        newData[id].order -= 1
    }
    else {
      if (order < selectedOrder && order >= selectedOrder + dif) 
        newData[id].order += 1
    }
  }

  newData[id].order += dif

  return {
    ...state,
    data: newData
  }
}

const addImageHead = (state, { id } ) => {

  const newState = { ...state }
  const image = state.data[id]
  const size = Math.max(image.width, image.height) * 0.2

  newState.data[id].heads[randomId()] = {
    height: size,
    width: size,
    x: image.width * 0.5,
    y: image.height * 0.5,
    rot: 0,
    scale: 1
  }

  return { 
    ...newState,
    forceUpdate: state.forceUpdate + 1
  }
}

const addImageTitle = (state, { id } ) => {

  const newState = { ...state }
  const image = state.data[id]
  const size = Math.max(image.width, image.height) * 0.3
  const width = 2000
  const height = 400

  newState.data[id].titles[randomId()] = {
    title: "This is {**Customer_INPUT**}'s Album",
    color: '#000000',
    align: 'center',
    // fonts: {
    //   en: photo.details.title.fonts ? photo.details.title.fonts.en : "", 
    //   zh: photo.details.title.fonts ? photo.details.title.fonts["zh-hant"] : ""
    // },
    width,
    height,
    scale: size / width,
    x: image.width * 0.5,
    y: image.height * 0.5,
    rot: 0,
  }

  return { 
    ...newState,
    forceUpdate: state.forceUpdate + 1
  }
}

const updateImageHead = (state, { data, id, imageId } ) => {

  const newState = { ...state }

  if (data.headId) {
    const currentHead = newState.data[imageId].heads[id]
    data.scale = currentHead.scale * (currentHead.width / data.width + currentHead.height / data.height) * 0.5
  }

  newState.data[imageId].history.undo.unshift({
    type: 'heads',
    id,
    data: { ...newState.data[imageId].heads[id] }
  }) // add to undo

  newState.data[imageId].history.redo = [] // clear redo

  newState.data[imageId].heads[id] = { 
    ...newState.data[imageId].heads[id], 
    ...data,
  }

  return { 
    ...newState,
    forceUpdate: state.forceUpdate + 1
  }
}

const updateImageTitle = (state, { data, id, imageId } ) => {

  const newState = { ...state }

  if (!data.url) {
    newState.data[imageId].history.undo.unshift({
      type: 'titles',
      id,
      data: { ...newState.data[imageId].titles[id] }
    }) // add to undo

    newState.data[imageId].history.redo = [] // clear redo
  }

  newState.data[imageId].titles[id] = { 
    ...newState.data[imageId].titles[id],
    ...data,
  }

  return { 
    ...newState,
    forceUpdate: state.forceUpdate + 1
  }
}

const deleteImageHead = (state, { id, imageId } ) => {

  const newState = { ...state }
  delete newState.data[imageId].heads[id]

  newState.data[imageId].history.undo = [] // clear undo
  newState.data[imageId].history.redo = [] // clear redo

  return { 
    ...newState,
    forceUpdate: state.forceUpdate + 1
  }
}

const deleteImageTitle = (state, { id, imageId } ) => {

  const newState = { ...state }
  delete newState.data[imageId].titles[id]

  newState.data[imageId].history.undo = [] // clear undo
  newState.data[imageId].history.redo = [] // clear redo

  return { 
    ...newState,
    forceUpdate: state.forceUpdate + 1
  }
}

const resetImageHead = (state, { id, imageId } ) => {

  const newState = { ...state }
  const image = state.data[imageId]
  const size = Math.max(image.width, image.height) * 0.2
  const currentHead = { ...image.heads[id]}

  newState.data[imageId].heads[id] = {
    ...currentHead,
    height: size,
    width: size,
    scale: currentHead.scale * (currentHead.width / size + currentHead.height / size) * 0.5,
    headId: null
  }

  return { 
    ...newState,
    forceUpdate: state.forceUpdate + 1 
  }
}

const imageUndo = (state, { id }) => {

  const newState = { ...state }

  if (newState.data[id].history.undo.length > 0) {
    const step = state.data[id].history.undo[0]

    newState.data[id].history.redo.unshift({
      type: step.type,
      id: step.id,
      data: { ...newState.data[id][step.type][step.id] }
    }) // save current to redo

    newState.data[id][step.type][step.id] = { ...step.data } // undo
    newState.data[id].history.undo.shift()
  }

  return { 
    ...newState,
    forceUpdate: state.forceUpdate + 1 
  }
}

const imageRedo = (state, { id }) => {

  const newState = { ...state }

  if (newState.data[id].history.redo.length > 0) {
    const step = state.data[id].history.redo[0]

    newState.data[id].history.undo.unshift({
      type: step.type,
      id: step.id,
      data: { ...newState.data[id][step.type][step.id] }
    }) // save current to undo

    newState.data[id][step.type][step.id] = { ...step.data } // redo
    newState.data[id].history.redo.shift()
  }

  return { 
    ...newState,
    forceUpdate: state.forceUpdate + 1 
  }
}


/* Reducers to types */

export const reducer = createReducer(INITIAL_STATE, {
  [Types.ADD_IMAGE]: addImage,
  [Types.SELECT_IMAGE]: selectImage,
  [Types.DELETE_IMAGE]: deleteImage,
  [Types.CHANGE_IMAGES_ORDER]: changeImagesOrder,
  [Types.ADD_IMAGE_HEAD]: addImageHead,
  [Types.ADD_IMAGE_TITLE]: addImageTitle,
  [Types.UPDATE_IMAGE_HEAD]: updateImageHead,
  [Types.UPDATE_IMAGE_TITLE]: updateImageTitle,
  [Types.DELETE_IMAGE_HEAD]: deleteImageHead,
  [Types.DELETE_IMAGE_TITLE]: deleteImageTitle,
  [Types.RESET_IMAGE_HEAD]: resetImageHead,
  [Types.IMAGE_UNDO]: imageUndo,
  [Types.IMAGE_REDO]: imageRedo,
})
