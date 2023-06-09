import { DeleteOutlined, ExclamationCircleOutlined, PrinterOutlined } from "@ant-design/icons";
import { Button, Card, Modal, Row, Space } from "antd";
import exportIcon from "assets/icon/export.svg";
// import importIcon from "assets/icon/import.svg";
import AuthWrapper from "component/authorization/AuthWrapper";
import ContentContainer from "component/container/content.container";
import OrdersFilter from "component/filter/order.filter";
import ButtonCreate from "component/header/ButtonCreate";
import { MenuAction } from "component/table/ActionButton";
import { ICustomTableColumType } from "component/table/CustomTable";
import ModalSettingColumn from "component/table/ModalSettingColumn";
import { HttpStatus } from "config/http-status.config";
import { ORDER_PERMISSIONS } from "config/permissions/order.permission";
import UrlConfig from "config/url.config";
import {
  ExternalShipperGetListAction,
  searchAccountPublicAction,
} from "domain/actions/account/account.action";
import { hideLoading, showLoading } from "domain/actions/loading.action";
import { getListOrderAction, PaymentMethodGetList } from "domain/actions/order/order.action";
import { getAllSourcesRequestAction } from "domain/actions/product/source.action";
import { actionFetchListOrderProcessingStatus } from "domain/actions/settings/order-processing-status.action";
import useHandleTableColumnsVersion2 from "hook/table/useHandleTableColumnsVersion2";
import useAuthorization from "hook/useAuthorization";
import useFetchStores from "hook/useFetchStores";
import useFetchUserConfigs from "hook/useFetchUserConfigSettings";
import useGetOrderSubStatuses from "hook/useGetOrderSubStatuses";
import { AccountResponse, DeliverPartnerResponse } from "model/account/account.model";
import { PageResponse } from "model/base/base-metadata.response";
import { HandoverResponse } from "model/handover/handover.response";
import { HandoverSearchRequest } from "model/handover/handover.search";
import {
  ChangeOrderStatusHtmlModel,
  OrderModel,
  OrderSearchQuery,
  OrderTypeModel,
} from "model/order/order.model";
import {
  OrderProcessingStatusModel,
  OrderProcessingStatusResponseModel,
} from "model/response/order-processing-status.response";
import { OrderResponse } from "model/response/order/order.response";
import { PaymentMethodResponse } from "model/response/order/paymentmethod.response";
import { SourceResponse } from "model/response/order/source.response";
import { ChannelResponse } from "model/response/product/channel.response";
import queryString from "query-string";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { GoPlus } from "react-icons/go";
import { useDispatch } from "react-redux";
import { useHistory } from "react-router-dom";
import useFetchDeliverServices from "screens/order-online/hooks/useFetchDeliverServices";
import ChangeOrderStatusModal from "screens/order-online/modal/change-order-status.modal";
import ExportModal from "screens/order-online/modal/export.modal";
import { searchHandoverService } from "service/handover/handover.service";
import {
  changeOrderStatusToPickedService,
  deleteOrderService,
  setSubStatusService,
} from "service/order/order.service";
import { exportFile, getFile } from "service/other/export.service";
import {
  generateQuery,
  goToTopPage,
  handleFetchApiError,
  isFetchApiSuccessful,
} from "utils/AppUtils";
import { COLUMN_CONFIG_TYPE, FulFillmentStatus } from "utils/Constants";
import { dangerColor, successColor } from "utils/global-styles/variables";
import { ORDER_EXPORT_TYPE, ORDER_TYPES } from "utils/Order.constants";
import { checkIfOrderHasNotFinishedPaymentMomo } from "utils/OrderUtils";
import { showError, showSuccess } from "utils/ToastUtils";
import { getQueryParamsFromQueryString } from "utils/useQuery";
import OrdersTable from "./ListTable/OrderTable";
import { StyledComponent } from "./styles";

type PropTypes = {
  location: any;
  initQuery: OrderSearchQuery;
  pageTitle: {
    title: string;
    breadcrumb: {
      name: string;
      path?: string;
    }[];
  };
  orderType: OrderTypeModel;
  isHideTab?: boolean;
  initChannelCodes?: string[];
  channels?: ChannelResponse[];
};

let isLoadingSetSubStatus = false;

function OrderList(props: PropTypes) {
  let newResult: ChangeOrderStatusHtmlModel[] = [];
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const EXPORT_IDs = {
    allOrders: 1,
    ordersOnThisPage: 2,
    selectedOrders: 3,
    ordersFound: 4,
  };

  const ACTION_ID = {
    printOrder: 1,
    printShipment: 4,
    printStockExport: 5,
    changeOrderStatus: 6,
    deleteOrder: 7,
  };

  const history = useHistory();
  const dispatch = useDispatch();
  const [allowOrderDelete] = useAuthorization({
    acceptPermissions: [ORDER_PERMISSIONS.DELETE_ORDER],
    not: false,
  });

  const {
    location,
    initQuery,
    pageTitle,
    isHideTab = false,
    orderType,
    initChannelCodes,
    channels,
  } = props;
  const queryParamsParsed: any = queryString.parse(location.search);

  const [countForceFetchUserConfigs, setCountForceFetchUserConfigs] = useState(0);
  const { userConfigs } = useFetchUserConfigs(countForceFetchUserConfigs);

  // cột column
  const columnConfigType =
    orderType === ORDER_TYPES.offline
      ? COLUMN_CONFIG_TYPE.orderOffline
      : COLUMN_CONFIG_TYPE.orderOnline;
  const { tableColumnConfigs, onSaveConfigTableColumn } = useHandleTableColumnsVersion2(
    userConfigs,
    columnConfigType,
  );
  const [tableLoading, setTableLoading] = useState(true);
  const [isFilter, setIsFilter] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showSettingColumn, setShowSettingColumn] = useState(false);
  useState<Array<AccountResponse>>();
  let [params, setPrams] = useState<OrderSearchQuery>(initQuery);
  const [listSource, setListSource] = useState<Array<SourceResponse>>([]);
  const stores = useFetchStores();
  const [accounts, setAccounts] = useState<Array<AccountResponse>>([]);
  const [shippers, setShippers] = useState<Array<DeliverPartnerResponse>>([]);
  const [listOrderProcessingStatus, setListOrderProcessingStatus] = useState<
    OrderProcessingStatusModel[]
  >([]);
  const [initListOrderProcessingStatus, setInitListOrderProcessingStatus] = useState<
    OrderProcessingStatusModel[]
  >([]);

  const [listPaymentMethod, setListPaymentMethod] = useState<Array<PaymentMethodResponse>>([]);

  const deliveryServices = useFetchDeliverServices();

  const subStatuses = useGetOrderSubStatuses();

  const [isLoopInfoIfOrderHasMoreThanTwoProducts, setIsLoopInfoIfOrderHasMoreThanTwoProducts] =
    useState(false);

  const type = useMemo(() => {
    return orderType === ORDER_TYPES.online
      ? ORDER_EXPORT_TYPE.orders_online
      : ORDER_EXPORT_TYPE.orders_offline;
  }, [orderType]);

  const [data, setData] = useState<PageResponse<OrderModel>>({
    metadata: {
      limit: 30,
      page: 1,
      total: 0,
    },
    items: [],
  });

  const [isCalHandOvers, setIsHandOvers] = useState<boolean>(false);

  const setSearchResult = useCallback((result: PageResponse<OrderModel> | false) => {
    setTableLoading(false);
    setIsFilter(false);
    if (!!result) {
      setData(result);
    }
  }, []);

  useEffect(() => {
    const getHandOvers = (_handOvers: HandoverResponse[], _order: OrderModel) => {
      const fulfillmentsCode = _order.fulfillments?.map((p) => p.code);

      if (fulfillmentsCode) {
        const handOverData = [..._handOvers].filter((p) =>
          p.orders?.some((p) => fulfillmentsCode.indexOf(p.fulfillment_code) !== -1),
        );

        return handOverData;
      }
      return [];
    };

    if (isCalHandOvers && data.items.length !== 0) {
      setIsHandOvers(false);
      let itemData = [...data.items];
      const queryParam: HandoverSearchRequest = {
        order_codes: itemData.map((p) => p.code),
      };
      searchHandoverService(queryParam)
        .then((response) => {
          if (isFetchApiSuccessful(response)) {
            const itemResult: OrderModel[] = itemData.map((p) => {
              return {
                ...p,
                handOvers: getHandOvers(response.data.items, p),
              };
            });
            setData({
              ...data,
              items: itemResult,
            });
          }
        })
        .catch((e) => {
          console.log(e);
        })
        .finally();
    }
  }, [data, isCalHandOvers]);

  const [isShowChangeOrderStatusModal, setIsShowChangeOrderStatusModal] = useState(false);
  // const [isLoadingSetSubStatus, setIsLoadingSetSubStatus] = useState(true);

  const fetchData = useCallback(
    (params) => {
      return new Promise<void>((resolve, reject) => {
        setTableLoading(true);
        setIsFilter(true);
        const paramsCopy = { ...params };
        const inGoodsReceipt =
          Number(paramsCopy?.in_goods_receipt) === 1
            ? true
            : Number(paramsCopy?.in_goods_receipt) === 0
            ? false
            : undefined;
        dispatch(
          getListOrderAction(
            { ...params, in_goods_receipt: inGoodsReceipt },
            (result) => {
              setSearchResult(result);
              orderType === ORDER_TYPES.online && setIsHandOvers(true);
            },
            () => {
              setTableLoading(false);
              setIsFilter(false);
            },
          ),
        );
        resolve();
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [dispatch, setSearchResult],
  );

  const handleFetchData = useCallback(
    (params) => {
      fetchData(params).catch(() => {
        setTableLoading(false);
        setIsFilter(false);
      });
    },
    [fetchData],
  );

  const [columns, setColumns] = useState<Array<ICustomTableColumType<OrderModel>>>([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<number[]>([]);
  const [selectedRows, setSelectedRows] = useState<OrderResponse[]>([]);

  const selectedRowCodes = selectedRows.map((row) => row.code);

  const [changeOrderStatusHtml, setChangeOrderStatusHtml] = useState<JSX.Element>();

  const currentStores = useFetchStores();

  const actions: Array<MenuAction> = useMemo(
    () => [
      {
        id: ACTION_ID.printShipment,
        name: "In phiếu giao hàng",
        icon: <PrinterOutlined />,
        disabled: selectedRows.length ? false : true,
      },
      {
        id: ACTION_ID.printStockExport,
        name: "In phiếu xuất kho",
        icon: <PrinterOutlined />,
        disabled: selectedRows.length ? false : true,
      },
      {
        id: ACTION_ID.printOrder,
        name: "In hoá đơn",
        icon: <PrinterOutlined />,
        disabled: selectedRows.length ? false : true,
      },
      {
        id: ACTION_ID.changeOrderStatus,
        name: "Chuyển trạng thái đơn hàng",
        icon: <PrinterOutlined />,
        disabled: selectedRows.length ? false : true,
      },
      {
        id: ACTION_ID.deleteOrder,
        name: "Xóa đơn hàng",
        icon: <DeleteOutlined />,
        color: "#e24343",
        disabled: selectedRows.length ? false : true,
        hidden: !allowOrderDelete,
      },
    ],
    [
      ACTION_ID.changeOrderStatus,
      ACTION_ID.deleteOrder,
      ACTION_ID.printOrder,
      ACTION_ID.printShipment,
      ACTION_ID.printStockExport,
      allowOrderDelete,
      selectedRows.length,
    ],
  );

  const onSelectedChange = useCallback(
    (_: OrderResponse[], selected?: boolean, changeRow?: any[]) => {
      let selectedRowsCopy: OrderResponse[] = [...selectedRows];
      let selectedRowKeysCopy: number[] = [...selectedRowKeys];

      if (selected === true) {
        changeRow?.forEach((row, index) => {
          let indexItem = selectedRows.findIndex((p) => p.id === row.id);
          if (indexItem === -1) {
            selectedRowsCopy.push(row);
            selectedRowKeysCopy.push(row.id);
          }
        });
      } else {
        selectedRows.forEach((row, index) => {
          let indexItem = changeRow?.findIndex((p) => p.id === row.id);
          if (indexItem !== -1) {
            let i = selectedRowsCopy.findIndex((p) => p.id === row.id);
            selectedRowsCopy.splice(i, 1);
          }
        });

        selectedRowKeys.forEach((row, index) => {
          let indexItemKey = changeRow?.findIndex((p) => p.id === row);
          if (indexItemKey !== -1) {
            let i = selectedRowKeysCopy.findIndex((p) => p === row);
            selectedRowKeysCopy.splice(i, 1);
          }
        });
      }

      setSelectedRows(selectedRowsCopy);
      setSelectedRowKeys(selectedRowKeysCopy);
    },
    [selectedRowKeys, selectedRows],
  );

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const onClearSelected = () => {
    if (selectedRows.length > 0) {
      setSelectedRows([]);
    }
    if (selectedRowKeys.length > 0) {
      setSelectedRowKeys([]);
    }
  };

  const onPageChange = useCallback(
    (page, size) => {
      params.page = page;
      params.limit = size;
      let queryParam = generateQuery(params);
      history.push(`${location.pathname}?${queryParam}`);
      goToTopPage();
    },
    [history, location.pathname, params],
  );
  const onFilter = useCallback(
    (values) => {
      let newPrams = { ...params, ...values, page: 1 };
      let currentParam = generateQuery(params);
      let queryParam = generateQuery(newPrams);
      if (currentParam === queryParam) {
        handleFetchData(newPrams);
      } else {
        history.push(`${location.pathname}?${queryParam}`);
      }
      onClearSelected();
    },
    [handleFetchData, history, location.pathname, onClearSelected, params],
  );
  const onClearFilter = useCallback(() => {
    setPrams(initQuery);
    let queryParam = generateQuery(initQuery);
    history.push(`${location.pathname}?${queryParam}`);
  }, [history, initQuery, location.pathname]);

  const onFilterPhoneCustomer = useCallback(
    (phone: string) => {
      let paramCopy = { ...params, search_term: phone, page: 1 };
      setPrams(paramCopy);
      const orderLink =
        orderType === ORDER_TYPES.offline ? UrlConfig.OFFLINE_ORDERS : UrlConfig.ORDER;
      const queryParam = generateQuery(paramCopy);
      let pathname = `${process.env.PUBLIC_URL}${orderLink}?${queryParam}`;
      //history.push(`${location.pathname}?${queryParam}`);
      window.open(pathname, "_blank");
    },
    [orderType, params],
  );

  const onMenuClick = useCallback(
    (index: number) => {
      let params = {
        action: "print",
        ids: selectedRowKeys,
        "print-type": index === ACTION_ID.printShipment ? "shipment" : "stock_export",
        "print-dialog": true,
      };
      const queryParam = generateQuery(params);
      switch (index) {
        case ACTION_ID.printShipment:
          let ids: number[] = [];
          selectedRows.forEach((row) =>
            row.fulfillments?.forEach((single) => {
              ids.push(single.id);
            }),
          );
          dispatch(showLoading());
          changeOrderStatusToPickedService(ids)
            .then((response) => {
              if (isFetchApiSuccessful(response)) {
                window.location.reload();
              } else {
                handleFetchApiError(response, "In phiếu giao hàng", dispatch);
              }
            })
            .catch((error) => {
              console.log("error", error);
            })
            .finally(() => {
              dispatch(hideLoading());
            });
          const printPreviewUrl = `${process.env.PUBLIC_URL}${UrlConfig.ORDER}/print-preview?${queryParam}`;
          window.open(printPreviewUrl);
          break;
        case ACTION_ID.printStockExport: {
          // dispatch(showLoading());
          const printPreviewUrlExport = `${process.env.PUBLIC_URL}${UrlConfig.ORDER}/print-preview?${queryParam}`;
          let ids: number[] = [];
          selectedRows.forEach((row) =>
            row.fulfillments?.forEach((single) => {
              ids.push(single.id);
            }),
          );
          window.open(printPreviewUrlExport);
          // không chuyển trạng thái nữa
          // changeMultiOrderStatus(ids, "shipping").then(response => {
          //   if(isFetchApiSuccessful(response)) {
          //   } else {
          //     handleFetchApiError(response, "Chuyển trạng thái nhiều đơn hàng", dispatch)
          //   }
          // }).finally(()=>{
          //   dispatch(hideLoading());
          // })
          break;
        }

        case ACTION_ID.printOrder:
          const printBill = selectedRows
            .filter((order: any) => order.status === "finished")
            .map((order: any) => order.id);
          let queryParamOrder = generateQuery({
            action: "print",
            ids: printBill,
            "print-type": "order",
            "print-dialog": true,
          });
          if (selectedRows.length === 1 && selectedRows[0]?.order_return_origin?.id) {
            queryParamOrder = generateQuery({
              action: "print",
              ids: [selectedRows[0]?.order_return_origin?.id],
              "print-type": "order_exchange",
              "print-dialog": true,
            });
          }
          Modal.confirm({
            title: "In hoá đơn",
            icon: <ExclamationCircleOutlined />,
            content: `Có ${printBill.length} đơn hàng kết thúc. Hệ thống sẽ chỉ in đơn kết thúc. Bạn có muốn tiếp tục?`,
            okText: "Tiếp tục",
            cancelText: "Huỷ",
            onOk() {
              if (printBill.length) {
                const printPreviewOrderUrl = `${process.env.PUBLIC_URL}${UrlConfig.ORDER}/print-preview?${queryParamOrder}`;
                window.open(printPreviewOrderUrl);
              }
            },
            onCancel() {},
          });
          break;
        case ACTION_ID.changeOrderStatus:
          setIsShowChangeOrderStatusModal(true);
          break;
        /**
         * xóa đơn
         */
        case ACTION_ID.deleteOrder:
          if (selectedRows && selectedRows && selectedRows.length <= 0) {
            showError("Vui lòng chọn đơn hàng cần xóa");
            break;
          }
          const isOrderShipping = selectedRows.filter((p) =>
            p.fulfillments?.some((p1) => p1.status === FulFillmentStatus.SHIPPING),
          );

          if (isOrderShipping && isOrderShipping.length > 0) {
            Modal.error({
              title: "Không thể xoá đơn hàng",
              content: (
                <StyledComponent>
                  <div className="cannotDeleteOrderModal">
                    ({isOrderShipping.length}) đơn đang chuyển:
                    <div className="cannotDeleteOrderModal__orderCode">
                      {isOrderShipping.map((value) => (
                        <p>{value?.code}</p>
                      ))}
                    </div>
                  </div>
                </StyledComponent>
              ),
              okType: "danger",
            });
            return;
          }

          const deleteOrderConfirm = () => {
            onClearSelected();
            let ids = selectedRows.map((p) => p.id);
            dispatch(showLoading());
            deleteOrderService(ids)
              .then((response) => {
                if (isFetchApiSuccessful(response)) {
                  showSuccess("Xóa đơn hàng thành công");

                  let paramCopy: any = { ...params, page: 1 };
                  setPrams(paramCopy);
                  let queryParam = generateQuery(paramCopy);
                  history.push(`${location.pathname}?${queryParam}`);
                } else {
                  handleFetchApiError(response, "Xóa đơn hàng", dispatch);
                }
              })
              .catch((error) => {
                console.log("error", error);
              })
              .finally(() => {
                dispatch(hideLoading());
              });
          };

          Modal.confirm({
            title: "Xác nhận xóa",
            icon: <ExclamationCircleOutlined />,
            content: (
              <React.Fragment>
                <div className="yody-modal-confirm-list-code">
                  Bạn có chắc chắn xóa ({selectedRows.length}):
                  <div className="yody-modal-confirm-item-code">
                    {selectedRows.map((value) => (
                      <p>{value?.code}</p>
                    ))}
                  </div>
                </div>
                <p style={{ textAlign: "justify", color: "#ff4d4f" }}>
                  Lưu ý: Đối với đơn ở trạng thái Thành công, khi thực hiện xoá, sẽ xoá luôn cả đơn
                  trả liên quan. Bạn cần cân nhắc kĩ trước khi thực hiện xoá đơn ở trạng thái Thành
                  công
                </p>
              </React.Fragment>
            ),
            okText: "Xóa",
            cancelText: "Hủy",
            okType: "danger",
            onOk: deleteOrderConfirm,
          });

          break;
        default:
          break;
      }
    },
    [
      selectedRowKeys,
      ACTION_ID.printShipment,
      ACTION_ID.printStockExport,
      ACTION_ID.printOrder,
      ACTION_ID.changeOrderStatus,
      ACTION_ID.deleteOrder,
      selectedRows,
      dispatch,
      onClearSelected,
      history,
      location.pathname,
    ],
  );

  const [listExportFile, setListExportFile] = useState<Array<string>>([]);
  const [exportProgress, setExportProgress] = useState<number>(0);
  const [statusExport, setStatusExport] = useState<number>(1);
  const [exportError, setExportError] = useState<string>("");

  const onExport = useCallback(
    (optionExport, hiddenFieldsExport) => {
      let newParams: any = { ...params };
      switch (optionExport) {
        case EXPORT_IDs.allOrders:
          newParams = {};
          break;
        case EXPORT_IDs.ordersOnThisPage:
          break;
        case EXPORT_IDs.selectedOrders:
          newParams = {
            code: selectedRowCodes,
            is_online: orderType === ORDER_TYPES.online,
          };
          break;
        case EXPORT_IDs.ordersFound:
          delete newParams.page;
          delete newParams.limit;
          break;
        default:
          break;
      }

      let queryParams = generateQuery(newParams);
      exportFile({
        conditions: queryParams,
        type: isLoopInfoIfOrderHasMoreThanTwoProducts ? "EXPORT_ORDER_LOOP" : "EXPORT_ORDER",
        hidden_fields: hiddenFieldsExport,
      })
        .then((response) => {
          if (response.code === HttpStatus.SUCCESS) {
            setStatusExport(2);
            showSuccess("Đã gửi yêu cầu xuất file");
            setListExportFile([...listExportFile, response.data.code]);
          }
        })
        .catch((error) => {
          setStatusExport(4);
          console.log("orders export file error", error);
          showError("Có lỗi xảy ra, vui lòng thử lại sau");
        });
    },
    [
      params,
      isLoopInfoIfOrderHasMoreThanTwoProducts,
      EXPORT_IDs.allOrders,
      EXPORT_IDs.ordersOnThisPage,
      EXPORT_IDs.selectedOrders,
      EXPORT_IDs.ordersFound,
      selectedRowCodes,
      orderType,
      listExportFile,
    ],
  );
  const checkExportFile = useCallback(() => {
    let getFilePromises = listExportFile.map((code) => {
      return getFile(code);
    });
    Promise.all(getFilePromises).then((responses) => {
      responses.forEach((response) => {
        if (response.code === HttpStatus.SUCCESS) {
          setExportProgress(
            Math.round((response.data.num_of_record / response.data.total) * 10000) / 100,
          );
          if (response.data && response.data.status === "FINISH") {
            setStatusExport(3);
            setExportProgress(100);
            const fileCode = response.data.code;
            const newListExportFile = listExportFile.filter((item) => {
              return item !== fileCode;
            });
            window.open(response.data.url, "_self");
            setListExportFile(newListExportFile);
          }
          if (response.data && response.data.status === "ERROR") {
            setStatusExport(4);
            setExportError(response.data.message);
          }
        } else {
          setStatusExport(4);
        }
      });
    });
  }, [listExportFile]);

  const renderResultBlock = (newResult: any[]) => {
    let html = null;
    html = newResult.map((single) => {
      return (
        <li key={single.id} style={{ marginBottom: 10 }}>
          Đơn hàng<strong> {single.id}</strong>:{" "}
          <strong>
            {single.isSuccess ? (
              <span style={{ color: successColor }}>Thành công</span>
            ) : (
              <span style={{ color: dangerColor }}>Thất bại</span>
            )}
          </strong>
          . {single.text}
        </li>
      );
    });
    return html;
  };

  const changeStatus = (id: number, toStatus: string, reason_id = 0, sub_reason_id = 0) => {
    return new Promise((resolve, reject) => {
      isLoadingSetSubStatus = true;
      dispatch(showLoading());
      setSubStatusService(id, toStatus, reason_id, sub_reason_id)
        .then((response) => {
          isLoadingSetSubStatus = false;
          dispatch(hideLoading());
          resolve(response);
        })
        .catch((error) => {
          isLoadingSetSubStatus = false;
          dispatch(hideLoading());
          reject();
        });
    });
  };

  const changeOrderStatusInTable = (currentOrder: OrderResponse, toStatus: string) => {
    const index = data.items?.findIndex((single) => single.id === currentOrder.id);
    if (index > -1) {
      let dataResult = { ...data };
      dataResult.items[index].sub_status_code = toStatus;
      dataResult.items[index].sub_status = listOrderProcessingStatus.find(
        (single) => single.code === toStatus,
      )?.sub_status;
      setData(dataResult);
    }
  };

  const handleChangeSingleOrderStatus = async (i: number, toStatus: string) => {
    let selectedRowLength = selectedRows.length;
    if (i >= selectedRowLength) {
      return;
    }
    let currentOrder = selectedRows[i];

    // let {isCanChange, textResult} = handleIfIsChange(currentOrder, toStatus);

    // Không validate nữa
    let isCanChange = true;
    let textResult = "";

    if (isCanChange) {
      // setIsLoadingSetSubStatus(true);
      isLoadingSetSubStatus = true;
      if (checkIfOrderHasNotFinishedPaymentMomo(currentOrder)) {
        isCanChange = false;
        textResult = "Không thể điều phối đơn hàng khi chờ khách thanh toán qua ví điện tử";
      } else {
        let response: any = await changeStatus(currentOrder.id, toStatus);
        if (isFetchApiSuccessful(response)) {
          isCanChange = true;
          textResult = "Chuyển trạng thái thành công";
          changeOrderStatusInTable(selectedRows[i], toStatus);
        } else {
          isCanChange = false;
          textResult = "Có lỗi khi cập nhật trạng thái";
          handleFetchApiError(response, "Cập nhật trạng thái", dispatch);
        }
      }
      isLoadingSetSubStatus = false;
      // setIsLoadingSetSubStatus(false)
    }

    const newStatusHtml: ChangeOrderStatusHtmlModel = {
      id: currentOrder.id,
      isSuccess: isCanChange,
      text: textResult,
    };

    newResult[i] = newStatusHtml;
    // console.log('newResult', newResult);
    let renderListHtml = renderResultBlock(newResult);
    let htmlResult = (
      <React.Fragment>
        <div style={{ marginBottom: 10 }}>
          Đã xử lý: {i + 1} / {selectedRows.length}
        </div>
        <ul>{renderListHtml}</ul>
        {isLoadingSetSubStatus ? "Loading ..." : null}
      </React.Fragment>
    );
    setChangeOrderStatusHtml(htmlResult);
    let m = i + 1;
    handleChangeSingleOrderStatus(m, toStatus);
  };

  const handleConfirmOk = (status: string | undefined) => {
    // console.log('status', status)
    let i = 0;
    // console.log('selectedRow', selectedRow);
    if (!status) {
      return;
    }
    setChangeOrderStatusHtml(undefined);
    handleChangeSingleOrderStatus(i, status);
  };

  useEffect(() => {
    if (listExportFile.length === 0 || statusExport === 3 || statusExport === 4) return;
    checkExportFile();

    const getFileInterval = setInterval(checkExportFile, 3000);
    return () => clearInterval(getFileInterval);
  }, [listExportFile, checkExportFile, statusExport]);

  const setDataAccounts = (data: PageResponse<AccountResponse> | false) => {
    if (!data) {
      return;
    }
    setAccounts(data.items);
  };

  useEffect(() => {
    dispatch(searchAccountPublicAction({ limit: 30 }, setDataAccounts));
    dispatch(
      ExternalShipperGetListAction((response) => {
        if (response) {
          setShippers(response);
        }
      }),
    );
    // dispatch(getListAllSourceRequest(setListSource));
    dispatch(getAllSourcesRequestAction(setListSource));
    dispatch(
      PaymentMethodGetList((data) => {
        data.push({
          name: "COD",
          code: "cod",
          id: 0,
        });
        setListPaymentMethod(data);
      }),
    );
    const params = {
      sort_type: "asc",
      sort_column: "display_order",
    };
    dispatch(
      actionFetchListOrderProcessingStatus(params, (data: OrderProcessingStatusResponseModel) => {
        setListOrderProcessingStatus(data.items);
        setInitListOrderProcessingStatus(data.items);
      }),
    );
  }, [dispatch]);

  useEffect(() => {
    let dataQuery: OrderSearchQuery = {
      ...initQuery,
      ...getQueryParamsFromQueryString(queryParamsParsed),
    };

    setPrams(dataQuery);
    handleFetchData(dataQuery);
    setChangeOrderStatusHtml(undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, handleFetchData, setSearchResult, location.search]);

  return (
    <StyledComponent>
      <ContentContainer
        title={pageTitle.title}
        breadcrumb={pageTitle.breadcrumb}
        extra={
          <Row>
            <Space className="buttonLinks">
              {/* <AuthWrapper acceptPermissions={[ODERS_PERMISSIONS.IMPORT]} passThrough>
                {(isPassed: boolean) => (
                  <Button
                    type="default"
                    className="light"
                    size="large"
                    icon={<img src={importIcon} style={{ marginRight: 8 }} alt="" />}
                    onClick={() => { }}
                    disabled={!isPassed}
                  >
                    Nhập file
                  </Button>
                )}
              </AuthWrapper> */}
              <AuthWrapper acceptPermissions={[ORDER_PERMISSIONS.EXPORT]} passThrough>
                {(isPassed: boolean) => (
                  <Button
                    type="default"
                    className="light"
                    size="large"
                    icon={<img src={exportIcon} style={{ marginRight: 8 }} alt="" />}
                    // onClick={onExport}
                    onClick={() => {
                      setShowExportModal(true);
                    }}
                    disabled={!isPassed}
                  >
                    Xuất file
                  </Button>
                )}
              </AuthWrapper>
              {orderType === ORDER_TYPES.online ? (
                <AuthWrapper acceptPermissions={[ORDER_PERMISSIONS.CREATE]} passThrough>
                  {(isPassed: boolean) => (
                    <ButtonCreate
                      path={`${UrlConfig.ORDER}/create`}
                      disabled={!isPassed}
                      child="Thêm mới đơn hàng"
                    />
                  )}
                </AuthWrapper>
              ) : (
                <AuthWrapper acceptPermissions={[ORDER_PERMISSIONS.CREATE]} passThrough>
                  {(isPassed: boolean) => (
                    <a
                      href={process.env.REACT_APP_BASE_POS || ""}
                      target="_blank"
                      rel="noreferrer"
                      className="buttonLink"
                    >
                      <Button
                        type="primary"
                        className="ant-btn-primary"
                        size={"large"}
                        icon={<GoPlus style={{ marginRight: "0.2em" }} />}
                        disabled={!isPassed}
                      >
                        Thêm mới đơn hàng
                      </Button>
                    </a>
                  )}
                </AuthWrapper>
              )}
            </Space>
          </Row>
        }
      >
        <Card>
          <OrdersFilter
            onMenuClick={onMenuClick}
            actions={
              orderType === ORDER_TYPES.offline
                ? actions.filter((single) => single.id !== ACTION_ID.changeOrderStatus)
                : actions
            }
            onFilter={onFilter}
            isLoading={isFilter}
            params={params}
            listSource={listSource}
            listStore={stores}
            accounts={accounts}
            shippers={shippers}
            deliveryService={deliveryServices}
            listPaymentMethod={listPaymentMethod}
            subStatus={listOrderProcessingStatus}
            initSubStatus={initListOrderProcessingStatus}
            onShowColumnSetting={() => setShowSettingColumn(true)}
            onClearFilter={() => onClearFilter()}
            isHideTab={isHideTab}
            orderType={orderType}
            setListSource={setListSource}
            setListOrderProcessingStatus={setListOrderProcessingStatus}
            initChannelCodes={initChannelCodes}
            channels={channels}
            userConfigs={userConfigs}
            handleCountForceFetchUserConfigs={() =>
              setCountForceFetchUserConfigs((prev) => prev + 1)
            }
          />

          {(orderType === ORDER_TYPES.offline || deliveryServices.length > 0) &&
          subStatuses.length > 0 ? (
            <OrdersTable
              tableLoading={tableLoading}
              data={data}
              columns={columns}
              setColumns={setColumns}
              setData={setData}
              onPageChange={onPageChange}
              onSelectedChange={onSelectedChange}
              setShowSettingColumn={setShowSettingColumn}
              deliveryServices={deliveryServices}
              selectedRowKeys={selectedRowKeys}
              onFilterPhoneCustomer={onFilterPhoneCustomer}
              stores={stores}
              orderType={orderType}
              tableColumnConfigs={tableColumnConfigs}
              subStatuses={subStatuses}
              currentStores={currentStores}
            />
          ) : (
            <span>Đang tải dữ liệu...</span>
          )}
        </Card>

        <ModalSettingColumn
          visible={showSettingColumn}
          onCancel={() => setShowSettingColumn(false)}
          onOk={(data) => {
            setShowSettingColumn(false);
            setColumns(data);
            // console.log('data', data)
            onSaveConfigTableColumn(data);
          }}
          data={columns}
        />
        {showExportModal && (
          <ExportModal
            visible={showExportModal}
            onCancel={() => {
              setShowExportModal(false);
              setExportProgress(0);
              setStatusExport(1);
            }}
            onOk={(optionExport, hiddenFieldsExport) => onExport(optionExport, hiddenFieldsExport)}
            type={type}
            total={data.metadata.total}
            exportProgress={exportProgress}
            statusExport={statusExport}
            exportError={exportError}
            selected={selectedRowCodes.length ? true : false}
            isLoopInfoIfOrderHasMoreThanTwoProducts={isLoopInfoIfOrderHasMoreThanTwoProducts}
            setIsLoopInfoIfOrderHasMoreThanTwoProducts={setIsLoopInfoIfOrderHasMoreThanTwoProducts}
          />
        )}
        <ChangeOrderStatusModal
          visible={isShowChangeOrderStatusModal}
          onCancelChangeStatusModal={() => {
            setIsShowChangeOrderStatusModal(false);
            setChangeOrderStatusHtml(undefined);
          }}
          listOrderProcessingStatus={listOrderProcessingStatus}
          handleConfirmOk={handleConfirmOk}
          changeOrderStatusHtml={changeOrderStatusHtml}
        />
      </ContentContainer>
    </StyledComponent>
  );
}

export default OrderList;
