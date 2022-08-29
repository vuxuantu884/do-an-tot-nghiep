import { Divider, Modal, Radio, Row, Space } from "antd";
import PurchaseOrderFilter from "component/filter/purchase-order.filter";
import { MenuAction } from "component/table/ActionButton";
import CustomTable, { ICustomTableColumType } from "component/table/CustomTable";
import TagStatus, { TagStatusType } from "component/tag/tag-status";
import { HttpStatus } from "config/http-status.config";
import { PurchaseOrderPermission } from "config/permissions/purchase-order.permission";
import UrlConfig from "config/url.config";
import { unauthorizedAction } from "domain/actions/auth/auth.action";
import { StoreGetListAction } from "domain/actions/core/store.action";
import { hideLoading } from "domain/actions/loading.action";
import {
  createConfigPoAction,
  PODeleteAction,
  PoSearchAction,
  PoUpdateNoteAction,
  updateConfigPoAction,
} from "domain/actions/po/po.action";
import useAuthorization from "hook/useAuthorization";
import { PageResponse } from "model/base/base-metadata.response";
import { StoreResponse } from "model/core/store.model";
import { FilterConfig, FilterConfigRequest } from "model/other";
import {
  POProgressResult,
  PurchaseOrder,
  PurchaseOrderPrint,
  PurchaseOrderQuery,
} from "model/purchase-order/purchase-order.model";
import { PurchaseProcument } from "model/purchase-order/purchase-procument";
import { RootReducerType } from "model/reducers/RootReducerType";
import moment from "moment";
import React, { lazy, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useHistory } from "react-router-dom";
import { exportFile, getFile } from "service/other/export.service";
import {
  getPrintContent,
  getPurchaseOrderConfigService,
  updatePurchaseOrderStatusWaitingApproval,
} from "service/purchase-order/purchase-order.service";
import { generateQuery } from "utils/AppUtils";
import {
  ArrPoStatus,
  COLUMN_CONFIG_TYPE,
  PoPaymentStatus,
  POStatus,
  ProcumentStatus,
} from "utils/Constants";
import { ConvertUtcToLocalDate, DATE_FORMAT } from "utils/DateUtils";
import { showError, showSuccess, showWarning } from "utils/ToastUtils";
import { getQueryParams, useQuery } from "utils/useQuery";
import "./purchase-order-list.scss";
import { PurchaseOrderListContainer } from "./purchase-order-list.style";
import EditNote from "../order-online/component/edit-note";
import TextStatus from "component/tag/text-status";
import statusDraft from "assets/icon/status-draft-new.svg";
import statusWaitingApproval from "assets/icon/status-waiting-approval-new.svg";
import statusFinalized from "assets/icon/status-finalized-new.svg";
import statusStored from "assets/icon/status-stored-new.svg";
import statusFinished from "assets/icon/status-finished-new.svg";
import statusCompleted from "assets/icon/status-completed-new.svg";
import statusCancelled from "assets/icon/status-cancelled-new.svg";
import { CloseCircleOutlined, PrinterOutlined } from "@ant-design/icons";
import { callApiNative } from "utils/ApiUtils";
import { useReactToPrint } from "react-to-print";
import purify from "dompurify";
import { PrintTypePo } from "./helper";
import POProgressModal from "./POProgressModal";

import iconPo1 from "assets/icon/po-status-1.svg";
import iconPo2 from "assets/icon/po-status-2.svg";
import iconPo3 from "assets/icon/po-status-3.svg";
import phoneIcon from "assets/icon/phone-2.svg";
import NumberFormat from "react-number-format";
import CustomPagination from "../../component/table/CustomPagination";

const ModalDeleteConfirm = lazy(() => import("component/modal/ModalDeleteConfirm"));
const ModalSettingColumn = lazy(() => import("component/table/ModalSettingColumn"));
const ExportModal = lazy(() => import("screens/purchase-order/modal/export.modal"));

const actionsDefault: Array<MenuAction> = [
  {
    id: 1,
    name: "Chờ duyệt",
    icon: (
      <img
        width={18}
        height={18}
        src={statusWaitingApproval}
        alt=""
        style={{ marginRight: 3, marginBottom: 2 }}
      />
    ),
  },
  {
    id: 2,
    name: "In đơn",
    icon: <PrinterOutlined />,
  },
  {
    id: 3,
    name: "Xóa",
    icon: <CloseCircleOutlined />,
  },
];

const typeStatus: any = {
  received: "success",
  not_received: "warning",
};

const labelStatus: any = {
  received: "Kho đã nhận",
  not_received: "Đã chia hàng",
};

interface PurchaseOrderListScreenProps {
  showExportModal: boolean;
  setShowExportModal: (param: boolean) => void;
  setError: (param: boolean) => void;
}

const PurchaseOrderListScreen: React.FC<PurchaseOrderListScreenProps> = (
  props: PurchaseOrderListScreenProps,
) => {
  const { showExportModal, setShowExportModal, setError } = props;
  const query = useQuery();
  const history = useHistory();
  const dispatch = useDispatch();
  const isFirstLoad = useRef(true);
  const [tableLoading, setTableLoading] = useState(true);
  const [showSettingColumn, setShowSettingColumn] = useState(false);
  const [isConfirmDelete, setConfirmDelete] = useState<boolean>(false);
  const [selected, setSelected] = useState<Array<PurchaseOrder>>([]);
  const [listStore, setListStore] = useState<Array<StoreResponse>>([]);
  const [listExportFile, setListExportFile] = useState<Array<string>>([]);
  const userReducer = useSelector((state: RootReducerType) => state.userReducer);
  const { account } = userReducer;
  const [lstConfig, setLstConfig] = useState<Array<FilterConfig>>([]);
  const [showPrintConfirm, setShowPrintConfirm] = useState<boolean>(false);
  const [printContent, setPrintContent] = useState<string>("");
  const [poPrintType, setPOPrintType] = useState<string>(PrintTypePo.PURCHASE_ORDER_FGG);
  const [showWaitingConfirm, setShowWaitingConfirm] = useState<boolean>(false);
  const [showPoProgress, setShowPOProgress] = useState<boolean>(false);
  const [dataProgress, setDataProgress] = useState<POProgressResult>();

  let initQuery: PurchaseOrderQuery = {};

  let dataQuery: PurchaseOrderQuery = {
    ...initQuery,
    ...getQueryParams(query),
  };
  let [params, setPrams] = useState<PurchaseOrderQuery>(dataQuery);
  const [data, setData] = useState<PageResponse<PurchaseOrder>>({
    metadata: {
      limit: 30,
      page: 1,
      total: 0,
    },
    items: [],
  });
  const printElementRef = useRef(null);

  const onExport = useCallback(() => {
    let queryParams = generateQuery(params);
    exportFile({
      conditions: queryParams,
      type: "EXPORT_PURCHASE_ORDER",
    })
      .then((response) => {
        if (response.code === HttpStatus.SUCCESS) {
          showSuccess("Đã gửi yêu cầu xuất file");
          setListExportFile([...listExportFile, response.data.code]);
        }
      })
      .catch((error) => {
        console.log("purchase order export file error", error);
        showError("Có lỗi xảy ra, vui lòng thử lại sau");
      });
  }, [params, listExportFile]);
  const checkExportFile = useCallback(() => {
    let getFilePromises = listExportFile.map((code) => {
      return getFile(code);
    });
    Promise.all(getFilePromises).then((responses) => {
      responses.forEach((response) => {
        if (response.code === HttpStatus.SUCCESS) {
          if (response.data && response.data.status === "FINISH") {
            let fileCode = response.data.code,
              newListExportFile = listExportFile.filter((item) => {
                return item !== fileCode;
              });
            window.open(response.data.url);
            setListExportFile(newListExportFile);
          }
        }
      });
    });
  }, [listExportFile]);
  useEffect(() => {
    if (listExportFile.length === 0) return;
    checkExportFile();
    const getFileInterval = setInterval(checkExportFile, 3000);
    return () => clearInterval(getFileInterval);
  }, [listExportFile, checkExportFile]);
  const onMenuClick = useCallback(
    (index: number) => {
      if (selected && selected.length === 0) {
        showWarning("Bạn chưa chọn đơn đặt hàng nào");
        return;
      }
      switch (index) {
        case 1:
          setShowWaitingConfirm(true);
          break;
        case 2:
          setShowPrintConfirm(true);
          break;
        case 3:
          setConfirmDelete(true);
          // onDelete();
          break;
      }
    },
    [selected],
  );

  const [canDeletePO] = useAuthorization({
    acceptPermissions: [PurchaseOrderPermission.delete],
  });
  const [canPrintPO] = useAuthorization({
    acceptPermissions: [PurchaseOrderPermission.print],
  });
  const [canUpdatePO] = useAuthorization({
    acceptPermissions: [PurchaseOrderPermission.update],
  });
  const actions = useMemo(() => {
    return actionsDefault.filter((item) => {
      if (item.id === 3) {
        return canDeletePO;
      }
      if (item.id === 2) {
        return canPrintPO;
      }
      if (item.id === 1) {
        return canUpdatePO;
      }
      return false;
    });
  }, [canDeletePO, canPrintPO, canUpdatePO]);

  const onUpdateCall = (result: PurchaseOrder | null) => {
    if (result !== null) {
      showSuccess("Cập nhật nhập hàng thành công");
      dispatch(PoSearchAction({}, setSearchResult));
    }
    setTableLoading(false);
  };

  const onEditPurchaseOrder = (
    item: Pick<PurchaseOrder, "id" | "note" | "supplier_note">,
    value: string,
    name: "note" | "supplier_note",
  ) => {
    setTableLoading(true);
    dispatch(
      PoUpdateNoteAction(
        item.id,
        {
          note: name === "note" ? value : item.note,
          supplier_note: name === "supplier_note" ? value : item.supplier_note,
        },
        onUpdateCall,
      ),
    );
  };

  const defaultColumns: Array<ICustomTableColumType<PurchaseOrder>> = useMemo(() => {
    return [
      {
        title: "Mã đơn đặt hàng",
        dataIndex: "code",
        width: 150,
        render: (value: string, i: PurchaseOrder) => {
          return (
            <>
              <Link
                to={`${UrlConfig.PURCHASE_ORDERS}/${i.id}`}
                style={{ fontWeight: 500, fontSize: 16 }}
              >
                {value}
              </Link>
              <div className="fs-12 text-muted">
                Ngày tạo: {ConvertUtcToLocalDate(i.created_date, "DD/MM/yy")}
              </div>
              <div className="fs-12 text-muted">
                Ngày duyệt: {ConvertUtcToLocalDate(i.activated_date, "DD/MM/yy")}
              </div>
              <div>
                <span style={{ color: "#222222" }}>Tổng SL SP: </span>
                <span className="font-weight-500">{i.planned_quantity}</span>
              </div>
              <div>
                <span className="text-muted">Mã tham chiếu</span>:{" "}
                <span style={{ color: "#75757B", fontWeight: 500 }}>{i.reference}</span>
              </div>
            </>
          );
        },
        visible: true,
        fixed: "left",
      },
      {
        title: "Nhà cung cấp",
        dataIndex: "supplier",
        width: 140,
        visible: true,
        render: (value, record) => {
          return (
            <div style={{ lineHeight: "18px" }}>
              <div>
                <Link
                  style={{ fontWeight: 500 }}
                  to={`${UrlConfig.SUPPLIERS}/${record.supplier_id}`}
                  target="_blank"
                >
                  {record.supplier_code}
                </Link>
                <img src={phoneIcon} alt="phone" />{" "}
                <span className="text-muted fs-12">{record.phone}</span>
              </div>
              <div className="fs-12 font-weight-500" style={{ color: "#222222" }}>
                {value}
              </div>
            </div>
          );
        },
      },
      {
        title: "Trạng thái",
        width: 160,
        dataIndex: "status",
        render: (value: string, record) => {
          let type = TagStatusType.normal;
          let icon = "";
          let isFinishedStored = false;

          let processIcon;
          let textProcurementStatus: string;

          switch (record.receive_status) {
            case ProcumentStatus.NOT_RECEIVED:
            case null:
              processIcon = iconPo3;
              textProcurementStatus = "Chưa nhập kho";
              break;
            case ProcumentStatus.PARTIAL_RECEIVED:
              textProcurementStatus = "Nhập kho 1 phần";
              processIcon = iconPo2;
              break;
            case ProcumentStatus.RECEIVED:
            case ProcumentStatus.FINISHED:
              processIcon = iconPo1;
              textProcurementStatus = "Đã nhập kho";
              break;
            default:
              processIcon = iconPo3;
              textProcurementStatus = "Chưa nhập kho";
          }

          let financeProcessIcon = undefined;
          let textFinanceStatus = "";
          switch (record.financial_status) {
            case PoPaymentStatus.UNPAID:
            case null:
              financeProcessIcon = iconPo3;
              textFinanceStatus = "Chưa thanh toán";
              break;
            case PoPaymentStatus.PARTIAL_PAID:
              financeProcessIcon = iconPo2;
              textFinanceStatus = "Thanh toán 1 phần";
              break;
            case PoPaymentStatus.PAID:
            case PoPaymentStatus.FINISHED:
              financeProcessIcon = iconPo1;
              textFinanceStatus = "Đã thanh toán";
              break;
            default:
              financeProcessIcon = iconPo3;
              textFinanceStatus = "Chưa thanh toán";
              break;
          }

          switch (record.status) {
            case POStatus.FINALIZED:
              type = TagStatusType.primary;
              icon = statusFinalized;
              break;
            case POStatus.STORED:
              if (record.receive_status === ProcumentStatus.FINISHED) {
                type = TagStatusType.success;
                icon = statusFinished;
                isFinishedStored = true;
              } else {
                type = TagStatusType.warning;
                icon = statusStored;
              }
              break;
            case POStatus.CANCELLED:
              if (record.receive_status === ProcumentStatus.FINISHED) {
                isFinishedStored = false;
              }
              type = TagStatusType.danger;
              icon = statusCancelled;
              break;
            case POStatus.FINISHED:
              if (record.receive_status === ProcumentStatus.FINISHED) {
                isFinishedStored = false;
              }
              type = TagStatusType.success;
              icon = statusCompleted;
              break;
            case POStatus.COMPLETED:
              if (record.receive_status === ProcumentStatus.FINISHED) {
                isFinishedStored = false;
              }
              type = TagStatusType.success;
              icon = statusCompleted;
              break;
            case POStatus.WAITING_APPROVAL:
              type = TagStatusType.secondary;
              icon = statusWaitingApproval;
              break;
            case POStatus.DRAFT:
              type = TagStatusType.secondary;
              icon = statusDraft;
              break;
          }
          return (
            <div>
              <TextStatus icon={icon} type={type}>
                {isFinishedStored
                  ? "Kết thúc nhập kho"
                  : ArrPoStatus.find((e) => e.key === value)?.value}
              </TextStatus>
              <div className="display-flex" style={{ alignItems: "center" }}>
                <img src={processIcon} alt={textProcurementStatus} style={{ marginRight: 5 }} />
                <span>{textProcurementStatus}</span>
              </div>
              <div className="display-flex" style={{ alignItems: "center" }}>
                <img src={financeProcessIcon} alt={textFinanceStatus} style={{ marginRight: 5 }} />
                <span>{textFinanceStatus}</span>
              </div>
            </div>
          );
        },
        visible: true,
      },
      {
        title: "Ngày nhận hàng dự kiến",
        dataIndex: "procurements",
        render: (value: Array<PurchaseProcument>) => {
          if (value && value.length > 0) {
            value.sort((a, b) => moment(a.expect_receipt_date).diff(moment(b.expect_receipt_date)));
            const procurementData: Array<Array<PurchaseProcument>> = [];
            // nhóm pr có chung ngày nhận dự kiến vào 1 array
            for (let i = 0; i < value.length; i++) {
              const procurementArrayMap = [];
              let dateI = ConvertUtcToLocalDate(value[i]?.expect_receipt_date, DATE_FORMAT.DDMMYYY);
              let dateIPlus = ConvertUtcToLocalDate(
                value[i + 1]?.expect_receipt_date,
                DATE_FORMAT.DDMMYYY,
              );
              for (let j = 0; j < value.length; j++) {
                let dateJ = ConvertUtcToLocalDate(
                  value[j]?.expect_receipt_date,
                  DATE_FORMAT.DDMMYYY,
                );
                if (dateI === dateJ) {
                  procurementArrayMap.push(value[j]);
                }
              }
              if (dateI !== dateIPlus) {
                procurementData.push(procurementArrayMap);
              }
            }
            const procurementSupplier: Array<Array<PurchaseProcument>> =
              Object.values(procurementData);
            const procurementFilter: Array<Array<PurchaseProcument>> = procurementSupplier.filter(
              (element) =>
                !element.every(
                  (item: PurchaseProcument) => item.status === ProcumentStatus.CANCELLED,
                ),
            );
            return (
              <div>
                {procurementFilter.map((i, idx, row) => {
                  let status = "draft";
                  if (
                    i.every(
                      (el: PurchaseProcument) =>
                        el.status !== ProcumentStatus.RECEIVED &&
                        el.status !== ProcumentStatus.DRAFT,
                    )
                  ) {
                    status = ProcumentStatus.NOT_RECEIVED;
                  } else if (
                    i.some((el: PurchaseProcument) => el.status === ProcumentStatus.RECEIVED)
                  ) {
                    status = ProcumentStatus.RECEIVED;
                  }
                  return (
                    <>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          marginBottom: idx + 1 === row.length ? 3 : 0,
                        }}
                      >
                        <div style={{ marginRight: 8, paddingTop: 3 }}>
                          {ConvertUtcToLocalDate(i[0].expect_receipt_date, DATE_FORMAT.DDMMYYY)}
                        </div>
                        {status !== "draft" && (
                          <div>
                            {TagStatus({
                              type: typeStatus[status],
                              children: labelStatus[status],
                            })}
                          </div>
                        )}
                      </div>
                      {idx + 1 !== row.length && <Divider style={{ margin: "8px 0" }} />}
                    </>
                  );
                })}
              </div>
            );
          } else {
            return null;
          }
        },
        visible: true,
        width: 200,
      },
      {
        title: "Ngày chốt công nợ",
        dataIndex: "ap_closing_date",
        width: 100,
        align: "center",
        visible: true,
        render: (date: string) => {
          return date ? ConvertUtcToLocalDate(date, DATE_FORMAT.DDMMYYY) : "";
        },
      },
      {
        title: "Tổng tiền",
        dataIndex: "total",
        width: 100,
        render: (value: number) => (
          <NumberFormat
            value={value}
            className="foo"
            displayType={"text"}
            thousandSeparator={true}
          />
        ),
        visible: true,
        align: "center",
      },
      {
        title: "Merchandiser",
        dataIndex: "merchandiser",
        render: (value, row: PurchaseOrder) => {
          return (
            <div>
              <div>
                <Link
                  to={`${UrlConfig.ACCOUNTS}/${row.merchandiser_code}`}
                  className="link-underline"
                  target="_blank"
                >
                  {row && row.merchandiser_code && row.merchandiser && (
                    <span>
                      {row.merchandiser_code} - {row.merchandiser}
                      <span className="text-muted"> (Mer)</span>
                    </span>
                  )}
                </Link>
              </div>
              <div>
                <Link
                  to={`${UrlConfig.ACCOUNTS}/${row.qc_code}`}
                  className="link-underline"
                  target="_blank"
                >
                  {row && row.qc_code && row.qc && (
                    <span>
                      {row.qc_code} - {row.qc}
                      <span className="text-muted">(QC)</span>
                    </span>
                  )}
                </Link>
              </div>
              <div>
                <Link
                  to={`${UrlConfig.ACCOUNTS}/${row.designer_code}`}
                  className="link-underline"
                  target="_blank"
                >
                  {row && row.designer_code && row.designer && (
                    <span>
                      {row.designer_code} - {row.designer}
                      <span className="text-muted">(Thiết kế)</span>
                    </span>
                  )}
                </Link>
              </div>
            </div>
          );
        },
        width: 150,
        visible: true,
      },
      {
        title: "Ghi chú nội bộ",
        dataIndex: "note",
        visible: true,
        render: (value, item: PurchaseOrder) => {
          return (
            <div className="note">
              <EditNote note={value} onOk={(value) => onEditPurchaseOrder(item, value, "note")} />
            </div>
          );
        },
        width: 170,
      },
      {
        title: "Ghi chú nhà cung cấp",
        dataIndex: "supplier_note",
        width: 150,
        visible: true,
        render: (value, item: PurchaseOrder) => {
          return (
            <div className="note">
              <EditNote
                note={value}
                onOk={(value) => onEditPurchaseOrder(item, value, "supplier_note")}
              />
            </div>
          );
        },
      },
      {
        title: "Tag",
        dataIndex: "tags",
        render: (value: string) => {
          return <div className="txt-muted">{value}</div>;
        },
        visible: true,
        width: 120,
      },
    ];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [columns, setColumn] =
    useState<Array<ICustomTableColumType<PurchaseOrder>>>(defaultColumns);

  const onPageChange = useCallback(
    (page, size) => {
      params.page = page;
      params.limit = size;
      let queryParam = generateQuery(params);
      setPrams({ ...params });
      history.replace(`${UrlConfig.PURCHASE_ORDERS}?${queryParam}`);
    },
    [history, params],
  );

  const onFilter = useCallback(
    (values) => {
      let newPrams = { ...params, ...values, page: 1 };
      setPrams(newPrams);
      let queryParam = generateQuery(newPrams);
      history.push(`${UrlConfig.PURCHASE_ORDERS}?${queryParam}`);
    },
    [history, params],
  );
  const columnFinal = useMemo(() => columns.filter((item) => item.visible === true), [columns]);

  const setSearchResult = useCallback(
    (result: PageResponse<PurchaseOrder> | false) => {
      setTableLoading(false);
      if (!!result) {
        setData(result);
      } else {
        setError(true);
      }
    },
    [setError],
  );

  const getConfigColumnPo = useCallback(() => {
    if (account && account.code) {
      getPurchaseOrderConfigService(account.code)
        .then((res) => {
          switch (res.code) {
            case HttpStatus.SUCCESS:
              if (res) {
                setLstConfig(res.data);
                if (res.data && res.data.length > 0) {
                  const userConfigColumn = res.data.find(
                    (e) => e.type === COLUMN_CONFIG_TYPE.COLUMN_PO,
                  );

                  if (userConfigColumn) {
                    let cf = JSON.parse(userConfigColumn.json_content) as Array<
                      ICustomTableColumType<PurchaseOrder>
                    >;
                    cf.forEach((e) => {
                      e.render = defaultColumns.find((p) => p.dataIndex === e.dataIndex)?.render;
                    });
                    setColumn(cf);
                  }
                }
              }
              break;
            case HttpStatus.UNAUTHORIZED:
              dispatch(unauthorizedAction());
              break;
            default:
              res.errors.forEach((e: any) => showError(e));
              break;
          }
        })
        .catch((error) => {
          console.log("error", error);
        })
        .finally(() => {
          dispatch(hideLoading());
        });
    }
  }, [account, dispatch, defaultColumns]);

  useEffect(() => {
    getConfigColumnPo();
  }, [getConfigColumnPo]);

  useEffect(() => {
    if (isFirstLoad.current) {
      dispatch(StoreGetListAction(setListStore));
    }
    isFirstLoad.current = false;
    setTableLoading(true);
    dispatch(PoSearchAction(params, setSearchResult));
  }, [dispatch, params, setSearchResult]);

  const onSelect = useCallback((selectedRow: Array<PurchaseOrder>) => {
    setSelected(
      selectedRow.filter(function (el) {
        return el !== undefined;
      }),
    );
  }, []);

  const deleteCallback = useCallback((result: POProgressResult) => {
    setShowPOProgress(true);
    setDataProgress(result);
  }, []);

  const onDelete = useCallback(() => {
    if (selected.length === 0) {
      showWarning("Vui lòng chọn đơn đặt hàng cần xóa");
      return;
    }
    const ids = selected.map((item: PurchaseOrder) => item.id).join(",");
    dispatch(PODeleteAction(ids, deleteCallback));
  }, [deleteCallback, dispatch, selected]);

  const onSaveConfigColumn = useCallback(
    (data: Array<ICustomTableColumType<PurchaseOrder>>) => {
      let config = lstConfig.find(
        (e) => e.type === COLUMN_CONFIG_TYPE.COLUMN_PO,
      ) as FilterConfigRequest;
      if (!config) config = {} as FilterConfigRequest;

      const json_content = JSON.stringify(data);
      config.type = COLUMN_CONFIG_TYPE.COLUMN_PO;
      config.json_content = json_content;
      config.name = `${account?.code}_config_column_po`;
      if (config && config.id) {
        dispatch(updateConfigPoAction(config));
      } else {
        dispatch(createConfigPoAction(config));
      }
    },
    [dispatch, account?.code, lstConfig],
  );

  const handlePrint = useReactToPrint({
    content: () => printElementRef.current,
  });

  const printContentCallback = useCallback(
    (printContent: Array<PurchaseOrderPrint>) => {
      const pageBreak = "<div class='pageBreak'></div>";
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

  const actionPrint = useCallback(
    async (ids: string, printType: string) => {
      const res = await callApiNative(
        { isShowLoading: true },
        dispatch,
        getPrintContent,
        ids,
        printType,
      );
      if (res && res.data && res.data.message) {
        showError(res.data.message);
      } else {
        printContentCallback(res);
        handlePrint && handlePrint();
      }
    },
    [dispatch, handlePrint, printContentCallback],
  );

  const onCloseProgressModal = () => {
    setShowPOProgress(false);
    setTableLoading(true);
    dispatch(PoSearchAction(params, setSearchResult));
  };

  const onUpdatePOStatusWaitingApproval = async () => {
    setShowWaitingConfirm(false);
    const ids = selected.map((item: PurchaseOrder) => item.id).join(",");
    const res = await callApiNative(
      { isShowError: true },
      dispatch,
      updatePurchaseOrderStatusWaitingApproval,
      ids,
    );
    if (res) {
      setDataProgress(res);
      setShowPOProgress(true);
    }
  };

  return (
    <PurchaseOrderListContainer>
      <div className="purchase-order-list margin-top-20">
        <PurchaseOrderFilter
          openSetting={() => setShowSettingColumn(true)}
          params={params}
          onMenuClick={onMenuClick}
          actions={actions}
          onFilter={onFilter}
          listStore={listStore}
        />
        <CustomPagination
          pagination={{
            pageSize: data.metadata.limit,
            total: data.metadata.total,
            current: data.metadata.page,
            showSizeChanger: true,
            onChange: onPageChange,
            onShowSizeChange: onPageChange,
          }}
        />
        <CustomTable
          className="small-padding"
          bordered
          isRowSelection
          isLoading={tableLoading}
          showColumnSetting={true}
          scroll={{ x: "max-content" }}
          sticky={{ offsetScroll: 10, offsetHeader: 55 }}
          pagination={false}
          onShowColumnSetting={() => setShowSettingColumn(true)}
          onSelectedChange={onSelect}
          dataSource={data.items}
          columns={columnFinal}
          rowKey={(item: PurchaseOrder) => item.id}
        />
      </div>
      <ExportModal
        visible={showExportModal}
        onCancel={() => setShowExportModal(false)}
        onOk={() => {
          setShowExportModal(false);
          onExport();
        }}
      />
      <ModalSettingColumn
        visible={showSettingColumn}
        onCancel={() => setShowSettingColumn(false)}
        onOk={(data) => {
          setShowSettingColumn(false);
          //save config column
          onSaveConfigColumn(data);
          setColumn(data);
        }}
        data={defaultColumns}
        isSetDefaultColumn
      />
      <Modal
        width={500}
        centered
        visible={showPrintConfirm}
        onCancel={() => setShowPrintConfirm(false)}
        onOk={() => {
          setShowPrintConfirm(false);
          const ids = selected.map((item: PurchaseOrder) => item.id).join(",");
          actionPrint(ids, poPrintType);
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
              marginRight: 20,
            }}
          />
          <Space direction="vertical" size="middle">
            <strong className="margin-top-10">
              Bạn có muốn in {selected.length} đơn đặt hàng đã chọn ?
            </strong>
            <Radio.Group onChange={(e) => setPOPrintType(e.target.value)} value={poPrintType}>
              <Space direction="vertical">
                <Radio value={PrintTypePo.PURCHASE_ORDER_FGG}>In đơn đặt hàng FGG</Radio>
                <Radio value={PrintTypePo.PURCHASE_ORDER}>In đơn đặt hàng NCC</Radio>
              </Space>
            </Radio.Group>
          </Space>
        </Row>
      </Modal>
      <Modal
        width={500}
        centered
        visible={showWaitingConfirm}
        onCancel={() => setShowWaitingConfirm(false)}
        onOk={onUpdatePOStatusWaitingApproval}
        cancelText={`Hủy`}
        okText={`Đồng ý`}
      >
        <Row align="top">
          <strong className="margin-top-10">
            Bạn xác nhận chờ duyệt {selected.length} đơn đặt hàng đã chọn ?
          </strong>
        </Row>
      </Modal>
      <POProgressModal
        dataProcess={dataProgress}
        visible={showPoProgress}
        onOk={onCloseProgressModal}
        onCancel={onCloseProgressModal}
      />
      <ModalDeleteConfirm
        onCancel={() => setConfirmDelete(false)}
        onOk={() => {
          setConfirmDelete(false);
          // dispatch(categoryDeleteAction(idDelete, onDeleteSuccess));
          onDelete();
        }}
        title={`Bạn chắc chắn xóa ${selected.length} đơn đặt hàng ?`}
        subTitle="Các tập tin, dữ liệu bên trong thư mục này cũng sẽ bị xoá."
        visible={isConfirmDelete}
      />
      <div style={{ display: "none" }}>
        <div className="printContent" ref={printElementRef}>
          <div
            dangerouslySetInnerHTML={{
              __html: purify.sanitize(printContent),
            }}
          />
        </div>
      </div>
    </PurchaseOrderListContainer>
  );
};
export default PurchaseOrderListScreen;
