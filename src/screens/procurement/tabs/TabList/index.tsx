import CustomTable, { ICustomTableColumType } from "component/table/CustomTable";
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
  PurchaseProcument,
  PurchaseProcumentLineItem,
} from "model/purchase-order/purchase-procument";
import moment from "moment";
import { lazy, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router";
import { Link } from "react-router-dom";
import { formatCurrency, generateQuery } from "utils/AppUtils";
import { OFFSET_HEADER_TABLE, POStatus, STATUS_IMPORT_EXPORT } from "utils/Constants";
import {
  ConvertDateToUtc,
  ConvertUtcToLocalDate,
  DATE_FORMAT,
  formatDateTimeFilter,
  getEndOfDayCommon,
  getStartOfDayCommon,
} from "utils/DateUtils";
import { showError, showSuccess, showWarning } from "utils/ToastUtils";
import { getQueryParams, useQuery } from "utils/useQuery";
import { TabListFilter } from "../../filter";
import { PoDetailAction } from "domain/actions/po/po.action";
import { TabListWrapper } from "./styles";
import { PurchaseOrder, PurchaseOrderPrint } from "model/purchase-order/purchase-order.model";
import { callApiNative } from "utils/ApiUtils";
import { updatePurchaseProcumentNoteService } from "service/purchase-order/purchase-procument.service";
import { ProcurementExport } from "../../components";
import { PhoneOutlined, PrinterOutlined } from "@ant-design/icons";
import EditNote from "screens/order-online/component/edit-note";
import { primaryColor } from "utils/global-styles/variables";
import { RootReducerType } from "model/reducers/RootReducerType";
import { PurchaseOrderPermission } from "config/permissions/purchase-order.permission";
import statusDraft from "assets/icon/pr-draft.svg";
import statusFinalized from "assets/icon/status-finalized-new.svg";
import statusStored from "assets/icon/status-finished-new.svg";
import statusCancelled from "assets/icon/status-cancelled-new.svg";
import { AccountResponse } from "model/account/account.model";
import { searchAccountPublicApi } from "service/accounts/account.service";
import { MenuAction } from "component/table/ActionButton";
import useAuthorization from "hook/useAuthorization";
import { Modal, Row } from "antd";
import { printMultipleProcurementApi } from "service/purchase-order/purchase-order.service";
import { useReactToPrint } from "react-to-print";
import purify from "dompurify";
import { exportFile, getFile } from "service/other/export.service";
import { HttpStatus } from "config/http-status.config";
import {
  EnumActionIndex,
  getTotalProcurementQuantity,
  EnumImportResponseStatuses,
  POProcurementLineItemField,
  ProcurementStatus,
  ProcurementStatusName,
  EnumTypeExport,
} from "screens/procurement/helper";

const ProcumentConfirmModal = lazy(
  () => import("screens/purchase-order/modal/procument-confirm.modal"),
);
const ProcumentInventoryModal = lazy(
  () => import("screens/purchase-order/modal/procument-inventory.modal"),
);
const ModalSettingColumn = lazy(() => import("component/table/ModalSettingColumn"));

type TabListProps = {
  isShowExportDetailProcurement: boolean;
  setIsShowExportDetailProcurement: React.Dispatch<React.SetStateAction<boolean>>;
};

const TabList: React.FC<TabListProps> = (props: TabListProps) => {
  const { isShowExportDetailProcurement, setIsShowExportDetailProcurement } = props;
  const [storeExpect, setStoreExpect] = useState<number>(-1);
  const dispatch = useDispatch();
  const history = useHistory();
  const [isLoading, setIsLoading] = useState(true);
  const [isDetail, setIsDetail] = useState(false);
  const [poId, setPOId] = useState(0);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [isLoadingRecive, setIsLoadingRecive] = useState(false);
  const [isLoadingConfirm, setIsLoadingConfirm] = useState(false);
  const [isVisibleDraft, setIsVisibleDaft] = useState(false);
  const [isVisibleConfirm, setIsVisibleConfirm] = useState(false);
  const [poItems, setPOItem] = useState<PurchaseOrder | null>();
  const [procumentInventory, setProcumentInventory] = useState<PurchaseProcument | null>(null);
  const [procumentCode, setProcumentCode] = useState("");
  const [listStore, setListStore] = useState<Array<StoreResponse>>([]);
  const [item, setItem] = useState<PurchaseProcument | null>(null);
  const [selected, setSelected] = useState<Array<PurchaseProcument>>([]);
  const [exportProgress, setExportProgress] = useState<number>(0);
  const [statusExport, setStatusExport] = useState<number>(0);
  const [isShowPrintConfirm, setIsShowPrintConfirm] = useState<boolean>(false);
  const [printContent, setPrintContent] = useState<string>("");
  const [listExportFile, setListExportFile] = useState<Array<string>>([]);
  const [exportError, setExportError] = useState<string>("");
  const [isLoadingExport, setIsLoadingExport] = useState<boolean>(false);
  const pageBreak = "<div class='pageBreak'></div>";
  const [data, setData] = useState<PageResponse<PurchaseProcument>>({
    metadata: {
      limit: 30,
      page: 1,
      total: 0,
    },
    items: [],
  });
  const [purchaseOrderItem, setPurchaseOrderItem] = useState<PurchaseOrder>({} as PurchaseOrder);
  const [accounts, setAccounts] = useState<Array<AccountResponse>>([]);
  const printElementRef = useRef(null);

  const currentPermissions: string[] = useSelector(
    (state: RootReducerType) => state.permissionReducer.permissions,
  );

  const [allowPrint] = useAuthorization({
    acceptPermissions: [PurchaseOrderPermission.procurements_read],
  });

  const actionList: Array<MenuAction> = [
    {
      id: EnumActionIndex.PRINT_PROCUREMENTS,
      name: "In phiếu",
      icon: <PrinterOutlined />,
      disabled: !allowPrint,
    },
  ];

  const handlePrint = useReactToPrint({
    content: () => printElementRef.current,
  });

  const query = useQuery();
  let paramsrUrl: any = useMemo(() => {
    return { ...getQueryParams(query) };
  }, [query]);

  const onSearchProcurements = useCallback(() => {
    setIsLoading(true);
    const newParams = {
      ...paramsrUrl,
      expect_receipt_from:
        paramsrUrl.expect_receipt_from &&
        getStartOfDayCommon(paramsrUrl.expect_receipt_from)?.format(),
      expect_receipt_to:
        paramsrUrl.expect_receipt_to && getEndOfDayCommon(paramsrUrl.expect_receipt_to)?.format(),
      stock_in_from:
        paramsrUrl.stock_in_from &&
        formatDateTimeFilter(paramsrUrl.stock_in_from, DATE_FORMAT.DD_MM_YY_HHmm)?.format(),
      stock_in_to:
        paramsrUrl.stock_in_to &&
        formatDateTimeFilter(paramsrUrl.stock_in_to, DATE_FORMAT.DD_MM_YY_HHmm)?.format(),
      active_from: paramsrUrl.active_from && getStartOfDayCommon(paramsrUrl.active_from)?.format(),
      active_to: paramsrUrl.active_to && getEndOfDayCommon(paramsrUrl.active_to)?.format(),
    };
    dispatch(
      POSearchProcurement(newParams, (result) => {
        setIsLoading(false);
        if (result) {
          setData(result);
        }
      }),
    );
  }, [dispatch, paramsrUrl]);

  const onUpdateReceivedProcurement = useCallback(
    async (note: string, procurement: PurchaseProcument) => {
      if (procurement) {
        const poID = procurement.purchase_order.id;
        const prID = procurement.id;
        const data: PurchaseProcument = {
          ...procurement,
          [POProcumentField.note]: note,
        };
        const res = await callApiNative(
          { isShowError: true },
          dispatch,
          updatePurchaseProcumentNoteService,
          poID,
          prID,
          data,
        );
        if (res) {
          onSearchProcurements();
          showSuccess("Cập nhật thành công");
        }
      }
    },
    [dispatch, onSearchProcurements],
  );

  const defaultColumns: Array<ICustomTableColumType<PurchaseProcument>> = useMemo(() => {
    return [
      {
        // title: ActionComponent,
        title: "Mã phiếu nhập kho",
        dataIndex: "code",
        fixed: "left",
        width: "12%",
        visible: true,
        render: (value, record) => {
          // Cải tiến UI chuyển từ modal sang chế độ view full screen
          let improveProcurementTemporary = true;
          return improveProcurementTemporary ? (
            <>
              <div>
                <Link
                  to={`${UrlConfig.PURCHASE_ORDERS}/${record.purchase_order.id}/procurements/${record.id}`}
                >
                  <b>{value}</b>
                </Link>
              </div>
              <div style={{ fontSize: 12 }}>
                <div>
                  Mã đơn đặt hàng:{" "}
                  <Link
                    to={`${UrlConfig.PURCHASE_ORDERS}/${record.purchase_order.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {record.purchase_order.code}
                  </Link>
                </div>
                <div>
                  Mã tham chiếu:{" "}
                  <Link
                    to={`${UrlConfig.PURCHASE_ORDERS}/${record.purchase_order.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {record.purchase_order.reference}
                  </Link>
                </div>
              </div>
            </>
          ) : (
            <div className="procurement-code" onClick={() => handleClickProcurement(record)}>
              {value}
            </div>
          );
        },
      },
      {
        title: "Nhà cung cấp",
        dataIndex: "purchase_order",
        visible: true,
        width: "14%",
        render: (value) => {
          return (
            <div style={{ fontSize: 12 }}>
              <Link
                to={`${UrlConfig.SUPPLIERS}/${value.supplier_id}`}
                className="link-underline"
                target="_blank"
              ></Link>
              {value?.supplier_code} <PhoneOutlined /> {value?.phone}
              <div className="font-weight-500">{value?.supplier}</div>
              <div>
                Merchandiser:{" "}
                {value && value.merchandiser_code && value.merchandiser && (
                  <Link
                    to={`${UrlConfig.ACCOUNTS}/${value.merchandiser_code}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {`${value?.merchandiser_code} - ${value?.merchandiser}`}
                  </Link>
                )}
              </div>
              <div>
                QC:{" "}
                {value && value.qc && value.qc_code && (
                  <Link
                    to={`${UrlConfig.ACCOUNTS}/${value.qc_code}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {`${value?.qc_code} - ${value?.qc}`}
                  </Link>
                )}
              </div>
            </div>
          );
        },
      },
      {
        title: "Kho nhận hàng",
        dataIndex: "store",
        width: "20%",
        render: (value, record) => {
          return (
            <>
              {value}
              {record.stock_in_date && (
                <div>
                  <span className="fs-12 text-muted">Ngày nhận: </span>
                  <span className="fs-12 text-title">
                    {ConvertUtcToLocalDate(record.stock_in_date, DATE_FORMAT.DDMMYY_HHmm)}
                  </span>
                </div>
              )}
              {record?.activated_date && (
                <div>
                  <span className="fs-12 text-muted">Ngày duyệt: </span>
                  <span className="fs-12 text-title">
                    {ConvertUtcToLocalDate(record.activated_date, DATE_FORMAT.DDMMYY_HHmm)}
                  </span>
                </div>
              )}
            </>
          );
        },
        visible: true,
      },
      {
        title: "Người thao tác",
        dataIndex: "stock_in_by",
        visible: true,
        width: "15%",
        render: (value, row) => {
          if (value) {
            const stockInByName = value.split("-");
            const activatedByName = row?.activated_by?.split("-");
            return (
              <>
                <div>
                  <div className="fs-12 text-muted">Người duyệt:</div>
                  {activatedByName && (
                    <Link
                      to={`${UrlConfig.ACCOUNTS}/${activatedByName[0]}`}
                      className="primary"
                      target="_blank"
                    >
                      {Array.isArray(activatedByName) ? activatedByName[0] : activatedByName}
                    </Link>
                  )}
                  <b>
                    {" "}
                    {Array.isArray(activatedByName) && activatedByName.length > 1
                      ? activatedByName[1]
                      : ""}
                  </b>
                </div>
                <div>
                  <div className="fs-12 text-muted">Người nhận:</div>
                  <Link
                    to={`${UrlConfig.ACCOUNTS}/${stockInByName[0]}`}
                    className="primary"
                    target="_blank"
                  >
                    {stockInByName[0]}
                  </Link>
                  <b> {stockInByName[1]}</b>
                </div>
              </>
            );
          } else {
            return "";
          }
        },
      },
      {
        title: "Trạng thái",
        dataIndex: "status",
        visible: true,
        width: "9%",
        render: (status: string, record) => {
          let icon = "";
          let color = "";
          if (!status) {
            return "";
          }
          switch (record.status) {
            case ProcurementStatus.DRAFT:
              icon = statusDraft;
              color = "#666666";
              break;
            case ProcurementStatus.NOT_RECEIVED:
              icon = statusFinalized;
              color = "#2A2A86";
              break;
            case ProcurementStatus.RECEIVED:
              icon = statusStored;
              color = "#27AE60";
              break;
            case ProcurementStatus.CANCELLED:
              icon = statusCancelled;
              color = "#E24343";
              break;
          }
          return (
            <>
              <div style={{ color: color }}>
                {icon && (
                  <img
                    width={20}
                    height={20}
                    src={icon}
                    alt=""
                    style={{ marginRight: 4, marginBottom: 2 }}
                  />
                )}
                {ProcurementStatusName[status]}
              </div>
            </>
          );
        },
        align: "center",
      },
      {
        title: (
          <div>
            <div>SL được duyệt</div>
            <div>
              (
              <span style={{ color: "#22222" }}>
                {getTotalProcurementQuantity(
                  data.items,
                  POProcurementLineItemField.accepted_quantity,
                )}
              </span>
              )
            </div>
          </div>
        ),
        align: "center",
        width: "8%",
        dataIndex: "procurement_items",
        visible: true,
        render: (value: Array<PurchaseProcumentLineItem>) => {
          let totalAcceptedQuantity = 0;
          value.forEach((item: PurchaseProcumentLineItem) => {
            totalAcceptedQuantity += item.accepted_quantity;
          });
          return (
            <div className="font-weight-500 text-title">
              {formatCurrency(totalAcceptedQuantity)}
            </div>
          );
        },
      },
      {
        title: (
          <div>
            <div>SL thực nhận</div> (
            <span style={{ color: "#2A2A86" }}>
              {getTotalProcurementQuantity(data.items, POProcurementLineItemField.real_quantity)}
            </span>
            )
          </div>
        ),
        align: "center",
        dataIndex: "procurement_items",
        visible: true,
        width: "10%",
        render: (value) => {
          let totalRealQuantity = 0;
          value.forEach((item: PurchaseProcumentLineItem) => {
            totalRealQuantity += item.real_quantity;
          });
          return (
            <div className="font-weight-500 text-title">{formatCurrency(totalRealQuantity)}</div>
          );
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
                title=""
                color={primaryColor}
                onOk={(newNote) => {
                  onUpdateReceivedProcurement(newNote, record);
                }}
              />
            </>
          );
        },
      },
    ];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.items, currentPermissions]);

  const [columns, setColumns] =
    useState<Array<ICustomTableColumType<PurchaseProcument>>>(defaultColumns);

  useEffect(() => {
    setColumns(defaultColumns);
  }, [selected, defaultColumns]);

  const columnFinal = useMemo(() => columns.filter((item) => item.visible === true), [columns]);

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
        status: ProcurementStatus.DRAFT,
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
    receive_status: ProcurementStatus.DRAFT,
    activated_date: null,
    completed_stock_date: null,
    cancelled_date: null,
    completed_date: null,
  };

  const getPODetail = useCallback((result: PurchaseOrder | null) => {
    setIsLoading(false);
    setPOItem(result);
  }, []);

  const loadPODetail = useCallback(() => {
    dispatch(PoDetailAction(poId, getPODetail));
  }, [dispatch, poId, getPODetail]);

  const onAddProcumentSuccess = useCallback(() => {
    loadPODetail();
    setIsLoadingData((prevState) => !prevState);
  }, [loadPODetail]);

  const onPageChange = (page: number, size?: number) => {
    paramsrUrl.page = page;
    paramsrUrl.limit = size;
    history.replace(`${UrlConfig.PROCUREMENT}?${generateQuery(paramsrUrl)}`);
  };

  const onDeleteProcumentCallback = useCallback(
    (result) => {
      if (result !== null) {
        showSuccess("Huỷ phiếu nháp thành công");
        setIsVisibleDaft(false);
        onAddProcumentSuccess && onAddProcumentSuccess();
      }
    },
    [onAddProcumentSuccess],
  );

  const onDeleteProcument = useCallback(
    (value: PurchaseProcument) => {
      if (poId && value.id) {
        dispatch(PoProcumentDeleteAction(poId, value.id, onDeleteProcumentCallback));
      }
    },
    [dispatch, poId, onDeleteProcumentCallback],
  );

  const onConfirmProcumentCallback = useCallback(
    (value: PurchaseProcument | null) => {
      setIsLoadingConfirm(false);
      if (value === null) {
      } else {
        showSuccess("Thêm phiếu nháp kho thành công");
        setIsVisibleDaft(false);
        onAddProcumentSuccess && onAddProcumentSuccess();
      }
    },
    [onAddProcumentSuccess],
  );

  const onConfirmProcument = useCallback(
    (value: PurchaseProcument) => {
      if (poId && value.id) {
        setIsLoadingConfirm(true);
        dispatch(ApprovalPoProcumentAction(poId, value.id, value, onConfirmProcumentCallback));
      }
    },
    [dispatch, poId, onConfirmProcumentCallback],
  );

  const onReciveProcumentCallback = useCallback(
    (value: PurchaseProcument | null) => {
      setIsLoadingConfirm(false);
      if (value !== null) {
        showSuccess("Xác nhận nhập kho thành công");
        setIsLoadingRecive(false);
        setIsVisibleConfirm(false);
        onAddProcumentSuccess && onAddProcumentSuccess();
      }
    },
    [onAddProcumentSuccess],
  );

  const onReciveProcument = useCallback(
    (value: PurchaseProcument) => {
      if (poId && value.id) {
        setIsLoadingRecive(true);
        dispatch(ConfirmPoProcumentAction(poId, value.id, value, onReciveProcumentCallback));
      }
    },
    [dispatch, poId, onReciveProcumentCallback],
  );

  const [isShowSettingColumn, setIsShowSettingColumn] = useState(false);

  const handleClickProcurement = (record: PurchaseProcument | any) => {
    setPurchaseOrderItem(record.purchase_order);
    const { status = "", expect_store_id = 144, code } = record;
    switch (status) {
      case ProcurementStatus.DRAFT:
        setIsVisibleDaft(true);
        setItem(record);
        break;
      case ProcurementStatus.NOT_RECEIVED:
        setProcumentInventory(record);
        setIsVisibleConfirm(true);
        setIsDetail(false);
        break;
      default:
        setProcumentInventory(record);
        setIsVisibleConfirm(true);
        setIsDetail(true);
        break;
    }
    setProcumentCode(code);
    setPOId(() => {
      return record?.purchase_order.id;
    });
    setStoreExpect(expect_store_id);
  };

  const onSelectedChange = useCallback((selectedRow: Array<PurchaseProcument>) => {
    setSelected(
      selectedRow.filter(function (el) {
        return el !== undefined;
      }),
    );
  }, []);

  useEffect(() => {
    if (isVisibleDraft) {
      dispatch(PoDetailAction(poId, getPODetail));
    }
  }, [dispatch, poId, isVisibleDraft, getPODetail]);

  const getAccounts = async (codes: string) => {
    const response = await callApiNative({ isShowError: true }, dispatch, searchAccountPublicApi, {
      codes,
    });
    if (response) {
      setAccounts(response.items);
    }
  };

  useEffect(() => {
    if (history.location.pathname === ProcurementTabUrl.ALL) {
      onSearchProcurements();
    }
    if (history.location.pathname === ProcurementTabUrl.ALL && paramsrUrl.stock_in_bys) {
      getAccounts(paramsrUrl.stock_in_bys);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [history.location.search, dispatch, isLoadingData, history.location.pathname]);

  useEffect(() => {
    dispatch(StoreGetListAction(setListStore));
  }, [dispatch]);

  const actionExport = {
    Ok: async (typeExport: string) => {
      if (!typeExport) {
        return;
      }
      setStatusExport(STATUS_IMPORT_EXPORT.DEFAULT);
      if (typeExport === EnumTypeExport.SELECTED && selected && selected.length === 0) {
        setStatusExport(0);
        showWarning("Bạn chưa chọn phiếu chuyển nào để xuất file");
        return;
      }
      setExportProgress(0);
      setIsLoadingExport(true);
      let newParams = {
        ...paramsrUrl,
        expect_receipt_from:
          paramsrUrl.expect_receipt_from &&
          getStartOfDayCommon(paramsrUrl.expect_receipt_from)?.format(),
        expect_receipt_to:
          paramsrUrl.expect_receipt_to && getEndOfDayCommon(paramsrUrl.expect_receipt_to)?.format(),
        stock_in_from:
          paramsrUrl.stock_in_from &&
          formatDateTimeFilter(paramsrUrl.stock_in_from, DATE_FORMAT.DD_MM_YY_HHmm)?.format(),
        stock_in_to:
          paramsrUrl.stock_in_to &&
          formatDateTimeFilter(paramsrUrl.stock_in_to, DATE_FORMAT.DD_MM_YY_HHmm)?.format(),
        active_from:
          paramsrUrl.active_from && getStartOfDayCommon(paramsrUrl.active_from)?.format(),
        active_to: paramsrUrl.active_to && getEndOfDayCommon(paramsrUrl.active_to)?.format(),
        type: typeExport,
        limit: paramsrUrl.limit ?? 30,
      };
      switch (typeExport) {
        case EnumTypeExport.PAGE:
          break;
        case EnumTypeExport.ALL:
          delete newParams.page;
          delete newParams.limit;
          break;
        case EnumTypeExport.SELECTED:
          newParams.ids = selected.map((item: PurchaseProcument) => item.id);
          break;
        case EnumTypeExport.ALLIN:
          newParams = { type: EnumTypeExport.ALLIN };
          break;
        default:
          break;
      }

      const queryParams = generateQuery(newParams);
      exportFile({
        conditions: queryParams,
        type: "TYPE_EXPORT_PROCUREMENTS",
      })
        .then((response) => {
          if (response.code === HttpStatus.SUCCESS) {
            setStatusExport(STATUS_IMPORT_EXPORT.CREATE_JOB_SUCCESS);
            showSuccess("Đã gửi yêu cầu xuất file");
            setListExportFile([...listExportFile, response.data.code]);
          }
        })
        .catch((error) => {
          setStatusExport(STATUS_IMPORT_EXPORT.ERROR);
          showError("Có lỗi xảy ra, vui lòng thử lại sau");
        });
    },
    Cancel: () => {
      setIsShowExportDetailProcurement(false);
      setIsLoadingExport(false);
      setExportProgress(0);
      setStatusExport(0);
      setListExportFile([]);
    },
  };

  const checkExportFile = useCallback(() => {
    let getFilePromises = listExportFile.map((code) => {
      return getFile(code);
    });
    Promise.all(getFilePromises).then((responses) => {
      responses.forEach((response) => {
        if (response.code === HttpStatus.SUCCESS) {
          setExportProgress(response.data.percent ?? 0);
          if (response.data && response.data.status === EnumImportResponseStatuses.FINISH) {
            const fileCode = response.data.code;
            const newListExportFile = listExportFile.filter((item) => {
              return item !== fileCode;
            });
            window.open(response.data.url, "_self");
            setExportProgress(100);
            setStatusExport(STATUS_IMPORT_EXPORT.JOB_FINISH);
            setListExportFile(newListExportFile);
            setIsLoadingExport(false);
          }
          if (response.data && response.data.status === EnumImportResponseStatuses.ERROR) {
            setStatusExport(STATUS_IMPORT_EXPORT.ERROR);
            setExportError(response.data.message);
            setIsLoadingExport(false);
          }
        } else {
          setStatusExport(STATUS_IMPORT_EXPORT.ERROR);
          setIsLoadingExport(false);
        }
      });
    });
  }, [listExportFile]);

  useEffect(() => {
    if (
      listExportFile.length === 0 ||
      statusExport === STATUS_IMPORT_EXPORT.JOB_FINISH ||
      statusExport === STATUS_IMPORT_EXPORT.ERROR
    )
      return;
    checkExportFile();

    const getFileInterval = setInterval(checkExportFile, 3000);
    return () => clearInterval(getFileInterval);
  }, [listExportFile, checkExportFile, statusExport]);

  const printContentCallback = useCallback(
    (printContent: Array<PurchaseOrderPrint>) => {
      if (!printContent || printContent.length === 0) return;
      const textResponse = printContent.map((single) => {
        return "<div class='singleOrderPrint'>" + single.html_content + "</div>";
      });
      let textResponseFormatted = textResponse.join(pageBreak);
      //xóa thẻ p thừa
      let result = textResponseFormatted.replaceAll("<p></p>", "");
      setPrintContent(result);
      handlePrint && handlePrint();
    },
    [handlePrint],
  );

  const onPrint = useCallback(
    async (ids: string) => {
      const res = await callApiNative(
        { isShowLoading: true },
        dispatch,
        printMultipleProcurementApi,
        ids,
      );
      if (res && res.errors) {
        res.errors.forEach((e: string) => {
          showError(e);
        });
        return;
      } else {
        printContentCallback(res);
        handlePrint && handlePrint();
      }
    },
    [dispatch, printContentCallback, handlePrint],
  );

  const onMenuClick = (index: number) => {
    if (selected.length === 0) {
      showWarning("Chưa có phiếu nào được chọn");
      return;
    }
    switch (index) {
      case EnumActionIndex.PRINT_PROCUREMENTS:
        setIsShowPrintConfirm(true);
        break;
      default:
        break;
    }
  };

  return (
    <TabListWrapper>
      <div className="margin-top-20">
        <TabListFilter
          actions={actionList}
          paramsUrl={paramsrUrl}
          onClickOpen={() => setIsShowSettingColumn(true)}
          accounts={accounts}
          onMenuClick={onMenuClick}
          listStore={listStore}
        />
        <div style={{ marginTop: -20 }}>
          <CustomTable
            isRowSelection
            selectedRowKey={selected.map((e) => e.id)}
            isLoading={isLoading}
            dataSource={data.items}
            sticky={{ offsetScroll: 5, offsetHeader: OFFSET_HEADER_TABLE }}
            columns={columnFinal}
            rowKey={(item) => item.id}
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
        {isVisibleDraft && (
          <ProcumentConfirmModal
            isEdit={false}
            items={[]}
            stores={listStore}
            poData={poItems || initPurchaseOrder}
            procumentCode={procumentCode}
            now={now}
            visible={isVisibleDraft}
            item={item}
            onOk={(value: PurchaseProcument) => {
              onConfirmProcument(value);
            }}
            onDelete={onDeleteProcument}
            loading={isLoadingConfirm}
            defaultStore={storeExpect}
            onCancel={() => {
              setIsVisibleDaft(false);
            }}
          />
        )}
        {isShowSettingColumn && (
          <ModalSettingColumn
            visible={isShowSettingColumn}
            onCancel={() => setIsShowSettingColumn(false)}
            onOk={(data) => {
              setIsShowSettingColumn(false);
              setColumns(data);
            }}
            data={columns}
          />
        )}
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
        {isVisibleConfirm && (
          <ProcumentInventoryModal
            isDetail={isDetail}
            loadDetail={loadPODetail}
            isEdit={false}
            items={[]}
            poData={purchaseOrderItem}
            stores={listStore}
            now={now}
            visible={isVisibleConfirm}
            item={procumentInventory}
            onOk={(value: PurchaseProcument) => {
              onReciveProcument(value);
            }}
            onDelete={onDeleteProcument}
            loading={isLoadingRecive}
            defaultStore={storeExpect}
            procumentCode={procumentCode}
            onCancel={() => {
              setIsVisibleConfirm(false);
            }}
          />
        )}
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
        <Modal
          width={500}
          centered
          visible={isShowPrintConfirm}
          onCancel={() => setIsShowPrintConfirm(false)}
          onOk={() => {
            setIsShowPrintConfirm(false);
            const ids = selected.map((item: PurchaseProcument) => item.id).join(",");
            onPrint(ids);
          }}
          cancelText={`Hủy`}
          okText={`Đồng ý`}
        >
          <Row align="top">
            <PrinterOutlined
              style={{
                fontSize: 40,
                background: "#2A2A86",
                color: "white",
                borderRadius: "50%",
                padding: 10,
                marginRight: 10,
              }}
            />
            <strong className="margin-top-10">
              Bạn có muốn in {selected.length} phiếu nhập kho đã chọn ?
            </strong>
          </Row>
        </Modal>
        <ProcurementExport
          onCancel={actionExport.Cancel}
          onOk={actionExport.Ok}
          isVisible={isShowExportDetailProcurement}
          exportProgress={exportProgress}
          statusExport={statusExport}
          exportError={exportError}
          isLoadingExport={isLoadingExport}
        />
      </div>
      <div style={{ display: "none" }}>
        <div className="printContent" ref={printElementRef}>
          <div
            dangerouslySetInnerHTML={{
              __html: purify.sanitize(printContent),
            }}
          />
        </div>
      </div>
    </TabListWrapper>
  );
};

export default TabList;
