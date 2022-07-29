import { DownloadOutlined } from "@ant-design/icons";
import { Button, Card, Tooltip } from "antd";
import moment from "moment";
import queryString from "query-string";
import { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";

import BaseResponse from "base/base.response";
import ContentContainer from "component/container/content.container";
import CustomTable, { ICustomTableColumType } from "component/table/CustomTable";
import { HttpStatus } from "config/http-status.config";
import UrlConfig from "config/url.config";
import useAuthorization from "hook/useAuthorization";
import { WebAppGetOrdersMappingQuery } from "model/query/web-app.query";
import { Link, useHistory, useLocation } from "react-router-dom";
import { generateQuery, isNullOrUndefined } from "utils/AppUtils";
import { showError, showSuccess } from "utils/ToastUtils";
import DownloadDataModal from "../components/DownloadDataModal";
import OrderSyncFilter from "./OrderSyncFilter";
import { OrderSyncStyle, StyledStatus } from "./style";
import { getParamsFromQuery } from "utils/useQuery";
import { PageResponse } from "model/base/base-metadata.response";
import { OrderModel } from "model/order/order.model";
import {
  getSourceListAction,
  getOrderMappingListAction,
  downloadWebAppOrderAction,
  syncWebAppOrderAction,
} from "domain/actions/web-app/web-app.actions";
import { SourceResponse } from "model/response/order/source.response";
import TableRowAction from "screens/ecommerce/common/TableRowAction";
import { ConvertDateToUtc, ConvertUtcToLocalDate } from "utils/DateUtils";
import {
  EcommerceOrderPermission,
  EcommerceProductPermission,
} from "config/permissions/ecommerce.permission";
import ProgressDownloadModal from "./ProcessDownloadModal";
import { getProgressDownloadEcommerceApi } from "service/web-app/web-app.service";
import ConflictDownloadModal from "../components/ConflictDownloadModal";

import { OrderStatus } from "utils/Order.constants";
import checkIcon from "assets/icon/CheckIcon.svg";
import stopIcon from "assets/icon/Stop.svg";

const OrdersSync = () => {
  const dispatch = useDispatch();
  const history = useHistory();
  const location = useLocation();
  const queryParamsParsed: any = queryString.parse(location.search);

  //state modal
  const [isShowGetOrderModal, setIsShowGetOrderModal] = useState(false);
  const [isShowConflictModal, setIsShowConflictModal] = useState(false);
  const [isShowProcessDownloadModal, setIsShowProcessDownloadModal] = useState(false);

  //state data
  const [isDownloading, setIsDownloading] = useState(false);
  const [progressData, setProgressData] = useState(null);
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const [processId, setProcessId] = useState(null);
  const [sourceList, setSourceList] = useState<Array<SourceResponse>>([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [isSelectedRow, setIsSelectedRow] = useState(false);
  const [data, setData] = useState<PageResponse<OrderModel>>({
    metadata: {
      limit: 30,
      page: 1,
      total: 0,
    },
    items: [],
  });

  //init params
  const initQuery: WebAppGetOrdersMappingQuery = {
    page: 1,
    limit: 30,
    ecommerce_id: null,
    ecommerce_order_code: null,
    core_order_code: null,
    connected_status: null,
    created_date_from: null,
    created_date_to: null,
    ecommerce_order_statuses: [],
    shop_ids: [],
    source_id: null,
    source_ids: [],
  };
  let queryParams: WebAppGetOrdersMappingQuery = {
    ...initQuery,
    ...getParamsFromQuery(queryParamsParsed, initQuery),
  };
  const [params, setParams] = useState<WebAppGetOrdersMappingQuery>(queryParams);
  const sourceListRef = useRef<Array<SourceResponse>>([]);

  //permission
  const orderDownloadPermisson = [EcommerceOrderPermission.orders_download];
  const productsUpdateStockPermission = [EcommerceProductPermission.products_update_stock];
  const [allowProductsUpdateStock] = useAuthorization({
    acceptPermissions: productsUpdateStockPermission,
    not: false,
  });

  const [allowOrdersDownload] = useAuthorization({
    acceptPermissions: orderDownloadPermisson,
    not: false,
  });

  //common
  const getClassNameByStatus = (status: string) => {
    switch (status) {
      case OrderStatus.DRAFT:
        return "gray-status";
      case OrderStatus.FINALIZED:
        return "blue-status";
      case OrderStatus.FINISHED:
        return "green-status";
      case OrderStatus.CANCELLED:
        return "red-status";
      default:
        return "";
    }
  };

  const convertDateTimeFormat = (dateTimeData: any) => {
    const formatDateTime = "DD/MM/YYYY HH:mm:ss";
    const timeCreate = ConvertUtcToLocalDate(dateTimeData, formatDateTime);
    const dateCreate = timeCreate.split(" ")[0];
    const hourCreate = timeCreate.split(" ")[1];
    return (
      <div>
        <div>{dateCreate}</div>
        <div>{hourCreate}</div>
      </div>
    );
  };

  //get source list
  useEffect(() => {
    const getSourceList = () => {
      dispatch(
        getSourceListAction((result: Array<SourceResponse>) => {
          if (result) {
            setSourceList(result);
            sourceListRef.current = result;
          }
        }),
      );
    };
    getSourceList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const getSourceNameById = (id: number) => {
    let result = "";
    if (sourceListRef) {
      let source = sourceListRef.current.find((a) => a.id === id);
      if (source) {
        result = source.name;
      }
    }
    return result;
  };

  //handle download order
  const handleDownloadOrder = (params: any) => {
    dispatch(
      downloadWebAppOrderAction(params, (data: any) => {
        if (data) {
          setIsShowGetOrderModal(false);
          if (typeof data === "string") {
            setIsShowConflictModal(true);
          } else {
            setProcessId(data.process_id);
            setIsShowProcessDownloadModal(true);
            setIsDownloading(true);
          }
        }
      }),
    );
  };

  const handleSingleDownloadOrder = (rowData: any) => {
    const request = {
      order_list: [
        {
          ecommerce_id: rowData.ecommerce_id,
          shop_id: rowData.shop_id,
          order_sn: rowData.ecommerce_order_code,
        },
      ],
    };
    dispatch(
      syncWebAppOrderAction(request, (data) => {
        if (data) {
          if (typeof data === "string") {
            setIsShowConflictModal(true);
          } else {
            setProcessId(data.process_id);
            setIsShowProcessDownloadModal(true);
            setIsDownloading(true);
          }
        }
      }),
    );
  };

  const resetProgress = () => {
    setProcessId(null);
    setProgressPercent(0);
    setProgressData(null);
  };

  const getProcessDownloadOrder = () => {
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
              showSuccess("Hoàn thành tải đơn hàng");
            } else {
              resetProgress();
              setIsShowProcessDownloadModal(false);
              showError(processData.api_error);
            }
          } else {
            const percent = Math.floor((progressCount / processData.total) * 100);
            setProgressPercent(percent);
          }
        }
      });
    });
  };

  useEffect(() => {
    if (progressPercent === 100 || !processId) {
      return;
    }
    const interval = setInterval(getProcessDownloadOrder, 3000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getProcessDownloadOrder]);

  const handleProcessDonwload = () => {
    getOrderSyncList();
    setIsShowProcessDownloadModal(false);
    resetProgress();
  };

  //clear filter
  const handClearFilter = () => {
    setParams(initQuery);
    history.push(`${location.pathname}`);
  };

  //handle filter
  const handleFilter = (value: any) => {
    let newParams = { ...params, ...value, page: 1 };
    if (newParams.created_date_from != null) {
      newParams.created_date_from = moment(newParams.created_date_from, "DD-MM-YYYY").format(
        "DD-MM-YYYY",
      );
    }
    if (newParams.created_date_to != null) {
      newParams.created_date_to = moment(newParams.created_date_to, "DD-MM-YYYY").format(
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

  //handle download single
  const handleDownloadOrderSelected = () => {
    const requestSyncStockOrder: any[] = [];
    selectedRows.forEach((item: any) => {
      requestSyncStockOrder.push({
        ecommerce_id: item.ecommerce_id,
        shop_id: item.shop_id,
        order_sn: item.ecommerce_order_code,
      });
    });
    const rowDataFilterObj = {
      order_list: requestSyncStockOrder,
    };
    if (selectedRows && selectedRows.length > 0) {
      dispatch(
        syncWebAppOrderAction(rowDataFilterObj, (data) => {
          if (data) {
            if (typeof data === "string") {
              setIsShowConflictModal(true);
            } else {
              setProcessId(data.process_id);
              setIsShowProcessDownloadModal(true);
              setIsDownloading(true);
            }
          }
        }),
      );
    }
  };

  //handle change page
  const handleChangePage = (page: any, limit: any) => {
    let newParams = { ...params, page, limit };
    setParams(newParams);
    window.scrollTo(0, 0);
    let queryParam = generateQuery(newParams);
    history.push(`${location.pathname}?${queryParam}`);
  };

  //handle select row table
  const handleSelectRowTable = (rows: any) => {
    const newSelectedRow = rows.filter((row: any) => {
      return row !== undefined;
    });
    if (newSelectedRow.length > 0) {
      setIsSelectedRow(true);
    }
    setSelectedRows(newSelectedRow);
  };

  //get data
  const getOrderSyncList = () => {
    setIsLoading(true);
    const newParam = { ...queryParams };
    newParam.created_date_from = newParam.created_date_from
      ? moment(newParam.created_date_from, "DD-MM-YYYY").utc(true).format()
      : null;
    newParam.created_date_to = newParam.created_date_to
      ? moment(newParam.created_date_to, "DD-MM-YYYY").utc(true).format()
      : null;
    dispatch(
      getOrderMappingListAction(newParam, (result) => {
        setIsLoading(false);
        if (!!result) {
          setData(result);
        }
      }),
    );
  };
  useEffect(() => {
    getOrderSyncList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, location.search, sourceList]);

  //column
  const [columns] = useState<Array<ICustomTableColumType<OrderModel>>>([
    {
      title: "Mã đơn trên Yody",
      key: "core_order_code",
      width: "10%",
      align: "center",
      render: (item: any) => (
        <Link to={`${UrlConfig.ORDER}/${item.core_order_code}`} target="_blank">
          <b style={{ textAlign: "left" }}>{item.core_order_code}</b>
        </Link>
      ),
    },
    {
      title: "Mã đơn trên Sapo",
      dataIndex: "ecommerce_order_code",
      key: "order_id",
      width: "10%",
      align: "center",
      render: (item) => (
        <div>
          <span style={{ textAlign: "left" }}>{item}</span>
        </div>
      ),
    },
    {
      title: "Gian hàng",
      dataIndex: "shop",
      key: "shop",
      align: "center",
      width: "250px",
      render: (shop: string) => (
        <div className="shop-show-style" style={{ textAlign: "left", minWidth: "150px" }}>
          <Tooltip title={shop}>{shop.length > 35 ? shop.substring(0, 30) + "..." : shop}</Tooltip>
        </div>
      ),
    },
    {
      title: "Nguồn",
      dataIndex: "source_id",
      key: "source_id",
      align: "center",
      width: "12%",
      render: (sourceId: any) => (
        <div className="shop-show-style" style={{ textAlign: "left", minWidth: "150px" }}>
          {getSourceNameById(sourceId)}
        </div>
      ),
    },
    {
      title: "Trạng thái (Yody)",
      dataIndex: "core_order_status",
      key: "core_order_status",
      align: "center",
      width: "12%",
      render: (status: string) => {
        return (
          <StyledStatus>
            <div className={getClassNameByStatus(status)}>{OrderStatus.getName(status)}</div>
          </StyledStatus>
        );
      },
    },
    {
      title: "Trạng thái liên kết",
      dataIndex: "connected_status",
      key: "connected_status",
      align: "center",
      width: "8%",
      render: (value: any, item: any) => {
        return (
          <div>
            {value === "connected" && (
              <img src={checkIcon} alt="Thành công" style={{ marginRight: 8, width: "18px" }} />
            )}
            {value !== "connected" && (
              <Tooltip title={item.error_description}>
                <img src={stopIcon} alt="Thất bại" style={{ marginRight: 8, width: "18px" }} />
              </Tooltip>
            )}
          </div>
        );
      },
    },
    {
      title: "Ngày tạo",
      dataIndex: "ecommerce_created_date",
      key: "ecommerce_created_date",
      align: "center",
      width: "10%",
      render: (value: any, item: any) => (
        <div style={{ textAlign: "center" }}>
          <div>{convertDateTimeFormat(item.ecommerce_created_date)}</div>
        </div>
      ),
    },
    {
      title: "Lỗi đồng bộ",
      dataIndex: "error_description",
      key: "error_description",
      align: "center",
    },
    TableRowAction([
      {
        onClick: handleSingleDownloadOrder,
        actionName: "Đồng bộ đơn hàng",
      },
    ]),
  ]);

  return (
    <OrderSyncStyle>
      <ContentContainer
        title="Đồng bộ đơn hàng"
        breadcrumb={[
          {
            name: "Web/App",
            path: `${UrlConfig.WEB_APP}`,
          },
          {
            name: "Đồng bộ đơn hàng",
          },
        ]}
        extra={
          <>
            {allowOrdersDownload && (
              <Button
                onClick={() => setIsShowGetOrderModal(true)}
                className="ant-btn-outline ant-btn-primary"
                size="large"
                icon={<DownloadOutlined />}
              >
                Tải đơn hàng
              </Button>
            )}
          </>
        }
      >
        <Card>
          <OrderSyncFilter
            isLoading={isLoading}
            params={params}
            initQuery={initQuery}
            onClearFilter={handClearFilter}
            onFilter={handleFilter}
            handleDownloadOrderSelected={handleDownloadOrderSelected}
            sourceList={sourceList}
            isSelectedRow={isSelectedRow}
          />

          <CustomTable
            bordered
            isRowSelection={allowProductsUpdateStock}
            isLoading={isLoading}
            showColumnSetting={true}
            scroll={{ x: 1500 }}
            sticky={{ offsetScroll: 10, offsetHeader: 55 }}
            pagination={
              isLoading
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
          />
        </Card>
        {isShowGetOrderModal && (
          <DownloadDataModal
            visible={isShowGetOrderModal}
            onOk={handleDownloadOrder}
            onCancel={() => setIsShowGetOrderModal(false)}
          />
        )}
        {isShowProcessDownloadModal && (
          <ProgressDownloadModal
            visible={isShowProcessDownloadModal}
            onCancel={() => setIsShowProcessDownloadModal(false)}
            onOk={handleProcessDonwload}
            progressData={progressData}
            progressPercent={progressPercent}
            isDownloading={isDownloading}
          />
        )}
        {isShowConflictModal && (
          <ConflictDownloadModal
            visible={isShowConflictModal}
            onCancel={() => setIsShowConflictModal(false)}
            onOk={() => setIsShowConflictModal(false)}
          />
        )}
      </ContentContainer>
    </OrderSyncStyle>
  );
};
export default OrdersSync;
