import { Card, Tooltip } from "antd";
import CustomTable, {} from "component/table/CustomTable";
import { EcommerceProductPermission } from "config/permissions/ecommerce.permission";
import UrlConfig from "config/url.config";
import {
  getOrderMappingListAction,
} from "domain/actions/ecommerce/ecommerce.actions";
import useAuthorization from "hook/useAuthorization";
import { AccountResponse } from "model/account/account.model";
import { PageResponse } from "model/base/base-metadata.response";
import { OrderModel } from "model/order/order.model";
import { GetOrdersMappingQuery } from "model/query/ecommerce.query";
import React, {useCallback, useEffect, useMemo, useState} from "react";
import { useDispatch } from "react-redux";
import { Link, useHistory, useLocation } from "react-router-dom";
import TableRowAction from "screens/ecommerce/common/TableRowAction";
import { AllOrdersMappingStyled } from "screens/ecommerce/orders-mapping/all-orders/AllOrdersMappingStyled";
import { getIconByEcommerceId, LAZADA_ORDER_STATUS_LIST, SHOPEE_ORDER_STATUS_LIST } from "screens/ecommerce/common/commonAction";

import AllOrdersMappingFilter from "screens/ecommerce/orders-mapping/all-orders/component/AllOrdersMappingFilter";
import { ConvertUtcToLocalDate } from "utils/DateUtils";
import checkIcon from "assets/icon/CheckIcon.svg"
import stopIcon from "assets/icon/Stop.svg"
import "./AllOrdersMapping.scss"
import { generateQuery } from "utils/AppUtils";
import { getQueryParamsFromQueryString } from "utils/useQuery";
import queryString from "query-string";
import useGetOrderSubStatuses from "hook/useGetOrderSubStatuses";


const initQuery: GetOrdersMappingQuery = {
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

type AllOrdersMappingProps = {
  isReloadPage: boolean;
  setRowDataFilter: (x: any) => void;
  handleDownloadSelectedOrders: (x: any) => void
  handleSingleDownloadOrder: (x: any) => void
};

const AllOrdersMapping: React.FC<AllOrdersMappingProps> = (
  props: AllOrdersMappingProps
) => {
  const history = useHistory()
  const location = useLocation()
  const dispatch = useDispatch();
  const { isReloadPage,setRowDataFilter, handleDownloadSelectedOrders, handleSingleDownloadOrder } = props;
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  useState<Array<AccountResponse>>();
  const [params, setPrams] = useState<GetOrdersMappingQuery>(initQuery);
  const productsUpdateStockPermission = [
    EcommerceProductPermission.products_update_stock,
  ];

  const subStatuses = useGetOrderSubStatuses();

  const queryParamsParsed: any = queryString.parse(
    location.search
  );

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
    const formatDateTime = "DD/MM/YYYY HH:mm:ss";
    const timeCreate = ConvertUtcToLocalDate(dateTimeData, formatDateTime);
    const dateCreate = timeCreate.split(" ")[0];
    const hourCreate = timeCreate.split(" ")[1];
    return (
      <div>
        <div>{dateCreate}</div>
        <div>{hourCreate}</div>
      </div>
    )
  };

  const tableRowActionList = useMemo(() => {
    return [
      {
        onClick: handleSingleDownloadOrder,
        actionName: "Đồng bộ đơn hàng",
      },
    ];
  }, [handleSingleDownloadOrder]);

  const showEcommerceOrderStatus:any = (status_value: string, item: any) =>{
    let ecommerceStatus: string;
    switch (item?.ecommerce_id?.toString()) {
      case "1":
        const shopeeStatus: any = SHOPEE_ORDER_STATUS_LIST.find(
          (status) => status.value === status_value.toUpperCase()
        );
        ecommerceStatus = shopeeStatus?.name;
        break;
      case "2":
        const lazadaStatus: any = LAZADA_ORDER_STATUS_LIST.find(
          (status) => status.value === status_value.toUpperCase()
        );
        ecommerceStatus = lazadaStatus?.name;
        break;
      default:
        ecommerceStatus = "";
    }

    return <div>{ecommerceStatus}</div>
  }

  const columns: any = useMemo(() => {
    return [
      {
        title: "ID đơn (Sàn)",
        dataIndex: "ecommerce_order_code",
        key: "order_id",
        width: "16%",
        render: (item: any) => (
          <div>
            <span style={{ textAlign: "center"}}>{item}</span>
          </div>
        ),
      },
      {
        title: "Trạng thái (Sàn)",
        dataIndex: "ecommerce_order_status",
        key: "ecommerce_order_status",
        width: "12%",
        render: (status_value: string, item: any) => (
          showEcommerceOrderStatus(status_value, item)
        ),
      },
      {
        title: "ID đơn (Yody)",
        key: "core_order_code",
        width: "12%",
        render: (item: any) => (
          <Link to={`${UrlConfig.ORDER}/${item.core_order_code}`} target="_blank">
            <b>{item.core_order_code}</b>
          </Link>
        ),
      },
      {
        title: "Trạng thái (Yody)",
        dataIndex: "core_sub_status_code",
        key: "core_sub_status_code",
        align: "center",
        width: "15%",
        render: (status_value: string) => {
          const status = subStatuses.find((status) => status.code === status_value);
          return (
            <div className={`core-sub-status ${status?.code}`}>{status?.sub_status}</div>
          );
        },
      },
      {
        title: "Liên kết",
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
        title: "Đồng bộ",
        dataIndex: "updated_status",
        key: "updated_status",
        align: "center",
        width: "9%",
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
        title: "Gian hàng",
        key: "shop",
        align: "center",
        width: "17%",
        render: (value: any, item: any) => (
          <div className="shop-show-style" style={{ textAlign: "left", minWidth:"150px"}}>
            {getIconByEcommerceId(item.ecommerce_id) && (
              <img
                src={getIconByEcommerceId(item.ecommerce_id)}
                alt={item.id}
                style={{ marginRight: "5px", height: "16px" }}
              />
            )}
            <Tooltip title={item.shop}>
              <span className="name">{item.shop}</span>
            </Tooltip>
          </div>
          
        ),
      },
      {
        title: "Ngày tạo",
        dataIndex: "ecommerce_created_date",
        key: "received_status",
        align: "center",
        width: "11%",
        render: (value: any, item: any) => (
          <div style={{ textAlign: "left" }}>
            <div>{convertDateTimeFormat(item.ecommerce_created_date)}</div>
          </div>
          
        ),
      },
      TableRowAction(tableRowActionList),
    ];
  }, [subStatuses, tableRowActionList]);

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
      const newParams = { ...params, page, limit };
      const queryParam = generateQuery(newParams);
			history.push(`${location.pathname}?${queryParam}`);
    },
    [history, location.pathname, params]
  );

  const onFilter = useCallback(
    (values) => {
      let newParams = { ...params, ...values };
      const queryParam = generateQuery(newParams);
      const currentParam = generateQuery(params);

      if (currentParam === queryParam) {
        getOrderMappingList(newParams);
      } else {
        newParams.page = 1;
        const newQueryParam = generateQuery(newParams);
        history.push(`${location.pathname}?${newQueryParam}`);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [history, location.pathname, params]
  );

  const onClearFilter = useCallback(() => {
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
    window.scrollTo(0, 0);
    setIsLoading(true);
    dispatch(
      getOrderMappingListAction(queryParams, (result) => {
        setIsLoading(false);
        setSearchResult(result);
      })
    );
  }, [dispatch, setSearchResult]);

  // reload page
  useEffect(() => {
    if (isReloadPage) {
      getOrderMappingList(params);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getOrderMappingList, isReloadPage]);
  //end

  useEffect(() => {
    let dataQuery: GetOrdersMappingQuery = {
      ...initQuery,
      ...getQueryParamsFromQueryString(queryParamsParsed),
    };
    setPrams(dataQuery);
    getOrderMappingList(dataQuery);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, location.search]);


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
          // shopList={allShopList}
          setRowDataFilter={setRowDataFilter}
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
