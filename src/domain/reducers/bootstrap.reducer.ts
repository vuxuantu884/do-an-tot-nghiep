import { AnyAction } from "redux";
import { BootstrapReducerType } from "model/reducers/BootstrapReducerType";
import { BootstrapType } from "domain/types/content.type";

const intitalState: BootstrapReducerType = {
  isLoad: false,
  data: null,
};

const bootstrapReducer = (state = intitalState, action: AnyAction): BootstrapReducerType => {
  const { payload, type } = action;
  switch (type) {
    case BootstrapType.GET_BOOTSTRAP_SUCESSS:
      return { ...state, data: payload.data, isLoad: true };
    default:
      return state;
  }
};

export default bootstrapReducer;
