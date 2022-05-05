import { ExclamationCircleOutlined, PrinterOutlined } from "@ant-design/icons";
import { Button, Card, Modal, Row, Space } from "antd";
import exportIcon from "assets/icon/export.svg";
import importIcon from "assets/icon/import.svg";
import AuthWrapper from "component/authorization/AuthWrapper";
import ContentContainer from "component/container/content.container";
import OrdersFilter from "component/filter/order.filter";
import ButtonCreate from "component/header/ButtonCreate";
import { MenuAction } from "component/table/ActionButton";
import { ICustomTableColumType } from "component/table/CustomTable";
import ModalSettingColumn from "component/table/ModalSettingColumn";
import { HttpStatus } from "config/http-status.config";
import { ODERS_PERMISSIONS } from "config/permissions/order.permission";
import UrlConfig from "config/url.config";
import { ExternalShipperGetListAction, searchAccountPublicAction } from "domain/actions/account/account.action";
import { StoreGetListAction } from "domain/actions/core/store.action";
import { hideLoading, showLoading } from "domain/actions/loading.action";
import {
  DeliveryServicesGetList,
  getListOrderAction,
  PaymentMethodGetList
} from "domain/actions/order/order.action";
import { getListAllSourceRequest } from "domain/actions/product/source.action";
import { actionFetchListOrderProcessingStatus } from "domain/actions/settings/order-processing-status.action";
import useHandleFilterColumns from "hook/table/useHandleTableColumns";
import useGetOrderSubStatuses from "hook/useGetOrderSubStatuses";
import { AccountResponse, DeliverPartnerResponse } from "model/account/account.model";
import { PageResponse } from "model/base/base-metadata.response";
import { StoreResponse } from "model/core/store.model";
import { ChangeOrderStatusHtmlModel, OrderModel, OrderSearchQuery, OrderTypeModel } from "model/order/order.model";
import {
  OrderProcessingStatusModel,
  OrderProcessingStatusResponseModel
} from "model/response/order-processing-status.response";
import {
  DeliveryServiceResponse,
  OrderResponse
} from "model/response/order/order.response";
import { PaymentMethodResponse } from "model/response/order/paymentmethod.response";
import { SourceResponse } from "model/response/order/source.response";
import { ChannelResponse } from "model/response/product/channel.response";
import queryString from "query-string";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { GoPlus } from "react-icons/go";
import { useDispatch } from "react-redux";
import { useHistory } from "react-router-dom";
import ChangeOrderStatusModal from "screens/order-online/modal/change-order-status.modal";
import ExportModal from "screens/order-online/modal/export.modal";
import { changeOrderStatusToPickedService, setSubStatusService } from "service/order/order.service";
import { exportFile, getFile } from "service/other/export.service";
import { generateQuery, goToTopPage, handleFetchApiError, isFetchApiSuccessful } from "utils/AppUtils";
import { COLUMN_CONFIG_TYPE } from "utils/Constants";
import { dangerColor, successColor } from "utils/global-styles/variables";
import { ORDER_TYPES } from "utils/Order.constants";
import { showError, showSuccess } from "utils/ToastUtils";
import { getQueryParamsFromQueryString } from "utils/useQuery";
import OrdersTable from "./ListTable/OrdersTable";
import { StyledComponent } from "./OrderList.styles";

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

let isLoadingSetSubStatus = false

function OrderList(props: PropTypes) {
  let newResult: ChangeOrderStatusHtmlModel[] = []
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
  };


  const history = useHistory();
  const dispatch = useDispatch();

  const { location, initQuery, pageTitle, isHideTab = false, orderType, initChannelCodes, channels } = props;
  const queryParamsParsed: any = queryString.parse(
    location.search
  );

  // cột column
  const columnConfigType = orderType === ORDER_TYPES.offline ? COLUMN_CONFIG_TYPE.orderOffline : COLUMN_CONFIG_TYPE.orderOnline
  const {tableColumnConfigs, onSaveConfigTableColumn} = useHandleFilterColumns(columnConfigType)

  const [tableLoading, setTableLoading] = useState(true);
  const [isFilter, setIsFilter] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showSettingColumn, setShowSettingColumn] = useState(false);
  useState<Array<AccountResponse>>();
  let [params, setPrams] = useState<OrderSearchQuery>(initQuery);
  const [listSource, setListSource] = useState<Array<SourceResponse>>([]);
  const [listStore, setStore] = useState<Array<StoreResponse>>();
  const [accounts, setAccounts] = useState<Array<AccountResponse>>([]);
  const [shippers, setShippers] = useState<Array<DeliverPartnerResponse>>([]);
  const [listOrderProcessingStatus, setListOrderProcessingStatus] = useState<
    OrderProcessingStatusModel[]
  >([]);
  const [initListOrderProcessingStatus, setInitListOrderProcessingStatus] = useState<
    OrderProcessingStatusModel[]
  >([]);

  const [listPaymentMethod, setListPaymentMethod] = useState<
    Array<PaymentMethodResponse>
  >([]);

  const [deliveryServices, setDeliveryServices] = useState<
    Array<DeliveryServiceResponse>
  >([]);

  const subStatuses = useGetOrderSubStatuses();

  const type = useMemo(() => {
    return orderType === ORDER_TYPES.online ? "orders_online" : "orders_offline"
  }, [orderType])

  const [data, setData] = useState<PageResponse<OrderModel>>({
    metadata: {
      limit: 30,
      page: 1,
      total: 0,
    },
    items: [],
  });

  const setSearchResult = useCallback((result: PageResponse<OrderModel> | false) => {
    setTableLoading(false);
    setIsFilter(false);
    if (!!result) {
      setData(result);
    }
  }, []);

  const [isShowChangeOrderStatusModal, setIsShowChangeOrderStatusModal] = useState(false);
  // const [isLoadingSetSubStatus, setIsLoadingSetSubStatus] = useState(true);

  const fetchData = useCallback(
    (params) => {
      return new Promise<void>((resolve, reject) => {
        setTableLoading(true);
        setIsFilter(true);
        dispatch(getListOrderAction(params, setSearchResult, () => {
          setTableLoading(false);
          setIsFilter(false);
        }));
        resolve();
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [dispatch, setSearchResult]
  );

  const handleFetchData = useCallback(
    (params) => {
      fetchData(params).catch(() => {
        setTableLoading(false);
        setIsFilter(false);
      });
    },
    [fetchData]
  );

  const [columns, setColumns] = useState<Array<ICustomTableColumType<OrderModel>>>([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<number[]>([]);
  const [selectedRowCodes, setSelectedRowCodes] = useState<string[]>([]);
  const [selectedRow, setSelectedRow] = useState<OrderResponse[]>([]);

  const [changeOrderStatusHtml, setChangeOrderStatusHtml] = useState<JSX.Element>()

  const actions: Array<MenuAction> = useMemo(() => [
    {
      id: ACTION_ID.printShipment,
      name: "In phiếu giao hàng",
      icon: <PrinterOutlined />,
      disabled: selectedRow.length ? false : true,
    },
    {
      id: ACTION_ID.printStockExport,
      name: "In phiếu xuất kho",
      icon: <PrinterOutlined />,
      disabled: selectedRow.length ? false : true,
    },
    {
      id: ACTION_ID.printOrder,
      name: "In hoá đơn",
      icon: <PrinterOutlined />,
      disabled: selectedRow.length ? false : true,
    },
    {
      id: ACTION_ID.changeOrderStatus,
      name: "Chuyển trạng thái đơn hàng",
      icon: <PrinterOutlined />,
      disabled: selectedRow.length ? false : true,
    },
  ], [ACTION_ID.changeOrderStatus, ACTION_ID.printOrder, ACTION_ID.printShipment, ACTION_ID.printStockExport, selectedRow.length]);

  const onSelectedChange = useCallback((selectedRows: OrderResponse[], selected?: boolean, changeRow?: any[]) => {
    let selectedRowCopy: OrderResponse[] = [...selectedRow];
    let selectedRowKeysCopy: number[] = [...selectedRowKeys];
    let selectedRowCodesCopy: string[] = [...selectedRowCodes];

    if (selected === true) {
      changeRow?.forEach((row, index) => {
        let indexItem = selectedRow.findIndex((p) => p.id === row.id)
        if (indexItem === -1) {
          selectedRowCopy.push(row);
          selectedRowKeysCopy.push(row.id);
          selectedRowCodesCopy.push(row.code);
        }
      })
    }
    else {
      selectedRow.forEach((row, index) => {
        let indexItem = changeRow?.findIndex((p) => p.id === row.id);
        if (indexItem !== -1) {
          let i = selectedRowCopy.findIndex((p) => p.id === row.id);
          selectedRowCopy.splice(i, 1);
        }
      })

      selectedRowKeys.forEach((row, index) => {
        let indexItemKey = changeRow?.findIndex((p) => p.id === row);
        if (indexItemKey !== -1) {
          let i = selectedRowKeysCopy.findIndex((p) => p === row);
          selectedRowKeysCopy.splice(i, 1);
        }
      })

      selectedRowCodes.forEach((row, index) => {
        let indexItemCode = changeRow?.findIndex((p) => p.code === row);
        if (indexItemCode !== -1) {
          let i = selectedRowCodesCopy.findIndex((p) => p === row);
          selectedRowCodesCopy.splice(i, 1);
        }
      })
    }

    setSelectedRow(selectedRowCopy);
    setSelectedRowKeys(selectedRowKeysCopy);
    setSelectedRowCodes(selectedRowCodesCopy);

    // setSelectedRow(selectedRow);

    // const selectedRowKeys = selectedRow.map((row: any) => row.id);
    // setSelectedRowKeys(selectedRowKeys);

    // const selectedRowCodes = selectedRow.map((row: any) => row.code);
    // setSelectedRowCodes(selectedRowCodes);
  }, [selectedRow, selectedRowCodes, selectedRowKeys]);

  // console.log("selectedRowKeys",selectedRowKeys)

  const onPageChange = useCallback(
    (page, size) => {
      params.page = page;
      params.limit = size;
      let queryParam = generateQuery(params);
      history.push(`${location.pathname}?${queryParam}`);
      goToTopPage()
    },
    [history, location.pathname, params]
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
      setSelectedRow([]);
      setSelectedRowKeys([]);
      setSelectedRowCodes([]);
    },
    [handleFetchData, history, location.pathname, params]
  );
  const onClearFilter = useCallback(() => {
    setPrams(initQuery);
    let queryParam = generateQuery(initQuery);
    history.push(`${location.pathname}?${queryParam}`);
  }, [history, initQuery, location.pathname]);

  const onFilterPhoneCustomer = useCallback((phone: string) => {
    let paramCopy = { ...params, search_term: phone, page: 1  };
    setPrams(paramCopy);
    let queryParam = generateQuery(paramCopy);
    history.push(`${location.pathname}?${queryParam}`);
  }, [history, location.pathname, params]);

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
          selectedRow.forEach((row) =>
            row.fulfillments?.forEach((single) => {
              ids.push(single.id);
            })
          );
          dispatch(showLoading());
          changeOrderStatusToPickedService(ids)
            .then((response) => {
              if (isFetchApiSuccessful(response)) {
                window.location.reload();
              } else {
                handleFetchApiError(response, "In phiếu giao hàng", dispatch)
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
        case ACTION_ID.printStockExport:
          {
            // dispatch(showLoading());
            const printPreviewUrlExport = `${process.env.PUBLIC_URL}${UrlConfig.ORDER}/print-preview?${queryParam}`;
            let ids: number[] = [];
            selectedRow.forEach((row) =>
              row.fulfillments?.forEach((single) => {
                ids.push(single.id);
              })
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

          const printBill = selectedRow.filter((order: any) => order.status === 'finished').map((order: any) => order.id);
          let queryParamOrder = generateQuery({
            action: "print",
            ids: printBill,
            "print-type": "order",
            "print-dialog": true,
          });
          if(selectedRow.length === 1 && selectedRow[0]?.order_return_origin?.id) {
            queryParamOrder = generateQuery({
              action: "print",
              ids: [selectedRow[0]?.order_return_origin?.id],
              "print-type": "order_exchange",
              "print-dialog": true,
            });
          }
          Modal.confirm({
            title: 'In hoá đơn',
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
            onCancel() {
            },
          });
          break;
        case ACTION_ID.changeOrderStatus:
          setIsShowChangeOrderStatusModal(true)
          break;
        default:
          break;
      }
    },
    [ACTION_ID.changeOrderStatus, ACTION_ID.printOrder, ACTION_ID.printShipment, ACTION_ID.printStockExport, dispatch, selectedRow, selectedRowKeys]
  );

  const [listExportFile, setListExportFile] = useState<Array<string>>([]);
  const [exportProgress, setExportProgress] = useState<number>(0);
  const [statusExport, setStatusExport] = useState<number>(1);
  const [exportError, setExportError] = useState<string>("");
  useEffect(() => {
    dispatch(
      DeliveryServicesGetList((response: Array<DeliveryServiceResponse>) => {
        // eslint-disable-next-line react-hooks/exhaustive-deps
        setDeliveryServices(response);
      })
    );
  }, [dispatch]);

  const onExport = useCallback(
    (optionExport, hiddenFieldsExport) => {
      let newParams: any = { ...params };
      console.log("newParams",params)
      // let hiddenFields = [];
      switch (optionExport) {
        case EXPORT_IDs.allOrders:
          newParams = {};
          break;
        case EXPORT_IDs.ordersOnThisPage:
          break;
        case EXPORT_IDs.selectedOrders:
          newParams = {
            code: selectedRowCodes
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
      console.log("queryParams",queryParams)
      exportFile({
        conditions: queryParams,
        type: "EXPORT_ORDER",
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
    [params, EXPORT_IDs, selectedRowCodes, listExportFile]
  );
  const checkExportFile = useCallback(() => {

    let getFilePromises = listExportFile.map((code) => {
      return getFile(code);
    });
    Promise.all(getFilePromises).then((responses) => {
      responses.forEach((response) => {
        if (response.code === HttpStatus.SUCCESS) {
          setExportProgress(Math.round(response.data.num_of_record / response.data.total * 10000) / 100);
          if (response.data && response.data.status === "FINISH") {
            setStatusExport(3);
            setExportProgress(100);
            const fileCode = response.data.code;
            const newListExportFile = listExportFile.filter((item) => {
              return item !== fileCode;
            });
            window.open(response.data.url);
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
    html=newResult.map(single => {
      return(
        <li key={single.id} style={{marginBottom: 10}}>
          Đơn hàng<strong> {single.id}</strong>: <strong>{single.isSuccess ? <span style={{color: successColor}}>Thành công</span> : <span style={{color: dangerColor}}>Thất bại</span>}</strong>. {single.text}
        </li>
      )
    })
    return html;
  };

  // ko validate nữa
  // const checkIfOrderHasFulfillmentAndNoShipment = (order: OrderResponse) => {
  //   if(order.fulfillments && !order.fulfillments[0].shipment) {
  //     return true;
  //   }
  //   return false;
  // };

  // ko validate nữa
  // const checkIfOrderHasFulfillmentAndShipment = (order: OrderResponse) => {
  //   if(order.fulfillments?.some(single => !isFulfillmentCancelled(single) && single.shipment )) {
  //     return true;
  //   }
  //   return false;
  // };

  // ko validate nữa
  // const getTextResultWhenCannotChange = (order: OrderResponse, toStatus: string) => {
  //   let subStatusName = listOrderProcessingStatus.find(single => single.code === toStatus)?.sub_status
  //   return `Đơn ở trạng thái ${order.sub_status}, Bạn không được đổi sang trạng thái ${subStatusName}`
  // };

  // ko validate nữa
  // const handleIfIsChange = (order: OrderResponse, toStatus: string) => {
  //   let isCanChange = false;
  //   switch (order.sub_status_code) {
  //     // chờ xác nhận
  //     case ORDER_SUB_STATUS.awaiting_coordinator_confirmation:
  //       if(checkIfOrderHasFulfillmentAndNoShipment(order)) {
  //         // đang xác nhận và chờ xử lý
  //         if(toStatus === ORDER_SUB_STATUS.coordinator_confirmed || toStatus === ORDER_SUB_STATUS.awaiting_saler_confirmation) {
  //           isCanChange = true;
  //         }
  //       } else if(checkIfOrderHasFulfillmentAndShipment(order)) {
  //         isCanChange = true;
  //       }
  //       break;
  //     // chờ xử lý
  //     case ORDER_SUB_STATUS.awaiting_saler_confirmation:
  //       if(checkIfOrderHasFulfillmentAndNoShipment(order)) {
  //         // chờ xử lý
  //         if(toStatus === ORDER_SUB_STATUS.awaiting_coordinator_confirmation ) {
  //           isCanChange = true;
  //         }
  //       } else if(checkIfOrderHasFulfillmentAndShipment(order)) {
  //         isCanChange = true;
  //       }
  //       break;
  //      // đã xác nhận
  //      case ORDER_SUB_STATUS.coordinator_confirmed:
  //       if(checkIfOrderHasFulfillmentAndShipment(order)) {
  //         isCanChange = true;
  //       }
  //       break;
  //     // đổi kho hàng
  //     case ORDER_SUB_STATUS.require_warehouse_change:
  //       if(order.fulfillments?.some(single => !isFulfillmentCancelled(single))) {
  //         isCanChange = true;
  //       }
  //       break;
  //     // hết hàng
  //     case ORDER_SUB_STATUS.het_hang:
  //       isCanChange = false;
  //       // hủy đơn hàng
  //       // alert("Hủy đơn hàng")
  //       break;
  //     // đã đóng gói
  //     case ORDER_SUB_STATUS.merchandise_packed:
  //       isCanChange = false;
  //       if(toStatus === ORDER_SUB_STATUS.canceled) {
  //         // hủy fulfillment
  //         // alert("Hủy fulfillment")
  //       }
  //       break;
  //     // Chờ thu gom
  //     case ORDER_SUB_STATUS.awaiting_shipper:
  //       isCanChange = true;
  //       break;  
  //     // Thành công
  //     case ORDER_SUB_STATUS.shipped:
  //       isCanChange = true;
  //       break; 
  //     // Đang hoàn
  //     case ORDER_SUB_STATUS.returning:
  //       if(toStatus === ORDER_SUB_STATUS.returned) {
  //         isCanChange = true;
  //       } 
  //       break;  
  //     // Đã hoàn
  //     case ORDER_SUB_STATUS.returned:
  //       isCanChange = true;
  //       break; 
  //     default:
  //       break;
  //   }
  //   return {
  //     isCanChange,
  //     textResult: isCanChange ? "Thành công" : getTextResultWhenCannotChange(order, toStatus)
  //   }
  // }

  const changeStatus = (id: number, toStatus: string, reason_id = 0, sub_reason_id = 0, ) => {
    return new Promise((resolve, reject) => {
      // setIsLoadingSetSubStatus(true)
      isLoadingSetSubStatus = true;
      dispatch(showLoading())
      setSubStatusService(id, toStatus, reason_id, sub_reason_id).then(response => {
        // setIsLoadingSetSubStatus(false)
        isLoadingSetSubStatus = false;
        dispatch(hideLoading())
        resolve(response);
      }).catch(error => {
        // setIsLoadingSetSubStatus(false)
        isLoadingSetSubStatus = false;
        dispatch(hideLoading())
        reject()
      })
    })
  };

  const changeOrderStatusInTable = (currentOrder: OrderResponse, toStatus: string) => {
    const index = data.items?.findIndex((single) => single.id === currentOrder.id);
      if (index > -1) {
        let dataResult = { ...data };
        dataResult.items[index].sub_status_code = toStatus
        dataResult.items[index].sub_status = listOrderProcessingStatus.find(single => single.code === toStatus)?.sub_status
        setData(dataResult);
      }
  };

  const handleChangeSingleOrderStatus = async (i: number, toStatus: string) => {
    let selectedRowLength = selectedRow.length;
    if(i >=selectedRowLength) {
      return;
    }
    let currentOrder =selectedRow[i];
    
    // let {isCanChange, textResult} = handleIfIsChange(currentOrder, toStatus);

    // Không validate nữa
    let isCanChange = true;
    let textResult = "";

    if(isCanChange) {
      // setIsLoadingSetSubStatus(true);
      isLoadingSetSubStatus = true;
      let response:any = await changeStatus(currentOrder.id, toStatus);
      if(isFetchApiSuccessful(response)) {
        isCanChange = true;
        textResult = "Chuyển trạng thái thành công";
        changeOrderStatusInTable(selectedRow[i], toStatus);
      } else {
        isCanChange = false;
        textResult = "Có lỗi khi cập nhật trạng thái"
        handleFetchApiError(response, "Cập nhật trạng thái", dispatch)
      }
      // setIsLoadingSetSubStatus(false)
      isLoadingSetSubStatus = false;
    }
    
    const newStatusHtml:ChangeOrderStatusHtmlModel = {
      id: currentOrder.id,
      isSuccess: isCanChange,
      text: textResult,
    }
    
    // newResult.push(newStatusHtml)
    newResult[i] = newStatusHtml;
    console.log('newResult', newResult);
    let renderListHtml = renderResultBlock(newResult);
    let htmlResult = (
      <React.Fragment>
        <div style={{marginBottom: 10}}>Đã xử lý: {i+1} / {selectedRow.length}</div>
        <ul>
          {renderListHtml}
        </ul>
        {isLoadingSetSubStatus ? "Loading ..." : null}
      </React.Fragment>
    )
    setChangeOrderStatusHtml(htmlResult)
    let m=i+1;
    handleChangeSingleOrderStatus(m, toStatus)
  };

  const handleConfirmOk = (status: string|undefined) => {
    console.log('status', status)
    let i = 0;
    console.log('selectedRow', selectedRow);
    if(!status) {
      return;
    }
    setChangeOrderStatusHtml(undefined)
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
    dispatch(ExternalShipperGetListAction((response) => {
      if (response) {
        setShippers(response)
      }
    }));
    dispatch(getListAllSourceRequest(setListSource));
    dispatch(StoreGetListAction(setStore));
    dispatch(
      PaymentMethodGetList((data) => {
        data.push({
          name: "COD",
          code: "cod",
          id: 0,
        });
        setListPaymentMethod(data);
      })
    );
    const params=  {
      sort_type: "asc",
      sort_column: "display_order",
    }
    dispatch(
      actionFetchListOrderProcessingStatus(
        params,
        (data: OrderProcessingStatusResponseModel) => {
          setListOrderProcessingStatus(data.items);
          setInitListOrderProcessingStatus(data.items);
        }
      )
    );
  }, [dispatch]);

  useEffect(() => {

    let dataQuery: OrderSearchQuery = {
      ...initQuery,
      ...getQueryParamsFromQueryString(queryParamsParsed),
    };

    setPrams(dataQuery);
    handleFetchData(dataQuery);
    setChangeOrderStatusHtml(undefined)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, handleFetchData, setSearchResult, location.search]);

  return (
    <StyledComponent>
      <ContentContainer
        title={pageTitle.title}
        breadcrumb={pageTitle.breadcrumb}
        extra={
          <Row>
            <Space>
              <AuthWrapper acceptPermissions={[ODERS_PERMISSIONS.IMPORT]} passThrough>
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
              </AuthWrapper>
              <AuthWrapper acceptPermissions={[ODERS_PERMISSIONS.EXPORT]} passThrough>
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
                <AuthWrapper acceptPermissions={[ODERS_PERMISSIONS.CREATE]} passThrough>
                  {(isPassed: boolean) => (
                    <ButtonCreate
                      path={`${UrlConfig.ORDER}/create`}
                      disabled={!isPassed}
                      child="Thêm mới đơn hàng"
                    />
                  )}
                </AuthWrapper>
              ) : (
                <AuthWrapper acceptPermissions={[ODERS_PERMISSIONS.CREATE]} passThrough>
                  {(isPassed: boolean) => (
                    <a href={process.env.REACT_APP_BASE_POS || ""} target="_blank" rel="noreferrer">
                      <Button
                        type="primary"
                        className="ant-btn-primary"
                        size={"large"}
                        icon={<GoPlus style={{marginRight: "0.2em"}}/>}
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
            actions={orderType === ORDER_TYPES.offline ? actions.filter(single => single.id !== ACTION_ID.changeOrderStatus) : actions}
            onFilter={onFilter}
            isLoading={isFilter}
            params={params}
            listSource={listSource}
            listStore={listStore}
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
          />

          {deliveryServices.length > 0 && subStatuses.length > 0 ? (
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
              listStore={listStore}
              orderType={orderType}
              tableColumnConfigs={tableColumnConfigs}
              subStatuses={subStatuses}
            />
          ) : "Đang tải dữ liệu..."
          }
        </Card>

        <ModalSettingColumn
          visible={showSettingColumn}
          onCancel={() => setShowSettingColumn(false)}
          onOk={(data) => {
            setShowSettingColumn(false);
            setColumns(data);
            console.log('data', data)
            onSaveConfigTableColumn(data );
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
          />
        )}
        <ChangeOrderStatusModal
          visible={isShowChangeOrderStatusModal}
          onCancelChangeStatusModal={() => {
            setIsShowChangeOrderStatusModal(false)
            setChangeOrderStatusHtml(undefined)
          }}
          listOrderProcessingStatus={listOrderProcessingStatus}
          handleConfirmOk = {handleConfirmOk}
          changeOrderStatusHtml = {changeOrderStatusHtml}
        />
      </ContentContainer>
    </StyledComponent>
  );
}
export default OrderList;
