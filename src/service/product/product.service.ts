import { VariantSku3Response } from './../../model/product/product.model';
import BaseAxios from "base/base.axios";
import BaseResponse from "base/base.response";
import { ApiConfig } from "config/api.config";
import { generateQuery } from "utils/AppUtils";
import { PageResponse } from "model/base/base-metadata.response";
import {
  ProductHistoryQuery,
  ProductHistoryResponse,
  ProductRequest,
  ProductWrapperUpdateRequest,
  ProductWrapperResponse,
  ProductWrapperSearchQuery,
  VariantResponse,
  VariantSearchQuery,
  ProductBarcodeRequest,
  BarcodePrintTemEditNoteRequest,
} from "model/product/product.model";
import { ProductUploadModel } from "model/product/product-upload.model";
import { ExportRequest, ExportResponse, JobResponse } from "model/other/files/export-model";

export const searchVariantsSimpleApi = (
  query: VariantSearchQuery
): Promise<BaseResponse<PageResponse<VariantResponse>>> => {
  const queryString = generateQuery(query);
  return BaseAxios.get(`${ApiConfig.PRODUCT}/variants/simple?${queryString}`);
};

export const searchVariantsApi = (
  query: VariantSearchQuery
): Promise<BaseResponse<PageResponse<VariantResponse>>> => {
  const queryString = generateQuery(query);
  return BaseAxios.get(`${ApiConfig.PRODUCT}/variants?${queryString}`);
};

export const searchVariantsInventoriesApi = (
  query: VariantSearchQuery
): Promise<BaseResponse<PageResponse<VariantResponse>>> => {
  const queryString = generateQuery(query);
  return BaseAxios.get(`${ApiConfig.PRODUCT}/variants/inventories?${queryString}`);
};

export const getVariantApi = (
  id: string
): Promise<BaseResponse<VariantResponse>> => {
  return BaseAxios.get(`${ApiConfig.PRODUCT}/variants/${id}`);
};

export const searchProductWrapperApi = (
  query: ProductWrapperSearchQuery
): Promise<BaseResponse<PageResponse<ProductWrapperResponse>>> => {
  const queryString = generateQuery(query);
  return BaseAxios.get(`${ApiConfig.PRODUCT}/products?${queryString}`);
};

export const productWrapperDeleteApi = (id: number): Promise<BaseResponse<string>> => {
  return BaseAxios.delete(`${ApiConfig.PRODUCT}/products/${id}`);
}

export const productWrapperPutApi = (
  id: number,
  request: ProductWrapperUpdateRequest
): Promise<BaseResponse<ProductWrapperResponse>> => {
  return BaseAxios.put(`${ApiConfig.PRODUCT}/products/${id}`, request);
};

export const productUploadApi = (
  files: Array<File>,
  folder: string
): Promise<BaseResponse<Array<ProductUploadModel>>> => {
  let body = new FormData();
  body.append("folder", folder);
  files.forEach((item) => {
    body.append("file_upload", item);
  });
  return BaseAxios.post(`${ApiConfig.PRODUCT}/products/upload`, body, {
    headers: { "content-type": "multipart/form-data" },
  });
};

export const createProductApi = (request: ProductRequest) => {
  return BaseAxios.post(`${ApiConfig.PRODUCT}/products`, request);
};


export const productGetHistory = (query: ProductHistoryQuery): Promise<BaseResponse<PageResponse<ProductHistoryResponse>>> => {
  const queryString = generateQuery(query);
  return BaseAxios.get(`${ApiConfig.PRODUCT}/products/histories?${queryString}`);
};

export const productGetHistoryInTem = (query: ProductHistoryQuery): Promise<BaseResponse<PageResponse<ProductHistoryResponse>>> => {
  const queryString = generateQuery(query);
  return BaseAxios.get(`${ApiConfig.PRODUCT}/barcode-print-histories?${queryString}`);
};

export const productUpdateHistoryInTem = (id: number, request: BarcodePrintTemEditNoteRequest) => {
  return BaseAxios.put(`${ApiConfig.PRODUCT}/barcode-print-histories/${id}`, request);
}

export const productDetailApi = (id: number) => {
  return BaseAxios.get(`${ApiConfig.PRODUCT}/products/${id}`);
}

export const productUpdateApi = (id: number, request: ProductRequest) => {
  return BaseAxios.put(`${ApiConfig.PRODUCT}/products/${id}`, request);
}

export const productBarcodeApi = (request: ProductBarcodeRequest) => {
  return BaseAxios.post(`${ApiConfig.PRODUCT}/variants/print`, request);
}

export const productImportApi = (file: File, isCreate: string) => {
  let body = new FormData();
  console.log(file);
  body.append("is_create", isCreate);
  body.append("file_upload", file);
  return BaseAxios.post(`${ApiConfig.PRODUCT}/import`, body, {
    headers: { "content-type": "multipart/form-data" },
  });
}

export const productCheckDuplicateCodeApi = (code: string): Promise<BaseResponse<null>> => {
  const url = `${ApiConfig.PRODUCT}/products/validate`;
  return BaseAxios.post(url, { code })
}

export const exportFile = (
  params: ExportRequest
): Promise<BaseResponse<ExportResponse>> => {
  return BaseAxios.post(`${ApiConfig.PRODUCT}/excel/job/export`, params);
};

export const getJobByCode = (
  code: string
): Promise<BaseResponse<JobResponse>> => {
  return BaseAxios.get(`${ApiConfig.PRODUCT}/excel/jobs/${code}`);
};

export const productImportFile = (file: any) => {
  const formData = new FormData();
  formData.append('file', file)
  return BaseAxios.post(`${ApiConfig.PRODUCT}/variants/barcode/job`, formData, {
    headers: { "content-type": "multipart/form-data" },
  });
}

export const getFileProductByCode = (code: string) => {
  return BaseAxios.get(`${ApiConfig.PRODUCT}/variants/barcode/job/${code}`)
}

export const producImagetUploadApi = (
  files: Array<File>,
  folder: string,
  productId: number | undefined
): Promise<BaseResponse<Array<ProductUploadModel>>> => {
  let body = new FormData();
  body.append("folder", folder);
  files.forEach((item) => {
    body.append("file_upload", item);
  });
  return BaseAxios.post(`${ApiConfig.PRODUCT}/products/upload-images/${productId}`, body, {
    headers: { "content-type": "multipart/form-data" },
  });
};

export const getFile = (
  code: string
): Promise<BaseResponse<JobResponse>> => {
  return BaseAxios.get(`${ApiConfig.IMPORT_EXPORT}/exporting/jobs/${code}`);
};

export const searchVariantSku3Api = (
  query: ProductWrapperSearchQuery
): Promise<BaseResponse<PageResponse<VariantSku3Response>>> => {
  const queryString = generateQuery(query);
  return BaseAxios.get(`${ApiConfig.PRODUCT}/products/search/three-code?${queryString}`);
};