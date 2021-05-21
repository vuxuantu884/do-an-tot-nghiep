import { AnyAction } from 'redux';;

const intitalState = {
  isLogin: true,
  isLoad: false,
  account: undefined,
};

const userReducer = (state = intitalState, action: AnyAction) => {
  const {type, payload} = action;
  switch (type) {
    default:
      return state;
  }
}

export default userReducer;