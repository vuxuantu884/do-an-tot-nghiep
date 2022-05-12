import CustomTable, {
  ICustomTableColumType,
} from "component/table/CustomTable";
import { AppConfig } from "config/app.config";
import UrlConfig from "config/url.config";
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
  ProcurementConfirm,
  PurchaseProcument,
  PurchaseProcumentLineItem,
} from "model/purchase-order/purchase-procument";
import moment from "moment";
import { Fragment, ReactNode, useCallback, useEffect, useMemo, useState, lazy } from "react";
import { useDispatch } from "react-redux";
import { useHistory } from "react-router";
import { Link } from "react-router-dom";
import {formatCurrency, generateQuery} from "utils/AppUtils";
import {
  OFFSET_HEADER_TABLE,
  POStatus,
  ProcumentStatus,
  ProcurementStatus,
  ProcurementStatusName,
} from "utils/Constants";
import {
  ConvertDateToUtc,
  ConvertUtcToLocalDate,
  DATE_FORMAT,
  getEndOfDayCommon,
  getStartOfDayCommon,
} from "utils/DateUtils";
import { showSuccess, showWarning } from "utils/ToastUtils";
import {getQueryParams, useQuery} from "utils/useQuery";
import TabListFilter from "../../filter/TabList.filter";
import { PoDetailAction } from "domain/actions/po/po.action";
import { StyledComponent } from "./styles";
import { PurchaseOrder } from "model/purchase-order/purchase-order.model";
import CustomFilter from "component/table/custom.filter";
import { MenuAction } from "component/table/ActionButton";
import { callApiNative } from "utils/ApiUtils";
import { confirmProcumentsMerge, searchProcurementApi } from "service/purchase-order/purchase-procument.service";
import { ProcurementListWarning } from "../../components/ProcumentListWarning";
import BaseTagStatus from "component/base/BaseTagStatus";
import { cloneDeep } from "lodash";
import ProcurementExport from "../components/ProcurementExport";
import { TYPE_EXPORT } from "screens/products/constants";
import * as XLSX from 'xlsx';
import { ProcurementExportLineItemField } from 'model/procurement/field'

const ProcumentConfirmModal = lazy(() => import("screens/purchase-order/modal/procument-confirm.modal"))
const ModalConfirm = lazy(() => import("component/modal/ModalConfirm"))
const ProducmentInventoryMultiModal = lazy(() => import("screens/purchase-order/modal/procument-inventory-multi.modal"))
const ProcumentInventoryModal = lazy(() => import("screens/purchase-order/modal/procument-inventory.modal"))
const ModalSettingColumn = lazy(() => import("component/table/ModalSettingColumn"))

const ACTIONS_INDEX = {
  CONFIRM_MULTI: 1,
};

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
  const [showWarConfirm, setShowWarConfirm] = useState<boolean>(false);
  const [showConfirm, setShowConfirm] = useState<boolean>(false);
  const [contentWarning,setContentWarning] = useState<ReactNode>();
  const [listProcurement, setListProcurement] =
    useState<Array<PurchaseProcument>>();
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

  const actions: Array<MenuAction> = useMemo(()=>{
    return [
     {
       id: ACTIONS_INDEX.CONFIRM_MULTI,
       name: "Xác nhận nhanh",
     },
   ]
   },[]);

  const checkConfirmProcurement = useCallback(() => {
    let pass = true;
    let listProcurementCode = "";

    for (let index = 0; index < selected.length; index++) {
      const element = selected[index];
      if (element.status !== ProcumentStatus.NOT_RECEIVED) {
        listProcurementCode += `${element.code},`;
        pass = false;
      }
    }
    if (!pass) {
      setContentWarning(()=>ProcurementListWarning(listProcurementCode));
      setShowWarConfirm(true);
      return false;
    }
    for (let index = 0; index < selected.length; index++) {
      const element = selected[index];
      const firstElement = selected[0];
      listProcurementCode = firstElement.code;
      if (firstElement.purchase_order.supplier_id !== element.purchase_order.supplier_id
          || ConvertUtcToLocalDate(firstElement.stock_in_date,DATE_FORMAT.DDMMYYY) !== ConvertUtcToLocalDate(element.stock_in_date,DATE_FORMAT.DDMMYYY)
          || firstElement.store_id !== element.store_id) {
            listProcurementCode +=`, ${element.code},`;
         pass = false;
      }
    }
    if (!pass) {
      setContentWarning(()=>ProcurementListWarning(listProcurementCode));
      setShowWarConfirm(true);
      return false;
    }
    setListProcurement(selected);
    setShowConfirm(true);
  },[selected]);

  const onMenuClick = useCallback((index: number) => {
    switch (index) {
      case ACTIONS_INDEX.CONFIRM_MULTI:
        checkConfirmProcurement();
        break;
      default:
        break;
    }
  }, [checkConfirmProcurement]);

  const ActionComponent = useCallback(()=>{
      let Compoment = () => <span>Mã phiếu nhập kho</span>;
      if (selected?.length > 1) {
        Compoment = () => (
          <CustomFilter onMenuClick={onMenuClick} menu={actions}>
            <Fragment />
          </CustomFilter>
        );
      }
      return <Compoment />;
  },[selected,actions, onMenuClick ])

  // const getTotalProcurementItemsQuantity = (item: PurchaseProcument): number => {
  //   let totalConfirmQuantity = 0;
  //     item.procurement_items.forEach((item: PurchaseProcumentLineItem) => {
  //       totalConfirmQuantity += item.quantity;
  //     });
  //     return totalConfirmQuantity;
  // }

  const getTotalProcurementQuantity = useCallback((callback: (procurement:PurchaseProcument) => number): string => {
    let total:number[] = [];
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
        title: ActionComponent,
        dataIndex: "code",
        fixed: "left",
        width: 150,
        visible: true,
        render: (value, record, index) => {
          // Cải tiến UI chuyển từ modal sang chế độ view full screen
          let improveProcurementTemporary = true
          return improveProcurementTemporary ? (
            <Link to={{
              pathname: `${UrlConfig.PURCHASE_ORDERS}/${record.purchase_order.id}/procurements/${record.id}`,
            }}>
              {value}
            </Link>
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
        title: "Mã đơn đặt hàng",
        dataIndex: "purchase_order",
        fixed: "left",
        width: 150,
        visible: true,
        render: (value, record, index) => {
          return (
            <Link to={`${UrlConfig.PURCHASE_ORDERS}/${value.id}`}>
              {value.code}
            </Link>
          );
        },
      },
      {
        title: "Mã tham chiếu",
        dataIndex: "purchase_order",
        fixed: "left",
        width: 120,
        visible: true,
        render: (value) => {
          return (value?.reference)
        },
      },
      {
        title: "Nhà cung cấp",
        dataIndex: "purchase_order",
        visible: true,
        render: (value, row) => {
          return (
            <Link
              to={`${UrlConfig.SUPPLIERS}/${row.purchase_order.supplier_id}`}
              className="link-underline"
              target="_blank"
            >
              {value?.supplier}
            </Link>
          )
        }
      },
      {
        title: "Merchandiser",
        dataIndex: "purchase_order",
        // width: 130,
        visible: true,
        render: (value, row) => {
          if (!row || !row.purchase_order.merchandiser_code || !row.purchase_order.merchandiser) return "";
          return (
            <Link
              to={`${UrlConfig.ACCOUNTS}/${row.purchase_order.merchandiser_code}`}
              className="link-underline"
              target="_blank"
            >
              {`${row.purchase_order.merchandiser_code} - ${row.purchase_order.merchandiser}`}
            </Link>
          )
        },
      },
      {
        title: "Kho nhận hàng dự kiến",
        dataIndex: "store",
        render: (value, record, index) => value,
        visible: true,
        width: 200,
      },
      {
        title: "Ngày nhận hàng dự kiến",
        dataIndex: "expect_receipt_date",
        visible: true,
        render: (value, record, index) =>
          ConvertUtcToLocalDate(value, DATE_FORMAT.DDMMYYY),
        width: 200,
      },
      {
        title: "Trạng thái phiếu nhập kho",
        dataIndex: "status",
        visible: true,
        render: (status: string) => {
          return (
            <div>
              {
                status !== ProcurementStatus.cancelled &&
                <BaseTagStatus
                  fullWidth
                  color={
                    status === ProcurementStatus.draft ? "gray"
                      : status === ProcurementStatus.not_received ? "blue"
                      : status === ProcurementStatus.received ? "green"
                        :undefined
                  }
                >
                  { ProcurementStatusName[status] }
                </BaseTagStatus>
              }
            </div>
          );
        },
        align: "center",
        width: 200,
      },
      {
        title: "Trạng thái hủy",
        dataIndex: "is_cancelled",
        visible: true,
        render: (value, record, index) =>
          value || record?.status === "cancelled" ? "Đã hủy" : "",
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
        title: <div>SL thực nhận (<span style={{color: "#2A2A86"}}>{getTotalProcurementQuantity(getTotalProcurementItemsRealQuantity)}</span>)</div>,
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
        title: "Ngày tạo",
        align: "center",
        dataIndex: "created_date",
        visible: true,
        render: (value) => ConvertUtcToLocalDate(value),
      },
      {
        title: "Ngày duyệt",
        dataIndex: "activated_date",
        render: (value, record, index) => ConvertUtcToLocalDate(value),
      },
      {
        title: "Người duyệt",
        dataIndex: "activated_by",
        visible: true,
        render: (value, row) => {
          return (
            <Link
              to={`${UrlConfig.ACCOUNTS}/${row.activated_by}`}
              className="primary"
              target="_blank"
            >
              {value}
            </Link>
          )
        }
      },
      // {
      //   title: "Ngày nhập kho",
      //   dataIndex: "stock_in_date",
      //   visible: true,
      //   render: (value, record, index) => ConvertUtcToLocalDate(value),
      // },
      // {
      //   title: "Người nhập",
      //   dataIndex: "stock_in_by",
      //   visible: true,
      //   render: (value, record, index) => value,
      // },
    ]
  },[ActionComponent, getTotalProcurementQuantity]);

  const [columns, setColumns] = useState<
    Array<ICustomTableColumType<PurchaseProcument>>
  >(defaultColumns);

  useEffect(() => {
    setColumns(defaultColumns);
  }, [selected, defaultColumns]);

  const columnFinal = useMemo(()=>
   columns.filter((item) => item.visible === true)
  ,[columns]);

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

  const query = useQuery();
  let paramsrUrl: any = useMemo(() => {
    return {...getQueryParams(query)}
  }, [query]);

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

  const onReciveMuiltiProcumentCallback = useCallback(
    (value: boolean) => {
      setLoadingConfirm(false);
      if (value !== null) {
        showSuccess("Xác nhận nhập kho thành công");
        setShowConfirm(false);
        setLoadingRecive(false);
        onAddProcumentSuccess && onAddProcumentSuccess(false);
      }
    },
    [onAddProcumentSuccess]
  );

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

  const onReciveMultiProcument = useCallback(
   async (value: Array<PurchaseProcumentLineItem>) => {
      if (listProcurement) {
        const PrucurementConfirm = {
          procurement_items: value,
          refer_ids: listProcurement.map(e=>e.id)
        } as ProcurementConfirm;
        const res  = await callApiNative({isShowLoading: false},dispatch, confirmProcumentsMerge,PrucurementConfirm);
        if (res) {
          onReciveMuiltiProcumentCallback(true);
        }
      }
    },
    [listProcurement,dispatch,onReciveMuiltiProcumentCallback]
  );

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

  const search = useCallback(()=> {
    setLoading(true);
    const newParams = {
      ...paramsrUrl,
      expect_receipt_from: paramsrUrl.expect_receipt_from && getStartOfDayCommon(paramsrUrl.expect_receipt_from)?.format(),
      expect_receipt_to: paramsrUrl.expect_receipt_to && getEndOfDayCommon(paramsrUrl.expect_receipt_to)?.format(),
      stock_in_from: paramsrUrl.stock_in_from && getStartOfDayCommon(paramsrUrl.stock_in_from)?.format(),
      stock_in_to: paramsrUrl.stock_in_to && getEndOfDayCommon(paramsrUrl.stock_in_to)?.format(),
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
  },[dispatch, paramsrUrl])

  useEffect(() => {
    search();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [history.location.search, dispatch, loadingData]);

  useEffect(() => {
    dispatch(StoreGetListAction(setListStore));
  }, [dispatch]);

  const titleMultiConfirm = useMemo(() => {
    return <>
      Xác nhận nhập kho {listProcurement?.map((e, i) => {
        return <>
          <Link target="_blank" to={`${UrlConfig.PURCHASE_ORDERS}/${e.purchase_order.id}`}>
            {e.code}
          </Link>{i === (listProcurement.length - 1) ? "" : ", "}
        </>
      })}
    </>
  }, [listProcurement]);

  const getItemsByCondition = useCallback(async (type: string) => {
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
    switch (type) {
      case TYPE_EXPORT.all:
        const roundAll = Math.round(data.metadata.total / limit);
        times = roundAll < (data.metadata.total / limit) ? roundAll + 1 : roundAll;

        for (let index = 1; index <= times; index++) {
          const res = await callApiNative({ isShowLoading: true }, dispatch, searchProcurementApi, { ...newParams, page: index, limit: limit });
          if (res) {
            items = items.concat(res.items);
          }
        }

        break;
      case TYPE_EXPORT.allin:
        if (!totalItems || totalItems === 0) {
          break;
        }
        const roundAllin = Math.round(totalItems / limit);
        times = roundAllin < (totalItems / limit) ? roundAllin + 1 : roundAllin;

        for (let index = 1; index <= times; index++) {

          const res = await callApiNative({ isShowLoading: true }, dispatch, searchProcurementApi, { ...newParams, page: index, limit: limit });
          if (res) {
            items = items.concat(res.items);
          }
        }
        break;
      default:
        break;
    }
    return items;
  }, [dispatch, paramsrUrl, data, totalItems])

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
        [ProcurementExportLineItemField.created_name]: `${procurement.created_by} - ${procurement.created_name}`,

      });
    }
    return arr;
  }

  const actionExport = {
    Ok: async (typeExport: string) => {
      if(!typeExport) {
        setVExportDetailProcurement(false);
        return
      }
      // let dataExport: any = [];

      const res = await getItemsByCondition(typeExport);
      if (res && res.length === 0) {
        showWarning("Không có phiếu nhập kho nào đủ điều kiện");
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

      const today = moment(new Date(), 'YYYY/MM/DD');
      const month = today.format('M');
      const day = today.format('D');
      const year = today.format('YYYY');
      XLSX.writeFile(workbook, `Unicorn_phiếu nhập kho ncc_${day}_${month}_${year}.xlsx`);
      setVExportDetailProcurement(false);
    },
    Cancel: () => {
      setVExportDetailProcurement(false);
    },
  }

  return (
    <StyledComponent>
      <div className="margin-top-20">
        <TabListFilter paramsUrl={paramsrUrl} onClickOpen={() => setShowSettingColumn(true)} />
        <CustomTable
          isRowSelection
          selectedRowKey={selected.map(e => e.id)}
          isLoading={loading}
          dataSource={data.items}
          sticky={{ offsetScroll: 5, offsetHeader: OFFSET_HEADER_TABLE }}
          columns={columnFinal}
          rowKey={(item) => item.id}
          scroll={{ x: 2000 }}
          pagination={{
            pageSize: data.metadata.limit,
            total: data.metadata.total,
            current: data.metadata.page,
            showSizeChanger: true,
            onChange: onPageChange,
            onShowSizeChange: onPageChange,
          }}
          onSelectedChange={(selectedRows) => onSelectedChange(selectedRows)}
        />
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
        {
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
        }
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
        {
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
        }
        <ProcurementExport
          onCancel={actionExport.Cancel}
          onOk={actionExport.Ok}
          visible={vExportDetailProcurement}
        />
      </div>
    </StyledComponent>
  );
};

export default TabList;
