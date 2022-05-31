import CustomTable, {
  ICustomTableColumType,
} from "component/table/CustomTable";
import { AppConfig } from "config/app.config";
import UrlConfig, { ProcurementTabUrl } from "config/url.config";
import { StoreGetListAction } from "domain/actions/core/store.action";
import {
  ApprovalPoProcumentAction,
  ConfirmPoProcumentAction,
  PoProcumentDeleteAction,
  POSearchProcurement,
} from "domain/actions/po/po-procument.action";
import { PageResponse } from "model/base/base-metadata.response";
import { StoreResponse } from "model/core/store.model";
import {
  POProcumentField,
  // ProcurementConfirm,
  PurchaseProcument,
  PurchaseProcumentLineItem,
} from "model/purchase-order/purchase-procument";
import moment from "moment";
import { useCallback, useEffect, useMemo, useState, lazy } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router";
import { Link } from "react-router-dom";
import { formatCurrency, generateQuery } from "utils/AppUtils";
import {
  OFFSET_HEADER_TABLE,
  POStatus,
  ProcumentStatus,
  ProcurementStatus,
  ProcurementStatusName,
  STATUS_IMPORT_EXPORT,
} from "utils/Constants";
import {
  ConvertDateToUtc,
  ConvertUtcToLocalDate,
  DATE_FORMAT,
  formatDateTimeFilter,
  getEndOfDayCommon,
  getStartOfDayCommon,
} from "utils/DateUtils";
import { showSuccess, showWarning } from "utils/ToastUtils";
import { getQueryParams, useQuery } from "utils/useQuery";
import TabListFilter from "../../filter/TabList.filter";
import { PoDetailAction } from "domain/actions/po/po.action";
import { StyledComponent } from "./styles";
import { PurchaseOrder } from "model/purchase-order/purchase-order.model";
// import CustomFilter from "component/table/custom.filter";
// import { MenuAction } from "component/table/ActionButton";
import { callApiNative } from "utils/ApiUtils";
import { searchProcurementApi, updatePurchaseProcumentNoteService } from "service/purchase-order/purchase-procument.service";
// import { ProcurementListWarning } from "../../components/ProcumentListWarning";
import { cloneDeep } from "lodash";
import ProcurementExport from "../components/ProcurementExport";
import { TYPE_EXPORT } from "screens/products/constants";
import * as XLSX from 'xlsx';
import { ProcurementExportLineItemField } from 'model/procurement/field'
import { PhoneOutlined } from "@ant-design/icons";
import EditNote from "screens/order-online/component/edit-note";
import { primaryColor } from "utils/global-styles/variables";
import { RootReducerType } from "model/reducers/RootReducerType";
import { PurchaseOrderPermission } from "config/permissions/purchase-order.permission";
import statusDraft from 'assets/icon/status-draft-new.svg'
import statusFinalized from 'assets/icon/status-finalized-new.svg'
import statusStored from 'assets/icon/status-stored-new.svg'
import statusCancelled from 'assets/icon/status-cancelled-new.svg'

const ProcumentConfirmModal = lazy(() => import("screens/purchase-order/modal/procument-confirm.modal"))
// const ModalConfirm = lazy(() => import("component/modal/ModalConfirm"))
// const ProducmentInventoryMultiModal = lazy(() => import("screens/purchase-order/modal/procument-inventory-multi.modal"))
const ProcumentInventoryModal = lazy(() => import("screens/purchase-order/modal/procument-inventory.modal"))
const ModalSettingColumn = lazy(() => import("component/table/ModalSettingColumn"))

// const ACTIONS_INDEX = {
//   CONFIRM_MULTI: 1,
// };

interface TabListProps {
  vExportDetailProcurement: boolean;
  setVExportDetailProcurement: React.Dispatch<React.SetStateAction<boolean>>;
}

const TabList: React.FC<TabListProps> = (props: TabListProps) => {
  const { vExportDetailProcurement, setVExportDetailProcurement } = props
  const [storeExpect, setStoreExpect] = useState<number>(-1);
  const dispatch = useDispatch();
  const history = useHistory();
  const [loading, setLoading] = useState(true);
  const [isDetail, setIsDetail] = useState(false);
  const [poId, setPOId] = useState(0);
  const [loadingData, setLoadingData] = useState(false);
  const [loadingRecive, setLoadingRecive] = useState(false);
  const [loadingConfirm, setLoadingConfirm] = useState(false);
  const [visibleDraft, setVisibleDaft] = useState(false);
  const [visibleConfirm, setVisibleConfirm] = useState(false);
  const [poItems, setPOItem] = useState<PurchaseOrder | null>();
  const [procumentInventory, setProcumentInventory] =
    useState<PurchaseProcument | null>(null);
  const [procumentCode, setProcumentCode] = useState("");
  const [listStore, setListStore] = useState<Array<StoreResponse>>([]);
  const [item, setItem] = useState<PurchaseProcument | null>(null);
  const [selected, setSelected] = useState<Array<PurchaseProcument>>([]);
  const [exportProgress, setExportProgress] = useState<number>(0);
  const [statusExport, setStatusExport] = useState<number>(0);
  // const [showWarConfirm, setShowWarConfirm] = useState<boolean>(false);
  // const [showConfirm, setShowConfirm] = useState<boolean>(false);
  // const [contentWarning,setContentWarning] = useState<ReactNode>();
  // const [listProcurement, setListProcurement] =
  //   useState<Array<PurchaseProcument>>();
  const [data, setData] = useState<PageResponse<PurchaseProcument>>({
    metadata: {
      limit: 30,
      page: 1,
      total: 0,
    },
    items: [],
  });
  const [purchaseOrderItem, setPurchaseOrderItem] = useState<PurchaseOrder>(
    {} as PurchaseOrder
  );
  const [totalItems, setTotalItems] = useState<number>(0);

  const currentPermissions: string[] = useSelector(
    (state: RootReducerType) => state.permissionReducer.permissions
  );

  // const actions: Array<MenuAction> = useMemo(()=>{
  //   return [
  //    {
  //      id: ACTIONS_INDEX.CONFIRM_MULTI,
  //      name: "Xác nhận nhanh",
  //    },
  //  ]
  //  },[]);

  // const checkConfirmProcurement = useCallback(() => {
  //   let pass = true;
  //   let listProcurementCode = "";

  //   for (let index = 0; index < selected.length; index++) {
  //     const element = selected[index];
  //     if (element.status !== ProcumentStatus.NOT_RECEIVED) {
  //       listProcurementCode += `${element.code},`;
  //       pass = false;
  //     }
  //   }
  //   if (!pass) {
  //     setContentWarning(()=>ProcurementListWarning(listProcurementCode));
  //     setShowWarConfirm(true);
  //     return false;
  //   }
  //   for (let index = 0; index < selected.length; index++) {
  //     const element = selected[index];
  //     const firstElement = selected[0];
  //     listProcurementCode = firstElement.code;
  //     if (firstElement.purchase_order.supplier_id !== element.purchase_order.supplier_id
  //         || ConvertUtcToLocalDate(firstElement.stock_in_date,DATE_FORMAT.DDMMYYY) !== ConvertUtcToLocalDate(element.stock_in_date,DATE_FORMAT.DDMMYYY)
  //         || firstElement.store_id !== element.store_id) {
  //           listProcurementCode +=`, ${element.code},`;
  //        pass = false;
  //     }
  //   }
  //   if (!pass) {
  //     setContentWarning(()=>ProcurementListWarning(listProcurementCode));
  //     setShowWarConfirm(true);
  //     return false;
  //   }
  //   setListProcurement(selected);
  //   setShowConfirm(true);
  // },[selected]);

  // const onMenuClick = useCallback((index: number) => {
  //   switch (index) {
  //     case ACTIONS_INDEX.CONFIRM_MULTI:
  //       checkConfirmProcurement();
  //       break;
  //     default:
  //       break;
  //   }
  // }, [checkConfirmProcurement]);

  // const ActionComponent = useCallback(()=>{
  //     let Compoment = () => <span>Mã phiếu nhập kho</span>;
  //     if (selected?.length > 1) {
  //       Compoment = () => (
  //         <CustomFilter onMenuClick={onMenuClick} menu={actions}>
  //           <Fragment />
  //         </CustomFilter>
  //       );
  //     }
  //     return <Compoment />;
  // },[selected,actions, onMenuClick ])

  // const getTotalProcurementItemsQuantity = (item: PurchaseProcument): number => {
  //   let totalConfirmQuantity = 0;
  //     item.procurement_items.forEach((item: PurchaseProcumentLineItem) => {
  //       totalConfirmQuantity += item.quantity;
  //     });
  //     return totalConfirmQuantity;
  // }

  const query = useQuery();
  let paramsrUrl: any = useMemo(() => {
    return { ...getQueryParams(query) }
  }, [query]);

  const search = useCallback(() => {
    setLoading(true);
    const newParams = {
      ...paramsrUrl,
      expect_receipt_from: paramsrUrl.expect_receipt_from && getStartOfDayCommon(paramsrUrl.expect_receipt_from)?.format(),
      expect_receipt_to: paramsrUrl.expect_receipt_to && getEndOfDayCommon(paramsrUrl.expect_receipt_to)?.format(),
      stock_in_from: paramsrUrl.stock_in_from && formatDateTimeFilter(paramsrUrl.stock_in_from, 'DD/MM/YYYY HH:mm')?.format(),
      stock_in_to: paramsrUrl.stock_in_to && formatDateTimeFilter(paramsrUrl.stock_in_to, 'DD/MM/YYYY HH:mm')?.format(),
      active_from: paramsrUrl.active_from && getStartOfDayCommon(paramsrUrl.active_from)?.format(),
      active_to: paramsrUrl.active_to && getEndOfDayCommon(paramsrUrl.active_to)?.format(),
    }
    dispatch(
      POSearchProcurement(newParams, (result) => {
        setLoading(false);
        if (result) {
          setData(result);
          setTotalItems(result.metadata.total)
        }
      })
    );
  }, [dispatch, paramsrUrl])

  const onUpdateReceivedProcurement = useCallback(async (note: string, procurement: PurchaseProcument) => {
    if (procurement) {
      const poID = procurement.purchase_order.id
      const prID = procurement.id
      const data: PurchaseProcument = { ...procurement, [POProcumentField.note]: note }
      const res = await callApiNative({ isShowError: true }, dispatch, updatePurchaseProcumentNoteService, poID, prID, data)
      if (res) {
        search()
        showSuccess('Cập nhật thành công')
      }
    }
  }, [dispatch, search])

  const getTotalProcurementItems = useCallback(() => {
    let total = 0;
    const procurementsData = cloneDeep(data.items)
    procurementsData.forEach((element: PurchaseProcument) => {
      if (!element.procurement_items.length) element.procurement_items.length = 0
      total += element.procurement_items.length
    });
    return formatCurrency(total, ".")
  }, [data])

  const getTotalProcurementQuantity = useCallback((callback: (procurement: PurchaseProcument) => number): string => {
    let total: number[] = [];
    const procurementsData = cloneDeep(data.items)
    // const procurementsData = procurementsClone.filter((item: PurchaseProcument) =>
    //   item.status === ProcurementStatus.not_received || item.status === ProcurementStatus.received)

    procurementsData.forEach((element: PurchaseProcument) => {
      total.push(callback(element))
    });
    const result: number = total.reduce((pre, cur) => pre + cur, 0);

    return formatCurrency(result, ".")
  }, [data.items])

  const getTotalProcurementItemsRealQuantity = (item: PurchaseProcument): number => {
    let totalRealQuantity = 0;
    item.procurement_items.forEach((item: PurchaseProcumentLineItem) => {
      totalRealQuantity += item.real_quantity;
    });
    return totalRealQuantity;
  }

  const defaultColumns: Array<ICustomTableColumType<PurchaseProcument>> = useMemo(() => {
    return [
      {
        // title: ActionComponent,
        title: "Mã phiếu nhập kho",
        dataIndex: "code",
        fixed: "left",
        width: 150,
        visible: true,
        render: (value, record, index) => {
          // Cải tiến UI chuyển từ modal sang chế độ view full screen
          let improveProcurementTemporary = true
          return improveProcurementTemporary ? (
            <>
              <div>
                <Link to={{
                  pathname: `${UrlConfig.PURCHASE_ORDERS}/${record.purchase_order.id}/procurements/${record.id}`,
                }}>
                  <b>{value}</b>
                </Link>
              </div>
              <div style={{fontSize: 12}}>
                <div>
                  <div>Mã đơn đặt hàng:</div>
                  <Link to={`${UrlConfig.PURCHASE_ORDERS}/${record.purchase_order.id}`} target="_blank" rel="noopener noreferrer">
                    {record.purchase_order.code}
                  </Link>
                </div>
                <div>
                  <div>Mã tham chiếu:</div>
                  <Link to={`${UrlConfig.PURCHASE_ORDERS}/${record.purchase_order.id}`} target="_blank" rel="noopener noreferrer">
                    {record.purchase_order.reference}
                  </Link>
                </div>
              </div>
            </>
          ) : (
            <div
              className="procurement-code"
              onClick={() => handleClickProcurement(record)}>
              {value}
            </div>
          )
        },
      },
      {
        title: "Nhà cung cấp",
        dataIndex: "purchase_order",
        visible: true,
        render: (value, record) => {
          return (
            <div style={{ fontSize: 12 }}>
              <Link
                to={`${UrlConfig.SUPPLIERS}/${value.supplier_id}`}
                className="link-underline"
                target="_blank"
              >
                {value?.supplier}
              </Link>
              <div>
                <PhoneOutlined /> {value?.phone}
              </div>
              <div>
                <div>Merchandiser: </div>
                <Link to={`${UrlConfig.ACCOUNTS}/${value.merchandiser_code}`} target="_blank" rel="noopener noreferrer">
                  {`${value?.merchandiser_code} - ${value?.merchandiser}`}
                </Link>
              </div>
            </div>
          )
        }
      },
      {
        title: "Kho nhận hàng",
        dataIndex: "store",
        align: 'center',
        render: (value, record, index) => {
          return (
            <>
              {value}
              <div>
                Ngày nhận:
                <div>{ConvertUtcToLocalDate(record.stock_in_date, DATE_FORMAT.HHmm_DDMMYYYY)}</div>
              </div>
            </>
          )
        },
        visible: true,
        // width: 200,
      },
      {
        title: "Người nhận",
        dataIndex: "stock_in_by",
        align: 'center',
        visible: true,
        render: (value, row) => {
          if (value) {
            const name = value.split('-')
            return (
              <>
                <div>
                  <Link
                    to={`${UrlConfig.ACCOUNTS}/${name[0]}`}
                    className="primary"
                    target="_blank"
                  >
                    {name[0]}
                  </Link>
                </div>
                <b> {name[1]}</b>
              </>
            )
          } else {
            return ""
          }
        }
      },
      {
        title: "Trạng thái",
        dataIndex: "status",
        visible: true,
        render: (status: string, record) => {
          let icon = "";
          let color = ""
          // let type = TagStatusType.normal;
          if (!status) {
            return "";
          }
          switch (record.status) {
            case ProcurementStatus.draft:
              icon = statusDraft
              color = "#666666"
              break;
            case ProcurementStatus.not_received:
              icon = statusFinalized
              color = "#2A2A86"
              break;
            case ProcurementStatus.received:
              icon = statusStored
              color = "#FCAF17"
              break;
            case ProcurementStatus.cancelled:
              icon = statusCancelled
              color = "#E24343"
              break;
          }
          return (
            <>
              {/* <div> */}
              {
                // <TagStatus
                //   icon={icon}
                //   // type={type}
                // >
                //   {ProcurementStatusName[status]}
                // </TagStatus>
                <div style={{ color: color }} >
                  {icon && <img width={20} height={20} src={icon} alt="" style={{ marginRight: 4, marginBottom: 2 }} />}
                  {ProcurementStatusName[status]}
                </div>
              }
              {/* </div> */}
            </>
          );
        },
        align: "center",
        // width: 200,
      },
      // {
      //   title: <div>SL được duyệt (<span style={{color: "#2A2A86"}}>{getTotalProcurementQuantity(getTotalProcurementItemsQuantity)}</span>)</div>,
      //   align: "center",
      //   dataIndex: "procurement_items",
      //   visible: true,
      //   render: (value, record: PurchaseProcument, index) => {
      //     if (
      //       record.status === ProcurementStatus.not_received ||
      //       record.status === ProcurementStatus.received
      //     ) {
      //       let totalConfirmQuantity = 0;
      //       value.forEach((item: PurchaseProcumentLineItem) => {
      //         totalConfirmQuantity += item.quantity;
      //       });
      //       return formatCurrency(totalConfirmQuantity, ".");
      //     }
      //   },
      // },
      {
        title: <div>Sản phẩm (<span style={{ color: "#2A2A86" }}>{getTotalProcurementItems()}</span>)</div>,
        align: "center",
        dataIndex: "procurement_items",
        visible: true,
        render: (value, record, index) => {
          let totalItems = value?.length ?? 0
          return <b >{formatCurrency(totalItems, ".")}</b>
        },
      },
      {
        title: <div>SL thực nhận (<span style={{ color: "#2A2A86" }}>{getTotalProcurementQuantity(getTotalProcurementItemsRealQuantity)}</span>)</div>,
        align: "center",
        dataIndex: "procurement_items",
        visible: true,
        render: (value, record, index) => {
          let totalRealQuantity = 0;
          value.forEach((item: PurchaseProcumentLineItem) => {
            totalRealQuantity += item.real_quantity;
          });
          return formatCurrency(totalRealQuantity, ".");
        },
      },
      {
        title: "Ghi chú",
        align: "center",
        dataIndex: "note",
        visible: true,
        render: (value, record) => {
          const hasPermission = [PurchaseOrderPermission.update].some((element) => {
            return currentPermissions.includes(element);
          });
          return (
            <>
              <EditNote
                isHaveEditPermission={hasPermission}
                note={value}
                title="Ghi chú: "
                color={primaryColor}
                onOk={(newNote) => {
                  onUpdateReceivedProcurement(newNote, record)
                  // editNote(newNote, "customer_note", record.id, record);
                }}
              // isDisable={record.status === OrderStatus.FINISHED}
              />
            </>
          )
        },
      },
      // {
      //   title: "Ngày duyệt",
      //   dataIndex: "activated_date",
      //   render: (value, record, index) => ConvertUtcToLocalDate(value),
      // },
      // {
      //   title: "Người duyệt",
      //   dataIndex: "activated_by",
      //   visible: true,
      //   render: (value, row) => {
      //     return (
      //       <Link
      //         to={`${UrlConfig.ACCOUNTS}/${row.activated_by}`}
      //         className="primary"
      //         target="_blank"
      //       >
      //         {value}
      //       </Link>
      //     )
      //   }
      // },
    ]
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getTotalProcurementItems, getTotalProcurementQuantity]);

  const [columns, setColumns] = useState<
    Array<ICustomTableColumType<PurchaseProcument>>
  >(defaultColumns);

  useEffect(() => {
    setColumns(defaultColumns);
  }, [selected, defaultColumns]);

  const columnFinal = useMemo(() =>
    columns.filter((item) => item.visible === true)
    , [columns]);

  let now = moment();
  const initPurchaseOrder = {
    line_items: [],
    policy_price_code: AppConfig.import_price,
    untaxed_amount: 0,
    trade_discount_rate: null,
    trade_discount_value: null,
    trade_discount_amount: 0,
    designer_code: null,
    payments: [],
    procurements: [
      {
        fake_id: new Date().getTime(),
        reference: "",
        store_id: null,
        expect_receipt_date: "",
        procurement_items: [],
        status: ProcumentStatus.DRAFT,
        status_po: POStatus.DRAFTPO,
        note: "",
        actived_date: "",
        actived_by: "",
        stock_in_date: "",
        stock_in_by: "",
      },
    ],
    payment_discount_rate: null,
    payment_discount_value: null,
    payment_discount_amount: 0,
    total_cost_line: 0,
    total: 0,
    cost_lines: [],
    tax_lines: [],
    supplier_id: 0,
    expect_import_date: ConvertDateToUtc(moment()),
    order_date: null,
    status: POStatus.DRAFT,
    receive_status: ProcumentStatus.DRAFT,
    activated_date: null,
    completed_stock_date: null,
    cancelled_date: null,
    completed_date: null,
  };

  const onDetail = useCallback((result: PurchaseOrder | null) => {
    setLoading(false);
    setPOItem(result);
  }, []);

  const loadDetail = useCallback(
    (id: number, isLoading, isSuggestDetail: boolean) => {
      dispatch(PoDetailAction(poId, onDetail));
    },
    [dispatch, poId, onDetail]
  );

  const onAddProcumentSuccess = useCallback(
    (isSuggest) => {
      loadDetail(poId, true, isSuggest);
      setLoadingData((prevState) => !prevState);
    },
    [poId, loadDetail]
  );

  const onPageChange = (page: number, size?: number) => {
    paramsrUrl.page = page;
    paramsrUrl.limit = size;
    history.replace(
      `${UrlConfig.PROCUREMENT}?${generateQuery(paramsrUrl)}`
    );
  };

  const onDeleteProcumentCallback = useCallback(
    (result) => {
      if (result !== null) {
        showSuccess("Huỷ phiếu nháp thành công");
        setVisibleDaft(false);
        onAddProcumentSuccess && onAddProcumentSuccess(false);
      }
    },
    [onAddProcumentSuccess]
  );

  const onDeleteProcument = useCallback(
    (value: PurchaseProcument) => {
      if (poId && value.id) {
        dispatch(
          PoProcumentDeleteAction(poId, value.id, onDeleteProcumentCallback)
        );
      }
    },
    [dispatch, poId, onDeleteProcumentCallback]
  );

  const onConfirmProcumentCallback = useCallback(
    (value: PurchaseProcument | null) => {
      setLoadingConfirm(false);
      if (value === null) {
      } else {
        showSuccess("Thêm phiếu nháp kho thành công");
        setVisibleDaft(false);
        onAddProcumentSuccess && onAddProcumentSuccess(false);
      }
    },
    [onAddProcumentSuccess]
  );

  const onConfirmProcument = useCallback(
    (value: PurchaseProcument) => {
      if (poId && value.id) {
        setLoadingConfirm(true);
        dispatch(
          ApprovalPoProcumentAction(
            poId,
            value.id,
            value,
            onConfirmProcumentCallback
          )
        );
      }
    },
    [dispatch, poId, onConfirmProcumentCallback]
  );

  const onReciveProcumentCallback = useCallback(
    (value: PurchaseProcument | null) => {
      setLoadingConfirm(false);
      if (value !== null) {
        showSuccess("Xác nhận nhập kho thành công");
        setLoadingRecive(false);
        setVisibleConfirm(false);
        onAddProcumentSuccess && onAddProcumentSuccess(false);
      }
    },
    [onAddProcumentSuccess]
  );

  // const onReciveMuiltiProcumentCallback = useCallback(
  //   (value: boolean) => {
  //     setLoadingConfirm(false);
  //     if (value !== null) {
  //       showSuccess("Xác nhận nhập kho thành công");
  //       setShowConfirm(false);
  //       setLoadingRecive(false);
  //       onAddProcumentSuccess && onAddProcumentSuccess(false);
  //     }
  //   },
  //   [onAddProcumentSuccess]
  // );

  const onReciveProcument = useCallback(
    (value: PurchaseProcument) => {
      if (poId && value.id) {
        setLoadingRecive(true);
        dispatch(
          ConfirmPoProcumentAction(
            poId,
            value.id,
            value,
            onReciveProcumentCallback
          )
        );
      }
    },
    [dispatch, poId, onReciveProcumentCallback]
  );

  // const onReciveMultiProcument = useCallback(
  //  async (value: Array<PurchaseProcumentLineItem>) => {
  //     if (listProcurement) {
  //       const PrucurementConfirm = {
  //         procurement_items: value,
  //         refer_ids: listProcurement.map(e=>e.id)
  //       } as ProcurementConfirm;
  //       const res  = await callApiNative({isShowLoading: false},dispatch, confirmProcumentsMerge,PrucurementConfirm);
  //       if (res) {
  //         onReciveMuiltiProcumentCallback(true);
  //       }
  //     }
  //   },
  //   [listProcurement,dispatch,onReciveMuiltiProcumentCallback]
  // );

  const [showSettingColumn, setShowSettingColumn] = useState(false);

  const handleClickProcurement = (record: PurchaseProcument | any) => {
    setPurchaseOrderItem(record.purchase_order);
    const { status = "", expect_store_id = 144, code } = record;
    switch (status) {
      case ProcumentStatus.DRAFT:
        setVisibleDaft(true);
        setItem(record);
        break;
      case ProcumentStatus.NOT_RECEIVED:
        setProcumentInventory(record);
        setVisibleConfirm(true);
        setIsDetail(false);
        break;
      default:
        setProcumentInventory(record);
        setVisibleConfirm(true);
        setIsDetail(true);
        break;
    }
    setProcumentCode(code);
    setPOId(() => {
      return record?.purchase_order.id;
    });
    setStoreExpect(expect_store_id);
  };

  const onSelectedChange = useCallback(
    (selectedRow: Array<PurchaseProcument>) => {

      setSelected(
        selectedRow.filter(function (el) {
          return el !== undefined;
        })
      );
    },
    []
  );

  useEffect(() => {
    if (visibleDraft) {
      dispatch(PoDetailAction(poId, onDetail));
    }
  }, [dispatch, poId, visibleDraft, onDetail]);

  useEffect(() => {
    if (history.location.pathname === ProcurementTabUrl.ALL) {
      search();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [history.location.search, dispatch, loadingData]);

  useEffect(() => {
    dispatch(StoreGetListAction(setListStore));
  }, [dispatch]);

  // const titleMultiConfirm = useMemo(() => {
  //   return <>
  //     Xác nhận nhập kho {listProcurement?.map((e, i) => {
  //       return <>
  //         <Link target="_blank" to={`${UrlConfig.PURCHASE_ORDERS}/${e.purchase_order.id}`}>
  //           {e.code}
  //         </Link>{i === (listProcurement.length - 1) ? "" : ", "}
  //       </>
  //     })}
  //   </>
  // }, [listProcurement]);

  const getItemsByCondition = useCallback(async (type: string) => {
    let res: any;
    let items: Array<PurchaseProcument> = [];
    const limit = 50;
    let times = 0;
    const newParams = {
      ...paramsrUrl,
      expect_receipt_from: paramsrUrl.expect_receipt_from && getStartOfDayCommon(paramsrUrl.expect_receipt_from)?.format(),
      expect_receipt_to: paramsrUrl.expect_receipt_to && getEndOfDayCommon(paramsrUrl.expect_receipt_to)?.format(),
      stock_in_from: paramsrUrl.stock_in_from && getStartOfDayCommon(paramsrUrl.stock_in_from)?.format(),
      stock_in_to: paramsrUrl.stock_in_to && getEndOfDayCommon(paramsrUrl.stock_in_to)?.format(),
      active_from: paramsrUrl.active_from && getStartOfDayCommon(paramsrUrl.active_from)?.format(),
      active_to: paramsrUrl.active_to && getEndOfDayCommon(paramsrUrl.active_to)?.format(),
    }
    setStatusExport(STATUS_IMPORT_EXPORT.CREATE_JOB_SUCCESS);
    switch (type) {
      case TYPE_EXPORT.page:
        res = await callApiNative({ isShowLoading: false }, dispatch, searchProcurementApi, { ...newParams, limit: paramsrUrl.limit ?? 50 });
        if (res) {
          items = items.concat(res.items);
        }
        break;

      case TYPE_EXPORT.selected:
        items = selected;
        break;

      case TYPE_EXPORT.all:
        const roundAll = Math.round(data.metadata.total / limit);
        times = roundAll < (data.metadata.total / limit) ? roundAll + 1 : roundAll;

        for (let index = 1; index <= times; index++) {
          res = await callApiNative({ isShowLoading: false }, dispatch, searchProcurementApi, { ...newParams, page: index, limit: limit });
          if (res) {
            items = items.concat(res.items);
          }
          const percent = Math.round(Number.parseFloat((index / times).toFixed(2)) * 100);
          setExportProgress(percent);
        }
        break;

      case TYPE_EXPORT.allin:
        if (!totalItems || totalItems === 0) {
          break;
        }
        const roundAllin = Math.round(totalItems / limit);
        times = roundAllin < (totalItems / limit) ? roundAllin + 1 : roundAllin;

        for (let index = 1; index <= times; index++) {

          res = await callApiNative({ isShowLoading: false }, dispatch, searchProcurementApi, { ...newParams, page: index, limit: limit });
          if (res) {
            items = items.concat(res.items);
          }
          const percent = Math.round(Number.parseFloat((index / times).toFixed(2)) * 100);
          setExportProgress(percent);
        }
        break;
      default:
        break;
    }
    setExportProgress(100);
    return items;
  }, [paramsrUrl, dispatch, selected, data, totalItems])

  // const convertItemExport = (item: PurchaseProcument) => {

  //   return {
  //     [ProcurementExportLineItemField.code]: item.code,
  //     [ProcurementExportLineItemField.purchase_order_code]: item.purchase_order.code,
  //     [ProcurementExportLineItemField.purchase_order_reference]: item.purchase_order.reference,
  //     [ProcurementExportLineItemField.status]: ProcurementStatusName[item.status],
  //   };
  // }

  const convertTransferDetailExport = (procurement: PurchaseProcument, arrItem: Array<PurchaseProcumentLineItem>) => {
    let arr = [];
    for (let i = 0; i < arrItem.length; i++) {
      const item = arrItem[i];

      arr.push({
        [ProcurementExportLineItemField.code]: procurement.code,
        [ProcurementExportLineItemField.purchase_order_code]: procurement.purchase_order.code,
        [ProcurementExportLineItemField.purchase_order_reference]: procurement.purchase_order.reference,
        [ProcurementExportLineItemField.status]: ProcurementStatusName[procurement.status],
        [ProcurementExportLineItemField.supplier]: procurement.purchase_order.supplier,
        [ProcurementExportLineItemField.store]: procurement.store,
        [ProcurementExportLineItemField.product_code]: item.sku.substring(0, 7),
        [ProcurementExportLineItemField.sku]: item.sku,
        [ProcurementExportLineItemField.variant]: item.variant,
        [ProcurementExportLineItemField.barcode]: item.barcode,
        [ProcurementExportLineItemField.real_quantity]: item.real_quantity,
        [ProcurementExportLineItemField.created_date]: ConvertUtcToLocalDate(procurement.created_date, DATE_FORMAT.DDMMYYY),
        [ProcurementExportLineItemField.stock_in_date]: ConvertUtcToLocalDate(procurement.stock_in_date, DATE_FORMAT.DDMMYYY),
        [ProcurementExportLineItemField.stock_in_by]: `${procurement.stock_in_by}`,
        [ProcurementExportLineItemField.purchase_order_merchandiser]: `${procurement.purchase_order.merchandiser}`,
        [ProcurementExportLineItemField.purchase_order_designer]: `${procurement.purchase_order.designer}`,

      });
    }
    return arr;
  }

  const actionExport = {
    Ok: async (typeExport: string) => {
      if (!typeExport) {
        setVExportDetailProcurement(false);
        return
      }
      // let dataExport: any = [];
      setStatusExport(STATUS_IMPORT_EXPORT.DEFAULT);
      if (typeExport === TYPE_EXPORT.selected && selected && selected.length === 0) {
        setStatusExport(0);
        showWarning("Bạn chưa chọn phiếu chuyển nào để xuất file");
        setVExportDetailProcurement(false);
        return;
      }
      const res = await getItemsByCondition(typeExport);
      if (res && res.length === 0) {
        showWarning("Không có phiếu nhập kho nào đủ điều kiện");
        setStatusExport(0);
        return;
      }

      const workbook = XLSX.utils.book_new();
      let item: any = [];
      for (let i = 0; i < res.length; i++) {
        if (!res[i] || res[i].procurement_items?.length === 0) continue;

        if (workbook.Sheets[`${res[i].code}`]) {
          continue;
        }
        item = item.concat(convertTransferDetailExport(res[i], res[i].procurement_items));
        // const e = res[i];
        // const item = convertItemExport(e);
        // dataExport.push(item);
      }

      let worksheet = XLSX.utils.json_to_sheet(item);
      XLSX.utils.book_append_sheet(workbook, worksheet, "data");
      setStatusExport(STATUS_IMPORT_EXPORT.JOB_FINISH);
      const today = moment(new Date(), 'YYYY/MM/DD');
      const month = today.format('M');
      const day = today.format('D');
      const year = today.format('YYYY');
      XLSX.writeFile(workbook, `Unicorn_phiếu nhập kho ncc_${day}_${month}_${year}.xlsx`);
      setVExportDetailProcurement(false);
      setExportProgress(0);
      setStatusExport(0);
    },
    Cancel: () => {
      setVExportDetailProcurement(false);
      setExportProgress(0);
      setStatusExport(0);
    },
  }

  return (
    <StyledComponent>
      <div className="margin-top-20">
        <TabListFilter paramsUrl={paramsrUrl} onClickOpen={() => setShowSettingColumn(true)} />
        <div style={{ marginTop: -20 }}>
          <CustomTable
            isRowSelection
            selectedRowKey={selected.map(e => e.id)}
            isLoading={loading}
            dataSource={data.items}
            sticky={{ offsetScroll: 5, offsetHeader: OFFSET_HEADER_TABLE }}
            columns={columnFinal}
            rowKey={(item) => item.id}
            // scroll={{ x: 2000 }}
            pagination={{
              pageSize: data.metadata.limit,
              total: data.metadata.total,
              current: data.metadata.page,
              showSizeChanger: true,
              onChange: onPageChange,
              onShowSizeChange: onPageChange,
            }}
            onSelectedChange={(selectedRows) => onSelectedChange(selectedRows)}
            isShowPaginationAtHeader
            bordered
          />
        </div>
        {/* Duyệt phiếu nháp */}
        {
          visibleDraft && (
            <ProcumentConfirmModal
              isEdit={false}
              items={[]}
              stores={listStore}
              poData={poItems || initPurchaseOrder}
              procumentCode={procumentCode}
              now={now}
              visible={visibleDraft}
              item={item}
              onOk={(value: PurchaseProcument) => {
                onConfirmProcument(value);
              }}
              onDelete={onDeleteProcument}
              loading={loadingConfirm}
              defaultStore={storeExpect}
              onCancel={() => {
                setVisibleDaft(false);
              }}
            />
          )
        }
        {
          showSettingColumn && (
            <ModalSettingColumn
              visible={showSettingColumn}
              onCancel={() => setShowSettingColumn(false)}
              onOk={(data) => {
                setShowSettingColumn(false);
                setColumns(data);
              }}
              data={columns}
            />
          )
        }
        {/* Xác nhận nhập */}
        {/* {
          showConfirm && (
            <ProducmentInventoryMultiModal
              title={titleMultiConfirm}
              visible={showConfirm}
              listProcurement={listProcurement}
              onOk={(value: Array<PurchaseProcumentLineItem>) => {
                if (value) onReciveMultiProcument(value);
              }}
              loading={loadingRecive}
              onCancel={() => {
                setShowConfirm(false);
              }}
            />
          )
        } */}
        {/* Xác nhận nhập và Chi tiết phiếu nhập kho */}
        {
          visibleConfirm && (
            <ProcumentInventoryModal
              isDetail={isDetail}
              loadDetail={loadDetail}
              isEdit={false}
              items={[]}
              poData={purchaseOrderItem}
              stores={listStore}
              now={now}
              visible={visibleConfirm}
              item={procumentInventory}
              onOk={(value: PurchaseProcument) => {
                onReciveProcument(value);
              }}
              onDelete={onDeleteProcument}
              loading={loadingRecive}
              defaultStore={storeExpect}
              procumentCode={procumentCode}
              onCancel={() => {
                setVisibleConfirm(false);
              }}
            />
          )
        }
        {/* {
          showWarConfirm && (
            <ModalConfirm
              onCancel={(()=>{
                setShowWarConfirm(false);
              })}
              onOk={()=>{
                setSelected([]);
                setShowWarConfirm(false);
              }}
              okText="Chọn lại"
              cancelText="Hủy"
              title={`Nhận hàng từ nhiều phiếu nhập kho`}
              subTitle={contentWarning}
              visible={showWarConfirm}
            />
          )
        } */}
        <ProcurementExport
          onCancel={actionExport.Cancel}
          onOk={actionExport.Ok}
          visible={vExportDetailProcurement}
          exportProgress={exportProgress}
          statusExport={statusExport}
        />
      </div>
    </StyledComponent>
  );
};

export default TabList;
