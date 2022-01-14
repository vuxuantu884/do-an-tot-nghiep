import { Card } from "antd";
import CustomTable, {
  ICustomTableColumType,
} from "component/table/CustomTable";
import { EcommerceProductPermission } from "config/permissions/ecommerce.permission";
import UrlConfig from "config/url.config";
import {
  getOrderMappingListAction,
  getShopEcommerceList,
  syncStockEcommerceProduct,
} from "domain/actions/ecommerce/ecommerce.actions";
import useAuthorization from "hook/useAuthorization";
import { AccountResponse } from "model/account/account.model";
import { PageResponse } from "model/base/base-metadata.response";
import { OrderModel } from "model/order/order.model";
import { GetOrdersMappingQuery } from "model/query/ecommerce.query";
import { useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { StyledStatus } from "screens/ecommerce/common/commonStyle";
import TableRowAction from "screens/ecommerce/common/TableRowAction";
import { AllOrdersMappingStyled } from "screens/ecommerce/orders-mapping/all-orders/AllOrdersMappingStyled";
import { getIconByEcommerceId } from "screens/ecommerce/common/commonAction";

import AllOrdersMappingFilter from "screens/ecommerce/orders-mapping/all-orders/component/AllOrdersMappingFilter";
import { ConvertUtcToLocalDate } from "utils/DateUtils";
import { showError, showSuccess, showWarning } from "utils/ToastUtils";

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
};

const AllOrdersMapping: React.FC<AllOrdersMappingProps> = (
  props: AllOrdersMappingProps
) => {
  const dispatch = useDispatch();
  const { isReloadPage } = props;

  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  useState<Array<AccountResponse>>();
  const [params, setPrams] = useState<GetOrdersMappingQuery>(initQuery);
  const [allShopList, setAllShopList] = useState<Array<any>>([]);

  const [rowDataFilter, setRowDataFilter] = useState<Array<any>>([]);

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

  const handleSyncOrder = (rowData: any) => {
    const requestSyncStockOrder = {
      order_list: [
        {
          ecommerce_id: rowData.ecommerce_id,
          shop_id: rowData.shop_id,
          order_sn: rowData.ecommerce_order_code,
        },
      ],
    };

    dispatch(
      syncStockEcommerceProduct(requestSyncStockOrder, (result) => {
        if (!!result) {
          if (result.update_total > 0) {
            if (result.error_total > 0) {
              showWarning(`Đồng bộ ${result.update_total} đơn hàng thành công.

              Đồng bộ ${result.error_total} đơn hàng thất bại`);
            } else {
              showSuccess(`Đồng bộ ${result.update_total} đơn hàng thành công`);
            }
          } else {
            showError(`Đồng bộ ${result.error_total} đơn hàng thất bại`);
          }
        }
      })
    );
  };

  const tableRowActionList = [
    {
      onClick: handleSyncOrder,
      actionName: "Đồng bộ đơn hàng",
    },
  ];

  const [columns] = useState<Array<ICustomTableColumType<OrderModel>>>([
    {
      title: "Mã đơn trên sàn",
      dataIndex: "ecommerce_order_code",
      key: "order_id",
      width: "13%",
    },
    {
      title: "Gian hàng",
      key: "shop",
      width: "18%",
      render: (item) => (
        <div>
          {getIconByEcommerceId(item.ecommerce_id) && (
            <img
              src={getIconByEcommerceId(item.ecommerce_id)}
              alt={item.id}
              style={{ marginRight: "5px", height: "16px" }}
            />
          )}
          <span className="name">{item.shop}</span>
        </div>
      ),
    },
    {
      title: "Trạng thái trên sàn",
      dataIndex: "ecommerce_order_status",
      key: "ecommerce_order_status",
      width: "16%",
      render: (status_value: string) => {
        const ecommerceStatus = ECOMMERCE_ORDER_STATUS.find(
          (status) => status.value === status_value
        );
        return <div>{ecommerceStatus?.name || "--"}</div>;
      },
    },
    {
      title: "Mã đơn trên Yody",
      key: "core_order_code",
      width: "11%",
      render: (item: any, row: any) => (
        <Link to={`${UrlConfig.ORDER}/${item.core_order_code}`} target="_blank">
          <b>{item.core_order_code}</b>
        </Link>
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
          <StyledStatus>
            <div className={status?.className}>{status?.name}</div>
          </StyledStatus>
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
            {value === "connected" && (
              <span style={{ color: "#27AE60" }}>Thành công</span>
            )}

            {
              value !== "connected" && (
                <span style={{ color: "#E24343" }}>Thất bại</span>
              )
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
      dataIndex: "ecommerce_created_date",
      key: "received_status",
      align: "center",
      render: (ecommerce_created_date) => (
        <div>{convertDateTimeFormat(ecommerce_created_date)}</div>
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
          rowDataFilter={rowDataFilter}
        />

        <CustomTable
          bordered
          isRowSelection={isShowAction}
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
