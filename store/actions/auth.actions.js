import { SET_USER } from '../constants/auth.constants';
export const setUser = payload => {
  return {
    type: SET_USER,
    payload,
  };
};
