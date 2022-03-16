import {SupplierQuery} from "../../../model/core/supplier.model";
import {BaseBootstrapResponse} from "../../../model/content/bootstrap.model";
import {DistrictResponse} from "../../../model/content/district.model";
import {MenuAction} from "../../table/ActionButton";

export type SupplierFilterProps = {
  initValue: SupplierQuery;
  params: SupplierQuery & { [key: string]: any };
  setParams: any;
  onFilter?: (values: SupplierQuery) => void;
  supplierStatus?: Array<BaseBootstrapResponse>;
  listSupplierType?: Array<BaseBootstrapResponse>;
  scorecard?: Array<BaseBootstrapResponse>;
  listDistrict?: Array<DistrictResponse>;
  onMenuClick?: (index: number) => void;
  actions: Array<MenuAction>;
};

export enum SupplierEnum {
  status = "status",
  contact = "contact",
  condition = "condition",
  district_id = "district_id",
  scorecard = "scorecard",
  type = "type",
  collection_id = "collection_id",
  merchandiser = "pics",
}

export const FieldMapping = {
  [SupplierEnum.status]: "Trạng thái",
  [SupplierEnum.merchandiser]: "Merchandiser",
  [SupplierEnum.collection_id]: "Nhóm hàng",
  [SupplierEnum.condition]: "Thông tin LH",
  [SupplierEnum.scorecard]: "Phân cấp",
  [SupplierEnum.district_id]: "Khu vực",
  [SupplierEnum.type]: "Loại",
}


