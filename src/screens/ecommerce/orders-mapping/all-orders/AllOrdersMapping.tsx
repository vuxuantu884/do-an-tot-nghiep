import { Card, Tooltip } from "antd";
import CustomTable, {
  ICustomTableColumType,
} from "component/table/CustomTable";
import { EcommerceProductPermission } from "config/permissions/ecommerce.permission";
import UrlConfig from "config/url.config";
import {
  getOrderMappingListAction,
  getShopEcommerceList,
} from "domain/actions/ecommerce/ecommerce.actions";
import useAuthorization from "hook/useAuthorization";
import { AccountResponse } from "model/account/account.model";
import { PageResponse } from "model/base/base-metadata.response";
import { OrderModel } from "model/order/order.model";
import { GetOrdersMappingQuery } from "model/query/ecommerce.query";
import React, { useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { StyledStatus } from "screens/ecommerce/common/commonStyle";
import TableRowAction from "screens/ecommerce/common/TableRowAction";
import { AllOrdersMappingStyled } from "screens/ecommerce/orders-mapping/all-orders/AllOrdersMappingStyled";
import { getIconByEcommerceId } from "screens/ecommerce/common/commonAction";

import AllOrdersMappingFilter from "screens/ecommerce/orders-mapping/all-orders/component/AllOrdersMappingFilter";
import { ConvertUtcToLocalDate } from "utils/DateUtils";
import checkIcon from "assets/icon/CheckIcon.svg"
import stopIcon from "assets/icon/Stop.svg"
import "./AllOrdersMapping.scss"

const initQuery: GetOrdersMappingQuery = {
  page: 1,
  limit: 30,
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

const ECOMMERCE_ORDER_STATUS = [
  { name: "Chờ xác nhận", value: "UNPAID" },
  { name: "Chờ lấy hàng (chưa xử lý)", value: "READY_TO_SHIP" },
  { name: "Chờ lấy hàng (đã xử lý)", value: "PROCESSED" },
  { name: "Chờ lấy hàng (đã xử lý)", value: "RETRY_SHIP" },
  { name: "Đang giao", value: "SHIPPED" },
  { name: "Đang giao", value: "TO_CONFIRM_RECEIVE" },
  { name: "Đã huỷ", value: "CANCELLED" },
  { name: "Đã giao", value: "COMPLETED" },
];

type AllOrdersMappingProps = {
  isReloadPage: boolean;
  setRowDataFilter: (x: any) => void;
  handleDownloadSelectedOrders: (x: any) => void
  handleSingleDownloadOrder: (x: any) => void
};

const AllOrdersMapping: React.FC<AllOrdersMappingProps> = (
  props: AllOrdersMappingProps
) => {
  const dispatch = useDispatch();
  const { isReloadPage,setRowDataFilter, handleDownloadSelectedOrders, handleSingleDownloadOrder } = props;
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  useState<Array<AccountResponse>>();
  const [params, setPrams] = useState<GetOrdersMappingQuery>(initQuery);
  const [allShopList, setAllShopList] = useState<Array<any>>([]);
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
    const formatDateTime = "HH:mm:ss DD/MM/YYYY";
    return ConvertUtcToLocalDate(dateTimeData, formatDateTime);
  };

  const tableRowActionList = [
    {
      onClick: handleSingleDownloadOrder,
      actionName: "Đồng bộ đơn hàng",
    },
  ];

  const formatShowStatus:any = (name:any) =>{
    if (name === undefined) {
      return <div>{"--"}</div>;
    }

    if (name === "Chờ lấy hàng (đã xử lý)") {
      return (
        <div>
          <div>Chờ lấy hàng</div>
          <div>(đã xử lý)</div>
        </div>
      ) 
    } else if (name === "Chờ lấy hàng (chưa xử lý)") {
      return (
        <div>
          <div>Chờ lấy hàng</div>
          <div>(chưa xử lý)</div>
        </div>
      ) 
    } else {
      return <div>{name}</div>
    }
    
  }

  const [columns] = useState<Array<ICustomTableColumType<OrderModel>>>([
    {
      title: "ID đơn (Sàn)",
      dataIndex: "ecommerce_order_code",
      key: "order_id",
      width: "15%",
      render: (item) => (
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
      render: (status_value: string) => {
        const ecommerceStatus: any = ECOMMERCE_ORDER_STATUS.find(
          (status) => status.value === status_value
        );
        return <div>{formatShowStatus(ecommerceStatus?.name)}</div>
      },
    },
    {
      title: "ID đơn (Yody)",
      key: "core_order_code",
      width: "10%",
      render: (item: any, row: any) => (
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
      width: "15%",
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
      title: "Liên kết",
      dataIndex: "connected_status",
      key: "connected_status",
      align: "center",
      width: "8%",
      render: (value: any, item: any, index: any) => {
        return (
          <div>
            {value === "connected" && (
              <img src={checkIcon} alt="Thành công" style={{ marginRight: 8 }} />
            )}

            {
              value !== "connected" && (
                <Tooltip title={item.error_description}>
                  <img src={stopIcon} alt="Thất bại" style={{ marginRight: 8 }} />
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
      render: (value: any, item: any, index: any) => {
        return (
          <div>
            {value === "connected" && (
              <img src={checkIcon} alt="Thành công" style={{ marginRight: 8 }} />
            )}

            {
              value !== "connected" && (
                <Tooltip title={item.error_description}>
                  <img src={stopIcon} alt="Thất bại" style={{ marginRight: 8 }} />
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
      render: (value: any, item: any, index: any) => (
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
      render: (value: any, item: any, index: any) => (
        <div style={{ textAlign: "center" }}>
          <div>{convertDateTimeFormat(item.ecommerce_created_date)}</div>
        </div>
        
      ),
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
    (page, size) => {
      params.page = page;
      params.limit = size;
      setPrams({ ...params });
      window.scrollTo(0, 0);
    },
    [params]
  );

  const onFilter = useCallback(
    (values) => {
      const filterParams = { ...params, ...values, page: 1 };
      setPrams(filterParams);
    },
    [params]
  );

  const onClearFilter = useCallback(() => {
    setPrams(initQuery);
  }, []);

  const setSearchResult = useCallback(
    (result: PageResponse<OrderModel> | false) => {
      setIsLoading(false);
      if (!!result) {
        setData(result);
      }
    },
    []
  );

  const getOrderMappingList = useCallback(() => {
    setIsLoading(true);
    dispatch(
      getOrderMappingListAction(params, (result) => {
        setIsLoading(false);
        setSearchResult(result);
      })
    );
  }, [dispatch, params, setSearchResult]);

  useEffect(() => {
    getOrderMappingList();
  }, [getOrderMappingList]);

  // reload page
  useEffect(() => {
    if (isReloadPage) {
      getOrderMappingList();
    }
  }, [getOrderMappingList, isReloadPage]);
  // end

  // handle get all shop list
  const updateAllShopList = useCallback((result) => {
    const shopList: any[] = [];
    if (result && result.length > 0) {
      result.forEach((item: any) => {
        shopList.push({
          id: item.id,
          name: item.name,
          isSelected: false,
          ecommerce: item.ecommerce,
        });
      });
    }

    setAllShopList(shopList);
  }, []);


  useEffect(() => {
    dispatch(getShopEcommerceList({}, updateAllShopList));
  }, [dispatch, updateAllShopList]);
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
          shopList={allShopList}
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
