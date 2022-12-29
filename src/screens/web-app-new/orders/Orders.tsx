import { Card, Divider, Tabs } from "antd";
import queryString from "query-string";
import { useEffect, useState } from "react";
import NumberFormat from "react-number-format";
import { useDispatch, useSelector } from "react-redux";
import { Link, useHistory, useLocation } from "react-router-dom";

import { FileExcelOutlined, PrinterOutlined } from "@ant-design/icons";
import CircleEmptyIcon from "assets/icon/circle_empty.svg";
import CircleFullIcon from "assets/icon/circle_full.svg";
import CircleHalfFullIcon from "assets/icon/circle_half_full.svg";
import CustomerIcon from "assets/icon/customer-icon.svg";
import DeliveryrIcon from "assets/icon/gray-delivery.svg";
import AuthWrapper from "component/authorization/AuthWrapper";
import ContentContainer from "component/container/content.container";
import ExportFileModal, { ResultLimitModel } from "component/modal/ExportFileModal/ExportFileModal";
import ModalDeleteConfirm from "component/modal/ModalDeleteConfirm";
import { promotionUtils } from "component/order/promotion.utils";
import CustomTable, { ICustomTableColumType } from "component/table/CustomTable";
import { HttpStatus } from "config/http-status.config";
import { EcommerceOrderPermission } from "config/permissions/ecommerce.permission";
import UrlConfig from "config/url.config";
import { searchAccountPublicAction } from "domain/actions/account/account.action";
import { hideLoading, showLoading } from "domain/actions/loading.action";
import { getListOrderAction, updateOrderPartial } from "domain/actions/order/order.action";
import { AccountResponse } from "model/account/account.model";
import { PageResponse } from "model/base/base-metadata.response";
import { EcommerceOrderSearchQuery, OrderModel } from "model/order/order.model";
import { RootReducerType } from "model/reducers/RootReducerType";
import { OrderResponse } from "model/response/order/order.response";
import moment from "moment";
import React from "react";
import NoPermission from "screens/no-permission.screen";
import EditNote from "screens/order-online/component/edit-note";
import { changeOrderStatusToPickedService } from "service/order/order.service";
import { exportFile, getFile } from "service/other/export.service";
import { generateQuery, handleFetchApiError, isFetchApiSuccessful } from "utils/AppUtils";
import { ConvertUtcToLocalDate } from "utils/DateUtils";
import { DownloadFile } from "utils/DownloadFile";
import { ExportFileName, ExportFileStatus, ExportFileType } from "utils/ExportFileConstants";
import { primaryColor } from "utils/global-styles/variables";
import { getSaveSearchLocalStorage, setSaveSearchhLocalStorage } from "utils/LocalStorageUtils";
import { OrderStatus } from "utils/Order.constants";
import { SaveSearchType } from "utils/SaveSearchType";
import { showError, showSuccess } from "utils/ToastUtils";
import { getParamsFromQuery } from "utils/useQuery";
import { StyledStatus } from "../order-sync/style";
import OrderFilter from "./OrderFilter";
import { nameQuantityWidth, StyledComponent } from "./style";

const WebAppOrders: React.FC = () => {
  const dispatch = useDispatch();
  const history = useHistory();
  const location = useLocation();
  const ALL_CHANNEL = ["WEBSITE", "APP", "LANDINGPAGE"];
  const user = useSelector((state: RootReducerType) => state.userReducer.account);
  const { TabPane } = Tabs;

  //permission
  const ordersViewPermission = [EcommerceOrderPermission.orders_read];

  //init
  const initParams: EcommerceOrderSearchQuery = {
    page: 1,
    limit: 30,
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
    coordinator_codes: [],
    marketer_codes: [],
    assignee_codes: [],
    price_min: undefined,
    price_max: undefined,
    payment_method_ids: [],
    delivery_types: [],
    delivery_provider_ids: [],
    shipper_codes: [],
    note: null,
    customer_note: null,
    tags: [],
    reference_code: null,
    search_term: "",
    services: [],
    marketing_campaign: [],
  };
  const queryParamsParsed: any = queryString.parse(location.search);
  let dataParams: EcommerceOrderSearchQuery = {
    ...initParams,
    ...getParamsFromQuery(queryParamsParsed, initParams),
  };

  //state
  const [accounts, setAccounts] = useState<Array<AccountResponse>>([]);
  const [tableLoading, setTableLoading] = useState(false);
  const [isShowExportFileModal, setIsShowExportFileModal] = useState(false);
  const [selectedRows, setSelectedRows] = useState<OrderResponse[]>([]);
  const [statusExport, setStatusExport] = useState<number>(ExportFileStatus.Export);
  const [exportProgress, setExportProgress] = useState<number>(0);
  const [exportCode, setExportCode] = useState("");
  const [tabActiveSaveSearch, setTabActiveSaveSearch] = useState("all");
  const [isSearching, setIsSearching] = useState(false);
  let [params, setParams] = useState<EcommerceOrderSearchQuery>(dataParams);

  //save search
  const [saveSearchList, setSaveSearchList] = useState<Array<any>>([]);
  const [isShowButtonRemoveSaveSearch, setIsShowButtonRemoveSaveSearch] = useState(false);
  const [isShowRemoveSaveSearchModal, setIsShowRemoveSaveSearchModal] = useState(false);

  const [data, setData] = useState<PageResponse<any>>({
    metadata: {
      limit: 30,
      page: 1,
      total: 0,
    },
    items: [],
  });

  //common
  const convertProgressStatus = (value: any) => {
    switch (value) {
      case "partial_paid":
        return CircleHalfFullIcon;
      case "paid":
        return CircleFullIcon;
      default:
        return CircleEmptyIcon;
    }
  };

  //handle export file
  const handleExportFile = (exportType: string) => {
    let exportFileParams: any = { ...params };
    if (!exportFileParams.channel_codes?.length) {
      exportFileParams.channel_codes = ALL_CHANNEL;
    }
    if (exportType === ExportFileType.ALL) {
      exportFileParams = {};
      exportFileParams.channel_codes = ALL_CHANNEL;
    } else if (exportType === ExportFileType.SELECTED) {
      let codes = selectedRows.map((row: any) => row.code);
      exportFileParams.code = codes;
    } else if (exportType === ExportFileType.CURRENT_SEARCH) {
      delete exportFileParams.page;
      delete exportFileParams.limit;
    }
    const query = generateQuery(exportFileParams);
    exportFile({
      conditions: query,
      type: ExportFileName.EXPORT_ORDER,
    })
      .then((response) => {
        setStatusExport(ExportFileStatus.Exporting);
        showSuccess("Đã gửi yêu cầu xuất file");
        setExportCode(response.data.code);
      })
      .catch((error) => {
        setStatusExport(ExportFileStatus.ExportError);
        showError("Có lỗi xảy ra, vui lòng thử lại sau");
      });
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const checkExportFile = () => {
    const getFilePromises = [getFile(exportCode)];
    Promise.all(getFilePromises).then((response) => {
      if (response) {
        response.forEach((response) => {
          if (response.code === HttpStatus.SUCCESS) {
            setExportProgress(
              Math.round((response.data?.num_of_record / response.data?.total) * 100),
            );
            if (response.data && response.data.status === "FINISH") {
              setStatusExport(ExportFileStatus.ExportSuccess);
              setExportProgress(100);
              DownloadFile(response.data.url);
            }
          } else {
            setStatusExport(ExportFileStatus.ExportError);
          }
        });
      }
    });
  };

  useEffect(() => {
    const getAccountList = () => {
      dispatch(
        searchAccountPublicAction({}, (data: PageResponse<AccountResponse> | false) => {
          if (!!data) {
            setAccounts(data.items);
          }
        }),
      );
    };
    getAccountList();
  }, [dispatch]);

  useEffect(() => {
    if (statusExport === ExportFileStatus.Exporting) checkExportFile();
    else return;
    const getFileInterval = setInterval(checkExportFile, 3000);
    return () => clearInterval(getFileInterval);
  }, [statusExport, checkExportFile]);

  //handle print
  const handlePrintShipment = () => {
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
    printAction("shipment");
  };

  const printAction = (type: string) => {
    let ids = selectedRows.map((row: any) => row?.id);
    let params = {
      action: "print",
      ids: ids,
      "print-type": type,
      "print-dialog": true,
    };
    const queryParam = generateQuery(params);
    const printPreviewUrl = `${process.env.PUBLIC_URL}${UrlConfig.ORDER}/print-preview?${queryParam}`;
    window.open(printPreviewUrl);
  };

  const actionList = [
    {
      id: 1,
      icon: <FileExcelOutlined />,
      name: "Xuất excel",
      onClick: () => setIsShowExportFileModal(true),
    },
    {
      id: 2,
      name: "In phiếu giao hàng",
      icon: <PrinterOutlined />,
      disabled: !selectedRows?.length || !data.items.length,
      onClick: () => handlePrintShipment(),
    },
    {
      id: 3,
      name: "In phiếu xuất kho",
      icon: <PrinterOutlined />,
      disabled: !selectedRows?.length || !data.items.length,
      onClick: () => printAction("stock_export"),
    },
  ];

  //handle filter
  const handleFilter = (value: any) => {
    let newParams = { ...params, ...value, page: 1 };
    if (newParams.issued_on_min != null) {
      newParams.issued_on_min = moment(newParams.issued_on_min, "DD-MM-YYYY").format("DD-MM-YYYY");
    }
    if (newParams.issued_on_max != null) {
      newParams.issued_on_max = moment(newParams.issued_on_max, "DD-MM-YYYY").format("DD-MM-YYYY");
    }
    if (newParams.completed_on_min != null) {
      newParams.completed_on_min = moment(newParams.completed_on_min, "DD-MM-YYYY").format(
        "DD-MM-YYYY",
      );
    }
    if (newParams.completed_on_max != null) {
      newParams.completed_on_max = moment(newParams.completed_on_max, "DD-MM-YYYY").format(
        "DD-MM-YYYY",
      );
    }
    if (newParams.cancelled_on_min != null) {
      newParams.cancelled_on_min = moment(newParams.cancelled_on_min, "DD-MM-YYYY").format(
        "DD-MM-YYYY",
      );
    }
    if (newParams.cancelled_on_max != null) {
      newParams.cancelled_on_max = moment(newParams.cancelled_on_max, "DD-MM-YYYY").format(
        "DD-MM-YYYY",
      );
    }
    let queryParam = generateQuery(params);
    let newQueryParam = generateQuery(newParams);
    if (newQueryParam !== queryParam) {
      setParams(newParams);
      history.push(`${location.pathname}?${newQueryParam}`);
    }
  };

  const handleClearFilter = () => {
    setParams(initParams);
    let newParams = { ...initParams };
    newParams.page = null;
    newParams.limit = null;
    let query = generateQuery(initParams);
    history.push(`${location.pathname}?${query}`);
  };

  //handle change page

  const handleChangePage = (page: any, size: any) => {
    let newParams = { ...params, page, limit: size };
    setParams(newParams);
    let query = generateQuery(newParams);
    history.push(`${location.pathname}?${query}`);
  };

  const handleSelectRowTable = (rows: any) => {
    rows = rows.filter((row: any) => {
      return row !== undefined;
    });
    setSelectedRows(rows);
  };

  //handle edit note
  const editNote = (newNote: string, noteType: string, orderID: number, record: OrderModel) => {
    let params: any = {};
    if (noteType === "note") {
      params.note = newNote;
    }
    if (noteType === "customer_note") {
      params.customer_note = newNote;
    }
    dispatch(
      updateOrderPartial(params, orderID, () => {
        getOrderData();
      }),
    );
  };

  //handle save search
  const getListSaveSearch = () => {
    let key = "savesearch";
    let value = getSaveSearchLocalStorage(key);
    let result: Array<any> = [];
    if (value) {
      result = JSON.parse(value);
      result = result.filter((a) => {
        return a.userId === user?.id && a.type === SaveSearchType.WEBAPP_ORDER;
      });
    }
    return result;
  };

  useEffect(() => {
    setSaveSearchList(getListSaveSearch());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [history, params]);

  const handleActiveSaveSearch = () => {
    let paramQuery = generateQuery(params);
    let newParams = { ...params };
    newParams.page = null;
    newParams.limit = null;
    if (generateQuery(newParams) === "") {
      history.push(`/web-app-orders`);
    } else {
      history.push(`/web-app-orders?${paramQuery}`);
    }
    let saveSearchList = getListSaveSearch();
    setSaveSearchList(saveSearchList);
    setIsSearching(false);
    if (saveSearchList) {
      let saveSearch = saveSearchList.find(
        (a) =>
          a.value === paramQuery && a.userId === user?.id && a.type === SaveSearchType.WEBAPP_ORDER,
      );
      if (saveSearch) {
        setIsShowButtonRemoveSaveSearch(true);
        setTabActiveSaveSearch(saveSearch.id.toString());
      } else {
        let newParam = { ...params };
        newParam.page = null;
        newParam.limit = null;
        let newParamQuery = generateQuery(newParam);
        if (newParamQuery === "") {
          setTabActiveSaveSearch("all");
        } else {
          setIsSearching(true);
          setIsShowButtonRemoveSaveSearch(false);
          setTabActiveSaveSearch("searching");
        }
      }
    }
  };

  const handleRemoveSaveSearch = () => {
    let saveSearchList = getListSaveSearch();
    if (saveSearchList) {
      let paramQuery = generateQuery(params);
      let index = saveSearchList.findIndex(
        (a) =>
          a.value === paramQuery && a.userId === user?.id && a.type === SaveSearchType.WEBAPP_ORDER,
      );
      if (index !== -1) {
        saveSearchList.splice(index, 1);
        setSaveSearchhLocalStorage("savesearch", JSON.stringify(saveSearchList));
        setIsShowButtonRemoveSaveSearch(false);
        setIsShowRemoveSaveSearchModal(false);
        history.push(`${location.pathname}`);
        setParams(initParams);
        handleActiveSaveSearch();
      }
    }
  };
  const confirmRemoveSaveSearch = () => {
    setIsShowRemoveSaveSearchModal(true);
  };

  useEffect(() => {
    handleActiveSaveSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [history, location.search, params]);

  const handleChangeTabSaveSearch = (tab: string) => {
    //setTabActiveSaveSearch(tab);
    if (tab === "all") {
      history.push(`${location.pathname}`);
      setParams(initParams);
    } else {
      if (saveSearchList) {
        let saveSearch = saveSearchList.find((a) => a.id === parseInt(tab));
        if (saveSearch) {
          setIsShowButtonRemoveSaveSearch(true);
          history.push(`${location.pathname}?${saveSearch.value}`);
          let queryParams: any = queryString.parse(saveSearch.value);
          let dataParams: EcommerceOrderSearchQuery = {
            ...initParams,
            ...getParamsFromQuery(queryParams, initParams),
          };
          setParams(dataParams);
        }
      }
    }
  };

  //get data
  const getOrderData = () => {
    const requestParams = { ...params };
    if (!requestParams.channel_codes?.length) {
      requestParams.channel_codes = ALL_CHANNEL;
    }
    requestParams.issued_on_min = requestParams.issued_on_min
      ? moment(requestParams.issued_on_min, "DD-MM-YYYY").utc(true).format()
      : null;
    requestParams.issued_on_max = requestParams.issued_on_max
      ? moment(requestParams.issued_on_max + " 23:59:59", "DD-MM-YYYY HH:mm:ss")
          .utc(true)
          .format()
      : null;
    requestParams.completed_on_min = requestParams.completed_on_min
      ? moment(requestParams.completed_on_min, "DD-MM-YYYY").utc(true).format()
      : null;
    requestParams.completed_on_max = requestParams.completed_on_max
      ? moment(requestParams.completed_on_max + " 23:59:59", "DD-MM-YYYY HH:mm:ss")
          .utc(true)
          .format()
      : null;
    requestParams.cancelled_on_min = requestParams.cancelled_on_min
      ? moment(requestParams.cancelled_on_min, "DD-MM-YYYY").utc(true).format()
      : null;
    requestParams.cancelled_on_max = requestParams.cancelled_on_max
      ? moment(requestParams.cancelled_on_max + " 23:59:59", "DD-MM-YYYY HH:mm:ss")
          .utc(true)
          .format()
      : null;
    setTableLoading(true);
    dispatch(
      getListOrderAction(requestParams, (result) => {
        setTableLoading(false);
        if (!!result) setData(result);
      }),
    );
  };
  useEffect(() => {
    getOrderData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  //list export file
  const resultsExportFile: ResultLimitModel[] = [
    {
      value: ExportFileType.INPAGE,
      name: ExportFileType.INPAGE,
      title: "Đơn hàng trên trang này",
      isHidden: false,
      isChecked: true,
    },
    {
      value: ExportFileType.SELECTED,
      name: ExportFileType.SELECTED,
      title: "Các đơn hàng được chọn",
      isHidden: selectedRows.length > 0 ? false : true,
      isChecked: false,
    },
    {
      value: ExportFileType.ALL,
      name: ExportFileType.ALL,
      title: `${data.metadata.total} đơn hàng phù hợp với điều kiện tìm kiếm hiện tại`,
      isHidden: false,
      isChecked: false,
    },
  ];

  //columns
  const [columns] = useState<Array<ICustomTableColumType<OrderModel>>>([
    {
      title: "Đơn hàng",
      key: "order_id",
      visible: true,
      fixed: "left",
      align: "center",
      className: "custom-shadow-td",
      width: 175,
      render: (data: any, item: OrderModel) => (
        <div style={{ textAlign: "left" }}>
          <Link to={`${UrlConfig.ORDER}/${item.id}`} target="_blank">
            <strong>{data.code}</strong>
          </Link>
          <div>{ConvertUtcToLocalDate(data.created_date, "HH:mm DD/MM/YYYY")}</div>
          <div>
            <span style={{ color: "#666666" }}>Nguồn: </span>
            <span>{data.source}</span>
          </div>
          <div>
            <span style={{ color: "#666666" }}>Kho: </span>
            <span>{data.store}</span>
          </div>
          <div>
            <span style={{ color: "#666666" }}>Gian hàng: </span>
            <span>{data.ecommerce_shop_name}</span>
          </div>
          <div>({data.reference_code})</div>
        </div>
      ),
    },
    {
      title: "Khách hàng",
      key: "customer",
      visible: true,
      align: "center",
      width: 160,
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
            <div className="p-b-3">{record.shipping_address.phone}</div>
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
          <span className="product-name">Sản phẩm</span>
          <span className="quantity">SL</span>
          <span className="item-price">Giá</span>
        </div>
      ),
      dataIndex: "items",
      key: "items.name11",
      align: "center",
      className: "product-and-quantity",
      render: (items: any) => {
        return (
          <>
            {items.map((item: any, index: number) => {
              return (
                <div className="item-custom-td" key={index}>
                  <div className="product">
                    <Link
                      target="_blank"
                      to={`${UrlConfig.PRODUCT}/${item.product_id}/variants/${item.variant_id}`}
                    >
                      <div>({item.sku})</div>
                      {item.variant}
                    </Link>
                  </div>
                  <div className="quantity">{item.quantity}</div>
                  <div className="item-price">
                    <div>
                      <NumberFormat
                        value={item.price}
                        className="foo"
                        displayType={"text"}
                        thousandSeparator={true}
                      />
                    </div>
                    {item.discount_items.map((discount: any, index: number) => {
                      return (
                        <div style={{ color: "#EF5B5B" }} key={index}>
                          -
                          <NumberFormat
                            value={discount.amount || 0}
                            className="foo"
                            displayType={"text"}
                            thousandSeparator={true}
                          />
                        </div>
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
      align: "right",
      width: 95,
      render: (record: any) => (
        <>
          <div>
            <NumberFormat
              value={record.total_line_amount_after_line_discount}
              className="foo"
              displayType={"text"}
              thousandSeparator={true}
            />
          </div>
          <div style={{ color: "#EF5B5B" }}>
            -
            <NumberFormat
              value={record.total_discount}
              className="foo"
              displayType={"text"}
              thousandSeparator={true}
            />
          </div>
        </>
      ),
    },
    {
      title: "TT Xử lý",
      dataIndex: "sub_status",
      key: "sub_status",
      visible: true,
      width: 130,
      align: "center",
      render: (sub_status: string) => {
        return (
          <div
            style={{
              background: "rgba(42, 42, 134, 0.1)",
              borderRadius: "100px",
              color: "#2A2A86",
              width: "fit-content",
              padding: "5px 10px",
              margin: "0 auto",
            }}
          >
            {sub_status}
          </div>
        );
      },
    },
    {
      title: "Ghi chú",
      align: "center",
      className: "notes",
      render: (value: string, record: OrderModel) => (
        <div className="orderNotes">
          <div className="inner">
            <div className="single">
              <EditNote
                note={record.customer_note}
                title="Khách hàng: "
                color={primaryColor}
                onOk={(newNote) => {
                  editNote(newNote, "customer_note", record.id, record);
                }}
                isDisable={record.status === OrderStatus.FINISHED}
              />
            </div>
            <Divider />
            <div className="single">
              <EditNote
                note={record.note}
                title="Nội bộ: "
                color={primaryColor}
                onOk={(newNote) => {
                  editNote(newNote, "note", record.id, record);
                }}
                isDisable={record.status === OrderStatus.FINISHED}
                promotionText={promotionUtils.getAllPromotionTitle(record)}
              />
            </div>
          </div>
        </div>
      ),
      key: "note",
      visible: true,
      width: 150,
    },
    {
      title: "Vận chuyển",
      key: "",
      visible: true,
      width: 130,
      align: "center",
      render: (item: any) => {
        const shipment = item.fulfillments && item.fulfillments[0] && item.fulfillments[0].shipment;
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
                      value={shipment?.shipping_fee_informed_to_customer}
                      className="foo"
                      displayType={"text"}
                      thousandSeparator={true}
                    />
                  </div>
                  <div>
                    <img src={DeliveryrIcon} alt="" style={{ marginRight: 5, height: 13 }} />
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
    {
      title: "TT Đơn hàng",
      dataIndex: "status",
      key: "order_status",
      visible: true,
      align: "center",
      width: 150,
      render: (status_value: string) => {
        return (
          <StyledStatus>
            <div className={OrderStatus.getClassName(status_value)}>
              {OrderStatus.getName(status_value)}
            </div>
          </StyledStatus>
        );
      },
    },
    {
      title: "Địa chỉ giao hàng",
      key: "shipping_address",
      visible: true,
      align: "center",
      width: 200,
      render: (item: any) => {
        return (
          <div className="p-b-3 delivery-address">
            {item.shipping_address ? item.shipping_address.full_address : ""}
          </div>
        );
      },
    },
    {
      title: "Đóng gói",
      dataIndex: "packed_status",
      key: "packed_status",
      visible: true,
      align: "center",
      width: 100,
      render: (value: string) => {
        const processIcon = convertProgressStatus(value);
        return <img src={processIcon} alt="" />;
      },
    },
    {
      title: "Xuất kho",
      dataIndex: "received_status",
      key: "received_status",
      visible: true,
      align: "center",
      width: 100,
      render: (value: string) => {
        const processIcon = convertProgressStatus(value);
        return <img src={processIcon} alt="" />;
      },
    },
    {
      title: "Thanh toán",
      dataIndex: "payment_status",
      key: "payment_status",
      visible: true,
      align: "center",
      width: 100,
      render: (value: string) => {
        const processIcon = convertProgressStatus(value);
        return <img src={processIcon} alt="" />;
      },
    },
    {
      title: "Trả hàng",
      dataIndex: "return_status",
      key: "return_status",
      visible: true,
      align: "center",
      width: 100,
      render: (value: string) => {
        const processIcon = convertProgressStatus(value);
        return <img src={processIcon} alt="" />;
      },
    },
    {
      title: "NV bán hàng",
      key: "assignee",
      visible: true,
      align: "center",
      width: 200,
      render: (data) => <div>{`${data.assignee_code} - ${data.assignee}`}</div>,
    },
    {
      title: "Ngày hoàn tất",
      dataIndex: "finished_on",
      key: "finished_on",
      visible: true,
      align: "center",
      width: 150,
      render: (finished_on: string) => (
        <div>{ConvertUtcToLocalDate(finished_on, "DD/MM/YYYY")}</div>
      ),
    },
    {
      title: "Ngày huỷ",
      dataIndex: "cancelled_on",
      key: "cancelled_on",
      visible: true,
      align: "center",
      render: (cancelled_on) => <div>{ConvertUtcToLocalDate(cancelled_on, "DD/MM/YYYY")}</div>,
    },
  ]);

  return (
    <StyledComponent>
      <ContentContainer
        title="Danh sách đơn hàng"
        breadcrumb={[
          {
            name: "Web/App",
            path: `${UrlConfig.WEB_APP}`,
          },
          {
            name: "Danh sách đơn hàng",
          },
        ]}
      >
        <AuthWrapper acceptPermissions={ordersViewPermission} passThrough>
          {(allowed: boolean) =>
            allowed ? (
              <Card>
                {saveSearchList && saveSearchList.length > 0 && (
                  <Tabs
                    activeKey={tabActiveSaveSearch}
                    onChange={(active) => handleChangeTabSaveSearch(active)}
                    className="tabs-list"
                    style={{ padding: "0px", marginBottom: "15px" }}
                  >
                    <TabPane tab="Tất cả đơn hàng" key="all"></TabPane>
                    {saveSearchList.map((item) => {
                      return <TabPane tab={item.name} key={item.id.toString()}></TabPane>;
                    })}
                    {isSearching && <TabPane tab="Tìm kiếm..." key="searching"></TabPane>}
                  </Tabs>
                )}
                <OrderFilter
                  actionList={actionList}
                  onFilter={handleFilter}
                  isLoading={tableLoading}
                  accounts={accounts}
                  params={params}
                  onClearFilter={handleClearFilter}
                  initParams={initParams}
                  changeActiveTabSaveSearch={handleActiveSaveSearch}
                  deleteSaveSearch={confirmRemoveSaveSearch}
                  isShowButtonRemoveSaveSearch={isShowButtonRemoveSaveSearch}
                />
                <CustomTable
                  isRowSelection
                  bordered
                  isLoading={tableLoading}
                  showColumnSetting={true}
                  scroll={{ x: 2400 }}
                  sticky={{ offsetScroll: 10, offsetHeader: 55 }}
                  pagination={
                    tableLoading
                      ? false
                      : {
                          pageSize: data.metadata.limit,
                          total: data.metadata.total,
                          current: data.metadata.page,
                          showSizeChanger: true,
                          onChange: handleChangePage,
                          onShowSizeChange: handleChangePage,
                        }
                  }
                  onSelectedChange={handleSelectRowTable}
                  dataSource={data.items}
                  columns={columns}
                  rowKey={(item: OrderModel) => item.id}
                  className="ecommerce-order-list"
                />
                {isShowExportFileModal && (
                  <ExportFileModal
                    results={resultsExportFile}
                    visible={isShowExportFileModal}
                    isExportList={true}
                    onOk={(exportType) => handleExportFile(exportType)}
                    title="đơn hàng"
                    status={statusExport}
                    onCancel={() => {
                      setIsShowExportFileModal(false);
                      setExportProgress(0);
                      setStatusExport(ExportFileStatus.Export);
                    }}
                    exportProgress={exportProgress}
                    total={1}
                  />
                )}
                <ModalDeleteConfirm
                  visible={isShowRemoveSaveSearchModal}
                  title="Xóa bộ lọc"
                  subTitle="Bạn có muốn xóa kết quả tìm kiếm này? Thao tác này không thể khôi phục."
                  onCancel={() => setIsShowRemoveSaveSearchModal(false)}
                  onOk={handleRemoveSaveSearch}
                />
              </Card>
            ) : (
              <NoPermission />
            )
          }
        </AuthWrapper>
      </ContentContainer>
    </StyledComponent>
  );
};
export default WebAppOrders;
