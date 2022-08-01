import React, { createRef, FC, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { StyledWrapper } from "./styles";
import exportIcon from "assets/icon/export.svg";
import UrlConfig, { BASE_NAME_ROUTER } from "config/url.config";
import { Button, Col, Form, Input, Modal, Row, Space, Tabs, Upload } from "antd";
import arrowLeft from "assets/icon/arrow-back.svg";
import {
  DeleteOutlined,
  PaperClipOutlined,
  PrinterOutlined,
  SearchOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import BottomBarContainer from "component/container/bottom-bar.container";
import { useHistory, useParams } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import {
  inventoryGetVariantByStoreAction,
  inventoryUploadFileAction,
} from "domain/actions/inventory/stock-transfer/stock-transfer.action";
import { InventoryAdjustmentDetailItem, LineItemAdjustment } from "model/inventoryadjustment";
import ContentContainer from "component/container/content.container";
import InventoryAdjustmentTimeLine from "./conponents/InventoryAdjustmentTimeLine";
import { VariantResponse } from "model/product/product.model";
import CustomAutoComplete from "component/custom/autocomplete.cusom";
import { showError, showSuccess } from "utils/ToastUtils";
import ProductItem from "screens/purchase-order/component/product-item";
import _, { parseInt } from "lodash";
import {
  INVENTORY_ADJUSTMENT_AUDIT_TYPE_ARRAY,
  STATUS_INVENTORY_ADJUSTMENT,
} from "../ListInventoryAdjustment/constants";
import { PageResponse } from "model/base/base-metadata.response";
import InventoryAdjustmentListAll from "./conponents/InventoryAdjustmentListAll";
import {
  adjustInventoryAction,
  getDetailInventoryAdjustmentAction,
  getLinesItemAdjustmentAction,
  InventoryAdjustmentGetPrintContentAction,
  InventoryAdjustmentGetPrintProductAction,
  updateInventoryAdjustmentAction,
  updateOnlineInventoryAction,
} from "domain/actions/inventory/inventory-adjustment.action";
import { STATUS_INVENTORY_ADJUSTMENT_CONSTANTS } from "../constants";
import { HttpStatus } from "config/http-status.config";

import { UploadRequestOption } from "rc-upload/lib/interface";
import InventoryTransferExportModal from "./conponents/ExportModal";
import { useReactToPrint } from "react-to-print";
import { formatCurrency, generateQuery } from "utils/AppUtils";
import purify from "dompurify";
import { AccountResponse } from "model/account/account.model";
import { searchAccountPublicAction } from "domain/actions/account/account.action";
import ModalConfirm from "component/modal/ModalConfirm";
import { StoreResponse } from "model/core/store.model";
import { ConvertFullAddress } from "utils/ConvertAddress";
import { UploadFile } from "antd/lib/upload/interface";
import InventoryTransferImportModal from "./conponents/ImportModal";
import {
  exportFileV2,
  getFile,
  getFileV2,
  importFile,
} from "service/other/import.inventory.service";
import { ImportResponse } from "model/other/files/export-model";
import AuthWrapper from "component/authorization/AuthWrapper";
import { InventoryAdjustmentPermission } from "config/permissions/inventory-adjustment.permission";
import { callApiNative } from "utils/ApiUtils";
import {
  addLineItem,
  cancelInventoryTicket,
  getTotalOnHand,
} from "service/inventory/adjustment/index.service";
import { RootReducerType } from "model/reducers/RootReducerType";
import EditNote from "../../order-online/component/edit-note";
import AccountSearchPaging from "component/custom/select-search/account-select-paging";
import InventoryReportIcon from "assets/icon/inventory-report.svg";
import InventoryReportModal from "../ListInventoryAdjustment/components/InventoryReportModal";
import { primaryColor } from "utils/global-styles/variables";
import ScanIcon from "assets/icon/scan.svg";
import CloseCircleIcon from "assets/icon/close-circle.svg";
import IconPrint from "assets/icon/printer-blue.svg";

const { TabPane } = Tabs;

export interface InventoryParams {
  id: string;
}

export interface SummaryData {
  total: number;
  partly: number;
}

export interface Summary {
  TotalExcess: number | 0;
  TotalMiss: number | 0;
  TotalOnHand: number | 0;
  TotalRealOnHand: number | 0;
}
export const STATUS_IMPORT_EXPORT = {
  DEFAULT: 1,
  CREATE_JOB_SUCCESS: 2,
  JOB_FINISH: 3,
  ERROR: 4,
};

const DetailInventoryAdjustment: FC = () => {
  const [form] = Form.useForm();
  const [activeTab, setActiveTab] = useState<string>("1");
  const history = useHistory();
  const dispatch = useDispatch();
  const [data, setData] = useState<InventoryAdjustmentDetailItem>();
  const [isShowConfirmAdited, setIsShowConfirmAdited] = useState<boolean>(false);
  const [isShowConfirmAdj, seIsShowConfirmAdj] = useState<boolean>(false);
  const [isDeleteTicket, setIsDeleteTicket] = useState<boolean>(false);
  const [isOpenModal, setIsOpenModal] = useState<boolean>(false);

  const [isError, setError] = useState(false);
  const [isLoading, setLoading] = useState<boolean>(false);
  const [isLoadingBtn, setIsLoadingBtn] = useState<boolean>(false);
  const [isLoadingBtnCancel, setIsLoadingBtnCancel] = useState<boolean>(false);
  const productSearchRef = createRef<CustomAutoComplete>();

  const { id } = useParams<InventoryParams>();
  const idNumber = parseInt(id);
  const [hasError, setHasError] = useState<boolean>(false);
  const [isReRender, setIsReRender] = useState<boolean>(false);
  const [isReRenderTotalOnHand, setIsReRenderTotalOnHand] = useState<boolean>(false);

  const [printContent, setPrintContent] = useState("");
  const [keySearchHistory, setKeySearchHistory] = useState("");
  const [keySearchAll, setKeySearchAll] = useState("");
  const printElementRef = useRef(null);
  const handlePrint = useReactToPrint({
    content: () => printElementRef.current,
  });

  const [listExportFile, setListExportFile] = useState<Array<string>>([]);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportProgress, setExportProgress] = useState<number>(0);
  const [statusExport, setStatusExport] = useState<number>(STATUS_IMPORT_EXPORT.DEFAULT);

  const [listJobImportFile, setListJobImportFile] = useState<Array<string>>([]);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importProgress, setImportProgress] = useState<number>(0);
  const [statusImport, setStatusImport] = useState<number>(1);
  const [fileList, setFileList] = useState<Array<UploadFile>>([]);
  const [fileListUpdate, setFileListUpdate] = useState<Array<UploadFile>>([]);
  const [dataImport, setDataImport] = useState<ImportResponse>();
  const [hasImportUrl, setHasImportUrl] = useState<boolean>(false);
  const [isRerenderTab, setIsRerenderTab] = useState<boolean>(false);
  const [isRerenderTabHistory, setIsRerenderTabHistory] = useState<boolean>(false);

  const [accounts, setAccounts] = useState<Array<AccountResponse>>([]);
  const [formStoreData, setFormStoreData] = useState<StoreResponse | null>();
  const [tableLoading, setTableLoading] = useState(false);
  const [isPermissionAudit, setIsPermissionAudit] = useState(false);
  const [total, setTotal] = useState(0);
  const [dataLinesItem, setDataLinesItem] = useState<PageResponse<LineItemAdjustment>>({
    metadata: {
      limit: 30,
      page: 1,
      total: 0,
    },
    items: [],
  });

  const [objSummaryTableByAuditTotal, setObjSummaryTableByAuditTotal] = useState<any>({
    totalStock: 0,
    totalShipping: 0,
    totalOnWay: 0,
    onHand: 0,
    realOnHand: 0,
    totalExcess: 0,
    totalMissing: 0,
  });

  //phân quyền

  const setDataAccounts = useCallback((data: PageResponse<AccountResponse> | false) => {
    if (!data) {
      return;
    }
    setAccounts(data.items);
  }, []);

  const userReducer = useSelector((state: RootReducerType) => state.userReducer);

  useEffect(() => {
    if (!data) return;
    const auditedByFiltered =
      data.audited_bys && data?.audited_bys?.length > 0
        ? data?.audited_bys?.filter(
            (i: any) => i.toUpperCase() === userReducer.account?.code.toUpperCase(),
          )
        : [];
    setIsPermissionAudit(
      userReducer.account?.code.toUpperCase() === data.created_by.toUpperCase() ||
        auditedByFiltered.length > 0,
    );
  }, [data, userReducer.account?.code]);

  useEffect(() => {
    if (accounts.length === 0 || !data) return;

    dispatch(searchAccountPublicAction({ codes: data.audited_bys?.join(",") }, setDataAccounts));
    // eslint-disable-next-line react-hooks/exhaustive-deps,
  }, [JSON.stringify(accounts), data]);

  const [resultSearch, setResultSearch] = useState<PageResponse<VariantResponse> | any>();

  const onSearchProduct = (value: string) => {
    const storeId = data?.adjusted_store_id;
    if (!storeId) {
      showError("Vui lòng chọn kho gửi");
      return;
    } else if (value.trim() !== "" && value.length >= 3) {
      dispatch(
        inventoryGetVariantByStoreAction(
          {
            status: "active",
            limit: 10,
            page: 1,
            store_ids: storeId,
            info: value.trim(),
          },
          setResultSearch,
        ),
      );
    }
  };

  let textTag: string;
  let classTag: string;
  switch (data?.status) {
    case STATUS_INVENTORY_ADJUSTMENT.ADJUSTED.status:
      textTag = STATUS_INVENTORY_ADJUSTMENT.ADJUSTED.name;
      classTag = STATUS_INVENTORY_ADJUSTMENT.ADJUSTED.status;
      break;
    case STATUS_INVENTORY_ADJUSTMENT.AUDITED.status:
      textTag = STATUS_INVENTORY_ADJUSTMENT.AUDITED.name;
      classTag = STATUS_INVENTORY_ADJUSTMENT.AUDITED.status;
      break;
    case STATUS_INVENTORY_ADJUSTMENT.CANCELED.status:
      textTag = STATUS_INVENTORY_ADJUSTMENT.CANCELED.name;
      classTag = STATUS_INVENTORY_ADJUSTMENT.CANCELED.status;
      break;
    default:
      textTag = STATUS_INVENTORY_ADJUSTMENT.DRAFT.name;
      classTag = STATUS_INVENTORY_ADJUSTMENT.DRAFT.status;
      break;
  }

  const renderResult = useMemo(() => {
    let options: any[] = [];
    resultSearch?.items?.forEach((item: VariantResponse) => {
      options.push({
        label: <ProductItem isTransfer data={item} key={item.id.toString()} />,
        value: JSON.stringify(item),
      });
    });
    return options;
  }, [resultSearch]);

  const addItemApi = async (adjustmentId: number, data: any) => {
    return await callApiNative({ isShowError: false }, dispatch, addLineItem, adjustmentId, data);
  };

  const formatLineItemsData = (value: any) => {
    let variantPrice =
      value &&
      value.variant_prices &&
      value.variant_prices[0] &&
      value.variant_prices[0].retail_price;

    const { sku, barcode, id, name, variant_images, product, weight, weight_unit } = value;

    return {
      sku,
      barcode,
      variant_name: name || value.variant_name,
      variant_id: id || value.variant_id,
      variant_image: variant_images && variant_images.length > 0 ? variant_images[0].url : "",
      product_name: product ? product.name : value.product_name,
      product_id: product ? product.id : value.product_id,
      weight,
      weight_unit,
      real_on_hand: 0,
      on_hand_adj: 0 - (value.on_hand ?? 0),
      price: variantPrice !== null ? variantPrice : value.price,
      on_hand: value.on_hand ?? 0,
      on_way: value.on_way ?? 0,
      shipping: value.shipping ?? 0,
      total_stock: value.total_stock ?? 0,
    };
  };

  const onSelectProduct = useCallback(
    (value: string) => {
      let newValues = JSON.parse(value);

      const newData = formatLineItemsData(newValues);

      const data = {
        line_items: [newData],
      };

      setHasError(false);

      addItemApi(idNumber, data).then((res) => {
        if (!res) return;

        if (activeTab === "1") setIsRerenderTabHistory(!isRerenderTabHistory);
        if (activeTab === "2") setIsRerenderTab(!isRerenderTab);

        setTotal(total + 1);

        getTotalOnHandApi().then((res) => {
          if (!res) return;
          setObjSummaryTableByAuditTotal(res);
        });
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps,
    [resultSearch, idNumber, dispatch],
  );

  const pageBreak = "<div class='pageBreak'></div>";
  const printContentCallback = useCallback(
    (printContent) => {
      const textResponse = printContent.map((single: any) => {
        return `<div class="singleOrderPrint">` + single.html_content + "</div>";
      });
      let textResponseFormatted = textResponse.join(pageBreak);
      //xóa thẻ p thừa
      let result = textResponseFormatted.replaceAll("<p></p>", "");
      setPrintContent(result);
      handlePrint && handlePrint();
    },
    [handlePrint],
  );

  const printContentProductCallback = useCallback(
    (printContent) => {
      const textResponse = `<div class="singleOrderPrint">` + printContent.html_content + "</div>";
      let result = textResponse.replaceAll("<p></p>", "");
      setPrintContent(result);
      handlePrint && handlePrint();
    },
    [handlePrint],
  );

  const onBeforeUpload = useCallback(() => {}, []);

  const onCustomRequest = (options: UploadRequestOption) => {
    const { file } = options;
    let files: Array<File> = [];
    if (file instanceof File) {
      let uuid = file.uid;
      files.push(file);
      dispatch(
        inventoryUploadFileAction({ files: files }, (data: false | Array<string>) => {
          let index = fileList.findIndex((item) => item.uid === uuid);
          if (!!data) {
            if (index !== -1) {
              fileList[index].status = "done";
              fileList[index].url = data[0];
            }
            setHasImportUrl(true);
          } else {
            fileList.splice(index, 1);
            showError("Upload ảnh không thành công");
          }
          setFileList([...fileList]);
        }),
      );
    }
  };

  const onCustomUpdateRequest = (options: UploadRequestOption) => {
    const { file } = options;
    let files: Array<File> = [];
    if (file instanceof File) {
      let uuid = file.uid;
      files.push(file);
      dispatch(
        inventoryUploadFileAction({ files: files }, (data: false | Array<string>) => {
          let newFileListUpdate = [...fileListUpdate];
          let index = newFileListUpdate.findIndex((item) => item.uid === uuid);
          if (!!data) {
            if (index !== -1) {
              newFileListUpdate[index].status = "done";
              newFileListUpdate[index].url = data[0];
              let fileCurrent: Array<string> = form.getFieldValue("list_attached_files");
              if (!fileCurrent) {
                fileCurrent = [];
              }
              let newFileCurrent = [...fileCurrent, data[0]];
              form.setFieldsValue({ list_attached_files: newFileCurrent });

              updateAdjustment(true, null);
            }
          } else {
            newFileListUpdate.splice(index, 1);
            showError("Upload file không thành công");
          }
          setFileListUpdate(newFileListUpdate);
        }),
      );
    }
  };

  const onChangeFile = useCallback((info) => {
    setFileList([info.file]);
    setShowImportModal(true);
  }, []);

  const onChangeFileUpdate = useCallback((info) => {
    setFileListUpdate(info.fileList);
  }, []);

  const onPrintAction = () => {
    if (data) {
      let params = {
        ids: data.id,
        store_id: data.adjusted_store_id,
      };
      const queryParam = generateQuery(params);
      dispatch(InventoryAdjustmentGetPrintContentAction(queryParam, printContentCallback));
    }
  };

  const onResult = useCallback(
    (result) => {
      setLoading(true);
      if (!result) {
        setError(true);
        return;
      } else {
        setLoading(false);
        let data: InventoryAdjustmentDetailItem = result;
        setHasError(false);
        setFormStoreData(data?.store);
        setData(data);
        form.setFieldsValue(result);
      }
    },
    [form],
  );

  const updateAdjustment = (isUpdateFile: boolean = false, newNote: string | null) => {
    const dataUpdate = {
      ...data,
      note: newNote || data?.note,
      version: form.getFieldValue("version"),
      line_items: dataLinesItem.items,
      list_attached_files: form.getFieldValue("list_attached_files"),
    } as InventoryAdjustmentDetailItem;

    if (data && dataUpdate) {
      dispatch(
        updateInventoryAdjustmentAction(data.id, dataUpdate, () => {
          showSuccess("Cập nhật phiếu kiểm kho thành công");
          if (isUpdateFile) {
            setData({
              ...data,
              list_attached_files: form.getFieldValue("list_attached_files"),
            });
            return;
          }

          setData({
            ...data,
            note: newNote || data.note,
          });
        }),
      );
    }
  };

  const updateAuditedBys = () => {
    const dataUpdate = form.getFieldsValue(true);
    if (data && dataUpdate && dataUpdate.audited_bys.length > 0) {
      dispatch(
        updateInventoryAdjustmentAction(data.id, dataUpdate, () => {
          showSuccess("Cập nhật người kiểm kho thành công");
        }),
      );
    }
  };

  const onUpdateOnlineInventory = useCallback(() => {
    setLoading(true);
    dispatch(
      updateOnlineInventoryAction(data?.id ?? 0, (result) => {
        setLoading(false);
        if (result) {
          onResult(result);
          showSuccess("Hoàn thành kiểm kho thành công.");
          setIsShowConfirmAdited(false);
        }
      }),
    );
  }, [data, dispatch, onResult]);

  const onAdjustInventory = useCallback(() => {
    setLoading(true);
    dispatch(
      adjustInventoryAction(data?.id ?? 0, (result) => {
        setLoading(false);
        if (result) {
          onResult(result);
          showSuccess("Cân tồn kho thành công.");
          seIsShowConfirmAdj(false);
        }
      }),
    );
  }, [dispatch, data?.id, onResult]);

  const onResultDataTable = useCallback((result: PageResponse<LineItemAdjustment> | false) => {
    if (result) {
      setTotal(result.metadata.total);
    }
  }, []);

  useEffect(() => {
    dispatch(getLinesItemAdjustmentAction(idNumber, `page=1&limit=30`, onResultDataTable));

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onEnterFilterVariant = useCallback(
    (code: string) => {
      if (activeTab === "1") setKeySearchHistory(code?.toLocaleLowerCase());
      if (activeTab === "2") setKeySearchAll(code?.toLocaleLowerCase());
      setTableLoading(false);
    },
    [activeTab],
  );

  type accountAudit = {
    user_name: string;
  };

  const RenderItemAuditBy = useCallback(
    (auditBY: accountAudit) => {
      const account = accounts.find(
        (e) => e.code.toLocaleLowerCase() === auditBY.user_name.toLocaleLowerCase(),
      );

      return <div>{`${account?.code} - ${account?.full_name}`}</div>;
    },
    [accounts],
  );

  const debounceSearchVariant = useMemo(
    () =>
      _.debounce((code: string) => {
        setTableLoading(true);
        onEnterFilterVariant(code);
      }, 300),
    [onEnterFilterVariant],
  );

  const onChangeKeySearch = useCallback(
    (code: string) => {
      debounceSearchVariant(code);
    },
    [debounceSearchVariant],
  );

  const onExport = useCallback(() => {
    exportFileV2({
      conditions: data?.id.toString(),
      type: "EXPORT_INVENTORY_ADJUSTMENT",
    })
      .then((response) => {
        if (response.code === HttpStatus.SUCCESS) {
          setStatusExport(STATUS_IMPORT_EXPORT.CREATE_JOB_SUCCESS);
          showSuccess("Đã gửi yêu cầu xuất file");
          setListExportFile([...listExportFile, response.data.code]);
        }
      })
      .catch(() => {
        setStatusExport(STATUS_IMPORT_EXPORT.ERROR);
        showError("Có lỗi xảy ra, vui lòng thử lại sau");
      });
  }, [data?.id, listExportFile]);

  const checkExportFile = useCallback(() => {
    let getFilePromises = listExportFile.map((code) => {
      return getFileV2(code);
    });
    Promise.all(getFilePromises).then((responses) => {
      responses.forEach((response) => {
        if (response.code === HttpStatus.SUCCESS) {
          if (response.data.total) {
            const percent = Math.round(response.data.num_of_record / response.data.total) * 100;
            setExportProgress(percent);
          }
          if (response.data && response.data.status === "FINISH") {
            setStatusExport(STATUS_IMPORT_EXPORT.JOB_FINISH);
            const fileCode = response.data.code;
            const newListExportFile = listExportFile.filter((item) => {
              return item !== fileCode;
            });
            var downLoad = document.createElement("a");
            downLoad.href = response.data.url;
            downLoad.download = "download";

            downLoad.click();

            setListExportFile(newListExportFile);
          }
        }
      });
    });
  }, [listExportFile]);

  useEffect(() => {
    if (listExportFile.length === 0 || statusExport === 3) return;
    checkExportFile();

    const getFileInterval = setInterval(checkExportFile, 3000);
    return () => clearInterval(getFileInterval);
  }, [listExportFile, checkExportFile, statusExport]);

  const onImport = useCallback(() => {
    importFile({
      url: fileList[0].url,
      conditions: data?.id.toString(),
      type: "IMPORT_INVENTORY_ADJUSTMENT",
    })
      .then((response) => {
        if (response.code === HttpStatus.SUCCESS) {
          setStatusImport(STATUS_IMPORT_EXPORT.CREATE_JOB_SUCCESS);
          showSuccess("Đã gửi yêu cầu nhập file");
          setListJobImportFile([...listJobImportFile, response.data.code]);
        }
      })
      .catch(() => {
        setStatusImport(STATUS_IMPORT_EXPORT.ERROR);
        showError("Có lỗi xảy ra, vui lòng thử lại sau");
      });
  }, [data?.id, fileList, listJobImportFile]);

  const checkImportFile = useCallback(() => {
    if (statusImport !== STATUS_IMPORT_EXPORT.DEFAULT) {
      let getFilePromises = listJobImportFile.map((code) => {
        return getFile(code);
      });
      Promise.all(getFilePromises).then((responses) => {
        responses.forEach((response) => {
          if (response.code === HttpStatus.SUCCESS) {
            setDataImport(response.data);
            if (response.data.percent) {
              setImportProgress(response.data.percent);
            }
            if (response.data && response.data.status === "FINISH") {
              if (!response.data.percent) {
                setImportProgress(100);
              }

              setStatusImport(STATUS_IMPORT_EXPORT.JOB_FINISH);
              dispatch(getDetailInventoryAdjustmentAction(idNumber, onResult));
            }
            if (response.data && response.data.status === "ERROR") {
              setStatusImport(STATUS_IMPORT_EXPORT.ERROR);
            }
          }
        });
      });
    }
  }, [dispatch, idNumber, listJobImportFile, onResult, statusImport]);

  const getTotalOnHandApi = async () => {
    return await callApiNative({ isShowError: false }, dispatch, getTotalOnHand, Number(id));
  };

  const getTotalOnHandFunc = () => {
    getTotalOnHandApi().then((res) => {
      if (!res) return;
      setObjSummaryTableByAuditTotal({
        onHand: res.onHand || 0,
        totalStock: res.totalStock || 0,
        totalShipping: res.totalShipping || 0,
        totalOnWay: res.totalOnWay || 0,
        realOnHand: res.realOnHand || 0,
        totalExcess: res.totalExcess || 0,
        totalMissing: res.totalMissing || 0,
      });
    });
  };

  useEffect(() => {
    getTotalOnHandFunc();
    // eslint-disable-next-line react-hooks/exhaustive-deps,
  }, [isReRenderTotalOnHand]);

  useEffect(() => {
    if (
      listJobImportFile.length === 0 ||
      statusImport === STATUS_IMPORT_EXPORT.JOB_FINISH ||
      statusImport === STATUS_IMPORT_EXPORT.ERROR
    )
      return;
    checkImportFile();

    const getFileInterval = setInterval(checkImportFile, 3000);
    return () => clearInterval(getFileInterval);
  }, [listJobImportFile, statusImport, checkImportFile]);

  useEffect(() => {
    setIsLoadingBtn(true);
    dispatch(getDetailInventoryAdjustmentAction(idNumber, onResult));
    try {
      const interval = setInterval(async () => {
        setData((data) => {
          if (data?.status === STATUS_INVENTORY_ADJUSTMENT_CONSTANTS.INITIALIZING || !data) {
            dispatch(getDetailInventoryAdjustmentAction(idNumber, onResult));
          } else {
            getTotalOnHandFunc();
            clearInterval(interval);
            setIsLoadingBtn(false);
          }

          return data;
        });
      }, 5000);

      return () => clearInterval(interval);
    } catch (e) {
      console.log(e);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps,
  }, [idNumber, isReRender]);

  useEffect(() => {
    dispatch(searchAccountPublicAction({}, setDataAccounts));
  }, [dispatch, setDataAccounts]);

  const onCancelTicket = async () => {
    const res = await callApiNative(
      { isShowLoading: false },
      dispatch,
      cancelInventoryTicket,
      data?.id,
    );

    if (res) {
      showSuccess(`Hủy phiếu kiểm ${data?.code} thành công`);
      const newData: any = { ...data };
      newData.status = "canceled";

      setData(newData);
    }
    setIsLoadingBtnCancel(false);
  };

  const renderSearchComponent = () => (
    <CustomAutoComplete
      id="#product_search_variant"
      dropdownClassName="product"
      placeholder="Thêm sản phẩm vào phiếu kiểm"
      onSearch={onSearchProduct}
      dropdownMatchSelectWidth={456}
      style={{ width: "100%" }}
      showAdd={true}
      isNotPermissionAudit={!isPermissionAudit}
      textAdd="Thêm mới sản phẩm"
      onSelect={onSelectProduct}
      options={renderResult}
      ref={productSearchRef}
      onClickAddNew={() => {
        window.open(`${BASE_NAME_ROUTER}${UrlConfig.PRODUCT}/create`, "_blank");
      }}
    />
  );

  const onPrintProductAction = (type: string) => {
    if (data) {
      dispatch(
        InventoryAdjustmentGetPrintProductAction(`type=${type}`, data.id, printContentProductCallback)
      );
    }
  }

  return (
    <StyledWrapper>
      <ContentContainer
        isError={isError}
        isLoading={isLoading}
        title={`Kiểm kho ${data?.code}`}
        breadcrumb={[
          {
            name: "Kho hàng",
          },
          {
            name: "Kiểm kho",
            path: `${UrlConfig.INVENTORY_ADJUSTMENTS}`,
          },
          {
            name: `${data?.code}`,
          },
        ]}
        extra={
          <InventoryAdjustmentTimeLine status={data?.status} inventoryAdjustmentDetail={data} />
        }
      >
        {data && (
          <>
            <Form form={form}>
              <Row gutter={30} className="mb-20 detail-info">
                <Col span={24} md={5}>
                  <div className="label label-green mb-20 mt-10">
                    <div>Quét được</div>
                    <div style={{ color: "#FFFFFF", fontSize: 18 }}>
                      {formatCurrency(objSummaryTableByAuditTotal.realOnHand)}/
                      {formatCurrency(objSummaryTableByAuditTotal.onHand)}
                    </div>
                    <img src={ScanIcon} alt="scan" className="icon" />
                  </div>

                  <div className="label label-red">
                    <div>Thừa/thiếu</div>
                    <div style={{ fontSize: 18 }}>
                      {objSummaryTableByAuditTotal.totalExcess === 0 ||
                      !objSummaryTableByAuditTotal.totalExcess ? (
                        0
                      ) : (
                        <span style={{ color: "#FFFFFF" }}>
                          +{formatCurrency(objSummaryTableByAuditTotal.totalExcess)}
                        </span>
                      )}
                      {objSummaryTableByAuditTotal.totalExcess !== null &&
                      objSummaryTableByAuditTotal.totalMissing !== null ? (
                        <Space>/</Space>
                      ) : (
                        ""
                      )}
                      {objSummaryTableByAuditTotal.totalMissing === 0 ||
                      !objSummaryTableByAuditTotal.totalMissing ? (
                        0
                      ) : (
                        <span style={{ color: "#FFFFFF" }}>
                          {formatCurrency(objSummaryTableByAuditTotal.totalMissing)}
                        </span>
                      )}
                    </div>
                    <img src={CloseCircleIcon} alt="close" className="icon" />
                  </div>
                </Col>
                <Col span={24} md={7}>
                  <Row className="margin-bottom-15 mt-10">
                    <Col span={8} className="title">
                      Mã phiếu:
                    </Col>
                    <Col span={16} className="font-weight-500">
                      {data.code}
                    </Col>
                  </Row>

                  <Row className="margin-bottom-15">
                    <Col span={8} className="title">
                      Loại kiểm:
                    </Col>
                    <Col span={16} className="font-weight-500">
                      {INVENTORY_ADJUSTMENT_AUDIT_TYPE_ARRAY.find(
                        (e) => e.value === data.audit_type,
                      )?.name ?? ""}
                    </Col>
                  </Row>

                  <Row className="margin-bottom-15">
                    <Col span={8} className="title">
                      Người tạo:
                    </Col>
                    <Col span={16} className="font-weight-500">
                      {`${data.created_by} - ${data?.created_name}`}
                    </Col>
                  </Row>

                  <Row className="margin-bottom-15">
                    <Col span={8} className="title">
                      Người kiểm:
                    </Col>
                    <Col span={16} className="font-weight-500">
                      {data.status === STATUS_INVENTORY_ADJUSTMENT.DRAFT.status &&
                      isPermissionAudit ? (
                        <Form.Item
                          name="audited_bys"
                          labelCol={{ span: 24, offset: 0 }}
                          colon={false}
                          rules={[
                            {
                              required: true,
                              message: "Vui lòng chọn người kiểm",
                            },
                          ]}
                        >
                          <AccountSearchPaging
                            onSelect={updateAuditedBys}
                            onDeselect={updateAuditedBys}
                            mode="multiple"
                            placeholder="Chọn người kiểm"
                            style={{ width: "100%" }}
                          />
                        </Form.Item>
                      ) : (
                        <div>
                          {data.audited_bys?.map((item: string) => {
                            return (
                              <RenderItemAuditBy
                                key={item?.toString()}
                                user_name={item?.toString()}
                              />
                            );
                          })}
                        </div>
                      )}
                    </Col>
                  </Row>

                  <Row className="margin-bottom-15">
                    <Col span={8} className="title">
                      Trạng thái:
                    </Col>
                    <Col span={16} className="font-weight-500">
                      <div className={classTag}>{textTag}</div>
                    </Col>
                  </Row>
                </Col>

                <Col span={24} md={12}>
                  <Row className="margin-bottom-15 mt-10">
                    <Col span={4} className="title">
                      Kho hàng:
                    </Col>
                    <Col span={20} className="font-weight-500">
                      {formStoreData?.name}
                    </Col>
                  </Row>

                  <Row className="margin-bottom-15">
                    <Col span={4} className="title">
                      SĐT:
                    </Col>
                    <Col span={20} className="font-weight-500">
                      {formStoreData?.hotline}
                    </Col>
                  </Row>

                  <Row className="margin-bottom-15">
                    <Col span={4} className="title">
                      Địa chỉ:
                    </Col>
                    <Col span={20} className="font-weight-500">
                      {ConvertFullAddress(formStoreData)}
                    </Col>
                  </Row>

                  <Row>
                    <Col span={4} className="title">
                      Đính kèm:
                    </Col>
                    <Col span={20} className="font-weight-500">
                      {Array.isArray(data.list_attached_files) &&
                        data.list_attached_files.length > 0 &&
                        data.list_attached_files?.map((link: string, index: number) => {
                          return (
                            <a
                              key={index}
                              className="file-pin"
                              target="_blank"
                              rel="noreferrer"
                              href={link}
                            >
                              <PaperClipOutlined /> {link}
                            </a>
                          );
                        })}

                      <Form.Item>
                        {data.status !== STATUS_INVENTORY_ADJUSTMENT_CONSTANTS.ADJUSTED && (
                          <Upload
                            beforeUpload={onBeforeUpload}
                            multiple={true}
                            fileList={fileListUpdate}
                            onChange={onChangeFileUpdate}
                            customRequest={onCustomUpdateRequest}
                            showUploadList={false}
                          >
                            <Button icon={<UploadOutlined />}>Chọn file</Button>
                          </Upload>
                        )}
                      </Form.Item>
                    </Col>
                  </Row>

                  <Row className="margin-bottom-15">
                    <Col span={4} className="title">
                      Ghi chú:
                    </Col>
                    <Col span={20} className="font-weight-500">
                      <EditNote
                        isHaveEditPermission={true}
                        note={data.note}
                        title=""
                        color={primaryColor}
                        onOk={(newNote) => {
                          updateAdjustment(false, newNote);
                        }}
                      />
                    </Col>
                  </Row>
                </Col>
              </Row>

              <Form.Item noStyle hidden name="list_attached_files">
                <Input />
              </Form.Item>
              <Form.Item noStyle hidden name="version">
                <Input />
              </Form.Item>

              <Row gutter={24}>
                <Col span={24}>
                  <div className="detail-info">
                    <Tabs
                      style={{ overflow: "initial" }}
                      activeKey={activeTab}
                      onChange={(active) => setActiveTab(active)}
                    >
                      <TabPane
                        tab={`Thừa/Thiếu (${formatCurrency(dataLinesItem.metadata.total) ?? 0})`}
                        key="1"
                      >
                        <AuthWrapper acceptPermissions={[InventoryAdjustmentPermission.update]}>
                          <Input.Group style={{ paddingTop: 16 }} className="display-flex">
                            {renderSearchComponent()}
                            <Input
                              name="key_search"
                              onChange={(e) => {
                                onChangeKeySearch(e.target.value);
                              }}
                              style={{ marginLeft: 8 }}
                              placeholder="Tìm kiếm sản phẩm trong phiếu"
                              addonAfter={
                                <SearchOutlined
                                  onClick={() => {
                                    onChangeKeySearch(keySearchHistory);
                                  }}
                                  style={{ color: "#2A2A86" }}
                                />
                              }
                            />
                            <Button
                              onClick={() => onPrintProductAction('deviant')}
                              type="primary"
                              ghost
                              style={{ padding: "0 25px", fontWeight: 400, margin: "0 10px" }}
                            >
                              <img src={IconPrint} alt="" style={{ paddingRight: "10px" }} /> In danh sách
                            </Button>
                          </Input.Group>
                        </AuthWrapper>
                        {activeTab === "1" && (
                          <InventoryAdjustmentListAll
                            setIsReRender={() => {
                              setIsReRenderTotalOnHand((isReRenderTotalOnHand) => {
                                return !isReRenderTotalOnHand;
                              });
                            }}
                            setDataTab={(value) => setDataLinesItem(value)}
                            tab={activeTab}
                            isPermissionAudit={isPermissionAudit}
                            keySearch={activeTab === "1" ? keySearchHistory : keySearchAll}
                            tableLoading={tableLoading}
                            isRerenderTab={isRerenderTab}
                            objSummaryTableByAuditTotal={objSummaryTableByAuditTotal}
                            idNumber={idNumber}
                            data={data}
                          />
                        )}
                      </TabPane>
                      <TabPane tab={`Tất cả (${total})`} key="2">
                        <AuthWrapper acceptPermissions={[InventoryAdjustmentPermission.update]}>
                          <Input.Group style={{ paddingTop: 16 }} className="display-flex">
                            {renderSearchComponent()}
                            <Input
                              name="key_search"
                              onChange={(e) => {
                                onChangeKeySearch(e.target.value);
                              }}
                              style={{ marginLeft: 8 }}
                              placeholder="Tìm kiếm sản phẩm trong phiếu"
                              addonAfter={
                                <SearchOutlined
                                  onClick={() => {
                                    onChangeKeySearch(keySearchAll);
                                  }}
                                  style={{ color: "#2A2A86" }}
                                />
                              }
                            />
                            <Button
                              onClick={() => onPrintProductAction('total')}
                              type="primary"
                              ghost
                              style={{ padding: "0 25px", fontWeight: 400, margin: "0 10px" }}
                            >
                              <img src={IconPrint} alt="" style={{ paddingRight: "10px" }} /> In danh sách
                            </Button>
                          </Input.Group>
                        </AuthWrapper>
                        {activeTab === "2" && (
                          <InventoryAdjustmentListAll
                            setIsReRender={() => {
                              setIsReRenderTotalOnHand((isReRenderTotalOnHand) => {
                                return !isReRenderTotalOnHand;
                              });
                            }}
                            tab={activeTab}
                            isPermissionAudit={isPermissionAudit}
                            keySearch={keySearchAll}
                            tableLoading={tableLoading}
                            isRerenderTab={isRerenderTab}
                            objSummaryTableByAuditTotal={objSummaryTableByAuditTotal}
                            idNumber={idNumber}
                            data={data}
                          />
                        )}
                      </TabPane>
                    </Tabs>
                  </div>
                </Col>
              </Row>
            </Form>
            <div style={{ display: "none" }}>
              <Upload fileList={fileList} />
              <div className="printContent" ref={printElementRef}>
                <div
                  dangerouslySetInnerHTML={{
                    __html: purify.sanitize(printContent),
                  }}
                />
              </div>
            </div>
            <BottomBarContainer
              leftComponent={
                <div
                  onClick={() => history.push(`${UrlConfig.INVENTORY_ADJUSTMENTS}`)}
                  style={{ cursor: "pointer" }}
                >
                  <img style={{ marginRight: "10px" }} src={arrowLeft} alt="" />
                  {"Quay lại danh sách"}
                </div>
              }
              rightComponent={
                <Space>
                  {data.status !== STATUS_INVENTORY_ADJUSTMENT.CANCELED.status &&
                    data.status !== STATUS_INVENTORY_ADJUSTMENT.ADJUSTED.status && (
                      <AuthWrapper acceptPermissions={[InventoryAdjustmentPermission.cancel]}>
                        <Button
                          loading={isLoadingBtnCancel}
                          type="primary"
                          danger
                          onClick={() => {
                            setIsDeleteTicket(true);
                          }}
                        >
                          Hủy phiếu
                        </Button>
                      </AuthWrapper>
                    )}
                  {data.status === STATUS_INVENTORY_ADJUSTMENT.ADJUSTED.status && (
                    <Button
                      onClick={() => {
                        setIsOpenModal(true);
                      }}
                      className="btn-report"
                      icon={
                        <img
                          className="icon-report"
                          src={InventoryReportIcon}
                          alt="inventory-report-icon"
                        />
                      }
                    >
                      Xem báo cáo kiểm
                    </Button>
                  )}
                  {data.status !== STATUS_INVENTORY_ADJUSTMENT.DRAFT.status &&
                    data.status !== STATUS_INVENTORY_ADJUSTMENT.INITIALIZING.status && (
                      <AuthWrapper acceptPermissions={[InventoryAdjustmentPermission.print]}>
                        <Button
                          type="default"
                          onClick={() => {
                            onPrintAction();
                          }}
                        >
                          <Space>
                            <PrinterOutlined /> In phiếu
                          </Space>
                        </Button>
                      </AuthWrapper>
                    )}
                  <Button
                    loading={isLoadingBtn}
                    disabled={isLoadingBtn}
                    type="default"
                    className="light"
                    size="large"
                    icon={<img src={exportIcon} style={{ marginRight: 8 }} alt="" />}
                    onClick={() => {
                      setShowExportModal(true);
                      onExport();
                    }}
                  >
                    Xuất excel
                  </Button>
                  {(data.status === STATUS_INVENTORY_ADJUSTMENT.DRAFT.status ||
                    data.status === STATUS_INVENTORY_ADJUSTMENT.INITIALIZING.status) && (
                    <>
                      <AuthWrapper acceptPermissions={[InventoryAdjustmentPermission.import]}>
                        <Upload
                          beforeUpload={onBeforeUpload}
                          multiple={false}
                          showUploadList={false}
                          onChange={onChangeFile}
                          customRequest={onCustomRequest}
                        >
                          <Button
                            disabled={
                              data.status === STATUS_INVENTORY_ADJUSTMENT.INITIALIZING.status ||
                              !isPermissionAudit
                            }
                            icon={<UploadOutlined />}
                          >
                            Nhập excel
                          </Button>
                        </Upload>
                      </AuthWrapper>
                      <AuthWrapper acceptPermissions={[InventoryAdjustmentPermission.audit]}>
                        <Button
                          type="primary"
                          onClick={() => {
                            setIsShowConfirmAdited(true);
                          }}
                          loading={isLoading}
                          disabled={
                            hasError ||
                            isLoading ||
                            data.status === STATUS_INVENTORY_ADJUSTMENT.INITIALIZING.status ||
                            !isPermissionAudit
                          }
                        >
                          Hoàn thành kiểm
                        </Button>
                      </AuthWrapper>
                    </>
                  )}
                  {data.status === STATUS_INVENTORY_ADJUSTMENT.AUDITED.status && (
                    <AuthWrapper acceptPermissions={[InventoryAdjustmentPermission.adjust]}>
                      <Button
                        type="primary"
                        onClick={() => {
                          seIsShowConfirmAdj(true);
                        }}
                        loading={isLoading}
                        disabled={hasError || isLoading || !isPermissionAudit}
                      >
                        Cân tồn kho
                      </Button>
                    </AuthWrapper>
                  )}
                </Space>
              }
            />
            {showExportModal && (
              <InventoryTransferExportModal
                visible={showExportModal}
                onCancel={() => {
                  setShowExportModal(false);
                  setExportProgress(0);
                  setStatusExport(STATUS_IMPORT_EXPORT.DEFAULT);
                }}
                onOk={() => onExport()}
                exportProgress={exportProgress}
                statusExport={statusExport}
              />
            )}
            {showImportModal && (
              <InventoryTransferImportModal
                visible={showImportModal}
                onImport={onImport}
                dataImport={dataImport}
                hasImportUrl={hasImportUrl}
                onCancel={() => {
                  setShowImportModal(false);
                  setImportProgress(0);
                  setListJobImportFile([]);
                  setStatusImport(STATUS_IMPORT_EXPORT.DEFAULT);
                  setFileList([]);
                  setIsReRender(!isReRender);
                }}
                importProgress={importProgress && importProgress}
                statusImport={statusImport}
                fileList={fileList}
              />
            )}
            {isShowConfirmAdited && (
              <ModalConfirm
                onCancel={() => {
                  setIsShowConfirmAdited(false);
                }}
                onOk={() => {
                  onUpdateOnlineInventory();
                }}
                okText="Đồng ý"
                cancelText="Hủy"
                title={`Bạn có chắc chắn Hoàn thành kiểm?`}
                subTitle='Phiếu kiểm kho sẽ chuyển sang trạng thái "Đã kiểm" và không thể thay đổi số lượng thực tồn.'
                visible={isShowConfirmAdited}
              />
            )}

            {isShowConfirmAdj && (
              <ModalConfirm
                onCancel={() => {
                  seIsShowConfirmAdj(false);
                }}
                onOk={() => {
                  onAdjustInventory();
                }}
                okText="Đồng ý"
                cancelText="Hủy"
                title={`Bạn có chắc chắn Cân tồn kho?`}
                subTitle='Phiếu kiểm kho sẽ chuyển sang trạng thái "Đã cân tồn" và tính toán lại tồn kho.'
                visible={isShowConfirmAdj}
              />
            )}

            {isDeleteTicket && (
              <Modal
                width={500}
                centered
                visible={isDeleteTicket}
                confirmLoading={isLoadingBtnCancel}
                onCancel={() => setIsDeleteTicket(false)}
                onOk={() => {
                  setIsDeleteTicket(false);
                  setIsLoadingBtnCancel(true);
                  onCancelTicket().then();
                }}
                cancelText={`Hủy`}
                okText={`Đồng ý`}
              >
                <Row align="top">
                  <DeleteOutlined
                    style={{
                      fontSize: 40,
                      background: "#e24343",
                      color: "white",
                      borderRadius: "50%",
                      padding: 10,
                      marginRight: 10,
                    }}
                  />
                  <strong className="margin-top-10">
                    Bạn chắc chắn Hủy phiếu kiểm kho {data?.code}?
                  </strong>
                </Row>
              </Modal>
            )}
          </>
        )}

        {isOpenModal && (
          <InventoryReportModal
            inventoryId={idNumber}
            visible={isOpenModal}
            onCancel={() => setIsOpenModal(false)}
          />
        )}
      </ContentContainer>
    </StyledWrapper>
  );
};

export default DetailInventoryAdjustment;
