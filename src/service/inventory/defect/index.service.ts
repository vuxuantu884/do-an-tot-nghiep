import {
  DeleteInventoryDefects,
  InventoryDefectQuery,
  InventoryDefectResponse,
} from "./../../../model/inventory-defects/index";
import BaseResponse from "../../../base/base.response";
import BaseAxios from "../../../base/base.axios";
import { ApiConfig } from "../../../config/api.config";
import { DataRequestDefectItems } from "model/inventory-defects";
import { generateQuery } from "utils/AppUtils";

const createInventoryDefect = (data: DataRequestDefectItems): Promise<BaseResponse<any>> => {
  return BaseAxios.post(`${ApiConfig.INVENTORY_DEFECT}/defects`, data);
};

const editInventoryDefectNote = (id: number, note: string) => {
  return BaseAxios.put(`${ApiConfig.INVENTORY_DEFECT}/defects/${id}/update-note`, {
    note,
  });
};

// const editInventoryDefect = (data: DataRequestDefectItems): Promise<BaseResponse<InventoryDefectResponse>> => {
//     return BaseAxios.put(`${ApiConfig.INVENTORY_ADJUSTMENT}/defects/${data.items[0].id}`, data)
// }

const deleteInventoryDefect = (id: number): Promise<BaseResponse<any>> => {
  return BaseAxios.delete(`${ApiConfig.INVENTORY_DEFECT}/defects/${id}`);
};

const deleteInventoryDefects = (params: DeleteInventoryDefects): Promise<BaseResponse<any>> => {
  return BaseAxios.delete(`${ApiConfig.INVENTORY_DEFECT}/defects`, { params });
};

const getListInventoryDefect = (
  params: InventoryDefectQuery,
): Promise<BaseResponse<Array<InventoryDefectResponse>>> => {
  const queryString = generateQuery(params);
  return BaseAxios.get(`${ApiConfig.INVENTORY_DEFECT}/defects?${queryString}`);
};

const getListInventoryDefectHistory = (
  params: string,
): Promise<BaseResponse<Array<InventoryDefectResponse>>> => {
  return BaseAxios.get(`${ApiConfig.INVENTORY_DEFECT}/defects/history?${params}`);
};

export {
  createInventoryDefect,
  // editInventoryDefect,
  deleteInventoryDefect,
  getListInventoryDefect,
  deleteInventoryDefects,
  editInventoryDefectNote,
  getListInventoryDefectHistory,
};
