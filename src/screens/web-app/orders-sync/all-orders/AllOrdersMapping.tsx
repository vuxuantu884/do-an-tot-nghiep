import { Card, Tooltip } from "antd";
import CustomTable, {
  ICustomTableColumType,
} from "component/table/CustomTable";
import { EcommerceProductPermission } from "config/permissions/ecommerce.permission";
import UrlConfig from "config/url.config";
import {
  getOrderMappingListAction,
} from "domain/actions/web-app/web-app.actions";
import useAuthorization from "hook/useAuthorization";
import { AccountResponse } from "model/account/account.model";
import { PageResponse } from "model/base/base-metadata.response";
import { OrderModel } from "model/order/order.model";
import { WebAppGetOrdersMappingQuery } from "model/query/web-app.query";
import React, { useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { Link, useHistory, useLocation } from "react-router-dom";
import { StyledStatus } from "screens/web-app/common/commonStyle";
import TableRowAction from "screens/web-app/common/TableRowAction";
import { AllOrdersMappingStyled } from "screens/web-app/orders-sync/all-orders/AllOrdersMappingStyled";

import AllOrdersMappingFilter from "screens/web-app/orders-sync/all-orders/component/AllOrdersMappingFilter";
import { ConvertUtcToLocalDate } from "utils/DateUtils";
import checkIcon from "assets/icon/CheckIcon.svg"
import stopIcon from "assets/icon/Stop.svg"
import "./AllOrdersMapping.scss"
import { generateQuery } from "utils/AppUtils";
import { getQueryParamsFromQueryString } from "utils/useQuery";
import queryString from "query-string";
import {getWebAppById} from "screens/web-app/common/commonAction";


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
};

const CORE_ORDER_STATUS = [
  { name: "Nháp", value: "draft", className: "gray-status" },
  { name: "Đã xác nhận", value: "finalized", className: "blue-status" },
  { name: "Kết thúc", value: "finished", className: "green-status" },
  { name: "Hủy đơn", value: "cancelled", className: "red-status" },
];

type AllOrdersMappingProps = {
  isReloadPage: boolean;
  setRowDataFilter: (x: any) => void;
  handleDownloadSelectedOrders: () => void
  handleSingleDownloadOrder: (x: any) => void
};

const AllOrdersMapping: React.FC<AllOrdersMappingProps> = (
  props: AllOrdersMappingProps
) => {
  const dispatch = useDispatch();
  const history = useHistory()
  const location = useLocation()

  const queryParamsParsed: any = queryString.parse(
    location.search
  );


  const { isReloadPage,setRowDataFilter, handleDownloadSelectedOrders, handleSingleDownloadOrder } = props;
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  useState<Array<AccountResponse>>();
  const [params, setPrams] = useState<WebAppGetOrdersMappingQuery>(initQuery);
  // const [allShopList, setAllShopList] = useState<Array<any>>([]);
  const productsUpdateStockPermission = [
    EcommerceProductPermission.products_update_stock,
  ];

  const [allowProductsUpdateStock] = useAuthorization({
    acceptPermissions: productsUpdateStockPermission,
    not: false,
  });

  const isShowAction = allowProductsUpdateStock;

  const [data, setData] = useState<PageResponse<OrderModel>>({
    metadata: {
      limit: 30,
      page: 1,
      total: 0,
    },
    items: [],
  });

  const convertDateTimeFormat = (dateTimeData: any) => {
    // const formatDateTime = "HH:mm:ss DD/MM/YYYY";
    const formatDateTime = "DD/MM/YYYY HH:mm:ss";
    const timeCreate = ConvertUtcToLocalDate(dateTimeData, formatDateTime);
    const dateCreate = timeCreate.split(" ")[0]
    const hourCreate = timeCreate.split(" ")[1]
    return (
      <div>
        <div>{dateCreate}</div>
        <div>{hourCreate}</div>
      </div>
    )
  };

  const tableRowActionList = [
    {
      onClick: handleSingleDownloadOrder,
      actionName: "Đồng bộ đơn hàng",
    },
  ];

  const [columns] = useState<Array<ICustomTableColumType<OrderModel>>>([
    {
      title: "Mã đơn trên Sapo",
      dataIndex: "ecommerce_order_code",
      key: "order_id",
      width: "14%",
      render: (item) => (
        <div>
          <span style={{ textAlign: "center"}}>{item}</span>
        </div>
      ),
    },
    {
      title: "Nguồn",
      dataIndex: "ecommerce_id",
      key: "ecommerce_id",
      align: "center",
      width: "12%",
      render: (value: any) => (
        <div className="shop-show-style" style={{ textAlign: "left", minWidth:"150px"}}>
          {getWebAppById(value)?.title}
        </div>

      ),
    },
    {
      title: "Mã đơn trên Yody",
      key: "core_order_code",
      width: "15%",
      render: (item: any) => (
        <Link to={`${UrlConfig.ORDER}/${item.core_order_code}`} target="_blank">
          <b>{item.core_order_code}</b>
        </Link>
      ),
    },
    {
      title: "Trạng thái (Yody)",
      dataIndex: "core_order_status",
      key: "core_order_status",
      align: "center",
      width: "12%",
      render: (status_value: string) => {
        const status = CORE_ORDER_STATUS.find(
          (status) => status.value === status_value
        );
        return (
          <StyledStatus>
            <div className={status?.className}>{status?.name}</div>
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

            {
              value !== "connected" && (
                <Tooltip title={item.error_description}>
                  <img src={stopIcon} alt="Thất bại" style={{ marginRight: 8, width: "18px" }} />
                </Tooltip>

              )
            }
          </div>
        );
      },
    },
    {
      title: "Ngày tạo",
      dataIndex: "ecommerce_created_date",
      key: "received_status",
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
    TableRowAction(tableRowActionList),
  ]);

  const onSelectTableRow = useCallback((selectedRow) => {
    const newSelectedRow = selectedRow.filter((row: any) => {
      return row !== undefined;
    });
    const selectedRowIds = newSelectedRow.map((row: any) => row?.id);
    setSelectedRowKeys(selectedRowIds);
    setRowDataFilter(newSelectedRow);
  }, [setRowDataFilter]);

  const onPageChange = useCallback(
    (page, limit) => {
      let newPrams = { ...params, page, limit };
      setPrams(newPrams);
      window.scrollTo(0, 0);
      let queryParam = generateQuery(newPrams);
      history.push(`${location.pathname}?${queryParam}`);
    },
    [history, location.pathname, params]
  );

  const onFilter = useCallback(
    (values) => {
      const filterParams = { ...params, ...values, page: 1 };
      let currentQueryParam = generateQuery(params);
      let newQueryParam = generateQuery(filterParams);
      if (newQueryParam !== currentQueryParam) {
        setPrams(filterParams);
        history.push(`${location.pathname}?${newQueryParam}`);
      }
    },
    [history, location.pathname, params]
  );

  const onClearFilter = useCallback(() => {
    setPrams(initQuery);
    let queryParam = generateQuery(initQuery);
    history.push(`${location.pathname}?${queryParam}`);
  }, [history, location.pathname]);

  const setSearchResult = useCallback(
    (result: PageResponse<OrderModel> | false) => {
      setIsLoading(false);
      if (!!result) {
        setData(result);
      }
    },
    []
  );

  const getOrderMappingList = useCallback((queryParams) => {
    setIsLoading(true);
    dispatch(
      getOrderMappingListAction(queryParams, (result) => {
        setIsLoading(false);
        setSearchResult(result);
      })
    );
  }, [dispatch, setSearchResult]);

  useEffect(() => {
    let queryParams: WebAppGetOrdersMappingQuery = {
      ...initQuery,
      ...getQueryParamsFromQueryString(queryParamsParsed),
    };
    setPrams(queryParams);
    getOrderMappingList(queryParams);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch,setSearchResult, location.search]);


  // reload page
  useEffect(() => {
    if (isReloadPage) {
      getOrderMappingList(params);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getOrderMappingList, isReloadPage]);
  // end

  return (
    <AllOrdersMappingStyled>
      <Card>
        <AllOrdersMappingFilter
          isLoading={isLoading}
          params={params}
          selectedRowKeys={selectedRowKeys}
          initQuery={initQuery}
          onClearFilter={onClearFilter}
          onFilter={onFilter}
          handleDownloadSelectedOrders={handleDownloadSelectedOrders}
        />

        <CustomTable
          bordered
          isRowSelection={isShowAction}
          isLoading={isLoading}
          showColumnSetting={true}
          sticky={{ offsetScroll: 10, offsetHeader: 55 }}
          pagination={
            isLoading
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
          columns={columns}
          rowKey={(item: OrderModel) => item.id}
        />
      </Card>
    </AllOrdersMappingStyled>
  );
};

export default AllOrdersMapping;
