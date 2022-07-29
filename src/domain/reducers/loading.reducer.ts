import { LoadingReducerType } from "model/reducers/LoadingReducerType";
import { AnyAction } from "redux";
import LoadingType from "domain/types/loading.type";

const intitalState: LoadingReducerType = {
  isVisible: false,
};

const loadingReducer = (state = intitalState, action: AnyAction): LoadingReducerType => {
  switch (action.type) {
    case LoadingType.LOADING_SHOW:
      state.isVisible = true;
      return {
        ...state,
      };
    case LoadingType.LOADING_HIDE:
      state.isVisible = false;
      return {
        ...state,
      };
    default:
      return state;
  }
};

export default loadingReducer;
