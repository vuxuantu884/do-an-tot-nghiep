import { PhoneOutlined, PrinterOutlined } from "@ant-design/icons";
import { Modal, Row } from "antd";
import { MenuAction } from "component/table/ActionButton";
import CustomTable, { ICustomTableColumType } from "component/table/CustomTable";
import { PurchaseOrderPermission } from "config/permissions/purchase-order.permission";
import { StyledComponent } from "./styles";
import {
  ConfirmPoProcumentAction,
  PoProcumentDeleteAction,
  POSearchProcurement,
} from "domain/actions/po/po-procument.action";
import { PoDetailAction } from "domain/actions/po/po.action";
import { PageResponse } from "model/base/base-metadata.response";
import { StoreResponse } from "model/core/store.model";
import { PurchaseOrder, PurchaseOrderPrint } from "model/purchase-order/purchase-order.model";
import {
  POProcumentField,
  ProcurementQuery,
  PurchaseProcument,
  PurchaseProcumentLineItem,
  POProcumentLineItemField,
} from "model/purchase-order/purchase-procument";
import moment from "moment";
import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import ProcumentInventoryModal from "screens/purchase-order/modal/procument-inventory.modal";
import { updatePurchaseProcumentNoteService } from "service/purchase-order/purchase-procument.service";
import { callApiNative } from "utils/ApiUtils";
import { ProcurementStatus, ProcurementStatusName } from "utils/Constants";
import { ConvertUtcToLocalDate, DATE_FORMAT, getEndOfDay, getStartOfDay } from "utils/DateUtils";
import { showError, showSuccess, showWarning } from "utils/ToastUtils";
import { Link } from "react-router-dom";
import UrlConfig, { ProcurementTabUrl } from "../../../../../config/url.config";
import TabCurrentFilter from "../../filter/TabCurrent.filter";
import { getQueryParams, useQuery } from "utils/useQuery";
import { useHistory } from "react-router";
import { formatCurrency, generateQuery } from "utils/AppUtils";
import statusDraft from "assets/icon/pr-draft.svg";
import statusFinalized from "assets/icon/status-finalized-new.svg";
import statusStored from "assets/icon/status-finished-new.svg";
import statusCancelled from "assets/icon/status-cancelled-new.svg";
import EditNote from "screens/order-online/component/edit-note";
import { primaryColor } from "utils/global-styles/variables";
import { cloneDeep } from "lodash";
import { RootReducerType } from "model/reducers/RootReducerType";
import useAuthorization from "hook/useAuthorization";
import { printMultipleProcurementApi } from "service/purchase-order/purchase-order.service";
import { useReactToPrint } from "react-to-print";
import purify from "dompurify";
import ModalSettingColumn from "component/table/ModalSettingColumn";
import { AccountResponse } from "model/account/account.model";
import { searchAccountPublicApi } from "service/accounts/account.service";

const ACTIONS_INDEX = {
  PRINT_PROCUREMENTS: 1,
  CANCEL: 2,
};

const TabCurrent: React.FC = () => {
  const dispatch = useDispatch();
  const history = useHistory();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<PageResponse<PurchaseProcument>>({
    metadata: {
      limit: 30,
      page: 1,
      total: 0,
    },
    items: [],
  });

  const [selectedProcurement, setSelectedProcurement] = useState<PurchaseProcument>(
    {} as PurchaseProcument,
  );
  const [purchaseOrderItem, setPurchaseOrderItem] = useState<PurchaseOrder>({} as PurchaseOrder);
  const [isVisibleReceiveModal, setIsVisibleReceiveModal] = useState<boolean>(false);
  const [isLoadingReceive, setIsLoadingReceive] = useState<boolean>(false);
  const [showLoadingBeforeShowModal, setShowLoadingBeforeShowModal] = useState<number>(-1);

  const [selected, setSelected] = useState<Array<PurchaseProcument>>([]);
  // const [showConfirm, setShowConfirm] = useState<boolean>(false);
  // const [listProcurement, setListProcurement] = useState<Array<PurchaseProcument>>();
  const [printContent, setPrintContent] = useState<string>("");
  const [accounts, setAccounts] = useState<Array<AccountResponse>>([]);
  const [showPrintConfirm, setShowPrintConfirm] = useState<boolean>(false);
  const [showSettingColumn, setShowSettingColumn] = useState(false);
  const pageBreak = "<div class='pageBreak'></div>";
  const printElementRef = useRef(null);

  const today = new Date();
  const [params, setParams] = useState<ProcurementQuery>({});
  const currentPermissions: string[] = useSelector(
    (state: RootReducerType) => state.permissionReducer.permissions,
  );
  const [allowPrint] = useAuthorization({
    acceptPermissions: [PurchaseOrderPermission.procurements_read],
  });
  const search = useCallback(() => {
    const search = new URLSearchParams(history.location.search);
    const newParams = {
      ...params,
      expect_receipt_from: getStartOfDay(today),
      expect_receipt_to: getEndOfDay(today),
      ...getQueryParams(search),
    };
    setLoading(true);
    dispatch(
      POSearchProcurement(newParams, (result) => {
        setLoading(false);
        if (result) {
          setData(result);
        }
      }),
    );

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, history.location.search, params]);
  const onPageChange = useCallback(
    (page, size) => {
      params.page = page;
      params.limit = size;
      setParams({ ...params });
      history.replace(`${UrlConfig.PROCUREMENT}/today?${generateQuery(params)}`);
    },
    [history, params],
  );

  const getAccounts = async (codes: string) => {
    const response = await callApiNative({ isShowError: true }, dispatch, searchAccountPublicApi, {
      codes,
    });
    if (response) {
      setAccounts(response.items);
    }
  };

  const onDetail = useCallback((result: PurchaseOrder | null) => {
    if (result) {
      setPurchaseOrderItem(result);
      setShowLoadingBeforeShowModal(-1);
    }
  }, []);
  const loadDetail = useCallback(
    (id: number) => {
      dispatch(PoDetailAction(id, onDetail));
    },
    [dispatch, onDetail],
  );
  const onDeleteProcument = useCallback(
    (poId: number, procurementId: number) => {
      if (poId && procurementId) {
        dispatch(
          PoProcumentDeleteAction(poId, procurementId, () => {
            search();
            setShowLoadingBeforeShowModal(-1);
            setIsLoadingReceive(false);
            setIsVisibleReceiveModal(false);
            showSuccess("Xoá phiếu nhập kho thành công");
          }),
        );
      }
    },
    [dispatch, search],
  );

  const confirmResult = useCallback(() => {
    setShowLoadingBeforeShowModal(-1);
    setIsLoadingReceive(false);
    setIsVisibleReceiveModal(false);
    showSuccess("Xác nhận phiếu nhập kho thành công");
    search();
  }, [search]);

  const onReciveProcument = useCallback(
    (poId: number, purchaseProcument: PurchaseProcument) => {
      if (purchaseProcument && poId) {
        setIsLoadingReceive(true);
        dispatch(
          ConfirmPoProcumentAction(poId, purchaseProcument.id, purchaseProcument, confirmResult),
        );
      }
    },
    [dispatch, confirmResult],
  );

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
  //     setContentWarning(() => ProcurementListWarning(listProcurementCode));
  //     setShowWarConfirm(true);
  //     return false;
  //   }
  //   for (let index = 0; index < selected.length; index++) {
  //     const element = selected[index];
  //     const firstElement = selected[0];
  //     listProcurementCode = firstElement.code;
  //     if (
  //       firstElement.purchase_order.supplier_id !== element.purchase_order.supplier_id ||
  //       ConvertUtcToLocalDate(firstElement.stock_in_date, DATE_FORMAT.DDMMYYY) !==
  //         ConvertUtcToLocalDate(element.stock_in_date, DATE_FORMAT.DDMMYYY) ||
  //       firstElement.store_id !== element.store_id
  //     ) {
  //       listProcurementCode += `, ${element.code},`;
  //       pass = false;
  //     }
  //   }
  //   if (!pass) {
  //     setContentWarning(() => ProcurementListWarning(listProcurementCode));
  //     setShowWarConfirm(true);
  //     return false;
  //   }
  //   setListProcurement(selected);
  //   setShowConfirm(true);
  // }, [selected]);

  const onMenuClick = useCallback(
    (index: number) => {
      if (selected.length === 0) {
        showWarning("Chưa có phiếu nào được chọn");
        return;
      }
      switch (index) {
        case ACTIONS_INDEX.PRINT_PROCUREMENTS:
          setShowPrintConfirm(true);
          break;
        default:
          break;
      }
    },
    [selected.length],
  );

  // const ActionComponent = useCallback(() => {
  //   let Compoment = () => <span>Mã nhập kho</span>;
  //   if (selected?.length > 1) {
  //     Compoment = () => (
  //       <CustomFilter onMenuClick={onMenuClick} menu={actions}>
  //         <Fragment />
  //       </CustomFilter>
  //     );
  //   }
  //   return <Compoment />;
  // }, [selected, actions, onMenuClick]);

  const getTotalProcurementItems = useCallback(() => {
    let total = 0;
    const procurementsData = cloneDeep(data.items);
    procurementsData.forEach((element: PurchaseProcument) => {
      if (!element.procurement_items.length) element.procurement_items.length = 0;
      total += element.procurement_items.length;
    });
    return formatCurrency(total, ".");
  }, [data]);

  const getTotalProcurementQuantity = useCallback(
    (
      callback: (procurement: PurchaseProcument, prQuantityType: string) => number,
      quantityType: string,
    ): string => {
      let total: number[] = [];
      const procurementsData = cloneDeep(data.items);
      procurementsData.forEach((element: PurchaseProcument) => {
        total.push(callback(element, quantityType));
      });
      const result: number = total.reduce((pre, cur) => pre + cur, 0);

      return formatCurrency(result, ".");
    },
    [data.items],
  );

  const getTotalProcurementItemsQuantity = (
    item: PurchaseProcument,
    prQuantityType: string,
  ): number => {
    let totalQuantity = 0;
    item.procurement_items.forEach((item: PurchaseProcumentLineItem) => {
      totalQuantity += item[prQuantityType];
    });
    return totalQuantity;
  };

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
          search();
          showSuccess("Cập nhật thành công");
        }
      }
    },
    [dispatch, search],
  );

  const handlePrint = useReactToPrint({
    content: () => printElementRef.current,
  });

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

  const actionList: Array<MenuAction> = [
    {
      id: ACTIONS_INDEX.PRINT_PROCUREMENTS,
      name: "In phiếu",
      icon: <PrinterOutlined />,
      disabled: !allowPrint,
    },
    // {
    //   id: ACTIONS_INDEX.CANCEL,
    //   name: "Hủy phiếu",
    //   icon: <CloseCircleOutlined />,
    //   disabled: !allowCancel,
    // },
  ];

  const defaultColumns: Array<ICustomTableColumType<PurchaseProcument>> = useMemo(() => {
    return [
      // {
      //   title: <ActionComponent />,
      //   dataIndex: "code",
      //   render: (value) => value,
      // },
      {
        title: "Mã phiếu nhập kho",
        dataIndex: "code",
        fixed: "left",
        width: "12%",
        visible: true,
        render: (value, record) => {
          return (
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
        width: "12%",
        render: (value, record) => {
          return (
            <>
              {value}
              <div>
                <span className="fs-12 text-muted">Ngày nhận dự kiến: </span>
                <span className="fs-12 text-title">
                  {ConvertUtcToLocalDate(record.expect_receipt_date, DATE_FORMAT.DDMMYY_HHmm)}
                </span>
              </div>
              {record.stock_in_date && (
                <div>
                  <span className="fs-12 text-muted">Ngày nhận: </span>
                  <span className="fs-12 text-title">
                    {ConvertUtcToLocalDate(record.stock_in_date, DATE_FORMAT.DDMMYY_HHmm)}
                  </span>
                </div>
              )}
              {record.activated_date && (
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
        width: "12%",
        render: (value, row) => {
          const newStockInBy = value ?? "";
          const newActiveBy = row?.activated_by ?? "";
          const stockInByName = newStockInBy.split("-");
          const activedByName = newActiveBy.split("-");
          return (
            <>
              <div>
                <div className="fs-12 text-muted">Người duyệt:</div>
                {activedByName && (
                  <Link
                    to={`${UrlConfig.ACCOUNTS}/${activedByName[0]}`}
                    className="primary"
                    target="_blank"
                  >
                    {Array.isArray(activedByName) ? activedByName[0] : activedByName}
                  </Link>
                )}
                <b>
                  {" "}
                  {Array.isArray(activedByName) && activedByName.length > 1 ? activedByName[1] : ""}
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
        },
      },
      {
        title: "Trạng thái",
        dataIndex: "status",
        visible: true,
        width: "8%",
        render: (status: string, record) => {
          let icon = "";
          let color = "";
          if (!status) {
            return "";
          }
          switch (record.status) {
            case ProcurementStatus.draft:
              icon = statusDraft;
              color = "#666666";
              break;
            case ProcurementStatus.not_received:
              icon = statusFinalized;
              color = "#2A2A86";
              break;
            case ProcurementStatus.received:
              icon = statusStored;
              color = "#27AE60";
              break;
            case ProcurementStatus.cancelled:
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
            <div>Sản phẩm</div>
            <div>
              (<span style={{ color: "#2A2A86" }}>{getTotalProcurementItems()}</span>)
            </div>
          </div>
        ),
        align: "center",
        width: "7%",
        dataIndex: "procurement_items",
        visible: true,
        render: (value) => {
          let totalItems = value?.length ?? 0;
          return <div className="font-weight-500 text-title">{formatCurrency(totalItems)}</div>;
        },
      },
      {
        title: (
          <div>
            <div>SL được duyệt</div> (
            <span style={{ color: "#2A2A86" }}>
              {getTotalProcurementQuantity(
                getTotalProcurementItemsQuantity,
                POProcumentLineItemField.accepted_quantity,
              )}
            </span>
            )
          </div>
        ),
        align: "center",
        dataIndex: "procurement_items",
        visible: true,
        width: "8%",
        render: (value) => {
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
              {getTotalProcurementQuantity(
                getTotalProcurementItemsQuantity,
                POProcumentLineItemField.real_quantity,
              )}
            </span>
            )
          </div>
        ),
        align: "center",
        dataIndex: "procurement_items",
        visible: true,
        width: "8%",
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
                  // editNote(newNote, "customer_note", record.id, record);
                }}
                // isDisable={record.status === OrderStatus.FINISHED}
              />
            </>
          );
        },
      },
    ];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPermissions, getTotalProcurementItems, getTotalProcurementQuantity]);

  const [columns, setColumns] =
    useState<Array<ICustomTableColumType<PurchaseProcument>>>(defaultColumns);

  const onSelectedChange = useCallback((selectedRow: Array<PurchaseProcument>) => {
    setSelected(
      selectedRow.filter(function (el) {
        return el !== undefined;
      }),
    );
  }, []);

  // const onReciveMuiltiProcumentCallback = useCallback(
  //   (value: boolean) => {
  //     if (value !== null) {
  //       setSelected([]);
  //       showSuccess("Xác nhận nhập kho thành công");
  //       setShowConfirm(false);
  //       search();
  //     }
  //   },
  //   [search],
  // );

  // const onReciveMultiProcument = useCallback(
  //   async (value: Array<PurchaseProcumentLineItem>) => {
  //     if (listProcurement) {
  //       const PrucurementConfirm = {
  //         procurement_items: value,
  //         refer_ids: listProcurement.map((e) => e.id),
  //       } as ProcurementConfirm;
  //       const res = await callApiNative(
  //         { isShowLoading: false },
  //         dispatch,
  //         confirmProcumentsMerge,
  //         PrucurementConfirm,
  //       );
  //       if (res) {
  //         onReciveMuiltiProcumentCallback(true);
  //       }
  //     }
  //   },
  //   [listProcurement, dispatch, onReciveMuiltiProcumentCallback],
  // );

  useEffect(() => {
    setColumns(defaultColumns);
  }, [selected, defaultColumns]);

  const query = useQuery();

  let paramsUrl: any = useMemo(() => {
    if (history.location.pathname === ProcurementTabUrl.TODAY) {
      return { ...getQueryParams(query) };
    }
  }, [history.location.pathname, query]);

  useEffect(() => {
    if (history.location.pathname === ProcurementTabUrl.TODAY) {
      search();
    }
    if (history.location.pathname === ProcurementTabUrl.TODAY && paramsUrl.stock_in_bys) {
      getAccounts(paramsUrl.stock_in_bys);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, history.location.search, history.location.pathname]);

  return (
    <StyledComponent>
      <div className="margin-top-20">
        <TabCurrentFilter
          paramsUrl={paramsUrl}
          actions={actionList}
          onMenuClick={onMenuClick}
          onClickOpen={() => setShowSettingColumn(true)}
          accounts={accounts}
        />
        <CustomTable
          isRowSelection
          selectedRowKey={selected.map((e) => e.id)}
          isLoading={loading}
          dataSource={data.items}
          sticky={{ offsetScroll: 5, offsetHeader: 109 }}
          columns={columns}
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
          bordered
        />

        <ProcumentInventoryModal
          loadDetail={loadDetail}
          isEdit={false}
          items={purchaseOrderItem.line_items}
          stores={[] as Array<StoreResponse>}
          procumentCode={""}
          poData={purchaseOrderItem}
          now={moment(purchaseOrderItem.created_date)}
          visible={isVisibleReceiveModal && showLoadingBeforeShowModal === -1}
          item={selectedProcurement}
          onOk={(value: PurchaseProcument) => {
            onReciveProcument(purchaseOrderItem.id, value);
          }}
          onDelete={() => onDeleteProcument(purchaseOrderItem.id, selectedProcurement.id)}
          loading={isLoadingReceive}
          defaultStore={-1}
          onCancel={() => {
            setIsVisibleReceiveModal(false);
          }}
        />

        {/* Xác nhận nhập */}
        {/* <ProducmentInventoryMultiModal
          title={`Xác nhận nhập kho ${listProcurement?.map((e) => e.code).toString()}`}
          visible={showConfirm}
          listProcurement={listProcurement}
          onOk={(value: Array<PurchaseProcumentLineItem>) => {
            if (value) onReciveMultiProcument(value);
          }}
          loading={isLoadingReceive}
          onCancel={() => {
            setShowConfirm(false);
          }}
        /> */}

        {/* <ModalConfirm
          onCancel={() => {
            setShowWarConfirm(false);
          }}
          onOk={() => {
            setSelected([]);
            setShowWarConfirm(false);
          }}
          okText="Chọn lại"
          cancelText="Hủy"
          title={`Nhận hàng từ nhiều phiếu nhập kho`}
          subTitle={contentWarning}
          visible={showWarConfirm}
        /> */}
      </div>
      {showSettingColumn && (
        <ModalSettingColumn
          visible={showSettingColumn}
          onCancel={() => setShowSettingColumn(false)}
          onOk={(data) => {
            setShowSettingColumn(false);
            setColumns(data);
          }}
          data={columns}
        />
      )}
      <Modal
        width={500}
        centered
        visible={showPrintConfirm}
        onCancel={() => setShowPrintConfirm(false)}
        onOk={() => {
          setShowPrintConfirm(false);
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
      <div style={{ display: "none" }}>
        <div className="printContent" ref={printElementRef}>
          <div
            dangerouslySetInnerHTML={{
              __html: purify.sanitize(printContent),
            }}
          />
        </div>
      </div>
    </StyledComponent>
  );
};

export default TabCurrent;
