import React, { createRef, FC, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { StyledWrapper } from "./styles";
import exportIcon from "assets/icon/export.svg";
import UrlConfig, { BASE_NAME_ROUTER } from "config/url.config";
import { Button, Col, Form, Input, Modal, Row, Space, Tabs, Upload } from "antd";
import arrowLeft from "assets/icon/arrow-back.svg";
import {
  CloseCircleOutlined,
  DeleteOutlined,
  EditOutlined,
  PaperClipOutlined,
  PrinterOutlined, SaveOutlined,
  SearchOutlined,
  UploadOutlined
} from "@ant-design/icons";
import BottomBarContainer from "component/container/bottom-bar.container";
import { useHistory, useParams } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import {
  inventoryGetVariantByStoreAction,
  inventoryUploadFileAction,
} from "domain/actions/inventory/stock-transfer/stock-transfer.action";
import {
  IncurredAuditRecordType,
  InventoryAdjustmentDetailItem,
  LineItemAdjustment,
} from "model/inventoryadjustment";
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
  addAttachedFile,
  addLineItem,
  cancelInventoryTicket,
  checkIncurredRecordApi,
  deleteAttachedFile,
  getDetailInventorAdjustmentGetApi,
  getLinesItemAdjustmentApi,
  getTotalOnHand,
  renameAttachedFileApi,
  updateAttachedFile
} from "service/inventory/adjustment/index.service";
import { RootReducerType } from "model/reducers/RootReducerType";
import EditNote from "../../order-online/component/edit-note";
import AccountSearchPaging from "component/custom/select-search/account-select-paging";
import InventoryReportIcon from "assets/icon/inventory-report-blue.svg";
import InventoryReportModal from "../ListInventoryAdjustment/components/InventoryReportModal";
import { primaryColor } from "utils/global-styles/variables";
import ScanIcon from "assets/icon/scan.svg";
import CloseCircleIcon from "assets/icon/close-circle.svg";
import IconPrint from "assets/icon/printer-blue.svg";
import BaseAxios from "base/base.axios";
import { ApiConfig } from "config/api.config";
import useAuthorization from "hook/useAuthorization";
import NoticeIncurredRecordTour from "./conponents/InventoryAdjustmentTours/NoticeIncurredRecordTour";
import SummaryIncurredRecordTour from "./conponents/InventoryAdjustmentTours/SummaryIncurredRecordTour";
import { hideLoading, showLoading } from "domain/actions/loading.action";
import debounce from "lodash/debounce";
import ModalDeleteConfirm from "component/modal/ModalDeleteConfirm";
import moment from "moment";
import { FORMAT_DATE_UPLOAD_FILE, KEY } from "../helper";
import { saveAs } from "file-saver";

const { TabPane } = Tabs;

export interface InventoryParams {
  id: string;
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
  const [isShowConfirmAudited, setIsShowConfirmAudited] = useState<boolean>(false);
  const [isShowConfirmAdj, setIsShowConfirmAdj] = useState<boolean>(false);
  const [isDeleteTicket, setIsDeleteTicket] = useState<boolean>(false);
  const [isOpenModal, setIsOpenModal] = useState<boolean>(false);

  const [isError, setError] = useState(false);
  const [isLoading, setLoading] = useState<boolean>(false);
  const [isLoadingBtn, setIsLoadingBtn] = useState<boolean>(false);
  const [isLoadingBtnCancel, setIsLoadingBtnCancel] = useState<boolean>(false);
  const [isLoadingBtnPrint, setIsLoadingBtnPrint] = useState<boolean>(false);
  const productSearchRef = createRef<CustomAutoComplete>();

  const { id } = useParams<InventoryParams>();
  const idNumber = parseInt(id);
  const [hasError, setHasError] = useState<boolean>(false);
  const [isReRender, setIsReRender] = useState<boolean>(false);
  const [isReRenderTotalOnHand, setIsReRenderTotalOnHand] = useState<boolean>(false);
  const [isRun, setIsRun] = useState<boolean>(false);
  const [isVisibleModalNotice, setIsVisibleModalNotice] = useState<boolean>(false);
  const [isVisibleModalSummaryNotice, setIsVisibleModalSummaryNotice] = useState<boolean>(false);
  const [isDisabledIncurredRecordBtn, setIsDisabledIncurredRecordBtn] = useState(true);
  const [isShowModalConfirmDeleteFile, setIsShowModalConfirmDeleteFile] = useState(false);
  const [incurredRecordNumber, setIncurredRecordNumber] = useState(0);
  const [incurredAuditRecords, setIncurredAuditRecords] = useState<Array<IncurredAuditRecordType>>(
    [],
  );
  const [incurredAuditRecordsMap, setIncurredAuditRecordsMap] = useState<
    Map<string, Array<IncurredAuditRecordType>>
  >(new Map());
  const [incurredAdjustRecords, setIncurredAdjustRecords] = useState<
    Array<IncurredAuditRecordType>
  >([]);
  const [incurredAdjustRecordsMap, setIncurredAdjustRecordsMap] = useState<
    Map<string, Array<IncurredAuditRecordType>>
  >(new Map());

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
  const [isReSearch, setIsReSearch] = useState<boolean>(false);
  const [selectedFile, setSelectedFile] = useState<number | null>(null);
  const [selectedFileToDelete, setSelectedFileToDelete] = useState<number | null>(null);

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

  const [objSummaryTableByAudit, setObjSummaryTableByAudit] = useState<any>({
    deviant: {
      on_hand: 0,
      real_on_hand: 0,
      total_excess: 0,
      total_missing: 0,
      total_stock: 0,
      total_shipping: 0,
      total_on_way: 0,
    },
    total: {
      on_hand: 0,
      real_on_hand: 0,
      total_excess: 0,
      total_missing: 0,
      total_stock: 0,
      total_shipping: 0,
      total_on_way: 0,
    },
  });

  const isShowSummaryTourVar = "isShowSummaryTour";
  const isShowAuditTourVar = "isShowAuditTour";

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

  const onSearchProductDebounce = debounce((key: string) => {
    onSearchProduct(key);
  }, 300);

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

      dispatch(showLoading());

      addItemApi(idNumber, data).then((res) => {
        dispatch(hideLoading());
        if (!res) return;

        form.setFieldsValue({
          version: form.getFieldValue("version") + 1
        });

        setIsRerenderTab(!isRerenderTab);

        if (activeTab === "1") {
          callApiNative(
            { isShowError: false },
            dispatch,
            getLinesItemAdjustmentApi,
            idNumber,
            `page=${dataLinesItem.metadata.page}&limit=${dataLinesItem.metadata.limit}&type=
            total"`,
          ).then((res) => {
            setTotal(res.metadata.total);
          });
        } else {
        }

        getTotalOnHandApi().then((res) => {
          if (!res) return;
          setObjSummaryTableByAudit(res);
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
      setIsLoadingBtnPrint(false);
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

      const attachedFiles = data?.attached_files;

      dispatch(
        inventoryUploadFileAction({ files: files }, (data: false | Array<string>) => {
          let newFileListUpdate = [...fileListUpdate];
          let index = newFileListUpdate.findIndex((item) => item.uid === uuid);
          if (!!data) {
            if (index !== -1) {
              newFileListUpdate[index].status = "done";
              newFileListUpdate[index].url = data[0];

              const fileName = newFileListUpdate[index].name;
              const fileNameFormatted = `${fileName.slice(0, fileName.lastIndexOf("."))}@${userReducer.account?.code}-${userReducer.account?.full_name}-${moment(new Date())
                .format(FORMAT_DATE_UPLOAD_FILE)}${newFileListUpdate[index]
                .name.slice(fileName.lastIndexOf("."), fileName.length)}`;

              const fileFiltered = attachedFiles?.filter((item) => item.name.slice(0, item.name.indexOf('@')) === fileName.slice(0, fileName.lastIndexOf(".")));

              if (fileFiltered && fileFiltered.length > 0) {
                showError("Tên file đính kèm đã tồn tại");
                return;
              }

              updateFile(fileNameFormatted, data[0]).then();
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

  const updateAdjustment = (newNote: string | null) => {
    const dataUpdate = {
      ...data,
      note: newNote || data?.note,
      version: form.getFieldValue("version"),
      line_items: dataLinesItem.items,
      list_attached_files: form.getFieldValue("list_attached_files"),
    } as InventoryAdjustmentDetailItem;

    if (data && dataUpdate) {
      dispatch(
        updateInventoryAdjustmentAction(data.id, dataUpdate, (res) => {
          dispatch(hideLoading());
          if (res) {
            showSuccess("Cập nhật phiếu kiểm kho thành công");
            if (data?.note !== newNote) {
              form.setFieldsValue({
                version: Number(form.getFieldValue("version")) + 1
              });
            }

            setData({
              ...data,
              note: newNote || data.note,
            });

            return;
          }

          showError("Cập nhật phiếu kiểm kho thất bại");
        }),
      );
    } else {
      dispatch(hideLoading());
    }
  };

  const updateFile = async (name: string, url: string) => {
    const attachedFile = {
      name,
      url
    };

    const res = await addAttachedFile(data?.id, attachedFile);
    if (res.code === HttpStatus.SUCCESS) {
      showSuccess("Thêm mới file đính kèm thành công");
      getDetailInventoryAdjustment().then();
      return;
    }

    showError("Thêm mới file đính kèm thất bại");
  };

  const updateAuditedBys = () => {
    const dataUpdate = form.getFieldsValue(true);
    if (data && dataUpdate && dataUpdate.audited_bys.length > 0 && dataUpdate.audited_bys.length !== data.audited_bys?.length) {
      dispatch(showLoading());
      dispatch(
        updateInventoryAdjustmentAction(data.id, dataUpdate, () => {
          form.setFieldsValue({ version: form.getFieldValue("version") + 1 })
          setTimeout(() => {
            dispatch(hideLoading());
            showSuccess("Cập nhật người kiểm kho thành công");
          }, 0);
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
          onResult({
            ...result,
            version: result.version + 1
          });
          showSuccess("Hoàn thành kiểm kho thành công.");
          setIsShowConfirmAudited(false);
          setIsRun(false);
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
          onResult({
            ...result,
            version: result.version + 1
          });
          showSuccess("Cân tồn kho thành công.");
          setIsShowConfirmAdj(false);
        }
      }),
    );
  }, [dispatch, data?.id, onResult]);

  const onResultDataTable = useCallback((result: PageResponse<LineItemAdjustment> | false) => {
    if (result) {
      setTotal(result.metadata.total);
    }
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
      setObjSummaryTableByAudit(res);
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
    BaseAxios.get(
      `${ApiConfig.INVENTORY_ADJUSTMENT}/inventory-adjustment/${id}/lines-item?page=1&limit=30&type=total`,
    ).then((res) => {
      if (res) {
        setTotal(res.data.metadata.total);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps,
  }, []);

  const getDetailInventoryAdjustment = async () => {
    const response = await callApiNative(
      { isShowError: true },
      dispatch,
      getDetailInventorAdjustmentGetApi,
      idNumber,
    );

    dispatch(hideLoading());

    if (response) {
      onResult(response);

      if (response?.status === STATUS_INVENTORY_ADJUSTMENT_CONSTANTS.INITIALIZING) {
        setTimeout(() => {
          getDetailInventoryAdjustment().then();
        }, 3000);
        return;
      }

      getTotalOnHandFunc();

      dispatch(
        getLinesItemAdjustmentAction(idNumber, `page=1&limit=30&type=total`, onResultDataTable),
      );

      setIsLoadingBtn(false);
    }
  };

  useEffect(() => {
    dispatch(showLoading());
    getDetailInventoryAdjustment().then();

    // eslint-disable-next-line react-hooks/exhaustive-deps,
  }, [idNumber, isReRender]);

  const editPermission = [InventoryAdjustmentPermission.update];

  const [isHaveEditPermission] = useAuthorization({
    acceptPermissions: editPermission,
    not: false,
  });

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
      onSearch={onSearchProductDebounce}
      dropdownMatchSelectWidth={456}
      style={{ width: "100%" }}
      showAdd={true}
      isNotPermissionAudit={!isPermissionAudit}
      textAdd="+ Thêm mới sản phẩm"
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
      setIsLoadingBtnPrint(true);
      dispatch(
        InventoryAdjustmentGetPrintProductAction(
          `type=${type}`,
          data.id,
          printContentProductCallback,
        ),
      );
    }
  };

  const convertRecordToMap = (data: Array<IncurredAuditRecordType>) => {
    const auditRecordsMap = new Map();

    data.forEach((record: IncurredAuditRecordType) => {
      if (auditRecordsMap.has(record.code)) {
        auditRecordsMap.set(record.code, [...auditRecordsMap.get(record.code), record]);
      } else {
        auditRecordsMap.set(record.code, [record]);
      }
    });

    return auditRecordsMap;
  };

  const sortRecordByCode = (data: Array<IncurredAuditRecordType>) => {
    return data.sort((a: IncurredAuditRecordType, b: IncurredAuditRecordType) => {
      return b.code < a.code ? -1 : b.code > a.code ? 1 : 0;
    });
  };

  const checkIncurredRecord = async (event: React.MouseEvent<HTMLElement>) => {
    event.preventDefault();
    dispatch(showLoading());

    const res = await callApiNative(
      { isShowLoading: false },
      dispatch,
      checkIncurredRecordApi,
      data?.id,
    );

    dispatch(hideLoading());

    if (res && res.transaction_while_audit && res.transaction_while_audit.length > 0) {
      const isShowTour = localStorage.getItem(isShowAuditTourVar);
      if (!isShowTour) {
        setTimeout(() => {
          setIsRun(true);
        }, 300);
      }

      setIsVisibleModalNotice(true);

      setIncurredAuditRecordsMap(convertRecordToMap(res.transaction_while_audit));
      setIncurredAuditRecords(sortRecordByCode(res.transaction_while_audit));
      localStorage.setItem(isShowAuditTourVar, "false");

      return;
    }

    setIsShowConfirmAudited(true);
  };

  const allApiCheckIncurredRecord = async () => {
    const res = await callApiNative(
      { isShowLoading: false },
      dispatch,
      checkIncurredRecordApi,
      data?.id,
    );

    if (res?.transaction_while_audit?.length > 0 || res?.transaction_while_adjust?.length > 0) {
      setIsDisabledIncurredRecordBtn(false);
      setIncurredAuditRecords(sortRecordByCode(res.transaction_while_audit));
      setIncurredAuditRecordsMap(convertRecordToMap(res.transaction_while_audit));
      setIncurredAdjustRecords(sortRecordByCode(res.transaction_while_adjust));
      setIncurredAdjustRecordsMap(convertRecordToMap(res.transaction_while_adjust));
      setIncurredRecordNumber(
        res.transaction_while_audit.length + res.transaction_while_adjust.length,
      );
    }
  };

  useEffect(() => {
    if (data && data.status === STATUS_INVENTORY_ADJUSTMENT.ADJUSTED.status) {
      allApiCheckIncurredRecord().then();
    }
    // eslint-disable-next-line
  }, [data]);

  const showModalIncurredRecord = async (event: React.MouseEvent<HTMLElement>) => {
    event.preventDefault();

    const isShowSummaryTour = localStorage.getItem(isShowSummaryTourVar);
    if (!isShowSummaryTour) {
      setTimeout(() => {
        setIsRun(true);
      }, 300);
    }
    setIsVisibleModalSummaryNotice(true);
    localStorage.setItem(isShowSummaryTourVar, "false");
  };

  const showModalConfirmDelete = (id: number) => {
    setSelectedFileToDelete(id);
    setIsShowModalConfirmDeleteFile(true);
  };

  const editFileName = (id: number) => {
    setSelectedFile(id);
    setTimeout(() => {
      const input = document.getElementById(String(id)) as HTMLInputElement;
      input?.focus();
      input?.setSelectionRange(0, input.value.indexOf('@'));
    }, 100)
  };

  const deleteFile = async () => {
    const res = await deleteAttachedFile(data?.id, selectedFileToDelete);
    if (res.code === HttpStatus.SUCCESS) {
      showSuccess("Xóa file đính kèm thành công");
      getDetailInventoryAdjustment().then();
      setSelectedFile(null);
      setIsShowModalConfirmDeleteFile(false);
      return;
    }

    showError("Xóa file đính kèm thất bại");
  };

  const cancelEditFileName = () => {
    setSelectedFile(null);
  };

  const saveFileName = async (id: number) => {
    const input = document.getElementById(String(id)) as HTMLInputElement;

    const fileFiltered = data?.attached_files?.filter((item) => item.name.slice(0, item.name.indexOf('@')) === input.value.slice(0, input.value.indexOf('@')));

    if (fileFiltered && fileFiltered.length > 0) {
      showError("Tên file đính kèm đã tồn tại");
      return;
    }

    const attachedFile = {
      name: input.value !== '' ? input.value.trim() : input.value
    };

    const res = await updateAttachedFile(data?.id, attachedFile, id);
    if (res.code === HttpStatus.SUCCESS) {
      showSuccess("Cập nhật file đính kèm thành công");
      getDetailInventoryAdjustment().then();
      setSelectedFile(null);
      return;
    }

    showError("Cập nhật file đính kèm thất bại");
  }

  const downloadAttachedFile = async (url: string, name: string) => {
    const urlDecode = decodeURI(url);
    const res = await renameAttachedFileApi({
      url: urlDecode.slice(urlDecode.indexOf('yody-file/'), url.length),
      new_url: name,
    });

    if (res.code === HttpStatus.SUCCESS) {
      saveAs(res.data);
    }
  };

  const handleKeyPress = (e: KeyboardEvent) => {
    switch (e.key) {
      case KEY.ESC:
        cancelEditFileName();
        break;
      case KEY.ENTER:
        if (selectedFile) {
          saveFileName(selectedFile).then();
        }
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    window.addEventListener("keyup", handleKeyPress);
    return () => {
      window.removeEventListener("keyup", handleKeyPress);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedFile]);

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
                <Col span={24} md={6}>
                  <div className="label label-green mb-20 mt-10">
                    <div>Quét được</div>
                    <div style={{ color: "#FFFFFF", fontSize: 18 }}>
                      {formatCurrency(objSummaryTableByAudit.total.real_on_hand)}/
                      {formatCurrency(objSummaryTableByAudit.total.on_hand)}
                    </div>
                    <img src={ScanIcon} alt="scan" className="icon" />
                  </div>

                  <div className="label label-red">
                    <div>Thừa/thiếu</div>
                    <div style={{ fontSize: 18 }}>
                      {objSummaryTableByAudit.total.total_excess === 0 ||
                      !objSummaryTableByAudit.total.total_excess ? (
                        0
                      ) : (
                        <span style={{ color: "#FFFFFF" }}>
                          +{formatCurrency(objSummaryTableByAudit.total.total_excess)}
                        </span>
                      )}
                      {objSummaryTableByAudit.total.total_excess !== null &&
                      objSummaryTableByAudit.total.total_missing !== null ? (
                        <Space>/</Space>
                      ) : (
                        ""
                      )}
                      {objSummaryTableByAudit.total.total_missing === 0 ||
                      !objSummaryTableByAudit.total.total_missing ? (
                        0
                      ) : (
                        <span style={{ color: "#FFFFFF" }}>
                          {formatCurrency(objSummaryTableByAudit.total.total_missing)}
                        </span>
                      )}
                    </div>
                    <img src={CloseCircleIcon} alt="close" className="icon" />
                  </div>
                </Col>
                <Col span={24} md={8}>
                  <Row className="margin-bottom-15 mt-10">
                    <Col span={6} className="title">
                      Mã phiếu:
                    </Col>
                    <Col span={18} className="font-weight-500">
                      {data.code}
                    </Col>
                  </Row>

                  <Row className="margin-bottom-15">
                    <Col span={6} className="title">
                      Loại kiểm:
                    </Col>
                    <Col span={18} className="font-weight-500">
                      {INVENTORY_ADJUSTMENT_AUDIT_TYPE_ARRAY.find(
                        (e) => e.value === data.audit_type,
                      )?.name ?? ""}
                    </Col>
                  </Row>

                  <Row className="margin-bottom-15">
                    <Col span={6} className="title">
                      Người tạo:
                    </Col>
                    <Col span={18} className="font-weight-500">
                      {`${data.created_by} - ${data?.created_name}`}
                    </Col>
                  </Row>

                  <Row className="margin-bottom-15">
                    <Col span={6} className="title">
                      Người kiểm:
                    </Col>
                    <Col span={18} className="font-weight-500">
                      {data.status === STATUS_INVENTORY_ADJUSTMENT.DRAFT.status &&
                      isPermissionAudit &&
                      isHaveEditPermission ? (
                        <Form.Item
                          style={{ margin: 0 }}
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
                    <Col span={6} className="title">
                      Trạng thái:
                    </Col>
                    <Col span={18} className="font-weight-500">
                      <div className={classTag}>{textTag}</div>
                    </Col>
                  </Row>
                </Col>

                <Col span={24} md={10}>
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
                      {Array.isArray(data.attached_files) &&
                        data.attached_files.length > 0 &&
                        data.attached_files?.map((file, index: number) => {
                          return (
                            <div className="container-file-pin">
                              {selectedFile !== file.id && (
                                // eslint-disable-next-line jsx-a11y/anchor-is-valid
                                <a
                                  key={index}
                                  className="file-pin mr-15"
                                  rel="noreferrer"
                                  onClick={() => downloadAttachedFile(file.url, file.name)}
                                >
                                  <PaperClipOutlined /> {file.name}
                                </a>
                              )}
                              {selectedFile === file.id ? (
                                <>
                                  <Input id={String(file.id)} className="input-editable mr-15" defaultValue={file.name} />
                                  <CloseCircleOutlined onClick={cancelEditFileName} className="mr-5 cursor-p" style={{ fontSize: 18 }} />
                                  <SaveOutlined onClick={() => saveFileName(file.id)} className="mr-5 cursor-p" style={{ fontSize: 18 }} />
                                </>
                              ) : (
                                <EditOutlined  onClick={() => editFileName(file.id)} className="mr-5 cursor-p" style={{ fontSize: 18 }} />
                              )}
                              <DeleteOutlined onClick={() => showModalConfirmDelete(file.id)} className="cursor-p" style={{ fontSize: 18 }} />
                            </div>
                          );
                        })}

                      <Form.Item>
                        {data.status !== STATUS_INVENTORY_ADJUSTMENT_CONSTANTS.ADJUSTED &&
                          isPermissionAudit &&
                          isHaveEditPermission && (
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
                        isHaveEditPermission={isPermissionAudit && isHaveEditPermission}
                        note={data.note}
                        title=""
                        color={primaryColor}
                        onOk={(newNote) => {
                          dispatch(showLoading());
                          updateAdjustment(newNote);
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
                        <Row gutter={12}>
                          <Col flex="auto">
                            {isHaveEditPermission &&
                              data.status !== STATUS_INVENTORY_ADJUSTMENT.ADJUSTED.status &&
                              data.status !== STATUS_INVENTORY_ADJUSTMENT.AUDITED.status &&
                              renderSearchComponent()}
                          </Col>
                          <Col flex="auto">
                            <Input
                              name="key_search"
                              onChange={(e) => {
                                onChangeKeySearch(e.target.value);
                              }}
                              onKeyPress={(e) => e.key === "Enter" && setIsReSearch(!isReSearch)}
                              style={{ marginLeft: 8 }}
                              placeholder="Tìm kiếm sản phẩm trong phiếu"
                              addonAfter={
                                <SearchOutlined
                                  onClick={() => {
                                    setIsReSearch(!isReSearch);
                                  }}
                                  style={{ color: "#2A2A86" }}
                                />
                              }
                            />
                          </Col>
                          <Col flex="120px">
                            <Button
                              loading={isLoadingBtnPrint}
                              disabled={isLoadingBtnPrint}
                              onClick={() => onPrintProductAction("deviant")}
                              type="primary"
                              ghost
                              style={{ padding: "0 25px", fontWeight: 400, margin: "0 10px" }}
                            >
                              <img src={IconPrint} alt="" style={{ paddingRight: "10px" }} /> In
                              danh sách
                            </Button>
                          </Col>
                        </Row>
                        {activeTab === "1" && (
                          <InventoryAdjustmentListAll
                            isPermissionEdit={isHaveEditPermission}
                            setIsReRender={() => {
                              setIsReRenderTotalOnHand((isReRenderTotalOnHand) => {
                                return !isReRenderTotalOnHand;
                              });
                            }}
                            setIncreaseVersion={() => {
                              const version = form.getFieldValue("version");
                              form.setFieldsValue({ version: version + 1 });
                            }}
                            setDataTab={(value) => setDataLinesItem(value)}
                            tab={activeTab}
                            isReSearch={isReSearch}
                            isPermissionAudit={isPermissionAudit}
                            keySearch={activeTab === "1" ? keySearchHistory : keySearchAll}
                            tableLoading={tableLoading}
                            isRerenderTab={isRerenderTab}
                            objSummaryTableByAuditTotal={objSummaryTableByAudit.deviant}
                            idNumber={idNumber}
                            data={data}
                          />
                        )}
                      </TabPane>
                      <TabPane tab={`Tất cả (${total})`} key="2">
                        <Input.Group className="display-flex">
                          {isHaveEditPermission && renderSearchComponent()}
                          <Input
                            name="key_search"
                            onChange={(e) => {
                              onChangeKeySearch(e.target.value);
                            }}
                            onKeyPress={(e) => e.key === "Enter" && setIsReSearch(!isReSearch)}
                            style={{ marginLeft: 8 }}
                            placeholder="Tìm kiếm sản phẩm trong phiếu"
                            addonAfter={
                              <SearchOutlined
                                onClick={() => {
                                  setIsReSearch(!isReSearch);
                                }}
                                style={{ color: "#2A2A86" }}
                              />
                            }
                          />
                          <Button
                            loading={isLoadingBtnPrint}
                            disabled={isLoadingBtnPrint}
                            onClick={() => onPrintProductAction("total")}
                            type="primary"
                            ghost
                            style={{ padding: "0 25px", fontWeight: 400, margin: "0 10px" }}
                          >
                            <img src={IconPrint} alt="" style={{ paddingRight: "10px" }} /> In danh
                            sách
                          </Button>
                        </Input.Group>
                        {activeTab === "2" && (
                          <InventoryAdjustmentListAll
                            isPermissionEdit={isHaveEditPermission}
                            isReSearch={isReSearch}
                            setIsReRender={() => {
                              setIsReRenderTotalOnHand((isReRenderTotalOnHand) => {
                                return !isReRenderTotalOnHand;
                              });
                            }}
                            setIncreaseVersion={() => {
                              const version = form.getFieldValue("version");
                              form.setFieldsValue({ version: version + 1 });
                            }}
                            tab={activeTab}
                            isPermissionAudit={isPermissionAudit}
                            keySearch={keySearchAll}
                            tableLoading={tableLoading}
                            isRerenderTab={isRerenderTab}
                            setTotalTabOne={(value) => setDataLinesItem(value)}
                            objSummaryTableByAuditTotal={objSummaryTableByAudit.total}
                            idNumber={idNumber}
                            data={data}
                            setTotalProp={(value) => setTotal(value)}
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
                    data.status !== STATUS_INVENTORY_ADJUSTMENT.ADJUSTED.status &&
                    isPermissionAudit &&
                    isHaveEditPermission && (
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
                      disabled={isDisabledIncurredRecordBtn}
                      onClick={(event) => showModalIncurredRecord(event)}
                      type="primary"
                      ghost
                      style={{ padding: "0 25px", fontWeight: 400, margin: "0 10px" }}
                    >
                      Tổng hợp phát sinh ({incurredRecordNumber})
                    </Button>
                  )}
                  {data.status === STATUS_INVENTORY_ADJUSTMENT.ADJUSTED.status && (
                    <Button
                      onClick={() => {
                        setIsOpenModal(true);
                      }}
                      type="primary"
                      ghost
                      style={{ padding: "0 25px", fontWeight: 400, margin: "0 10px" }}
                    >
                      <img src={InventoryReportIcon} alt="" style={{ paddingRight: "10px" }} /> Xem
                      báo cáo kiểm
                    </Button>
                  )}
                  {data.status !== STATUS_INVENTORY_ADJUSTMENT.DRAFT.status &&
                    data.status !== STATUS_INVENTORY_ADJUSTMENT.INITIALIZING.status && (
                      <AuthWrapper acceptPermissions={[InventoryAdjustmentPermission.print]}>
                        <Button
                          onClick={() => {
                            onPrintAction();
                          }}
                          type="primary"
                          ghost
                          style={{ padding: "0 25px", fontWeight: 400, margin: "0 10px" }}
                        >
                          <Space>
                            <PrinterOutlined /> In phiếu
                          </Space>
                        </Button>
                      </AuthWrapper>
                    )}
                  <AuthWrapper acceptPermissions={[InventoryAdjustmentPermission.export]}>
                    <Button
                      loading={isLoadingBtn}
                      disabled={isLoadingBtn}
                      onClick={() => {
                        setShowExportModal(true);
                        onExport();
                      }}
                      type="primary"
                      ghost
                      icon={<img src={exportIcon} style={{ marginRight: 8 }} alt="" />}
                      style={{ padding: "0 25px", fontWeight: 400, margin: "0 10px" }}
                    >
                      <Space>Xuất excel</Space>
                    </Button>
                  </AuthWrapper>
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
                          style={{ marginLeft: 10 }}
                          type="primary"
                          onClick={checkIncurredRecord}
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
                      <NoticeIncurredRecordTour
                        confirmAudit={() => onUpdateOnlineInventory()}
                        isRun={isRun}
                        setIsRun={setIsRun}
                        isVisibleModalNotice={isVisibleModalNotice}
                        setIsVisibleModalNotice={setIsVisibleModalNotice}
                        incurredAuditRecords={incurredAuditRecords}
                        incurredAuditRecordsMap={incurredAuditRecordsMap}
                      />
                    </>
                  )}
                  {data.status === STATUS_INVENTORY_ADJUSTMENT.AUDITED.status && (
                    <AuthWrapper acceptPermissions={[InventoryAdjustmentPermission.adjust]}>
                      <Button
                        type="primary"
                        onClick={() => {
                          setIsShowConfirmAdj(true);
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
            {isShowConfirmAudited && (
              <ModalConfirm
                onCancel={() => {
                  setIsShowConfirmAudited(false);
                }}
                onOk={() => {
                  onUpdateOnlineInventory();
                }}
                okText="Đồng ý"
                cancelText="Hủy"
                title={`Bạn có chắc chắn Hoàn thành kiểm?`}
                subTitle='Phiếu kiểm kho sẽ chuyển sang trạng thái "Đã kiểm" và không thể thay đổi số lượng thực tồn.'
                visible={isShowConfirmAudited}
              />
            )}

            {isShowConfirmAdj && (
              <ModalConfirm
                onCancel={() => {
                  setIsShowConfirmAdj(false);
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

        {isVisibleModalSummaryNotice && (
          <SummaryIncurredRecordTour
            isRun={isRun}
            setIsRun={setIsRun}
            isVisibleModalSummaryNotice={isVisibleModalSummaryNotice}
            setIsVisibleModalSummaryNotice={setIsVisibleModalSummaryNotice}
            incurredAuditRecords={incurredAuditRecords}
            incurredAuditRecordsMap={incurredAuditRecordsMap}
            incurredAdjustRecords={incurredAdjustRecords}
            incurredAdjustRecordsMap={incurredAdjustRecordsMap}
          />
        )}

        {isShowModalConfirmDeleteFile && (
          <ModalDeleteConfirm
            visible={isShowModalConfirmDeleteFile}
            okText={"Đồng ý"}
            onOk={deleteFile}
            cancelText={"Hủy"}
            onCancel={() => setIsShowModalConfirmDeleteFile(false)}
            content={<div>Bạn có chắc chắn muốn <span className="font-weight-500">XÓA</span> file đính kèm trên phiếu <span className="font-weight-500">{data?.code}</span>?</div>}
          />
        )}
      </ContentContainer>
    </StyledWrapper>
  );
};

export default DetailInventoryAdjustment;
