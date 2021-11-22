import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { Card, Tooltip } from "antd";

import UrlConfig from "config/url.config";
import { ConvertUtcToLocalDate } from "utils/DateUtils";
import { getQueryParams, useQuery } from "utils/useQuery";

import {
  OrderModel,
} from "model/order/order.model";
import { AccountResponse } from "model/account/account.model";

import { getOrderMappingListAction } from "domain/actions/ecommerce/ecommerce.actions";


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
  search_term: null,
  connect_status: null,
  issued_on_min: null,
  issued_on_max: null,
  order_status: [],
  //remove late 
  channel_id: undefined,
  source_ids: [],
};

// todo thai need update
const ECOMMERCE_SOURCE = {
  shopee: 16,
  lazada: 19,
  sendo: 20,
  tiki: 100
}
const ALL_ECOMMERCE_SOURCE_ID = [
  ECOMMERCE_SOURCE.shopee,
  ECOMMERCE_SOURCE.lazada,
  ECOMMERCE_SOURCE.sendo,
  ECOMMERCE_SOURCE.tiki
];

const ordersViewPermission = [EcommerceOrderPermission.orders_view];


const EcommerceOrderSync: React.FC = () => {
  const query = useQuery();
  const dispatch = useDispatch();

  const [allowOrdersView] = useAuthorization({
    acceptPermissions: ordersViewPermission,
    not: false,
  });

  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [tableLoading, setTableLoading] = useState(false);
  useState<Array<AccountResponse>>();
  let dataQuery: GetOrdersMappingQuery = {
    ...initQuery,
    channel_id: 3,
    ...getQueryParams(query),
  };
  let [params, setPrams] = useState<GetOrdersMappingQuery>(dataQuery);

  const [data, setData] = useState<PageResponse<OrderModel>>({
    metadata: {
      limit: 30,
      page: 1,
      total: 0,
    },
    items: [],
  });

  const status_order = [
    { name: "Nháp", value: "draft" },
    { name: "Đóng gói", value: "packed" },
    { name: "Xuất kho", value: "shipping" },
    { name: "Đã xác nhận", value: "finalized" },
    { name: "Hoàn thành", value: "completed" },
    { name: "Kết thúc", value: "finished" },
    { name: "Đã huỷ", value: "cancelled" },
    { name: "Đã hết hạn", value: "expired" },
  ];

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
      key: "order_id",
      width: "12%",
      render: (item: any, row: any) => (
        <Link to={`${UrlConfig.ORDER}/${item.id}`}><b>{item.code}</b></Link>
      ),
    },
    {
      title: "Gian hàng",
      key: "shop",
      render: (item) => (
        <div>
          <img
            src={getEcommerceIcon(item.ecommerce)}
            alt={item.id}
            style={{ marginRight: "5px", height: "16px" }}
          />

          <Tooltip title={item.ecommerce_shop_name} color="#1890ff" placement="top">
            <span className="name">{item.ecommerce_shop_name}</span>
          </Tooltip>
        </div>
      )
    },
    {
      title: "Trạng thái trên sàn",
      dataIndex: "status",
      key: "ecommerce_status",
      width: "12%",
      render: (status_value: string) => {
        const status = status_order.find(
          (status) => status.value === status_value
        );
        return (
          <div>
            {status?.name || "--"}
          </div>
        );
      },
    },
    {
      title: "Mã đơn trên Yody",
      key: "sub_status",
      width: "12%",
      render: (item: any, row: any) => (
        <Link to={`${UrlConfig.ORDER}/${item.id}`}><b>{item.code}</b></Link>
      ),
    },
    {
      title: "Trạng thái trên Yody",
      dataIndex: "status",
      key: "order_status",
      align: "center",
      width: "12%",
      render: (status_value: string) => {
        const status = status_order.find(
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
      dataIndex: "packed_status",
      key: "packed_status",
      align: "center",
      width: "12%",
      render: (value: any, item: any, index: any) => {
        return (
          <div>
            {value && <span style={{ color: "#27AE60" }}>Thành công</span>}

            {!value &&
              <Tooltip title="Sẽ hiển thị lỗi liên kết thất bại ở đây">
                <span style={{ color: "#E24343" }}>Thất bại</span>
              </Tooltip>
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
      width: "12%",
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
      let newPrams = { ...params, ...values, page: 1 };
      setPrams(newPrams);
    },
    [params]
  );

  const onClearFilter = useCallback(() => {
    setPrams(initQuery);
  }, []);

  

  const setSearchResult = useCallback(
    (result: PageResponse<OrderModel> | false) => {
      setTableLoading(false);
      if (!!result) {
        setData(result);
      }
    },
    []
  );


  const getEcommerceOrderList = useCallback(() => {
    const requestParams = { ...params };
    if (!requestParams.source_ids?.length) {
      requestParams.source_ids = ALL_ECOMMERCE_SOURCE_ID;
    }
    
    setTableLoading(true);
    dispatch(getOrderMappingListAction(requestParams, (result) => {
      setTableLoading(false);
      setSearchResult(result);
    }));
  }, [dispatch, params, setSearchResult]);


  useEffect(() => {
    if (allowOrdersView) {
      getEcommerceOrderList();
    }
  }, [allowOrdersView, getEcommerceOrderList]);


  return (
    <StyledComponent>
      <AuthWrapper acceptPermissions={ordersViewPermission} passThrough>
        {(allowed: boolean) => (allowed ?
          <Card>
            <AllOrdersMappingFilter
              tableLoading={tableLoading}
              params={params}
              selectedRowKeys={selectedRowKeys}
              initQuery={initQuery}
              onClearFilter={onClearFilter}
              onFilter={onFilter}
            />
  
            <CustomTable
              isRowSelection
              bordered
              isLoading={tableLoading}
              showColumnSetting={true}
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
              onSelectedChange={(selectedRows) => onSelectedChange(selectedRows)}
              dataSource={data.items}
              columns={columns}
              rowKey={(item: OrderModel) => item.id}
              // className="ecommerce-order-list"
            />
          </Card>
          : <NoPermission />)}
      </AuthWrapper>
    </StyledComponent>
  );
};

export default EcommerceOrderSync;
