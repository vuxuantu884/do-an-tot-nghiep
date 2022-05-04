import React, { createRef, FC, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { StyledWrapper } from "./styles";
import exportIcon from "assets/icon/export.svg";
import UrlConfig, { BASE_NAME_ROUTER, InventoryTabUrl } from "config/url.config";
import { Button, Card, Col, Form, Input, Radio, Row, Space, Tabs, Tag, Tooltip, Upload } from "antd";
import arrowLeft from "assets/icon/arrow-back.svg";
import imgDefIcon from "assets/img/img-def.svg";
import PlusOutline from "assets/icon/plus-outline.svg";
import {
  CodepenOutlined,
  InfoCircleOutlined,
  PaperClipOutlined, PieChartOutlined,
  PrinterOutlined,
  ReloadOutlined,
  SearchOutlined,
  UploadOutlined, UserSwitchOutlined,
} from "@ant-design/icons";
import BottomBarContainer from "component/container/bottom-bar.container";
import { useHistory, useParams } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import {
  inventoryGetVariantByStoreAction,
  inventoryUploadFileAction,
} from "domain/actions/inventory/stock-transfer/stock-transfer.action";
import {
  InventoryAdjustmentDetailItem,
  LineItemAdjustment,
} from "model/inventoryadjustment";
import {Link} from "react-router-dom";
import ContentContainer from "component/container/content.container";
import InventoryAdjustmentTimeLine from "./conponents/InventoryAdjustmentTimeLine";
import { VariantResponse } from "model/product/product.model";
import CustomAutoComplete from "component/custom/autocomplete.cusom";
import { showError, showSuccess } from "utils/ToastUtils";
import ProductItem from "screens/purchase-order/component/product-item";
import PickManyProductModal from "screens/purchase-order/modal/pick-many-product.modal";
import _, { parseInt } from "lodash";
import {
  INVENTORY_ADJUSTMENT_AUDIT_TYPE_ARRAY,
  STATUS_INVENTORY_ADJUSTMENT,
} from "../ListInventoryAdjustment/constants";
import { PageResponse } from "model/base/base-metadata.response";
import InventoryAdjustmentHistory from "./conponents/InventoryAdjustmentHistory";
import InventoryAdjustmentListAll from "./conponents/InventoryAdjustmentListAll";
import {
  adjustInventoryAction,
  getDetailInventoryAdjustmentAction,
  getLinesItemAdjustmentAction,
  InventoryAdjustmentGetPrintContentAction,
  updateInventoryAdjustmentAction,
  updateItemOnlineInventoryAction,
  updateOnlineInventoryAction,
} from "domain/actions/inventory/inventory-adjustment.action";
import CustomTable, { ICustomTableColumType } from "component/table/CustomTable";
import { INVENTORY_AUDIT_TYPE_CONSTANTS, STATUS_INVENTORY_ADJUSTMENT_CONSTANTS } from "../constants";
import { HttpStatus } from "config/http-status.config";

import { UploadRequestOption } from "rc-upload/lib/interface";
import InventoryTransferExportModal from "./conponents/ExportModal";
import { useReactToPrint } from "react-to-print";
import { formatCurrency, generateQuery } from "utils/AppUtils";
import purify from "dompurify";
import { AccountResponse } from "model/account/account.model";
import { searchAccountPublicAction } from "domain/actions/account/account.action";
import { StyledComponent } from "screens/products/product/component/RowDetail/style";
import ModalConfirm from "component/modal/ModalConfirm";
import { StoreResponse } from "model/core/store.model";
import { ConvertFullAddress } from "utils/ConvertAddress";
import { UploadFile } from "antd/lib/upload/interface";
import InventoryTransferImportModal from "./conponents/ImportModal";
import { getFile, getFileV2, importFile,exportFileV2 } from "service/other/import.inventory.service";
import { ImportResponse } from "model/other/files/export-model";
import NumberInput from "component/custom/number-input.custom";
import AuthWrapper from "component/authorization/AuthWrapper";
import { InventoryAdjustmentPermission } from "config/permissions/inventory-adjustment.permission";
import useAuthorization from "hook/useAuthorization";
import TextArea from "antd/es/input/TextArea";
import { AiOutlineClose } from "react-icons/ai";
import CustomPagination from "component/table/CustomPagination";
import { callApiNative } from "utils/ApiUtils";
import {
  addLineItem,
  deleteLineItem,
  getTotalOnHand,
  updateOnHandItemOnlineInventoryApi, updateReasonItemOnlineInventoryApi,
} from "service/inventory/adjustment/index.service";
import { RootReducerType } from "../../../model/reducers/RootReducerType";
import { searchVariantsApi } from "../../../service/product/product.service";
import EditNote from "../../order-online/component/edit-note";

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

const arrTypeNote = [
  {key: 1,value: "XNK sai quy trình"},
  {key: 2,value: "Sai trạng thái đơn hàng"},
  {key: 3,value: "Thất thoát"},
]

const DetailInvetoryAdjustment: FC = () => {
  const [form] = Form.useForm();
  const [activeTab, setActiveTab] = useState<string>("1");
  const history = useHistory();
  const dispatch = useDispatch();
  const [data, setData] = useState<InventoryAdjustmentDetailItem>();
  const [dataTab, setDataTab] = useState<any>();
  const [isShowConfirmAdited, setIsShowConfirmAdited] = useState<boolean>(false);
  const [isShowConfirmAdj, seIsShowConfirmAdj] = useState<boolean>(false);

  const [isError, setError] = useState(false);
  const [isLoading, setLoading] = useState<boolean>(false);
  const productSearchRef = createRef<CustomAutoComplete>();

  const {id} = useParams<InventoryParams>();
  const idNumber = parseInt(id);
  const [keySearch, setKeySearch] = useState<string>("");
  const [visibleManyProduct, setVisibleManyProduct] = useState<boolean>(false);
  const [hasError, setHasError] = useState<boolean>(false);
  const [isReRender, setIsReRender] = useState<boolean>(false);

  const [printContent, setPrintContent] = useState("");
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

  const [accounts, setAccounts] = useState<Array<AccountResponse>>([]);
  const [formStoreData, setFormStoreData] = useState<StoreResponse | null>();
  const [dataLinesItem, setDatalinesItem] = useState<PageResponse<LineItemAdjustment>>({
    metadata: {
      limit: 30,
      page: 1,
      total: 0,
    },
    items: [],
  });
  const [tableLoading, setTableLoading] = useState(true);
  const [isPermissionAudit, setIsPermissionAudit] = useState(false);

  const [objSummaryTableByAuditTotal, setObjSummaryTableByAuditTotal] = useState<any>({
    onHand: 0,
    realOnHand: 0,
    totalExcess: 0,
    totalMissing: 0,
  });

  //phân quyền
  const [allowUpdate] = useAuthorization({
    acceptPermissions: [InventoryAdjustmentPermission.update],
  });

  const setDataAccounts = useCallback((data: PageResponse<AccountResponse> | false) => {
    if (!data) {
      return;
    }
    setAccounts(data.items);
  }, []);

  const userReducer = useSelector(
    (state: RootReducerType) => state.userReducer
  );

  useEffect(() => {
    if (!data) return;
    const auditedByFiltered = data.audited_bys && data?.audited_bys?.length > 0 ? data?.audited_bys?.filter((i: any) => i.toUpperCase() === userReducer.account?.code.toUpperCase()) : [];
    setIsPermissionAudit(userReducer.account?.code.toUpperCase() === data.created_by.toUpperCase() || auditedByFiltered.length > 0)
  }, [data, userReducer.account?.code]);

  useEffect(() => {
    if (accounts.length === 0 || !data) return;

    dispatch(searchAccountPublicAction({ codes: data.audited_bys?.join(',') }, setDataAccounts));
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
        )
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

  const onResultDataTable = useCallback(
    (result: PageResponse<LineItemAdjustment> | false) => {
      setTableLoading(false);
      if (result) {
        setDatalinesItem({...result});
        setHasError(false);
      }
    },
    []
  );

  const addItemApi = async (adjustmentId: number, data: any) => {
    return await callApiNative(
      { isShowError: false },
      dispatch,
      addLineItem,
      adjustmentId,
      data
    );
  };

  const formatLineItemsData = (value: any) => {
    let variantPrice = value &&
      value.variant_prices &&
      value.variant_prices[0] &&
      value.variant_prices[0].retail_price;

    const {
      sku,
      barcode,
      id,
      name,
      variant_images,
      product,
      weight,
      weight_unit
    } = value;

    return {
      sku,
      barcode,
      variant_name: name || value.variant_name,
      variant_id: id || value.variant_id,
      variant_image: variant_images && variant_images.length > 0 ? variant_images[0].url : '',
      product_name: product ? product.name : value.product_name,
      product_id: product ? product.id : value.product_id,
      weight,
      weight_unit,
      real_on_hand: 0,
      on_hand_adj: 0 - (value.on_hand ?? 0),
      price: variantPrice ? variantPrice : value.price,
      on_hand: value.on_hand ?? 0
    }
  }

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
        setTableLoading(true);
        dispatch(
          getLinesItemAdjustmentAction(
            idNumber,
            `page=${dataLinesItem.metadata.page}&limit=${dataLinesItem.metadata.limit}&condition=${keySearch?.toLocaleLowerCase()}`,
            onResultDataTable,
          ),
        );

        getTotalOnHandApi().then((res) => {
          if (!res) return;
          setObjSummaryTableByAuditTotal(res);
        });
      })
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps,
    [dataLinesItem.items, resultSearch, keySearch, idNumber, dispatch, onResultDataTable]
  );

  const onPickManyProduct = useCallback(
    (result: Array<VariantResponse>) => {
      const newResult = result?.map((item) => {
        return formatLineItemsData(item);
      });

      setTableLoading(true);

      const data = {
        line_items: newResult,
      };

      addItemApi(idNumber, data).then((res) => {
        if (!res) return;
        setTableLoading(true);
        dispatch(
          getLinesItemAdjustmentAction(
            idNumber,
            `page=${dataLinesItem.metadata.page}&limit=${dataLinesItem.metadata.limit}&condition=${keySearch?.toLocaleLowerCase()}`,
            onResultDataTable,
          ),
        );

        getTotalOnHandApi().then((res) => {
          if (!res) return;
          setObjSummaryTableByAuditTotal(res);
        });

        setTableLoading(false);
        setHasError(false);
        setVisibleManyProduct(false);
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps,
    [dispatch, keySearch, idNumber, dataLinesItem.items, onResultDataTable]
  );
  const pageBreak = "<div class='pageBreak'></div>";
  const printContentCallback = useCallback(
    (printContent) => {
      const textResponse = printContent.map((single: any) => {
        return `<div class='singleOrderPrint'>` + single.html_content + "</div>";
      });
      let textResponseFormatted = textResponse.join(pageBreak);
      //xóa thẻ p thừa
      let result = textResponseFormatted.replaceAll("<p></p>", "");
      setPrintContent(result);
      handlePrint && handlePrint();
    },
    [handlePrint]
  );

  const onBeforeUpload = useCallback(() => {
  }, []);

  const onCustomRequest = (options: UploadRequestOption<any>) => {
    const {file} = options;
    let files: Array<File> = [];
    if (file instanceof File) {
      let uuid = file.uid;
      files.push(file);
      dispatch(
        inventoryUploadFileAction({files: files}, (data: false | Array<string>) => {
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
        })
      );
    }
  };

  const onCustomUpdateRequest = (options: UploadRequestOption<any>) => {
    const {file} = options;
    let files: Array<File> = [];
    if (file instanceof File) {
      let uuid = file.uid;
      files.push(file);
      dispatch(
        inventoryUploadFileAction({files: files}, (data: false | Array<string>) => {
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
              let newFileCurrent = [
                ...fileCurrent,
                data[0]
              ];
              form.setFieldsValue({list_attached_files: newFileCurrent});

              updateAdjustment(true);
            }
          } else {
            newFileListUpdate.splice(index, 1);
            showError("Upload file không thành công");
          }
          setFileListUpdate(newFileListUpdate);
        })
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
        store_id: data.adjusted_store_id
      };
      const queryParam = generateQuery(params);
      dispatch(
        InventoryAdjustmentGetPrintContentAction(queryParam, printContentCallback)
      );
    }
  };

  const reloadOnHand = async (item: any) => {
    setTableLoading(true);
    const product = await callApiNative({ isShowError: true }, dispatch, searchVariantsApi, {
      status: "active",
      store_ids: data?.store.id,
      variant_ids: item.variant_id,
    })

    if (product) {
      const res = await callApiNative({isShowError: false}, dispatch, updateOnHandItemOnlineInventoryApi,data?.id ?? 0, item.id, {
        on_hand: product?.items.length > 0 ? product?.items[0].on_hand : 0
      });

      if (res) {
        showSuccess("Cập nhật tồn trong kho thành công");
        setIsReRender(!isReRender);
      }
    } else {
      setTableLoading(false);
    }
  };

  const debounceChangeReason = () => {
    showSuccess("Nhập lý do thành công.");
  }

  const onChangeReason = useCallback(
    (value: string | null, row: LineItemAdjustment, dataItems: PageResponse<LineItemAdjustment>) => {
      row.note = value;

      dataItems.items.forEach((e)=>{
        if (e.variant_id === row.id) {
          e.note = row.note;
        }
      });

      setDatalinesItem({...dataItems});
      debounceChangeReason();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps,
    []
  );

  const handleNoteChange = useCallback(async (index:number, newValue: string,item: LineItemAdjustment) => {
    const value = newValue;
    if (value && value.indexOf('##') !== -1) {
      return;
    }

    item.note = value ?? "";
    if (item.note) {
      item.note = item.note.substring(item.note.lastIndexOf("#")+1,item.note.length);
    }

    const res = await callApiNative({isShowError: false},dispatch,updateReasonItemOnlineInventoryApi,data?.id ?? 0,item.id,item);

    if (res) {
      onChangeReason(item.note, item, dataLinesItem);
    }
  },[dispatch, data?.id, onChangeReason, dataLinesItem]);

  const defaultColumns: Array<ICustomTableColumType<any>> = [
    {
      title: "Ảnh",
      width: "60px",
      dataIndex: "variant_image",
      render: (value: string) => {
        return (
          <div className="product-item-image">
            <img src={value ? value : imgDefIcon} alt="" className="" />
          </div>
        );
      },
    },
    {
      title: "Sản phẩm",
      width: "120px",
      className: "ant-col-info",
      dataIndex: "variant_name",
      render: (value: string, record: VariantResponse) => (
        <div>
          <div>
            <div className="product-item-sku">
              <Link
                target="_blank"
                to={`${InventoryTabUrl.HISTORIES}?condition=${record.sku}&store_ids=${data?.adjusted_store_id}&page=1`}
              >
                {record.sku}
              </Link>
            </div>
            <div className="product-item-name">
              <span className="product-item-name-detail">{value}</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: () => {
        return (
          <>
            <div>Tồn trong kho</div>
            <div>({formatCurrency(objSummaryTableByAuditTotal.onHand)})</div>
          </>
        );
      },
      width: 100,
      align: "center",
      dataIndex: "on_hand",
      render: (value) => {
        return value || 0;
      },
    },
    {
      title: () => {
        return (
          <>
            <div>Số kiểm</div>
            <div>({formatCurrency(objSummaryTableByAuditTotal.realOnHand)})</div>
          </>
        );
      },
      dataIndex: "real_on_hand",
      align: "center",
      width: 100,
      render: (value, row: LineItemAdjustment) => {
        if (data?.status === STATUS_INVENTORY_ADJUSTMENT_CONSTANTS.DRAFT && allowUpdate) {
          return (
            <NumberInput
              disabled={!isPermissionAudit}
              min={0}
              maxLength={12}
              value={value}
              onBlur={(e:any) => debounceChangeRealOnHand(row, e.target.value !== '' ? e.target.value : 0)}
            />
          );
        } else {
          return value ?? "";
        }
      },
    },
    {
      title: () => {
        return (
          <>
            <div>Thừa/Thiếu</div>
            <Row align="middle" justify="center">
              {(objSummaryTableByAuditTotal.totalExcess === 0 || !objSummaryTableByAuditTotal.totalExcess) ? (
                ""
              ) : (
                <div style={{color: "#27AE60"}}>+{formatCurrency(objSummaryTableByAuditTotal.totalExcess)}</div>
              )}
              {objSummaryTableByAuditTotal.totalExcess && objSummaryTableByAuditTotal.totalMissing ? (
                <Space>/</Space>
              ) : (
                ""
              )}
              {(objSummaryTableByAuditTotal.totalMissing === 0 || !objSummaryTableByAuditTotal.totalMissing) ? (
                ""
              ) : (
                <div style={{ color: "red" }}>{formatCurrency(objSummaryTableByAuditTotal.totalMissing)}</div>
              )}
            </Row>
          </>
        );
      },
      align: "center",
      width: 150,
      render: (value, item) => {
        if (!item.on_hand_adj || item.on_hand_adj === 0) {
          return null;
        }
        if (item.on_hand_adj && item.on_hand_adj < 0) {
          return <div style={{ color: "red" }}>{item.on_hand_adj}</div>;
        } else {
          return <div style={{ color: "green" }}>+{item.on_hand_adj}</div>;
        }
      },
    },
    {
      title: <div>
        Lý do <Tooltip title={
        <div>
          <div>1.XNK sai quy trình</div>
          <div>2.Sai trạng thái đơn hàng</div>
          <div>3.Thất thoát</div>
        </div>
      }><InfoCircleOutlined type="primary" color="primary" /></Tooltip>
      </div>,
      dataIndex: "note",
      align: "left",
      width: 165,
      render: (value, row: LineItemAdjustment, index: number) => {
        let note = `${index}#${value}`;
        let tooltip = null;

        if (!arrTypeNote.find(e=>e.value === value)) {
          note = `${index}##${value}`;
          tooltip= value;
        }

        if (data?.status === STATUS_INVENTORY_ADJUSTMENT_CONSTANTS.DRAFT && allowUpdate) {
          return (
            <Radio.Group className="custom-radio-group" value={note} buttonStyle="solid" onChange={(e)=>{
              handleNoteChange(index,e.target.value,row).then();
            }}>
              <Tooltip placement="topLeft" title={arrTypeNote[0].value}>
                <Radio.Button style={{paddingLeft: 12,paddingRight:12}} value={`${index}#${arrTypeNote[0].value}`}>
                  <UserSwitchOutlined />
                </Radio.Button>
              </Tooltip>
              <Tooltip placement="topLeft" title={arrTypeNote[1].value}>
                <Radio.Button style={{paddingLeft: 12,paddingRight:12}} value={`${index}#${arrTypeNote[1].value}`}>
                  <CodepenOutlined />
                </Radio.Button>
              </Tooltip>
              <Tooltip placement="topLeft" title={arrTypeNote[2].value}>
                <Radio.Button style={{paddingLeft: 12,paddingRight:12}} value={`${index}#${arrTypeNote[2].value}`}>
                  <PieChartOutlined />
                </Radio.Button>
              </Tooltip>
              <Tooltip placement="topLeft" title={tooltip}>
                <EditNote
                  isGroupButton
                  note={tooltip}
                  title=""
                  onOk={(newNote) => {
                    handleNoteChange(index, newNote, row).then();
                  }}
                />
              </Tooltip>
            </Radio.Group>
          );
        }
        return value || "";
      },
    },
    {
      title: "",
      fixed: dataLinesItem?.items.length !== 0 && "right",
      width: 30,
      render: (value: string, row) => {
        return <>
          {data?.status === STATUS_INVENTORY_ADJUSTMENT.DRAFT.status && (
            <ReloadOutlined title="Cập nhật lại tồn trong kho" onClick={() => reloadOnHand(row)} />
          )}
        </>
      }
    },
    {
      title: "",
      fixed: "right",
      width: 50,
      render: (value: string, row) => {
        return <>
          {
            data?.audit_type === INVENTORY_AUDIT_TYPE_CONSTANTS.TOTAL &&
              row.on_hand === 0 && isPermissionAudit &&
            <Button
              onClick={() => onDeleteItem(Number(id), row.id)}
              className="item-delete"
              icon={<AiOutlineClose color="red" />}
            />
          }
        </>
      }
    }
  ];

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

        dispatch(
          getLinesItemAdjustmentAction(
            idNumber,
            `page=${dataLinesItem.metadata.page}&limit=${dataLinesItem.metadata.limit}`,
            onResultDataTable
          )
        );
      }
    },
    [form, dispatch, idNumber, dataLinesItem.metadata.page, dataLinesItem.metadata.limit, onResultDataTable]
  );

  const updateAdjustment = React.useMemo(() =>
  _.debounce((isUpdateFile = false) => {
    const dataUpdate = {...data,
      note: form.getFieldValue('note'),
      version: form.getFieldValue('version'),
      line_items: dataLinesItem.items,
      list_attached_files: form.getFieldValue('list_attached_files')} as InventoryAdjustmentDetailItem;

    if (data && dataUpdate) {
      dispatch(updateInventoryAdjustmentAction(data.id, dataUpdate, (res)=>{
        showSuccess("Cập nhật phiếu kiểm kho thành công");
        if (isUpdateFile) {
          setData({
            ...data,
            list_attached_files: res.list_attached_files
          });
        }
      }));
    }
  }, 500),
  [dispatch, data, form, dataLinesItem]
)

const onChangeNote = useCallback(
  (note: string) => {
    if (note && note.length > 500) return;
    updateAdjustment();
  },
  [updateAdjustment]
)

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
      })
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
      })
    );
  }, [dispatch, data?.id, onResult]);

  const onEnterFilterVariant = useCallback(
    (code: string) => {
      dispatch(
        getLinesItemAdjustmentAction(
          idNumber,
          `page=1&limit=30&condition=${code?.toLocaleLowerCase()}`,
          onResultDataTable
        )
      );
      setTableLoading(false);
    },
    [dispatch, idNumber, onResultDataTable]
  );

  type accountAudit = {
    user_name: string;
  };

  const RenderItemAuditBy = useCallback(
    (auditBY: accountAudit) => {
      const account = accounts.find(
        (e) => e.code.toLocaleLowerCase() === auditBY.user_name.toLocaleLowerCase()
      );

      return <div>{`${account?.code} - ${account?.full_name}`}</div>;
    },
    [accounts]
  );

  const onRealQuantityChange = useCallback(
    (quantity: number | any, row: LineItemAdjustment) => {
      const dataTableClone: Array<LineItemAdjustment> = _.cloneDeep(dataLinesItem.items);

      dataTableClone.forEach((item) => {
        quantity = quantity ?? 0;

        if (item.id === row.id) {
          item.real_on_hand = quantity;
          let totalDiff: number;
          totalDiff = quantity - item.on_hand;
          if (totalDiff === 0) {
            item.on_hand_adj = null;
            item.on_hand_adj_dis = null;
          } else if (item.on_hand < quantity) {
            item.on_hand_adj = totalDiff;
            item.on_hand_adj_dis = `+${totalDiff}`;
          } else if (item.on_hand > quantity) {
            item.on_hand_adj = totalDiff;
            item.on_hand_adj_dis = `${totalDiff}`;
          }
        }
      });
    },
    [dataLinesItem.items]
  );

  const onPageChange = useCallback(
    (page, size) => {
      setTableLoading(true);
      setDatalinesItem({
        ...dataLinesItem,
        metadata: {...dataLinesItem.metadata, page: page, limit: size},
      });

      dispatch(
        getLinesItemAdjustmentAction(
          idNumber,
          `page=${page}&limit=${size}&condition=${keySearch?.toString()}`,
          onResultDataTable
        )
      );
    },
    [dataLinesItem, dispatch, idNumber, keySearch, onResultDataTable]
  );

  const debounceSearchVariant = useMemo(() =>
      _.debounce((code: string) => {
        setTableLoading(true);
        onEnterFilterVariant(code);
      }, 300),
   [onEnterFilterVariant]
   );

  const onChangeKeySearch = useCallback((code: string)=>{
    debounceSearchVariant(code);
  },[debounceSearchVariant]);

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
            const percent =(Math.round(response.data.num_of_record/response.data.total))*100;
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

  const onDeleteItem = async (adjustmentId: number, variantId: number) => {
    const response = await callApiNative(
      { isShowError: false },
      dispatch,
      deleteLineItem,
      adjustmentId,
      variantId,
    );

    if (response.code !== HttpStatus.SUCCESS) return;
    dispatch(
      getLinesItemAdjustmentAction(
        idNumber,
        `page=1&limit=30`,
        onResultDataTable,
      )
    );
  };

  const getTotalOnHandApi = async () => {
    return await callApiNative(
      { isShowError: false },
      dispatch,
      getTotalOnHand,
      Number(id),
    );
  }

  const getTotalOnHandFunc = () => {
    getTotalOnHandApi().then((res) => {
      if (!res) return;
      setObjSummaryTableByAuditTotal({
        onHand: res.onHand || 0,
        realOnHand: res.realOnHand || 0,
        totalExcess: res.totalExcess || 0,
        totalMissing: res.totalMissing || 0,
      });
    });
  };

  useEffect(() => {
    getTotalOnHandFunc();
    // eslint-disable-next-line react-hooks/exhaustive-deps,
  }, [isReRender]);

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
    dispatch(getDetailInventoryAdjustmentAction(idNumber, onResult));
    try {
      const interval = setInterval(async () => {
        setData((data) => {
          if (data?.status === STATUS_INVENTORY_ADJUSTMENT_CONSTANTS.INITIALIZING || !data) {
            dispatch(getDetailInventoryAdjustmentAction(idNumber, onResult));
          } else {
            getTotalOnHandFunc();
            clearInterval(interval);
          }

          return data;
        })
      }, 5000);

      return () => clearInterval(interval);
    } catch(e) {
      console.log(e);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps,
  }, [idNumber, onResult, dispatch, isReRender]);


  useEffect(()=>{
    dispatch(searchAccountPublicAction({}, setDataAccounts));
  },[dispatch,setDataAccounts]);

  const debounceChangeRealOnHand = useMemo(()=>
      _.debounce((row: LineItemAdjustment, realOnHand: number) => {
        if (row.real_on_hand === realOnHand && realOnHand !== 0) {
          return;
        }
        onRealQuantityChange(realOnHand, row);
        let value = realOnHand;
        row.real_on_hand = realOnHand;
        let totalDiff: number;
        totalDiff = value - row.on_hand;
        if (totalDiff === 0) {
          row.on_hand_adj = null;
          row.on_hand_adj_dis = null;
        } else if (row.on_hand < value) {
          row.on_hand_adj = totalDiff;
          row.on_hand_adj_dis = `+${totalDiff}`;
        } else if (row.on_hand > value) {
          row.on_hand_adj = totalDiff;
          row.on_hand_adj_dis = `${totalDiff}`;
        }
        if (!data || (!data.id)) {
          return null;
        }

        setTableLoading(true);

        dispatch(
          updateItemOnlineInventoryAction(data.id, row.id, row, (result: LineItemAdjustment) => {
            setTableLoading(false);
            if (result) {
              showSuccess("Nhập số kiểm thành công.");
              const version = form.getFieldValue("version");
              form.setFieldsValue({ version: version + 1 });
              setIsReRender(!isReRender);
            }
          }),
        );
      },0),
    // eslint-disable-next-line react-hooks/exhaustive-deps,
 [data, dispatch, onRealQuantityChange, onEnterFilterVariant, form, keySearch]
 );

  return (
    <StyledWrapper>
      <ContentContainer
        isError={isError}
        isLoading={isLoading}
        title={`Kiểm kho ${data?.code}`}
        breadcrumb={[
          {
            name: "Tổng quan",
            path: UrlConfig.HOME,
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
          <InventoryAdjustmentTimeLine
            status={data?.status}
            inventoryAdjustmentDetail={data}
          />
        }
      >
        {data && (
          <>
          <Form form={form}>
            <Row gutter={24}>
              <Col span={18}>
                <Card
                  title="KHO HÀNG"
                  bordered={false}
                  extra={
                    <Space size={20}>
                      <span>
                        <b>Loại kiểm:</b>
                      </span>
                      <span>
                        {INVENTORY_ADJUSTMENT_AUDIT_TYPE_ARRAY.find(
                          (e) => e.value === data.audit_type
                        )?.name ?? ""}
                      </span>
                    </Space>
                  }
                >
                  {formStoreData && (
                    <Row className="pd16">
                      <Col span={31}>
                        <>
                          <span>
                            <b>{formStoreData?.name}:</b>
                          </span>{" "}
                          {formStoreData?.code} - {formStoreData?.hotline} -{" "}
                          {ConvertFullAddress(formStoreData)}
                        </>
                      </Col>
                    </Row>
                  )}
                </Card>
                {
                  //case trạng thái
                  (data.status === STATUS_INVENTORY_ADJUSTMENT.AUDITED.status ||
                    data.status === STATUS_INVENTORY_ADJUSTMENT.ADJUSTED.status) ? (
                    <Card>
                      <Tabs
                        style={{overflow: "initial"}}
                        activeKey={activeTab}
                        onChange={(active) => setActiveTab(active)}
                      >
                        <TabPane tab={`Thừa/Thiếu (${formatCurrency(dataTab?.total_variant_deviant) ?? 0})`} key="1">
                          <InventoryAdjustmentHistory
                            objSummaryTableByAuditTotal={objSummaryTableByAuditTotal}
                            data={data}
                            setDataTab={(value: number) => setDataTab({
                              ...dataTab,
                              total_variant_deviant: value
                            })}
                            idNumber={idNumber}
                          />
                        </TabPane>
                        <TabPane tab={`Tất cả (${dataLinesItem.metadata.total ?? 0})`} key="2">
                          <InventoryAdjustmentListAll
                            objSummaryTableByAuditTotal={objSummaryTableByAuditTotal}
                            idNumber={idNumber}
                            data={data}
                          />
                        </TabPane>
                      </Tabs>
                    </Card>
                  ) : (
                    <Card title="Thông tin sản phẩm" bordered={false}>
                      <AuthWrapper
                        acceptPermissions={[InventoryAdjustmentPermission.update]}
                      >
                        <Input.Group style={{ paddingTop: 16 }} className="display-flex">
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
                              window.open(
                                `${BASE_NAME_ROUTER}${UrlConfig.PRODUCT}/create`,
                                "_blank",
                              );
                            }}
                          />
                          <Button
                            disabled={!isPermissionAudit}
                            onClick={() => {
                              setVisibleManyProduct(true);
                              return;
                            }}
                            style={{ width: 132, marginLeft: 10 }}
                            icon={<img src={PlusOutline} alt="" />}
                          >
                            &nbsp;&nbsp; Chọn nhiều
                          </Button>

                          <Input
                            name="key_search"
                            value={keySearch}
                            onChange={(e) => {
                              setKeySearch(e.target.value);
                              onChangeKeySearch(e.target.value);
                            }}
                            style={{ marginLeft: 8 }}
                            placeholder="Tìm kiếm sản phẩm trong phiếu"
                            addonAfter={
                              <SearchOutlined
                                onClick={() => {
                                  onChangeKeySearch(keySearch);
                                }}
                                style={{ color: "#2A2A86" }}
                              />
                            }
                          />
                        </Input.Group>
                      </AuthWrapper>
                      {data.status === STATUS_INVENTORY_ADJUSTMENT_CONSTANTS.INITIALIZING && (
                        <div className="text-center font-weight-500 margin-top-20">
                          Đang xử lý sản phẩm cần kiểm kho, vui lòng đợi giây lát...
                        </div>
                      )}
                      <CustomTable
                        isLoading={tableLoading}
                        tableLayout="fixed"
                        style={{ paddingTop: 20 }}
                        columns={defaultColumns}
                        pagination={false}
                        sticky={{ offsetScroll: 5, offsetHeader: 55 }}
                        dataSource={dataLinesItem.items}
                        rowKey={(item: LineItemAdjustment) => item.id}
                      />
                      <CustomPagination
                        pagination={{
                          pageSize: dataLinesItem.metadata.limit,
                          total: dataLinesItem.metadata.total,
                          current: dataLinesItem.metadata.page,
                          showSizeChanger: true,
                          onChange: onPageChange,
                          onShowSizeChange: onPageChange,
                        }}
                      />
                    </Card>
                  )
                }
              </Col>
              <Col span={6}>
                <Card
                  title={"THÔNG TIN PHIẾU"}
                  bordered={false}
                  className={"inventory-info"}
                  extra={<Tag className={classTag}>{textTag}</Tag>}
                >
                  <Col>
                    <Row>
                      <Col span={10}>
                        <div className="label">ID phiếu:</div>
                      </Col>
                      <Col span={14}>
                        <div className="data">{data.code}</div>
                      </Col>
                    </Row>
                    <Row>
                      <Col span={10}>
                        <div className="label">Người tạo:</div>
                      </Col>
                      <Col span={14}>
                        <div className="data">{`${data.created_by} - ${data?.created_name}`}</div>
                      </Col>
                    </Row>
                    <Row>
                      <Col span={10}>
                        <div className="label">Người kiểm:</div>
                      </Col>
                      <Col span={14}>
                        <div className="data">
                          {
                            <StyledComponent>
                              <Row className="audit_by">
                                <Col span={24}>
                                  {data.audited_bys?.map((item: string) => {
                                    return (
                                      <RenderItemAuditBy
                                        key={item?.toString()}
                                        user_name={item?.toString()}
                                      />
                                    );
                                  })}
                                </Col>
                              </Row>
                            </StyledComponent>
                          }
                        </div>
                      </Col>
                    </Row>
                  </Col>
                </Card>
                <Card title={"GHI CHÚ"} bordered={false} className={"inventory-note"}>
                  <Row className="" gutter={5} style={{flexDirection: "column"}}>
                    <Form.Item
                      name={"note"}
                      label={<b>Ghi chú nội bộ:</b>}
                      colon={false}
                      labelCol={{span: 24, offset: 0}}
                      rules={[{max: 500, message: "Không được nhập quá 500 ký tự"}]}
                    >
                      <TextArea onChange={(e)=>{onChangeNote(e.target.value)}} placeholder="Nhập ghi chú nội bộ" autoSize={{minRows: 4, maxRows: 6}} />
                    </Form.Item>
                  </Row>
                  <Row
                    className="margin-top-10"
                    gutter={5}
                    style={{flexDirection: "column"}}
                  >
                    <Col span={24}>
                      <span className="text-focus">
                        {Array.isArray(data.list_attached_files) && data.list_attached_files.length > 0 && data.list_attached_files?.map((link: string, index: number) => {
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
                      </span>
                    </Col>

                    <Form.Item
                      labelCol={{span: 24, offset: 0}}
                      label={<b>File đính kèm:</b>}
                      colon={false}
                    >
                      {
                       data.status !== STATUS_INVENTORY_ADJUSTMENT_CONSTANTS.ADJUSTED &&
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
                      }
                      </Form.Item>

                    <Form.Item noStyle hidden name="list_attached_files">
                      <Input />
                    </Form.Item>
                    <Form.Item noStyle hidden name="version">
                      <Input />
                    </Form.Item>
                  </Row>
                </Card>
              </Col>
            </Row>
          </Form>
            <div style={{display: "none"}}>
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
                  style={{cursor: "pointer"}}
                >
                  <img style={{marginRight: "10px"}} src={arrowLeft} alt="" />
                  {"Quay lại danh sách"}
                </div>
              }
              rightComponent={
                <Space>
                  {(data.status !== STATUS_INVENTORY_ADJUSTMENT.DRAFT.status
                    && data.status !== STATUS_INVENTORY_ADJUSTMENT.INITIALIZING.status) && (
                    <AuthWrapper
                      acceptPermissions={[InventoryAdjustmentPermission.print]}
                    >
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
                          type="default"
                          className="light"
                          size="large"
                          icon={<img src={exportIcon} style={{marginRight: 8}} alt="" />}
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
                      <AuthWrapper
                        acceptPermissions={[InventoryAdjustmentPermission.import]}
                      >
                        <Upload
                          beforeUpload={onBeforeUpload}
                          multiple={false}
                          showUploadList={false}
                          onChange={onChangeFile}
                          customRequest={onCustomRequest}
                        >
                          <Button disabled={data.status === STATUS_INVENTORY_ADJUSTMENT.INITIALIZING.status || !isPermissionAudit}
                                  icon={<UploadOutlined />}>Nhập excel</Button>
                        </Upload>
                      </AuthWrapper>
                      <AuthWrapper
                        acceptPermissions={[InventoryAdjustmentPermission.audit]}
                      >
                        <Button
                          type="primary"
                          onClick={() => {
                            setIsShowConfirmAdited(true);
                          }}
                          loading={isLoading}
                          disabled={hasError || isLoading || data.status === STATUS_INVENTORY_ADJUSTMENT.INITIALIZING.status || !isPermissionAudit}
                        >
                          Hoàn thành kiểm
                        </Button>
                      </AuthWrapper>
                    </>
                  )}
                  {data.status === STATUS_INVENTORY_ADJUSTMENT.AUDITED.status && (
                    <AuthWrapper
                      acceptPermissions={[InventoryAdjustmentPermission.adjust]}
                    >
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
            {visibleManyProduct && (
              <PickManyProductModal
                storeID={data?.adjusted_store_id}
                selected={dataLinesItem.items}
                isTransfer
                onSave={onPickManyProduct}
                onCancel={() => setVisibleManyProduct(false)}
                visible={visibleManyProduct}
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
          </>
        )}
      </ContentContainer>
    </StyledWrapper>
  );
};

export default DetailInvetoryAdjustment;
