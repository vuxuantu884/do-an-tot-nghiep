import { InventoryDefectResponse } from './../../../model/inventory-defects/index';
import BaseResponse from "../../../base/base.response";
import BaseAxios from "../../../base/base.axios";
import { ApiConfig } from "../../../config/api.config";
import { DataRequestDefectItems } from "model/inventory-defects";


const createInventoryDefect = (
    data: DataRequestDefectItems
): Promise<BaseResponse<any>> => {
    return BaseAxios.post(`${ApiConfig.INVENTORY_ADJUSTMENT}/defects`, data);
}

// const editInventoryDefect = (data: DataRequestDefectItems): Promise<BaseResponse<InventoryDefectResponse>> => {
//     return BaseAxios.put(`${ApiConfig.INVENTORY_ADJUSTMENT}/defects/${data.items[0].id}`, data)
// }

const deleteInventoryDefect = (id: number): Promise<BaseResponse<any>> => {
    return BaseAxios.delete(`${ApiConfig.INVENTORY_ADJUSTMENT}/defects/${id}`)
}

const getListInventoryDefect = (params: string): Promise<BaseResponse<Array<InventoryDefectResponse>>> => {
    return BaseAxios.get(`${ApiConfig.INVENTORY_ADJUSTMENT}/defects/?${params}`)
}

export {
    createInventoryDefect,
    // editInventoryDefect,
    deleteInventoryDefect,
    getListInventoryDefect
}