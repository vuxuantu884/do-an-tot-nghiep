import { AnyAction } from "redux";
import { InventoryType } from "../types/inventory.type";

const initialState = {
  isContinueCreateImport: true,
};

const inventoryReducer = (state = initialState, action: AnyAction) => {
  switch (action.type) {
    case InventoryType.CHANGE_IS_CONTINUE_CREATE_IMPORT:
      state.isContinueCreateImport = action.payload.isContinueCreateImport;
      return {
        ...state,
      };
    default:
      return state;
  }
};

export default inventoryReducer;
