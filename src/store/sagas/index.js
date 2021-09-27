import {
  all,
  put,
  takeLatest,
} from 'redux-saga/effects';

import store from '../';

export default function* rootSaga() {
  
  yield all([
    takeLatest('CLOSE_OVERLAY', closeOverlayAction),
    takeLatest('DELETE_IMAGE', deleteImageAction),
  ]);
}


function* closeOverlayAction(action) {
  store.dispatch({type:'HIDE_OVERLAY'});
  setTimeout(()=>store.dispatch({type:'OFF_OVERLAY'}),500)

  yield put({
    type: 'CLOSE_OVERLAY_FINISH',
  });
}

function* deleteImageAction(action) {
  store.dispatch({type:'LOCK_SLIDER'});
  setTimeout(()=>store.dispatch({type:'UNLOCK_SLIDER'}),500)
}


