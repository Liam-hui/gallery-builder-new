import { call, put } from 'redux-saga/effects';
import api from '@/services/api';

import WaterSuspensionActions from '@/store/ducks/waterSuspension';

export function* getWaterSuspensionRequest() {
  try {
    const endpoint = '/water-suspension';
    const { data } = yield call(api.get, endpoint);
    yield put(WaterSuspensionActions.getWaterSuspensionSuccess(data.payload.watersuspensions));
  } catch (error) {
    yield put(WaterSuspensionActions.getWaterSuspensionFailure());
  }
}
