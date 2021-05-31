import BaseAction from "base/BaseAction";
import { SupplierType } from "domain/types/core.type";
import { SearchSupplierQuerry } from "model/query/supplier.query";
import { PageResponse } from "model/response/base-metadata.response";
import { SupplierResposne } from "model/response/supplier/supplier.response";

const searchSupplier = (query: SearchSupplierQuerry, setData: (response: PageResponse<SupplierResposne>) => void) => {
  return BaseAction(SupplierType.SEARCH_SUPPLIER_REQUEST, {query, setData});
}

const createSupplier = (query: SearchSupplierQuerry, setData: (response: PageResponse<SupplierResposne>) => void) => {
  return BaseAction(SupplierType.SEARCH_SUPPLIER_REQUEST, {query, setData});
}

const SupplierAction = {
  searchSupplier, 
  createSupplier,
}

export default SupplierAction;