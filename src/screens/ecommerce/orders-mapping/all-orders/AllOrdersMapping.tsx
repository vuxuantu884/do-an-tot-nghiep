import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { Card } from "antd";

import UrlConfig from "config/url.config";
import { ConvertUtcToLocalDate } from "utils/DateUtils";

import {
  OrderModel,
} from "model/order/order.model";
import { AccountResponse } from "model/account/account.model";

import { getOrderMappingListAction, getShopEcommerceList } from "domain/actions/ecommerce/ecommerce.actions";


import { PageResponse } from "model/base/base-metadata.response";
import CustomTable, {
  ICustomTableColumType,
} from "component/table/CustomTable";
import AllOrdersMappingFilter from "screens/ecommerce/orders-mapping/all-orders/component/AllOrdersMappingFilter";
import AuthWrapper from "component/authorization/AuthWrapper";
import NoPermission from "screens/no-permission.screen";
import { EcommerceOrderPermission } from "config/permissions/ecommerce.permission";

import tikiIcon from "assets/icon/e-tiki.svg";
import shopeeIcon from "assets/icon/e-shopee.svg";
import lazadaIcon from "assets/icon/e-lazada.svg";
import sendoIcon from "assets/icon/e-sendo.svg";

import {
  StyledComponent,
} from "screens/ecommerce/orders/orderStyles";
import useAuthorization from "hook/useAuthorization";
import { GetOrdersMappingQuery } from "model/query/ecommerce.query";


const initQuery: GetOrdersMappingQuery = {
  page: 1,
  limit: 30,
  ecommerce_order_code: null,
  core_order_code: null,
  connected_status: null,
  created_date_from: null,
  created_date_to: null,
  ecommerce_order_statuses: [],
  shop_id: [],
};

const CORE_ORDER_STATUS = [
  { name: "Nháp", value: "draft" },
  { name: "Đóng gói", value: "packed" },
  { name: "Xuất kho", value: "shipping" },
  { name: "Đã xác nhận", value: "finalized" },
  { name: "Hoàn thành", value: "completed" },
  { name: "Kết thúc", value: "finished" },
  { name: "Đã huỷ", value: "cancelled" },
  { name: "Đã hết hạn", value: "expired" },
];

const ECOMMERCE_ORDER_STATUS = [
  { name: "Chờ xác nhận", value: "UNPAID" },
  { name: "Chờ lấy hàng (chưa xử lý)", value: "READY_TO_SHIP" },
  { name: "Chờ lấy hàng (đã xử lý)", value: "PROCESSED" },
  { name: "Đang giao", value: "SHIPPED" },
  { name: "Đã giao", value: "TO_CONFIRM_RECEIVE" },
  { name: "Đã huỷ", value: "CANCELLED" },
];

const ordersViewPermission = [EcommerceOrderPermission.orders_view];


const EcommerceOrderSync: React.FC = () => {
  const dispatch = useDispatch();

  const [allowOrdersView] = useAuthorization({
    acceptPermissions: ordersViewPermission,
    not: false,
  });

  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  useState<Array<AccountResponse>>();
  const [params, setPrams] = useState<GetOrdersMappingQuery>(initQuery);
  const [allShopList, setAllShopList] = useState<Array<any>>([]);
  
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

  const getEcommerceIcon = (shop: any) => {
    switch (shop) {
      case "shopee":
        return shopeeIcon;
      case "lazada":
        return lazadaIcon;
      case "tiki":
        return tikiIcon;
      case "sendo":
        return sendoIcon;
      default:
        return shopeeIcon;
    }
  };

  const [columns] = useState<
    Array<ICustomTableColumType<OrderModel>>
  >([
    {
      title: "Mã đơn trên sàn",
      dataIndex: "ecommerce_order_code",
      key: "order_id",
      width: "13%",
    },
    {
      title: "Gian hàng",
      key: "shop",
      width: "15%",
      render: (item) => (
        <div>
          <img
            src={getEcommerceIcon(item.ecommerce)}
            alt={item.id}
            style={{ marginRight: "5px", height: "16px" }}
          />
          <span className="name">{item.shop}</span>
        </div>
      )
    },
    {
      title: "Trạng thái trên sàn",
      dataIndex: "ecommerce_order_status",
      key: "ecommerce_order_status",
      width: "15%",
      render: (status_value: string) => {
        const ecommerceStatus = ECOMMERCE_ORDER_STATUS.find(
          (status) => status.value === status_value
        );
        return (
          <div>
            {ecommerceStatus?.name || "--"}
          </div>
        );
      },
    },
    {
      title: "Mã đơn trên Yody",
      key: "core_order_code",
      width: "13%",
      render: (item: any, row: any) => (
        <Link to={`${UrlConfig.ORDER}/${item.core_order_code}`} target="_blank"><b>{item.core_order_code}</b></Link>
      ),
    },
    {
      title: "Trạng thái trên Yody",
      dataIndex: "core_order_status",
      key: "core_order_status",
      align: "center",
      width: "13%",
      render: (status_value: string) => {
        const status = CORE_ORDER_STATUS.find(
          (status) => status.value === status_value
        );
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
            {status?.name}
          </div>
        );
      },
    },
    {
      title: "	Trạng thái liên kết ",
      dataIndex: "connected_status",
      key: "connected_status",
      align: "center",
      width: "13%",
      render: (value: any, item: any, index: any) => {
        return (
          <div>
            {value === "connected" && <span style={{ color: "#27AE60" }}>Thành công</span>}

            {value !== "connected" &&
              <span style={{ color: "#E24343" }}>Thất bại</span>
              // <Tooltip title="Sẽ hiển thị lỗi liên kết thất bại ở đây">
              //   <span style={{ color: "#E24343" }}>Thất bại</span>
              // </Tooltip>
            }
          </div>
        );
      },
    },
    {
      title: "Ngày tạo",
      dataIndex: "created_date",
      key: "received_status",
      align: "center",
      render: (created_date) => (
        <div>{convertDateTimeFormat(created_date)}</div>
      ),
    }
  ]);

  const onSelectedChange = useCallback((selectedRow) => {
    const selectedRowKeys = selectedRow.map((row: any) => row.id);
    setSelectedRowKeys(selectedRowKeys);
  }, []);

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
    dispatch(getOrderMappingListAction(params, (result) => {
      setIsLoading(false);
      setSearchResult(result);
    }));
  }, [dispatch, params, setSearchResult]);


  useEffect(() => {
    if (allowOrdersView) {
      getOrderMappingList();
    }
  }, [allowOrdersView, getOrderMappingList]);

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
    if (allowOrdersView) {
      dispatch(getShopEcommerceList({}, updateAllShopList));
    }
  }, [allowOrdersView, dispatch, updateAllShopList]);


  return (
    <StyledComponent>
      <AuthWrapper acceptPermissions={ordersViewPermission} passThrough>
        {(allowed: boolean) => (allowed ?
          <Card>
            <AllOrdersMappingFilter
              isLoading={isLoading}
              params={params}
              selectedRowKeys={selectedRowKeys}
              initQuery={initQuery}
              onClearFilter={onClearFilter}
              onFilter={onFilter}
              shopList={allShopList}
            />
  
            <CustomTable
              // isRowSelection
              bordered
              isLoading={isLoading}
              showColumnSetting={true}
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
              onSelectedChange={(selectedRows) => onSelectedChange(selectedRows)}
              dataSource={data.items}
              columns={columns}
              rowKey={(item: OrderModel) => item.id}
            />
          </Card>
          : <NoPermission />)}
      </AuthWrapper>
    </StyledComponent>
  );
};

export default EcommerceOrderSync;
