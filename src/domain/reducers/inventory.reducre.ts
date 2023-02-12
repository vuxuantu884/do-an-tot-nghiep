import { AnyAction } from "redux";
import { InventoryType } from "../types/inventory.type";

const initialState = {
  isContinueCreateImport: true,
  isFirstLoadReceive: true,
  isFirstLoadSender: true,
  countTransferIn: 0,
  countTransferOut: 0,
};

const inventoryReducer = (state = initialState, action: AnyAction) => {
  switch (action.type) {
    case InventoryType.CHANGE_IS_CONTINUE_CREATE_IMPORT:
      state.isContinueCreateImport = action.payload.isContinueCreateImport;
      return {
        ...state,
      };
    case InventoryType.IS_FIRST_LOAD_RECEIVE:
      state.isFirstLoadReceive = action.payload.isFirstLoadReceive;
      return {
        ...state,
      };
    case InventoryType.IS_FIRST_LOAD_SENDER:
      state.isFirstLoadSender = action.payload.isFirstLoadSender;
      return {
        ...state,
      };
    case InventoryType.COUNT_TRANSFER_IN:
      state.countTransferIn = action.payload.countTransferIn;
      return {
        ...state,
      };
    case InventoryType.COUNT_TRANSFER_OUT:
      state.countTransferOut = action.payload.countTransferOut;
      return {
        ...state,
      };
    default:
      return state;
  }
};

export default inventoryReducer;
