import { InventoryDefectResponse } from './../../../model/inventory-defects/index';
import BaseResponse from "../../../base/base.response";
import BaseAxios from "../../../base/base.axios";
import { ApiConfig } from "../../../config/api.config";
import { InventoryItemsDefectedDetail } from "model/inventory-defects";


const createInventoryDefect = (
    data: Array<InventoryItemsDefectedDetail>
): Promise<BaseResponse<any>> => {
    return BaseAxios.post(`${ApiConfig.INVENTORY_ADJUSTMENT}/defect`, data);
}

const editInventoryDefect = (data: InventoryDefectResponse): Promise<BaseResponse<InventoryDefectResponse>> => {
    return BaseAxios.put(`${ApiConfig.INVENTORY_ADJUSTMENT}/defect/${data.id}`, data)
}

const deleteInventoryDefect = (id: number): Promise<BaseResponse<any>> => {
    return BaseAxios.delete(`${ApiConfig.INVENTORY_ADJUSTMENT}/defect/${id}`)
}

const getListInventoryDefect = (params: string): Promise<BaseResponse<Array<InventoryDefectResponse>>> => {
    return BaseAxios.get(`${ApiConfig.INVENTORY_ADJUSTMENT}/defect/?${params}`)
}

export {
    createInventoryDefect,
    editInventoryDefect,
    deleteInventoryDefect,
    getListInventoryDefect
}