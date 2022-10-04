import {
  DownloadOutlined,
  EyeOutlined,
  FileExcelOutlined,
  PrinterOutlined,
} from "@ant-design/icons";
import { Button, Card, Input, Popover, Row, Select, Tooltip } from "antd";
import CircleEmptyIcon from "assets/icon/circle_empty.svg";
import CircleFullIcon from "assets/icon/circle_full.svg";
import CircleHalfFullIcon from "assets/icon/circle_half_full.svg";
import CustomerIcon from "assets/icon/customer-icon.svg";
import DeleteIcon from "assets/icon/ydDeleteIcon.svg";
import BaseResponse from "base/base.response";
import ContentContainer from "component/container/content.container";
import SubStatusChange from "component/order/SubStatusChange/SubStatusChange";
import CustomTable, { ICustomTableColumType } from "component/table/CustomTable";
import ModalSettingColumn from "component/table/ModalSettingColumn";
import { HttpStatus } from "config/http-status.config";
import { EcommerceOrderPermission } from "config/permissions/ecommerce.permission";
import UrlConfig from "config/url.config";
import { searchAccountPublicAction } from "domain/actions/account/account.action";
import { StoreGetListAction } from "domain/actions/core/store.action";
import {
  batchShippingAction,
  changeEcommerceOrderStatus,
  downloadPrintForm,
  ecommerceConfigGetAction,
  exitEcommerceJobsAction,
  exitProgressDownloadEcommerceAction,
  getAddressByShopIdAction,
} from "domain/actions/ecommerce/ecommerce.actions";
import { hideLoading, showLoading } from "domain/actions/loading.action";
import {
  DeliveryServicesGetList,
  getListOrderAction,
  getTrackingLogFulfillmentAction,
  PaymentMethodGetList,
  updateOrderPartial,
} from "domain/actions/order/order.action";
import { getListSourceRequest } from "domain/actions/product/source.action";
import { actionFetchListOrderProcessingStatus } from "domain/actions/settings/order-processing-status.action";
import useHandleFilterColumns from "hook/table/useHandleTableColumns";
import useSetTableColumns from "hook/table/useSetTableColumns";

import useAuthorization from "hook/useAuthorization";
import useGetOrderSubStatuses from "hook/useGetOrderSubStatuses";
import { AccountResponse } from "model/account/account.model";
import { BaseMetadata, PageResponse } from "model/base/base-metadata.response";
import { StoreResponse } from "model/core/store.model";
import { ErrorMessageBatchShipping, ShopAddressByShopId } from "model/ecommerce/ecommerce.model";
import { AllInventoryProductInStore, InventoryVariantListQuery } from "model/inventory";
import {
  ChangeOrderStatusHtmlModel,
  EcommerceOrderSearchQuery,
  OrderExtraModel,
  OrderModel,
} from "model/order/order.model";
import { RootReducerType } from "model/reducers/RootReducerType";
import {
  EcommerceId,
  EcommerceOrderList,
  EcommerceOrderStatus,
  EcommerceOrderStatusRequest,
} from "model/request/ecommerce.request";
import {
  ChangeOrderStatusErrorLine,
  ChangeOrderStatusErrorLineType,
  EcommerceChangeOrderStatusReponse,
} from "model/response/ecommerce/ecommerce.response";
import {
  OrderProcessingStatusModel,
  OrderProcessingStatusResponseModel,
} from "model/response/order-processing-status.response";

import GetOrderDataModal from "screens/ecommerce/orders/component/GetOrderDataModal";
import ProgressDownloadOrdersModal from "screens/ecommerce/orders/component/ProgressDownloadOrdersModal";
import EcommerceChangeOrderStatusModal from "screens/ecommerce/orders/component/EcommerceChangeOrderStatusModal";
import EcommerceOrderFilter from "screens/ecommerce/orders/component/EcommerceOrderFilter";

import AuthWrapper from "component/authorization/AuthWrapper";
import NoPermission from "screens/no-permission.screen";

import DeliveryIcon from "assets/icon/gray-delivery.svg";

import {
  nameQuantityWidth,
  StyledComponentEcommerceOrder,
} from "screens/ecommerce/orders/orderStyles";
import { SourceResponse } from "model/response/order/source.response";
import {
  DeliveryServiceResponse,
  FulFillmentResponse,
  OrderResponse,
} from "model/response/order/order.response";
import { PaymentMethodResponse } from "model/response/order/paymentmethod.response";
import queryString from "query-string";
import React, { ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import NumberFormat from "react-number-format";
import { useDispatch, useSelector } from "react-redux";
import { Link, useHistory, useLocation } from "react-router-dom";
import {
  EcommerceChannelId,
  getEcommerceIdByChannelId,
} from "screens/ecommerce/common/commonAction";
import ConflictDownloadModal from "screens/ecommerce/common/ConflictDownloadModal";
import ExitDownloadOrdersModal from "screens/ecommerce/orders/component/ExitDownloadOrdersModal";
import ExitProgressModal from "screens/ecommerce/orders/component/ExitProgressModal";
import EditNote from "screens/order-online/component/EditOrderNote";
import InventoryTable from "screens/order-online/component/OrderList/ListTable/InventoryTable";
import ChangeOrderStatusModal from "screens/order-online/modal/change-order-status.modal";
import ExportModal from "screens/order-online/modal/export.modal";
import {
  getEcommerceJobsApi,
  getProgressDownloadEcommerceApi,
} from "service/ecommerce/ecommerce.service";
import { inventoryGetApi } from "service/inventory";
import { changeOrderStatusToPickedService, setSubStatusService } from "service/order/order.service";
import { getOrderReasonService } from "service/order/return.service";
import { exportFile, getFile } from "service/other/export.service";
import {
  generateQuery,
  handleFetchApiError,
  isFetchApiSuccessful,
  isNullOrUndefined,
  sortFulfillments,
} from "utils/AppUtils";

import { COLUMN_CONFIG_TYPE, FulFillmentStatus, OrderStatus } from "utils/Constants";
import { ConvertUtcToLocalDate } from "utils/DateUtils";
import { dangerColor, primaryColor, successColor } from "utils/global-styles/variables";
import { ORDER_EXPORT_TYPE, ORDER_SUB_STATUS } from "utils/Order.constants";
import { checkIfFulfillmentCancelled, getTrackingCodeFulfillment } from "utils/OrderUtils";
import { fullTextSearch } from "utils/StringUtils";
import { showError, showSuccess } from "utils/ToastUtils";
import { getQueryParams, getQueryParamsFromQueryString, useQuery } from "utils/useQuery";

import PrintEcommerceDeliveryNoteProcess from "screens/ecommerce/orders/process-modal/print-ecommerce-delivery-note/PrintEcommerceDeliveryNoteProcess";
import ReportPreparationShopeeProductModal from "./component/ReportPreparationShopeeProductModal";
import PreparationShopeeProductModal from "./component/PreparationShopeeProductModal";
import ConfirmPreparationShopeeProductModal from "./component/ConfirmPreparationShopeeProductModal";
import shopeeIcon from "assets/icon/e-shopee.svg";
import lazadaIcon from "assets/icon/e-lazada.svg";
import tikiIcon from "assets/icon/e-tiki.svg";
import tiktokIcon from "assets/icon/e-tiktok.svg";

const BATCHING_SHIPPING_TYPE = {
  SELECTED: "SELECTED",
  FILTERED: "FILTERED",
};

const initQuery: EcommerceOrderSearchQuery = {
  page: 1,
  limit: 30,
  is_online: "true",
  sort_type: null,
  sort_column: null,
  code: null,
  customer_ids: [],
  store_ids: [],
  source_ids: [],
  variant_ids: [],
  issued_on_min: null,
  issued_on_max: null,
  issued_on_predefined: null,
  finalized_on_min: null,
  finalized_on_max: null,
  finalized_on_predefined: null,
  ship_on_min: null,
  ship_on_max: null,
  ship_on_predefined: null,
  ecommerce_shop_ids: [],
  channel_codes: [],
  channel_id: undefined,
  expected_receive_on_min: null,
  expected_receive_on_max: null,
  expected_receive_predefined: null,
  completed_on_min: null,
  completed_on_max: null,
  completed_on_predefined: null,
  cancelled_on_min: null,
  cancelled_on_max: null,
  cancelled_on_predefined: null,
  order_status: [],
  sub_status_code: [],
  fulfillment_status: [],
  payment_status: [],
  return_status: [],
  account_codes: [],
  assignee_codes: [],
  price_min: undefined,
  price_max: undefined,
  payment_method_ids: [],
  delivery_types: [],
  delivery_provider_ids: [],
  shipper_ids: [],
  note: null,
  customer_note: null,
  tags: [],
  reference_code: null,
};

const ALL_CHANNEL = ["Shopee", "lazada", "tiki", "tiktok"];

type dataExtra = PageResponse<OrderExtraModel>;
let isLoadingSetSubStatus = false;

const ordersViewPermission = [EcommerceOrderPermission.orders_read];
const ordersDownloadPermission = [EcommerceOrderPermission.orders_download];

let itemResult: OrderModel[] = [];
let metadataResult: BaseMetadata = {
  limit: 0,
  page: 0,
  total: 0,
};

const EcommerceOrders: React.FC = () => {
  const query = useQuery();
  const dispatch = useDispatch();
  const history = useHistory();
  const location = useLocation();

  const queryParamsParsed: any = queryString.parse(location.search);

  const [allowOrdersView] = useAuthorization({
    acceptPermissions: ordersViewPermission,
    not: false,
  });

  const [allowOrdersDownload] = useAuthorization({
    acceptPermissions: ordersDownloadPermission,
    not: false,
  });

  const EXPORT_IDs = {
    allOrders: 1,
    ordersOnThisPage: 2,
    selectedOrders: 3,
    ordersFound: 4,
  };

  //report shopee preparation product
  const [showReportPreparationModal, setShowReportPreparationModal] = useState(false);
  const [showPreparationModal, setShowPreparationModal] = useState(false);
  const [conFirmPreparationShopeeProduct, setConfirmPreparationShopeeProduct] = useState(false);
  const [showButtonConfirm, setIsShowButtonConfirm] = useState(true);
  const [isReportShopeeFilter, setReportShopeeFilter] = useState(true);
  const [ecommerceShopAddress, setEcommerceShopAddress] = useState<any>([]);
  const [ecommerceShopListByAddress, setEcommerceShopListByAddress] = useState<any>([]);
  const [shopeePreparationData, setShopeePreparationData] = useState<
    Array<ErrorMessageBatchShipping>
  >([]);
  const [listShopPickUpAddress, setListShopPickUpAddress] = useState<Array<any>>([]);
  const [listShopOrderList, setListShopOrderList] = useState<Array<any>>([]);
  const [orderSuccessMessage, setOrderSuccessMessage] = useState<any>([]);
  const [orderErrorMessage, setOrderErrorMessage] = useState<any>([]);
  const [batchShippingType, setBatchShippingType] = useState("");

  // change order status
  let newResult: ChangeOrderStatusHtmlModel[] = [];
  const [isShowChangeOrderStatusModal, setIsShowChangeOrderStatusModal] = useState(false);
  const [changeOrderStatusHtml, setChangeOrderStatusHtml] = useState<JSX.Element>();
  const subStatuses = useGetOrderSubStatuses();
  const [typeAPi, setTypeAPi] = useState("");
  const [toSubStatusCode, setToSubStatusCode] = useState<string | undefined>(undefined);
  const [selectedOrder, setSelectedOrder] = useState<OrderModel | null>(null);
  const status_order = useSelector(
    (state: RootReducerType) => state.bootstrapReducer.data?.order_status,
  );
  const type = {
    trackingCode: "trackingCode",
    subStatus: "subStatus",
    setSubStatus: "setSubStatus",
  };

  const [listShopIdEcommerce, setListShopIdEcommerce] = useState<Array<any>>([]);

  //show inventory every store with product
  const [inventoryData, setInventoryData] = useState<AllInventoryProductInStore[]>([]);
  const [storeInventory, setStoreInventory] = useState<StoreResponse[]>([]);

  //export order
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportProgress, setExportProgress] = useState<number>(0);
  const [statusExport, setStatusExport] = useState<number>(1);
  const [exportError, setExportError] = useState<string>("");

  const [isShowGetOrderModal, setIsShowGetOrderModal] = useState(false);

  const [listExportFile, setListExportFile] = useState<Array<string>>([]);

  const [columns, setColumns] = useState<Array<ICustomTableColumType<OrderModel>>>([]);
  const [selectedRow, setSelectedRow] = useState<OrderResponse[]>([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [selectedRowCodes, setSelectedRowCodes] = useState([]);
  const [tableLoading, setTableLoading] = useState(false);
  const [showSettingColumn, setShowSettingColumn] = useState(false);
  useState<Array<AccountResponse>>();
  let dataQuery: EcommerceOrderSearchQuery = {
    ...initQuery,
    ...getQueryParams(query),
  };
  let [params, setPrams] = useState<EcommerceOrderSearchQuery>(dataQuery);
  const [listStore, setStore] = useState<Array<StoreResponse>>();
  const [accounts, setAccounts] = useState<Array<AccountResponse>>([]);
  const [listOrderProcessingStatus, setListOrderProcessingStatus] = useState<
    OrderProcessingStatusModel[]
  >([]);

  // cột column
  const columnConfigType = COLUMN_CONFIG_TYPE.orderOnline;
  const { tableColumnConfigs, onSaveConfigTableColumn } = useHandleFilterColumns(columnConfigType);

  const [data, setData] = useState<PageResponse<any>>({
    metadata: {
      limit: 30,
      page: 1,
      total: 0,
    },
    items: [],
  });

  itemResult = data.items;
  metadataResult = data.metadata;

  const [successDeliveryNote, setSuccessDeliveryNote] = useState<Array<string>>([]);

  const [listSource, setListSource] = useState<Array<SourceResponse>>([]);
  const [listPaymentMethod, setListPaymentMethod] = useState<Array<PaymentMethodResponse>>([]);

  const [deliveryServices, setDeliveryServices] = useState<Array<DeliveryServiceResponse>>([]);

  const [reasonId, setReasonId] = useState<number | undefined>(undefined);
  const [subReasonRequireWarehouseChange, setSubReasonRequireWarehouseChange] = useState<
    number | undefined
  >(undefined);

  useEffect(() => {
    dispatch(
      ecommerceConfigGetAction((responseData) => {
        setListShopIdEcommerce(responseData);
      }),
    );
  }, [dispatch]);

  useEffect(() => {
    dispatch(
      DeliveryServicesGetList((response: Array<DeliveryServiceResponse>) => {
        setDeliveryServices(response);
      }),
    );
  }, [dispatch]);

  useEffect(() => {
    const code = [ORDER_SUB_STATUS.change_depot];
    getOrderReasonService(code).then((response) => {
      if (isFetchApiSuccessful(response)) {
        if (response && response.data && response.data[0]) {
          const diffDepotSubReason = response.data[0].sub_reasons?.find(
            (item: any) => item.code === "diff_depot",
          );
          setSubReasonRequireWarehouseChange(diffDepotSubReason?.id);
          setReasonId(response.data[0].id);
        }
      } else {
        handleFetchApiError(response, "Danh sách lý do đổi kho hàng", dispatch);
      }
    });
  }, [dispatch]);

  const onExport = useCallback(
    (optionExport, hiddenFieldsExport) => {
      let newParams: any = { ...params };
      if (!newParams.channel_codes?.length) {
        newParams.channel_codes = ALL_CHANNEL;
      }
      switch (optionExport) {
        case EXPORT_IDs.allOrders:
          newParams = {
            channel_codes: ALL_CHANNEL,
          };
          break;
        case EXPORT_IDs.ordersOnThisPage:
          break;
        case EXPORT_IDs.selectedOrders:
          newParams = {
            code: selectedRowCodes,
            is_online: true,
          };
          break;
        case EXPORT_IDs.ordersFound:
          delete newParams.page;
          delete newParams.limit;
          break;
        default:
          break;
      }

      newParams.is_online = true;
      let queryParams = generateQuery(newParams);
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
    [
      params,
      selectedRowCodes,
      EXPORT_IDs.allOrders,
      EXPORT_IDs.ordersOnThisPage,
      EXPORT_IDs.selectedOrders,
      EXPORT_IDs.ordersFound,
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
            Math.round((response.data?.num_of_record / response.data?.total) * 10000) / 100,
          );
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
            setExportProgress(0);
            setListExportFile([]);
            setExportError(response.data.message);
            showError("Đã có lỗi xảy ra!");
          }
        } else {
          setStatusExport(4);
        }
      });
    });
  }, [listExportFile]);

  const convertProgressStatus = (value: any) => {
    switch (value) {
      case "partial_paid":
        return CircleHalfFullIcon;
      case ORDER_SUB_STATUS.order_return:
      case "paid":
        return CircleFullIcon;
      default:
        return CircleEmptyIcon;
    }
  };

  // set ecommerce order data
  const setSearchResult = useCallback((result: PageResponse<OrderModel> | false) => {
    setTableLoading(false);
    if (!!result) {
      setData(result);
    }
  }, []);

  const handleBatchShippingShopeeProduct = (data: Array<ErrorMessageBatchShipping>) => {
    setShopeePreparationData(data);
  };

  const handlePreparationShopeeProductModal = () => {
    setConfirmPreparationShopeeProduct(true);
    setIsShowButtonConfirm(true);
    setBatchShippingType("");
    setShowPreparationModal(false);

    switch (batchShippingType) {
      case "SELECTED":
        setListShopOrderList([]);
        dispatch(
          batchShippingAction(
            {
              shipping_order_list: listShopOrderList,
              list_shop_pickup: null,
              search_query: null,
            },
            handleBatchShippingShopeeProduct,
          ),
        );
        break;
      case "FILTERED":
        setListShopPickUpAddress([]);
        const convertChannelCodeToArr = Array.isArray(params.channel_codes)
          ? params.channel_codes
          : [params.channel_codes];
        const convertEcommerceShopIdToArr = Array.isArray(params.ecommerce_shop_ids)
          ? params.ecommerce_shop_ids
          : [params.ecommerce_shop_ids];
        dispatch(
          batchShippingAction(
            {
              shipping_order_list: null,
              list_shop_pickup: listShopPickUpAddress,
              search_query: {
                ...params,
                channel_codes: convertChannelCodeToArr,
                ecommerce_shop_ids: convertEcommerceShopIdToArr,
              },
            },
            handleBatchShippingShopeeProduct,
          ),
        );
        break;
      default:
        return;
    }
  };

  const handleCancelPreparationShopeeProductModal = () => {
    setShowPreparationModal(false);
    setListShopOrderList([]);
    setListShopPickUpAddress([]);
  };

  const handleConfirmPreparationShopeeProductModal = () => {
    setConfirmPreparationShopeeProduct(false);
  };

  const getEcommerceOrderList = useCallback(
    (requestParams) => {
      if (!requestParams.channel_codes?.length) {
        requestParams.channel_codes = ALL_CHANNEL;
      }

      setTableLoading(true);
      dispatch(
        getListOrderAction(requestParams, (result) => {
          setTableLoading(false);
          setSearchResult(result);
        }),
      );
    },
    [dispatch, setSearchResult],
  );

  const reloadPage = useCallback(() => {
    setTimeout(() => {
      window.location.reload();
    }, 500);
  }, []);

  const onSuccessEditNote = useCallback(
    (note, customer_note, orderID) => {
      showSuccess(`${orderID} Cập nhật ghi chú thành công`);
      const indexOrder = itemResult.findIndex((item: any) => item.id === orderID);
      if (indexOrder > -1) {
        itemResult[indexOrder].note = note;
        itemResult[indexOrder].customer_note = customer_note;
      }
      setData({
        metadata: metadataResult,
        items: itemResult,
      });
    },
    [setData],
  );

  const editNote = useCallback(
    (note, customer_note, orderID, record: OrderModel) => {
      let params: any = {
        note,
        customer_note,
      };
      dispatch(
        updateOrderPartial(params, orderID, () => onSuccessEditNote(note, customer_note, orderID)),
      );
    },
    [dispatch, onSuccessEditNote],
  );

  // handle change single order status
  const checkIfOrderCannotChangeToWarehouseChange = (orderDetail: OrderExtraModel) => {
    const checkIfOrderHasNoFFM = (orderDetail: OrderExtraModel) => {
      return !orderDetail.fulfillments?.some((single) => {
        return single.shipment && !checkIfFulfillmentCancelled(single);
      });
    };
    const checkIfOrderIsNew = (orderDetail: OrderExtraModel) => {
      return orderDetail.sub_status_code === ORDER_SUB_STATUS.awaiting_coordinator_confirmation;
    };
    const checkIfOrderIsConfirm = (orderDetail: OrderExtraModel) => {
      return orderDetail.sub_status_code === ORDER_SUB_STATUS.coordinator_confirming;
    };
    const checkIfOrderIsAwaitSaleConfirm = (orderDetail: OrderExtraModel) => {
      return orderDetail.sub_status_code === ORDER_SUB_STATUS.awaiting_saler_confirmation;
    };
    return (
      (checkIfOrderIsNew(orderDetail) && checkIfOrderHasNoFFM(orderDetail)) ||
      (checkIfOrderIsConfirm(orderDetail) && checkIfOrderHasNoFFM(orderDetail)) ||
      (checkIfOrderIsAwaitSaleConfirm(orderDetail) && checkIfOrderHasNoFFM(orderDetail))
    );
  };

  const changeSubStatusCallback = (value: string, response?: any) => {
    console.log("response", response);
    const index = data.items?.findIndex((single) => single.id === selectedOrder?.id);
    if (index > -1) {
      let dataResult: dataExtra = { ...data };
      // selected = value;
      dataResult.items[index].sub_status_code = value;
      dataResult.items[index].sub_status = subStatuses?.find(
        (single) => single.code === value,
      )?.sub_status;
      dataResult.items[index].coordinator = response?.coordinator;
      dataResult.items[index].coordinator_code = response?.coordinator_code;
      setData(dataResult);
    }
  };
  // end handle change single order status

  useEffect(() => {
    if (!data?.items) {
      return;
    }
    if (typeAPi === type.trackingCode) {
      if (selectedOrder && selectedOrder.fulfillments) {
        const sortedFulfillments = sortFulfillments(selectedOrder.fulfillments);
        if (!sortedFulfillments[0]?.code) {
          return;
        }
        dispatch(
          getTrackingLogFulfillmentAction(sortedFulfillments[0]?.code, (response) => {
            // setIsVisiblePopup(true)
            const index = data.items?.findIndex((single) => single.id === selectedOrder.id);
            if (index > -1) {
              let dataResult: dataExtra = { ...data };
              dataResult.items[index].trackingLog = response;
              dataResult.items[index].isShowTrackingLog = true;
              setData(dataResult);
            }
          }),
        );
      }
    } else if (typeAPi === type.setSubStatus) {
    }
    //xóa data
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, selectedOrder, setData, type.subStatus, type.trackingCode, typeAPi]);

  // handle set table columns

  const renderOrderReturn = (item: any) => {
    let result = null;
    if (item?.order_returns && item?.order_returns.length > 0) {
      const returnedArr = item?.order_returns;
      result = returnedArr.map((single: any) => {
        return (
          <div key={single.id}>
            <Link to={`${UrlConfig.ORDERS_RETURN}/${single.id}`} target="_blank">
              {single.code_order_return}
            </Link>
          </div>
        );
      });
    }
    return result;
  };

  const handleInventoryData = useCallback(
    (variantIds: number[]) => {
      if (listStore) setStoreInventory([...listStore]);
      let inventoryQuery: InventoryVariantListQuery = {
        is_detail: true,
        variant_ids: variantIds,
        store_ids: listStore?.map((p) => p.id),
      };

      inventoryGetApi(inventoryQuery)
        .then((response) => {
          if (isFetchApiSuccessful(response)) {
            console.log(response);

            setInventoryData(response.data);
          } else {
            handleFetchApiError(response, "Danh sách tồn kho", dispatch);
          }
        })
        .catch((e) => {
          console.log(e);
        });
    },
    [dispatch, listStore],
  );

  const onSearchInventory = useCallback(
    (value: string) => {
      let _item: StoreResponse[] | any = listStore?.filter(
        (x) => fullTextSearch(value.toLowerCase().trim(), x.name.toLowerCase()) === true,
      );
      setStoreInventory(_item);
    },
    [listStore],
  );

  const handleRenderChannelIcon = (record: OrderModel) => {
    switch (record?.channel_id) {
      case EcommerceChannelId.SHOPEE:
        return shopeeIcon;
      case EcommerceChannelId.LAZADA:
        return lazadaIcon;
      case EcommerceChannelId.TIKI:
        return tikiIcon;
      case EcommerceChannelId.TIKTOK:
        return tiktokIcon;
      default:
        return "";
    }
  };

  const rowSelectionRenderCell = (
    checked: boolean,
    record: OrderModel,
    index: number,
    originNode: ReactNode,
  ) => {
    return (
      <React.Fragment>
        <div className="actionButton">{originNode}</div>
        <div className="actionButton">
          <Popover
            placement="right"
            overlayStyle={{ zIndex: 1000, top: "150px", maxWidth: "60%" }}
            title={
              <Row justify="space-between" align="middle" style={{ width: "100%" }}>
                <Input.Search placeholder="Tìm kiếm kho" allowClear onSearch={onSearchInventory} />
              </Row>
            }
            content={
              <InventoryTable
                inventoryData={inventoryData}
                storeId={record.store_id || 0}
                items={record.items}
                listStore={storeInventory}
              />
            }
            trigger="click"
            onVisibleChange={(visible) => {
              visible === true && handleInventoryData(record.items.map((p) => p.variant_id));
            }}
          >
            <Button
              type="link"
              className="checkInventoryButton"
              icon={<EyeOutlined style={{ color: "rgb(252, 175, 23)" }} />}
              style={{ padding: 0 }}
              title="Kiểm tra tồn kho"
            ></Button>
          </Popover>
        </div>
        {record?.order_returns && record?.order_returns?.length > 0 ? (
          <div className="actionButton" title="Đơn hàng có đổi trả">
            <b>[Đ]</b>
          </div>
        ) : null}
        <img width={18} height={18} src={handleRenderChannelIcon(record)} alt="" />
      </React.Fragment>
    );
  };
  const renderTrackingCode = (fulfillments: FulFillmentResponse[]) => {
    const fulfillmentsHasShipment = fulfillments?.filter((item: any) => !!item.shipment);
    const shipmentLength = fulfillmentsHasShipment?.length;
    const fulfillment = shipmentLength > 0 ? fulfillmentsHasShipment[shipmentLength - 1] : null;

    return <span>{getTrackingCodeFulfillment(fulfillment)}</span>;
  };

  const initColumns: ICustomTableColumType<OrderModel>[] = useMemo(() => {
    if (data.items.length === 0) {
      return [];
    }
    return [
      {
        title: "ID đơn hàng",
        key: "order_id",
        visible: true,
        fixed: "left",
        className: "custom-shadow-td",
        width: 175,
        align: "left",
        render: (data: any, item: OrderModel) => (
          <div>
            <Link to={`${UrlConfig.ORDER}/${item.id}`} target="_blank">
              <strong>{data.code}</strong>
            </Link>
            <div>{ConvertUtcToLocalDate(data.created_date, "HH:mm DD/MM/YYYY")}</div>
            <div>
              <span style={{ color: "#666666" }}>Kho: </span>
              <span>{data.store}</span>
            </div>
            <div>({data.reference_code})</div>
            <div>{renderTrackingCode(data.fulfillments)}</div>
          </div>
        ),
      },
      {
        title: "Khách hàng",
        key: "customer",
        visible: true,
        width: 160,
        align: "left",
        render: (record) =>
          record.shipping_address ? (
            <div className="customer custom-td">
              <div className="name p-b-3" style={{ color: "#2A2A86" }}>
                <Link
                  target="_blank"
                  to={`${UrlConfig.CUSTOMER}/${record.customer_id}`}
                  style={{ fontSize: "16px" }}
                >
                  {record.shipping_address.name}
                </Link>{" "}
              </div>
              <div className="p-b-3">{record.customer_phone_number}</div>
              <div>
                <strong>{record.ecommerce_shop_name}</strong>
              </div>
            </div>
          ) : (
            <div className="customer custom-td">
              <div className="name p-b-3" style={{ color: "#2A2A86" }}>
                {record.customer}
              </div>
              <div className="p-b-3">{record.customer_phone_number}</div>
            </div>
          ),
      },
      {
        title: (
          <div className="product-and-quantity-header">
            <span className="product-name">
              Sản phẩm
              <span className="separator">, </span>
            </span>
            <span className="quantity quantityWidth">
              SL
              <span className="separator">, </span>
            </span>
            <span className="price price-title priceWidth">Giá</span>
          </div>
        ),
        dataIndex: "items",
        key: "items.name11",
        className: "product-and-quantity",
        render: (items: any) => {
          return (
            <>
              {items.map((item: any, index: number) => {
                return (
                  <div className="item-custom-td" key={index}>
                    <div className="product productNameWidth 2">
                      <Link
                        target="_blank"
                        to={`${UrlConfig.PRODUCT}/${item.product_id}/variants/${item.variant_id}`}
                      >
                        <div>({item.sku})</div>
                        {item.variant}
                      </Link>
                    </div>
                    <div className="quantity quantityWidth">{item.quantity}</div>
                    <div className="price priceWidth">
                      <Tooltip title="Giá sản phẩm">
                        <NumberFormat
                          value={item.price}
                          className="foo"
                          displayType={"text"}
                          thousandSeparator={true}
                        />
                      </Tooltip>
                      {item.discount_items.map((discount: any, index: number) => {
                        return (
                          <Tooltip title="Khuyến mại sản phẩm">
                            <div style={{ color: "#EF5B5B" }} key={index}>
                              {"- "}
                              <NumberFormat
                                value={discount.amount || 0}
                                className="foo"
                                displayType={"text"}
                                thousandSeparator={true}
                              />
                            </div>
                          </Tooltip>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </>
          );
        },
        visible: true,
        width: nameQuantityWidth,
      },
      {
        title: "Doanh thu",
        key: "customer_amount_money",
        visible: true,
        width: 95,
        align: "left",
        render: (record: any) => {
          const discountAmount = record.discounts && record.discounts[0]?.amount;
          return (
            <div style={{ textAlign: "left" }}>
              <Tooltip title="Tổng tiền">
                <NumberFormat
                  value={record.total_line_amount_after_line_discount}
                  className="foo"
                  displayType={"text"}
                  thousandSeparator={true}
                />
              </Tooltip>

              <Tooltip title="Chiết khấu đơn hàng">
                <div style={{ color: "#EF5B5B" }}>
                  <span>- </span>
                  <NumberFormat
                    value={discountAmount || 0}
                    className="foo"
                    displayType={"text"}
                    thousandSeparator={true}
                  />
                </div>
              </Tooltip>

              <Tooltip title="Doanh thu">
                <div style={{ fontWeight: "bold" }}>
                  <NumberFormat
                    value={record.total}
                    className="foo"
                    displayType={"text"}
                    thousandSeparator={true}
                  />
                </div>
              </Tooltip>
            </div>
          );
        },
      },
      {
        title: "Trạng thái",
        dataIndex: "status",
        key: "status",
        visible: true,
        width: 145,
        className: "orderStatus",
        align: "left",
        render: (value: string, record: OrderExtraModel) => {
          if (!record || !status_order) {
            return null;
          }
          //const status = status_order.find((status) => status.value === record.status);
          let recordStatuses = record?.statuses;
          if (!recordStatuses) {
            recordStatuses = [];
          }
          let selected = record.sub_status_code ? record.sub_status_code : "finished";
          if (!recordStatuses.some((single) => single.code === selected)) {
            recordStatuses.push({
              name: record.sub_status,
              code: record.sub_status_code,
            });
          }
          let className =
            record.sub_status_code === ORDER_SUB_STATUS.fourHour_delivery
              ? "fourHour_delivery"
              : record.sub_status_code
              ? record.sub_status_code
              : "";
          return (
            <div className="orderStatus">
              <div className="inner">
                <div className="single">
                  <div>
                    <strong>Xử lý đơn: </strong>
                  </div>

                  {/* {record.sub_status ? record.sub_status : "-"} */}
                  {subStatuses ? (
                    <Select
                      style={{ width: "100%" }}
                      placeholder="Chọn trạng thái xử lý đơn"
                      optionFilterProp="children"
                      filterOption={(input, option) =>
                        option?.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                      }
                      notFoundContent="Không tìm thấy trạng thái xử lý đơn"
                      value={record.sub_status_code}
                      onClick={() => {
                        setTypeAPi(type.subStatus);
                        setSelectedOrder(record);
                      }}
                      className={className}
                      onChange={(value) => {
                        if (
                          value === ORDER_SUB_STATUS.require_warehouse_change &&
                          checkIfOrderCannotChangeToWarehouseChange(record)
                        ) {
                          showError("Bạn không thể đổi sang trạng thái khác!");
                          return;
                        }
                        // if (selected !== ORDER_SUB_STATUS.require_warehouse_change && value === ORDER_SUB_STATUS.require_warehouse_change) {
                        //   showError("Vui lòng vào chi tiết đơn chọn lý do đổi kho hàng!")
                        //   return;
                        // }
                        // let isChange = isOrderFromSaleChannel(selectedOrder) ? true : getValidateChangeOrderSubStatus(record, value);
                        // if (!isChange) {
                        //   return;
                        // }
                        setToSubStatusCode(value);
                      }}
                    >
                      {subStatuses &&
                        subStatuses.map((single: any, index: number) => {
                          return (
                            <Select.Option value={single.code} key={index}>
                              {single.sub_status}
                            </Select.Option>
                          );
                        })}
                    </Select>
                  ) : (
                    "-"
                  )}
                </div>
                <div className="single">
                  <div className="coordinator-item">
                    <strong>NV điều phối: </strong>
                    {record.coordinator ? (
                      <Link
                        to={`${UrlConfig.ACCOUNTS}/${record.coordinator_code}`}
                        style={{ fontWeight: 500 }}
                        target="_blank"
                      >
                        {record.coordinator_code + " - " + record.coordinator}
                      </Link>
                    ) : (
                      <span>{"---"}</span>
                    )}
                  </div>
                  {/* {record.status === OrderStatus.DRAFT && (
                    <div
                      style={{
                        color: "#737373",
                      }}>
                      {status?.name}
                    </div>
                  )}

                  {record.status === OrderStatus.FINALIZED && (
                    <div
                      style={{
                        color: "#FCAF17",
                      }}>
                      {status?.name}
                    </div>
                  )}

                  {record.status === OrderStatus.FINISHED && (
                    <div
                      style={{
                        color: successColor,
                      }}>
                      {status?.name}
                    </div>
                  )}

                  {record.status === OrderStatus.CANCELLED && (
                    <div
                      style={{
                        color: "#E24343",
                      }}>
                      {status?.name}
                    </div>
                  )} */}
                </div>
              </div>
            </div>
          );
        },
      },
      {
        title: "Ghi chú",
        className: "notes",
        render: (value: string, record: OrderModel) => {
          return (
            <div className="orderNotes">
              <div className="inner">
                <div className="single">
                  <EditNote
                    note={record.customer_note}
                    title="KH: "
                    color={primaryColor}
                    onOk={(values) => {
                      editNote(values.note, values.customer_note, record.id, record);
                    }}
                    noteFormValue={{
                      note: record.note,
                      customer_note: record.customer_note,
                    }}
                    isDisable={record.status === OrderStatus.CANCELLED}
                  />
                </div>
                <div className="single">
                  <EditNote
                    note={record.note}
                    title="NB: "
                    color={primaryColor}
                    onOk={(values) => {
                      editNote(values.note, values.customer_note, record.id, record);
                    }}
                    noteFormValue={{
                      note: record.note,
                      customer_note: record.customer_note,
                    }}
                    isDisable={record.status === OrderStatus.CANCELLED}
                  />
                </div>
              </div>
            </div>
          );
        },
        key: "note",
        visible: true,
        align: "left",
        width: 150,
      },
      {
        title: "Vận chuyển",
        key: "delivery_service",
        visible: true,
        width: 130,
        align: "left",
        render: (order: any) => {
          const shipment =
            order.fulfillments && order.fulfillments[0] && order.fulfillments[0].shipment;
          return (
            <>
              {shipment &&
                (shipment.delivery_service_provider_type === "external_service" ||
                  shipment.delivery_service_provider_type === "shopee") && (
                  <>
                    <strong>{shipment?.delivery_service_provider_name}</strong>
                    <div>
                      <img src={CustomerIcon} alt="" style={{ marginRight: 5, height: 15 }} />
                      <NumberFormat
                        value={order?.shipping_fee_informed_to_customer || 0}
                        className="foo"
                        displayType={"text"}
                        thousandSeparator={true}
                      />
                    </div>
                    <div>
                      <img src={DeliveryIcon} alt="" style={{ marginRight: 5, height: 13 }} />
                      <NumberFormat
                        value={shipment?.shipping_fee_paid_to_three_pls}
                        className="foo"
                        displayType={"text"}
                        thousandSeparator={true}
                      />
                    </div>
                  </>
                )}
              {shipment && shipment.delivery_service_provider_type === "pick_at_store" && (
                <>
                  <strong>Nhận tại cửa hàng</strong>
                </>
              )}
              {shipment && shipment.delivery_service_provider_type === "Shipper" && (
                <>
                  <strong>Tự giao hàng</strong>
                </>
              )}
            </>
          );
        },
      },
      // {
      //   title: "Biên bản bàn giao",
      //   dataIndex: "goods_receipt_id",
      //   key: "goods_receipt_id",
      //   align: "left",
      //   visible: true,
      //   width: 140,
      //   render: (value, record: OrderModel) => {
      //     let result: ReactNode = <span>-</span>;
      //     let arr = record.goods_receipts;
      //     if (arr && arr.length > 0) {
      //       result = arr.map((single, index) => {
      //         return (
      //           <React.Fragment key={index}>
      //             <Link to={`${UrlConfig.DELIVERY_RECORDS}/${single.id}`}>{single.id}</Link>
      //             {arr && index < arr.length - 1 && ", "}
      //           </React.Fragment>
      //         );
      //       });
      //     }
      //     return result;
      //   },
      // },
      {
        title: "Địa chỉ giao hàng",
        key: "shipping_address",
        visible: true,
        align: "left",
        width: 200,
        render: (item: any) => {
          return <div className="p-b-3">{item?.shipping_address?.full_address}</div>;
        },
      },
      {
        title: "Thanh toán",
        dataIndex: "payment_status",
        key: "payment_status",
        visible: true,
        align: "left",
        width: 100,
        render: (value: string) => {
          const processIcon = convertProgressStatus(value);
          return <img src={processIcon} alt="" />;
        },
      },
      {
        title: "Đơn trả hàng",
        dataIndex: "sub_status_code",
        key: "sub_status_code",
        visible: true,
        align: "left",
        width: 150,
        render: (value: any, item: any) => renderOrderReturn(item),
      },
      {
        title: "NV bán hàng",
        key: "assignee",
        visible: true,
        align: "left",
        width: 200,
        render: (data) => <div>{`${data.assignee_code} - ${data.assignee}`}</div>,
      },
      {
        title: "Ngày thành công",
        dataIndex: "finished_on",
        key: "finished_on",
        visible: true,
        align: "left",
        width: 150,
        render: (completed_on: string) => (
          <div>{ConvertUtcToLocalDate(completed_on, "DD/MM/YYYY")}</div>
        ),
      },
      {
        title: "Ngày huỷ",
        dataIndex: "cancelled_on",
        key: "cancelled_on",
        visible: true,
        align: "left",
        width: 100,
        render: (cancelled_on) => <div>{ConvertUtcToLocalDate(cancelled_on, "DD/MM/YYYY")}</div>,
      },
    ];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.items.length, deliveryServices, editNote, status_order]);

  useEffect(() => {
    if (columns.length === 0) {
      setColumns(initColumns);
    }
  }, [columns, initColumns, setColumns]);
  // handle set table columns

  useSetTableColumns(columnConfigType, tableColumnConfigs, initColumns, setColumns);

  const onSelectTableRow = useCallback((selectedRowTable) => {
    setSelectedRow(selectedRowTable);
    const newSelectedRow = selectedRowTable.filter((row: any) => {
      return row !== undefined;
    });

    setSelectedRow(newSelectedRow);

    const selectedRowIds = newSelectedRow.map((row: any) => row?.id);
    setSelectedRowKeys(selectedRowIds);

    const selectedRowCodes = newSelectedRow.map((row: any) => row.code);
    setSelectedRowCodes(selectedRowCodes);
  }, []);

  const onPageChange = useCallback(
    (page, size) => {
      let newPrams = { ...params, page, limit: size };
      let queryParam = generateQuery(newPrams);
      history.push(`${location.pathname}?${queryParam}`);
    },
    [history, location.pathname, params],
  );

  const onFilter = useCallback(
    (values) => {
      let newParams = { ...params, ...values };
      const queryParam = generateQuery(newParams);
      const currentParam = generateQuery(params);
      if (currentParam !== queryParam) {
        newParams.page = 1;
        const newQueryParam = generateQuery(newParams);
        history.push(`${location.pathname}?${newQueryParam}`);
      }
    },
    [history, location.pathname, params],
  );

  const onClearFilter = useCallback(() => {
    let queryParam = generateQuery(initQuery);
    history.push(`${location.pathname}?${queryParam}`);
  }, [history, location.pathname]);

  const handleGetAddressByShopId = (data: ShopAddressByShopId) => {
    setEcommerceShopAddress(data);
  };

  const [referenceCodeByShopAddress, setReferenceCodeByShopAddress] = useState<Array<any>>([]);

  const handleReportPreparationShopeeProductModal = () => {
    const shopIds: any[] = [];
    selectedRow.length &&
      selectedRow.map((item: any) =>
        item?.ecommerce_shop_id !== null && shopIds.includes(item?.ecommerce_shop_id)
          ? ""
          : shopIds.push(item?.ecommerce_shop_id),
      );

    shopIds.forEach((id: any) => {
      const checkReferenceCode = selectedRow.filter((ref) => ref.ecommerce_shop_id === id);
      const listReferenceCodeByAddress = checkReferenceCode.map((item) => item.reference_code);

      const orderListShopByAddress = {
        shop_id: id,
        order_list: listReferenceCodeByAddress,
      };
      setReferenceCodeByShopAddress((prev: any) => [...prev, orderListShopByAddress]);
    });

    if (batchShippingType === BATCHING_SHIPPING_TYPE.FILTERED) {
      const queryParam = { ...params };
      queryParam.page = null;
      queryParam.limit = null;
      queryParam.channel_codes = [];
      const generateQueryParam = generateQuery(queryParam);
      if (!generateQueryParam) {
        showError("Chưa áp dụng bộ lọc sản phẩm. Vui lòng kiểm tra lại.");
        setShowReportPreparationModal(false);
        setShowPreparationModal(false);
        setBatchShippingType("");
      } else {
        setShowReportPreparationModal(false);
        setShowPreparationModal(true);
      }
    }

    switch (batchShippingType) {
      case "SELECTED":
        setShowPreparationModal(true);
        dispatch(
          getAddressByShopIdAction(
            {
              shop_ids: shopIds,
            },
            handleGetAddressByShopId,
          ),
        );
        break;
      case "FILTERED":
        if (!params.ecommerce_shop_ids.length) {
          setShowPreparationModal(false);
          setConfirmPreparationShopeeProduct(true);

          const convertChannelCodeToArr = Array.isArray(params.channel_codes)
            ? params.channel_codes
            : [params.channel_codes];
          const convertEcommerceShopIdToArr = Array.isArray(params.ecommerce_shop_ids)
            ? params.ecommerce_shop_ids
            : [params.ecommerce_shop_ids];

          dispatch(
            batchShippingAction(
              {
                shipping_order_list: null,
                list_shop_pickup: [],
                search_query: {
                  ...params,
                  channel_codes: convertChannelCodeToArr,
                  ecommerce_shop_ids: convertEcommerceShopIdToArr,
                },
              },
              handleBatchShippingShopeeProduct,
            ),
          );
          return;
        } else {
          setShowPreparationModal(true);
        }
        dispatch(
          getAddressByShopIdAction(
            {
              shop_ids: params?.ecommerce_shop_ids?.toString(),
            },
            handleGetAddressByShopId,
          ),
        );
        break;
      default:
        return;
    }
    setShowReportPreparationModal(false);
  };

  // handle process modal
  const [isVisibleProcessModal, setIsVisibleProcessModal] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [processMessage, setProcessMessage] = useState<any>({
    success: "",
  });

  const [commonProcessId, setCommonProcessId] = useState(null);
  const [commonProcessPercent, setCommonProcessPercent] = useState<number>(0);
  const [commonProcessData, setCommonProcessData] = useState<any>(null);

  const resetCommonProcess = () => {
    setCommonProcessId(null);
    setCommonProcessPercent(0);
    setCommonProcessData(null);
  };

  // handle exit process modal
  const [isVisibleExitProcessModal, setIsVisibleExitProcessModal] = useState<boolean>(false);
  const [exitProcessModal, setExitProcessModal] = useState<any>({
    exitProgressContent: <></>,
  });

  const onCancelExitProcessModal = () => {
    setIsVisibleExitProcessModal(false);
  };

  const onOkExitProcessModal = () => {
    resetCommonProcess();
    setIsVisibleExitProcessModal(false);
    setIsVisibleProcessModal(false);
    if (commonProcessId) {
      dispatch(
        exitEcommerceJobsAction(commonProcessId, (responseData) => {
          if (responseData) {
            showSuccess(responseData);
          }
        }),
      );
    }
  };
  // end handle exit process modal

  const handleProgress = useCallback(() => {
    if (!commonProcessId) {
      return;
    }
    let getProgressPromises: Promise<BaseResponse<any>> = getEcommerceJobsApi(commonProcessId);

    Promise.all([getProgressPromises]).then((responses) => {
      responses.forEach((response) => {
        if (
          response.code === HttpStatus.SUCCESS &&
          response.data &&
          !isNullOrUndefined(response.data.total)
        ) {
          const responseData = response.data;
          setCommonProcessData(responseData);
          if (responseData.finish) {
            setIsProcessing(false);
            setCommonProcessId(null);
            setCommonProcessPercent(100);

            setSuccessDeliveryNote(
              responseData.success_list ? responseData.success_list.split(",") : [],
            );

            if (!responseData.api_error) {
              showSuccess(`${processMessage.success}`);
            } else {
              resetCommonProcess();
              setIsVisibleProcessModal(false);
              showError(responseData.api_error);
            }
          } else {
            const progressCount =
              responseData.total_created +
              responseData.total_updated +
              responseData.total_success +
              responseData.total_error;
            const percent = Math.floor((progressCount / responseData.total) * 100);
            setCommonProcessPercent(percent);
          }
        }
      });
    });
  }, [commonProcessId, processMessage.success]);

  useEffect(() => {
    if (commonProcessPercent === 100 || !commonProcessId) {
      return;
    }
    handleProgress();
    const getFileInterval = setInterval(handleProgress, 3000);
    return () => clearInterval(getFileInterval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [commonProcessId, handleProgress]);
  // end progress download orders

  // handle print ecommerce delivery note
  const [isPrintEcommerceDeliveryNote, setIsPrintEcommerceDeliveryNote] = useState<boolean>(false);

  useEffect(() => {
    if (!isVisibleProcessModal) {
      setIsPrintEcommerceDeliveryNote(false);
    }
  }, [isVisibleProcessModal]);

  const handleChangeEcommerceOrderStatusToPicked = () => {
    const orderPickedList: Array<any> = [];
    successDeliveryNote?.forEach((referenceCode) => {
      const order = selectedRow?.find(
        (row) =>
          row.reference_code?.toString().toUpperCase() === referenceCode?.toString().toUpperCase(),
      );
      if (order) {
        orderPickedList.push(order);
      }
    });
    handleChangeOrderStatusToPicked(orderPickedList);
  };

  const okPrintEcommerceDeliveryNote = (isPick: boolean) => {
    setIsVisibleProcessModal(false);
    // setIsPrintEcommerceDeliveryNote(false);
    if (commonProcessData?.url) {
      showSuccess("Tải phiếu giao hàng sàn thành công!");
      window.open(commonProcessData?.url);

      if (isPick) {
        handleChangeEcommerceOrderStatusToPicked();
      }
    } else {
      showError("Tải phiếu giao hàng sàn thất bại!");
    }
  };

  const cancelPrintEcommerceDeliveryNote = () => {
    if (isProcessing) {
      setIsVisibleExitProcessModal(true);
    } else {
      setIsVisibleProcessModal(false);
      // setIsPrintEcommerceDeliveryNote(false);
      resetCommonProcess();
    }
  };

  const downloadEcommerceDeliveryNote = useCallback((data: any) => {
    if (data && data.process_id) {
      setCommonProcessId(data.process_id);
      setIsVisibleProcessModal(true);
      setIsProcessing(true);
      setProcessMessage({
        success: "Đã tải dữ liệu phiếu giao hàng sàn.",
      });

      setExitProcessModal({
        exitProgressContent: (
          <div style={{ display: "flex", alignItems: "center" }}>
            <img src={DeleteIcon} alt="" />
            <div style={{ marginLeft: 15 }}>
              <strong style={{ fontSize: 16 }}>
                Bạn có chắc chắn muốn hủy tải phiếu giao hàng không?
              </strong>
              <div style={{ fontSize: 14 }}>
                Hệ thống sẽ dừng việc tải phiếu giao hàng, bạn vẫn có thể tải lại sau nếu muốn.
              </div>
            </div>
          </div>
        ),
      });
    }
  }, []);

  // handle action button
  const changeLazadaOrderStatus = useCallback(
    (status: EcommerceOrderStatus) => {
      let ecommerceOrderStatusRequest: EcommerceOrderStatusRequest = {
        status: status,
        ecommerce_id: EcommerceId.LAZADA,
        items: [],
      };
      if (selectedRowKeys?.length > 0) {
        let order_list: Array<EcommerceOrderList> = [];
        selectedRowKeys.forEach((idSelected) => {
          const orderMatched = data?.items.find((i) => i.id === idSelected);
          if (orderMatched) {
            const orderRequest: EcommerceOrderList = {
              order_sn: orderMatched.reference_code,
              shop_id: orderMatched.ecommerce_shop_id.toString(),
            };
            order_list.push(orderRequest);
          }
        });
        ecommerceOrderStatusRequest.items = order_list;
        dispatch(
          changeEcommerceOrderStatus(
            ecommerceOrderStatusRequest,
            (data: EcommerceChangeOrderStatusReponse) => {
              if (data === null) {
                showError("Có lỗi xảy ra khi chuyển trạng thái sàn");
              } else {
                let statusList: Array<ChangeOrderStatusErrorLine> = [],
                  sortedStatusList: Array<ChangeOrderStatusErrorLine> = [];
                data.success_list.forEach((orderSn) =>
                  statusList.push({
                    order_sn: orderSn,
                    error_message: "Thành công",
                    type: ChangeOrderStatusErrorLineType.SUCCESS,
                  }),
                );
                data.error_list.forEach((error: ChangeOrderStatusErrorLine) => {
                  statusList.push({
                    ...error,
                    type: ChangeOrderStatusErrorLineType.ERROR,
                  });
                });
                order_list.forEach((order: EcommerceOrderList) => {
                  let statusItem: ChangeOrderStatusErrorLine | undefined = statusList.find(
                    (item) => item.order_sn === order.order_sn,
                  );
                  if (statusItem) {
                    sortedStatusList.push(statusItem);
                  }
                });
                setChangeOrderStatusList(sortedStatusList);
                setIsVisibleChangeOrderStatusModal(status);
              }
            },
          ),
        );
      }
    },
    [selectedRowKeys, data?.items, dispatch],
  );

  // change order status to picked
  const handleChangeOrderStatusToPicked = useCallback(
    (orderList) => {
      const fulfillmentIds: Array<number> = [];
      orderList?.forEach((row: any) =>
        row?.fulfillments?.forEach((single: any) => {
          fulfillmentIds.push(single?.id);
        }),
      );

      if (fulfillmentIds?.length) {
        dispatch(showLoading());
        changeOrderStatusToPickedService(fulfillmentIds)
          .then((response) => {
            if (isFetchApiSuccessful(response)) {
              showSuccess("Đã chuyển trạng thái xử lý đơn hàng.");
            } else {
              handleFetchApiError(response, "In phiếu giao hàng", dispatch);
            }
          })
          .catch((error) => {
            console.log("error", error);
          })
          .finally(() => {
            dispatch(hideLoading());
            reloadPage();
          });
      }
    },
    [dispatch, reloadPage],
  );

  const handlePrintEcommerceDeliveryNote = useCallback(() => {
    let isOrderMatched = true;
    if (selectedRowKeys?.length > 0) {
      let order_list: any = [];
      selectedRowKeys.forEach((idSelected) => {
        const orderMatched = data?.items.find((i) => i.id === idSelected);
        if (orderMatched && !orderMatched.ecommerce_shop_id) {
          isOrderMatched = false;
          showError("Bạn không thể in phiếu giao hàng sàn");
          return;
        }
        if (orderMatched && listShopIdEcommerce?.length > 0) {
          const shop_id = listShopIdEcommerce.filter((shop) => {
            const sliceShopId = shop.id.slice(0, -4);
            const sliceEcommerceShopId = orderMatched.ecommerce_shop_id.toString().slice(0, -4);
            return sliceShopId === sliceEcommerceShopId;
          });

          const [shopId] = shop_id?.map((shop: any) => shop.id);

          const orderRequest = {
            order_sn: orderMatched.reference_code,
            core_order_id: orderMatched.id,
            tracking_number: orderMatched.fulfillments.find(
              (item: any) => item.status !== FulFillmentStatus.CANCELLED,
            )?.shipment?.tracking_code,
            delivery_name: orderMatched.fulfillments.find(
              (item: any) => item.status !== FulFillmentStatus.CANCELLED,
            )?.shipment?.delivery_service_provider_name,
            ecommerce_id: getEcommerceIdByChannelId(orderMatched.channel_id),
            shop_id: shopId,
          };
          order_list.push(orderRequest);
        }
      });
      if (!isOrderMatched) return;
      resetCommonProcess();
      setIsPrintEcommerceDeliveryNote(true);
      dispatch(downloadPrintForm({ order_list }, downloadEcommerceDeliveryNote));
    }
  }, [selectedRowKeys, dispatch, downloadEcommerceDeliveryNote, data?.items, listShopIdEcommerce]);
  // handle print ecommerce delivery note

  // handle print yody delivery note
  const printAction = useCallback(
    (printType: string) => {
      handleChangeOrderStatusToPicked(selectedRow);

      let params = {
        action: "print",
        ids: selectedRowKeys,
        "print-type": printType,
        "print-dialog": true,
      };
      const queryParam = generateQuery(params);
      const printPreviewUrl = `${process.env.PUBLIC_URL}${UrlConfig.ORDER}/print-preview?${queryParam}`;
      window.open(printPreviewUrl, "_blank", "noopener,noreferrer");
    },
    [handleChangeOrderStatusToPicked, selectedRow, selectedRowKeys],
  );

  const printEcommerceAction = useCallback(
    (printType: string) => {
      let params = {
        action: "print",
        ids: selectedRowKeys,
        "print-type": printType,
        "print-dialog": true,
      };
      const queryParam = generateQuery(params);
      const printPreviewUrl = `${process.env.PUBLIC_URL}${UrlConfig.ECOMMERCE}/print-preview?${queryParam}`;
      window.open(printPreviewUrl, "_blank", "noopener,noreferrer");
    },
    [selectedRowKeys],
  );

  const handlePrintShipment = () => {
    handleChangeOrderStatusToPicked(selectedRow);
    printEcommerceAction("shipment");
  };
  // end handle print yody delivery note

  //handle preparation shopee product
  const handlePreparationShopeeProduct = () => {
    setShowReportPreparationModal(true);
    const queryParam = { ...params };
    queryParam.page = null;
    queryParam.limit = null;
    queryParam.channel_codes = [];
    const generateQueryParam = generateQuery(queryParam);
    if (generateQueryParam) {
      setReportShopeeFilter(false);
    }
  };

  const handleExportOrder = () => {
    if (listExportFile.length) {
      setStatusExport(2);
    } else {
      setStatusExport(1);
    }
    setShowExportModal(true);
  };

  // handle change order status
  const handleChangeOrderStatus = () => {
    setIsShowChangeOrderStatusModal(true);
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

  const changeStatus = (id: number, toStatus: string, reason_id = 0, sub_reason_id = 0) => {
    return new Promise((resolve, reject) => {
      // setIsLoadingSetSubStatus(true)
      isLoadingSetSubStatus = true;
      dispatch(showLoading());
      setSubStatusService(id, toStatus, reason_id, sub_reason_id)
        .then((response) => {
          // setIsLoadingSetSubStatus(false)
          isLoadingSetSubStatus = false;
          dispatch(hideLoading());
          resolve(response);
        })
        .catch((error) => {
          // setIsLoadingSetSubStatus(false)
          isLoadingSetSubStatus = false;
          dispatch(hideLoading());
          reject();
        });
    });
  };

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

  const handleChangeSingleOrderStatus = async (i: number, toStatus: string) => {
    let selectedRowLength = selectedRow.length;
    if (i >= selectedRowLength) {
      return;
    }
    let currentOrder = selectedRow[i];

    // let {isCanChange, textResult} = handleIfIsChange(currentOrder, toStatus);

    // Không validate nữa
    let isCanChange = true;
    let textResult = "";
    const reason_id = toStatus === ORDER_SUB_STATUS.require_warehouse_change ? reasonId : undefined;
    const sub_reason_id =
      toStatus === ORDER_SUB_STATUS.require_warehouse_change
        ? subReasonRequireWarehouseChange
        : undefined;

    if (isCanChange) {
      // setIsLoadingSetSubStatus(true);
      isLoadingSetSubStatus = true;
      let response: any = await changeStatus(currentOrder.id, toStatus, reason_id, sub_reason_id);
      if (isFetchApiSuccessful(response)) {
        isCanChange = true;
        textResult = "Chuyển trạng thái thành công";
        changeOrderStatusInTable(selectedRow[i], toStatus);
      } else {
        isCanChange = false;
        textResult = "Có lỗi khi cập nhật trạng thái";
        handleFetchApiError(response, "Cập nhật trạng thái", dispatch);
      }
      // setIsLoadingSetSubStatus(false)
      isLoadingSetSubStatus = false;
    }

    const newStatusHtml: ChangeOrderStatusHtmlModel = {
      id: currentOrder.id,
      isSuccess: isCanChange,
      text: textResult,
    };
    newResult[i] = newStatusHtml;
    let renderListHtml = renderResultBlock(newResult);
    let htmlResult = (
      <React.Fragment>
        <div style={{ marginBottom: 10 }}>
          Đã xử lý: {i + 1} / {selectedRow.length}
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
    let i = 0;
    if (!status) {
      return;
    }
    setChangeOrderStatusHtml(undefined);
    handleChangeSingleOrderStatus(i, status);
  };
  // end handle change order status

  const handleDisablePreparationShopee = () => {
    if (!params) {
      if (!selectedRowKeys?.length) {
        return true;
      }
    }

    return false;
  };

  // actions list
  const actions = [
    {
      key: "export_ecommerce_order",
      icon: <FileExcelOutlined />,
      name: "Xuất excel",
      onClick: () => handleExportOrder(),
    },
    {
      key: "print_new_Ecommerce_shipment",
      name: "In phiếu nhặt hàng sàn",
      icon: <PrinterOutlined />,
      disabled: !selectedRowKeys?.length || !data.items.length,
      onClick: () => printAction("ecommerce_shipment"),
    },
    {
      key: "print_SO_shipment",
      name: "In phiếu giao hàng",
      icon: <PrinterOutlined />,
      disabled: !selectedRowKeys?.length || !data.items.length,
      onClick: () => handlePrintShipment(),
    },
    {
      key: "ecommerce_print_shipment",
      name: "In phiếu giao hàng sàn",
      icon: <PrinterOutlined />,
      disabled: !selectedRowKeys?.length || !data.items.length,
      onClick: handlePrintEcommerceDeliveryNote,
    },
    {
      key: "print_stock_export",
      name: "In phiếu xuất kho",
      icon: <PrinterOutlined />,
      disabled: !selectedRowKeys?.length || !data.items.length,
      onClick: () => printAction("stock_export"),
    },
    {
      key: "change_order_status",
      name: "Chuyển trạng thái đơn hàng",
      icon: <PrinterOutlined />,
      disabled: !selectedRow.length,
      onClick: handleChangeOrderStatus,
    },
  ];

  const lazadaActions = [
    {
      key: "lazada_create_package",
      name: "Tạo gói hàng Lazada",
      icon: <PrinterOutlined />,
      disabled: !data.items.length || !selectedRowKeys?.length,
      onClick: () => {
        changeLazadaOrderStatus(EcommerceOrderStatus.PACKED);
      },
    },
    {
      key: "lazada_notify_ready_to_deliver",
      name: "Báo Lazada sẵn sàng giao",
      icon: <PrinterOutlined />,
      disabled: !data.items.length || !selectedRowKeys?.length,
      onClick: () => {
        changeLazadaOrderStatus(EcommerceOrderStatus.READY_TO_SHIP);
      },
    },
  ];
  // end handle action button

  const shopeeActions = [
    {
      key: "shopee_ready_create_product",
      name: "Báo shopee chuẩn bị hàng",
      icon: <PrinterOutlined />,
      disabled: handleDisablePreparationShopee(),
      onClick: handlePreparationShopeeProduct,
    },
  ];

  const columnFinal = useMemo(() => columns.filter((item) => item.visible === true), [columns]);

  const setDataAccounts = useCallback((data: PageResponse<AccountResponse> | false) => {
    if (!data) {
      return;
    }
    setAccounts(data.items);
  }, []);

  // handle get order
  const openGetOrderModal = () => {
    setIsShowGetOrderModal(true);
  };

  const cancelGetOrderModal = () => {
    setIsShowGetOrderModal(false);
  };

  const callbackDownloadEcommerceOrders = (data: any) => {
    if (data) {
      if (typeof data === "string") {
        setIsShowGetOrderModal(false);
        setIsVisibleConflictModal(true);
      } else {
        setIsShowGetOrderModal(false);
        setProcessId(data.process_id);
        setIsVisibleProgressDownloadOrdersModal(true);

        setIsDownloading(true);
      }
    }
  };
  // end

  useEffect(() => {
    if (listExportFile.length === 0 || statusExport === 3 || statusExport === 4) return;
    checkExportFile();

    const getFileInterval = setInterval(checkExportFile, 3000);
    return () => clearInterval(getFileInterval);
  }, [checkExportFile, listExportFile, statusExport]);

  useEffect(() => {
    if (allowOrdersView) {
      getEcommerceOrderList(params);
    }
  }, [allowOrdersView, getEcommerceOrderList, params]);

  useEffect(() => {
    if (allowOrdersView) {
      dispatch(searchAccountPublicAction({}, setDataAccounts));
      dispatch(getListSourceRequest(setListSource));
      dispatch(PaymentMethodGetList(setListPaymentMethod));
      dispatch(StoreGetListAction(setStore));

      dispatch(
        actionFetchListOrderProcessingStatus(
          {
            sort_type: "asc",
            sort_column: "display_order",
          },
          (data: OrderProcessingStatusResponseModel) => {
            setListOrderProcessingStatus(data.items);
          },
        ),
      );
    }
  }, [allowOrdersView, dispatch, setDataAccounts]);

  // handle progress download orders
  const [isVisibleConflictModal, setIsVisibleConflictModal] = useState<boolean>(false);
  const [isVisibleProgressDownloadOrdersModal, setIsVisibleProgressDownloadOrdersModal] =
    useState<boolean>(false);
  const [isVisibleExitDownloadOrdersModal, setIsVisibleExitDownloadOrdersModal] =
    useState<boolean>(false);
  const [isVisibleChangeOrderStatusModal, setIsVisibleChangeOrderStatusModal] =
    useState<EcommerceOrderStatus | null>(null);
  const [changeOrderStatusList, setChangeOrderStatusList] = useState<
    Array<ChangeOrderStatusErrorLine>
  >([]);
  const [processId, setProcessId] = useState(null);
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [progressData, setProgressData] = useState(null);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);

  const resetProgress = () => {
    setProcessId(null);
    setProgressPercent(0);
    setProgressData(null);
  };

  const closeConflictDownloadModal = () => {
    setIsVisibleConflictModal(false);
  };

  // handle progress download orders modal
  const onCancelProgressDownloadOrder = () => {
    setIsVisibleExitDownloadOrdersModal(true);
  };

  const onOKProgressDownloadOrder = () => {
    resetProgress();
    reloadPage();
    setIsVisibleProgressDownloadOrdersModal(false);
  };
  // end

  // handle exit download orders modal
  const onCancelExitDownloadOrdersModal = () => {
    setIsVisibleExitDownloadOrdersModal(false);
  };

  const onCloseChangeOrderStatusModal = () => {
    setIsVisibleChangeOrderStatusModal(null);
  };

  useEffect(() => {
    if (isVisibleChangeOrderStatusModal === null) {
      setChangeOrderStatusList([]);
    }
  }, [isVisibleChangeOrderStatusModal]);

  const onOkExitDownloadOrdersModal = () => {
    resetProgress();
    dispatch(
      exitProgressDownloadEcommerceAction(processId, (responseData) => {
        if (responseData) {
          showSuccess(responseData);
          setIsVisibleExitDownloadOrdersModal(false);
          onOKProgressDownloadOrder();
        }
      }),
    );
  };
  // end

  const getProgress = useCallback(() => {
    let getProgressPromises: Promise<BaseResponse<any>> =
      getProgressDownloadEcommerceApi(processId);

    Promise.all([getProgressPromises]).then((responses) => {
      responses.forEach((response) => {
        if (
          response.code === HttpStatus.SUCCESS &&
          response.data &&
          !isNullOrUndefined(response.data.total)
        ) {
          const processData = response.data;
          setProgressData(processData);
          const progressCount =
            processData.total_created + processData.total_updated + processData.total_error;
          if (processData.finish) {
            setProgressPercent(100);
            setProcessId(null);
            setIsDownloading(false);
            if (!processData.api_error) {
              showSuccess("Tải đơn hàng thành công!");
            } else {
              resetProgress();
              setIsVisibleProgressDownloadOrdersModal(false);
              showError(processData.api_error);
            }
          } else {
            const percent = Math.floor((progressCount / processData.total) * 100);
            setProgressPercent(percent);
          }
        }
      });
    });
  }, [processId]);

  useEffect(() => {
    if (progressPercent === 100 || !processId) {
      return;
    }

    getProgress();

    const getFileInterval = setInterval(getProgress, 3000);
    return () => clearInterval(getFileInterval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getProgress]);
  // end progress download orders

  window.onbeforeunload = (e) => {
    if (processId) {
      const message = "Quá trình sẽ vẫn tiếp tục nếu bạn rời khỏi trang?";
      e = e || window.event;
      if (e) {
        e.returnValue = message;
      }
      return message;
    }
  };

  //get amout order success when preparation shopee
  useEffect(() => {
    const listOrderErrorMessage: any[] = [];
    shopeePreparationData?.length &&
      shopeePreparationData?.filter(
        (order) => order.error !== "" && listOrderErrorMessage.push(order.message),
      );
    setOrderErrorMessage(listOrderErrorMessage);
  }, [shopeePreparationData]);

  useEffect(() => {
    const listOrderSuccessMessage: any[] = [];
    shopeePreparationData?.length &&
      shopeePreparationData?.filter(
        (order) => order.error === "" && listOrderSuccessMessage.push(order.message),
      );
    setOrderSuccessMessage(listOrderSuccessMessage);
  }, [shopeePreparationData]);

  useEffect(() => {
    let dataQuery: EcommerceOrderSearchQuery = {
      ...initQuery,
      ...getQueryParamsFromQueryString(queryParamsParsed),
      issued_on_min: queryParamsParsed.issued_on_min,
      issued_on_max: queryParamsParsed.issued_on_max,
      finalized_on_min: queryParamsParsed.finalized_on_min,
      finalized_on_max: queryParamsParsed.finalized_on_max,
      cancelled_on_min: queryParamsParsed.cancelled_on_min,
      cancelled_on_max: queryParamsParsed.cancelled_on_max,
      completed_on_min: queryParamsParsed.completed_on_min,
      completed_on_max: queryParamsParsed.completed_on_max,
    };
    setPrams(dataQuery);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, location.search]);

  return (
    <StyledComponentEcommerceOrder>
      <ContentContainer
        title="Danh sách đơn hàng"
        breadcrumb={[
          {
            name: "Tổng quan",
            path: UrlConfig.HOME,
          },
          {
            name: "Sàn TMĐT",
            path: `${UrlConfig.ECOMMERCE}`,
          },
          {
            name: "Danh sách đơn hàng",
          },
        ]}
        extra={
          <>
            {allowOrdersDownload && (
              <Button
                disabled={tableLoading}
                onClick={openGetOrderModal}
                className="ant-btn-outline ant-btn-primary"
                size="large"
                icon={<DownloadOutlined />}
              >
                Tải đơn hàng về
              </Button>
            )}
          </>
        }
      >
        <AuthWrapper acceptPermissions={ordersViewPermission} passThrough>
          {(allowed: boolean) =>
            allowed ? (
              <Card>
                <EcommerceOrderFilter
                  actions={actions}
                  shopeeActions={shopeeActions}
                  lazadaActions={lazadaActions}
                  onFilter={onFilter}
                  isLoading={tableLoading}
                  params={params}
                  listSource={listSource}
                  listStore={listStore}
                  accounts={accounts}
                  deliveryService={deliveryServices}
                  listPaymentMethod={listPaymentMethod}
                  subStatus={listOrderProcessingStatus}
                  setEcommerceShopListByAddress={setEcommerceShopListByAddress}
                  onClearFilter={() => onClearFilter()}
                  onShowColumnSetting={() => setShowSettingColumn(true)}
                />

                <CustomTable
                  isRowSelection
                  rowSelectionRenderCell={rowSelectionRenderCell}
                  bordered
                  isLoading={tableLoading}
                  scroll={{
                    x: (2200 * columnFinal.length) / (columns.length ? columns.length : 1),
                  }}
                  sticky={{ offsetScroll: 10, offsetHeader: 55 }}
                  pagination={
                    tableLoading
                      ? false
                      : {
                          pageSize: data.metadata.limit,
                          total: data.metadata.total,
                          current: data.metadata.page,
                          showSizeChanger: true,
                          onChange: onPageChange,
                          onShowSizeChange: onPageChange,
                        }
                  }
                  onSelectedChange={onSelectTableRow}
                  dataSource={data.items}
                  columns={columnFinal}
                  isShowPaginationAtHeader
                  rowKey={(item: OrderModel) => item.id}
                  className="ecommerce-order-list"
                />
                <SubStatusChange
                  orderId={selectedOrder?.id}
                  toSubStatus={toSubStatusCode}
                  isEcommerceOrder={true}
                  reasonId={reasonId}
                  subReasonRequireWarehouseChange={subReasonRequireWarehouseChange}
                  setToSubStatusCode={setToSubStatusCode}
                  changeSubStatusCallback={changeSubStatusCallback}
                />
              </Card>
            ) : (
              <NoPermission />
            )
          }
        </AuthWrapper>

        {isShowGetOrderModal && (
          <GetOrderDataModal
            visible={isShowGetOrderModal}
            onCancel={cancelGetOrderModal}
            onOk={callbackDownloadEcommerceOrders}
          />
        )}

        {isVisibleProgressDownloadOrdersModal && (
          <ProgressDownloadOrdersModal
            visible={isVisibleProgressDownloadOrdersModal}
            onCancel={onCancelProgressDownloadOrder}
            onOk={onOKProgressDownloadOrder}
            progressData={progressData}
            progressPercent={progressPercent}
            isDownloading={isDownloading}
          />
        )}

        {/*print ecommerce delivery note process*/}
        {isPrintEcommerceDeliveryNote && isVisibleProcessModal && (
          <PrintEcommerceDeliveryNoteProcess
            visible={isPrintEcommerceDeliveryNote && isVisibleProcessModal}
            isProcessing={isProcessing}
            onOk={() => okPrintEcommerceDeliveryNote(false)}
            onPrintAndPick={() => okPrintEcommerceDeliveryNote(true)}
            onCancel={cancelPrintEcommerceDeliveryNote}
            processData={commonProcessData}
            processPercent={commonProcessPercent}
          />
        )}

        {isVisibleExitProcessModal && (
          <ExitProgressModal
            visible={isVisibleExitProcessModal}
            onCancel={onCancelExitProcessModal}
            onOk={onOkExitProcessModal}
            exitProgressContent={exitProcessModal.exitProgressContent}
          />
        )}
        {/*end print ecommerce delivery note process*/}

        {isVisibleConflictModal && (
          <ConflictDownloadModal
            visible={isVisibleConflictModal}
            onCancel={closeConflictDownloadModal}
            onOk={closeConflictDownloadModal}
          />
        )}

        {isVisibleExitDownloadOrdersModal && (
          <ExitDownloadOrdersModal
            visible={isVisibleExitDownloadOrdersModal}
            onCancel={onCancelExitDownloadOrdersModal}
            onOk={onOkExitDownloadOrdersModal}
          />
        )}

        {isVisibleChangeOrderStatusModal && (
          <EcommerceChangeOrderStatusModal
            visible={isVisibleChangeOrderStatusModal}
            onOk={onCloseChangeOrderStatusModal}
            onCancel={onCloseChangeOrderStatusModal}
            statusList={changeOrderStatusList}
          />
        )}

        {showSettingColumn && (
          <ModalSettingColumn
            visible={showSettingColumn}
            onCancel={() => setShowSettingColumn(false)}
            onOk={(data) => {
              setShowSettingColumn(false);
              setColumns(data);
              onSaveConfigTableColumn(data);
            }}
            data={columns}
          />
        )}

        {showExportModal && (
          <ExportModal
            visible={showExportModal}
            onCancel={() => {
              setShowExportModal(false);
              setExportProgress(0);
              setStatusExport(1);
            }}
            onOk={(optionExport, hiddenFieldsExport) => onExport(optionExport, hiddenFieldsExport)}
            type={ORDER_EXPORT_TYPE.ECOMMERCE}
            total={data.metadata.total}
            exportProgress={exportProgress}
            statusExport={statusExport}
            exportError={exportError}
            selected={!!selectedRowCodes.length}
          />
        )}

        {showReportPreparationModal && (
          <ReportPreparationShopeeProductModal
            title="Báo Shopee chuẩn bị hàng"
            visible={showReportPreparationModal}
            onOk={handleReportPreparationShopeeProductModal}
            onCancel={() => {
              setShowReportPreparationModal(false);
            }}
            okText="Xác nhận"
            cancelText="Hủy"
            params={params}
            total={data.metadata.total}
            showButtonConfirm={showButtonConfirm}
            setIsShowButtonConfirm={setIsShowButtonConfirm}
            selectedRowKeys={selectedRowKeys}
            isReportShopeeFilter={isReportShopeeFilter}
            selectedRow={selectedRow}
            BATCHING_SHIPPING_TYPE={BATCHING_SHIPPING_TYPE}
            batchShippingType={batchShippingType}
            setBatchShippingType={setBatchShippingType}
          />
        )}

        {showPreparationModal && (
          <PreparationShopeeProductModal
            title="Chuẩn bị hàng"
            visible={showPreparationModal}
            onOk={handlePreparationShopeeProductModal}
            onCancel={handleCancelPreparationShopeeProductModal}
            okText="Xác nhận"
            cancelText="Hủy"
            referenceCodeByShopAddress={referenceCodeByShopAddress}
            ecommerceShopAddress={ecommerceShopAddress}
            ecommerceShopListByAddress={ecommerceShopListByAddress}
            listShopOrderList={listShopOrderList}
            setListShopOrderList={setListShopOrderList}
            listShopPickUpAddress={listShopPickUpAddress}
            setListShopPickUpAddress={setListShopPickUpAddress}
          />
        )}

        {conFirmPreparationShopeeProduct && (
          <ConfirmPreparationShopeeProductModal
            title="Báo Shopee chuẩn bị hàng"
            visible={conFirmPreparationShopeeProduct}
            onOk={handleConfirmPreparationShopeeProductModal}
            onCancel={() => setConfirmPreparationShopeeProduct(false)}
            okText="Xác nhận"
            cancelText="Hủy"
            shopeePreparationData={shopeePreparationData}
            orderSuccessMessage={orderSuccessMessage}
            orderErrorMessage={orderErrorMessage}
          />
        )}

        <ChangeOrderStatusModal
          isEcommerceOrder={true}
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
    </StyledComponentEcommerceOrder>
  );
};

export default EcommerceOrders;
