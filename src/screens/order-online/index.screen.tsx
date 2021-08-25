/* eslint-disable @typescript-eslint/no-unused-vars */
import { Button, Card } from "antd";
import { MenuAction } from "component/table/ActionButton";
import { PageResponse } from "model/base/base-metadata.response";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useHistory } from "react-router-dom";
import { generateQuery, Products } from "utils/AppUtils";
import { getQueryParams, useQuery } from "utils/useQuery";
import { useDispatch, useSelector } from "react-redux";
// import ProductFilter from "component/filter/product.filter";
import OrderFilter from "component/filter/order.filter";
import { RootReducerType } from "model/reducers/RootReducerType";
import CustomTable, { ICustomTableColumType } from "component/table/CustomTable";
import { OrderFulfillmentsModel, OrderItemModel, OrderModel, OrderPaymentModel, OrderSearchQuery } from "model/order/order.model";
import {
  AccountResponse,
  AccountSearchQuery,
} from "model/account/account.model";
import UrlConfig from "config/UrlConfig";
import ButtonCreate from "component/header/ButtonCreate";
import ContentContainer from "component/container/content.container";
import { hideLoading, showLoading } from "domain/actions/loading.action";
import ModalSettingColumn from "component/table/ModalSettingColumn";
import { getListOrderAction } from "domain/actions/order/order.action";
import ColumnGroup from "antd/lib/table/ColumnGroup";
import Column from "antd/lib/table/Column";
import './scss/index.screen.scss'
import { PoPaymentStatus } from "utils/Constants";
import { SettingOutlined } from "@ant-design/icons";

const actions: Array<MenuAction> = [
  {
    id: 1,
    name: "Xóa",
  },
  {
    id: 2,
    name: "Export",
  },
];

const initQuery: OrderSearchQuery = {
  page: 0,
  limit: 0,
  sort_type: "",
  sort_column: "",
  code: "",
  customer: "",
  store_address: "",
  source: "",
  issued_on_min: "",
  issued_on_max: "",
  issued_on_predefined: "",
  finalized_on_min: "",
  finalized_on_max: "",
  finalized_on_predefined: "",
  ship_on_min: "",
  ship_on_max: "",
  ship_on_predefined: "",
  completed_on_min: "",
  completed_on_max: "",
  completed_on_predefined: "",
  cancelled_on_min: "",
  cancelled_on_max: "",
  cancelled_on_predefined: "",
  order_status: [
    ""
  ],
  fulfillment_status: [
    ""
  ],
  payment_status: [
    ""
  ],
  return_status: [
    ""
  ],
  account: "",
  assignee: "",
  price_min: 0,
  price_max: 0,
  payment_method_ids: [
    0
  ],
  ship_by: "",
  note: "",
  customer_note: "",
  tags: "",
  reference_code: ""
};

const initAccountQuery: AccountSearchQuery = {
  department_ids: [4],
};

const ListOrderScreen: React.FC = () => {
  const query = useQuery();
  const history = useHistory();
  const dispatch = useDispatch();
 
  const listStatus = useSelector((state: RootReducerType) => {
    return state.bootstrapReducer.data?.variant_status;
  });
  const [tableLoading, setTableLoading] = useState(true);
  const isFirstLoad = useRef(true);
  const [showSettingColumn, setShowSettingColumn] = useState(false);
    useState<Array<AccountResponse>>();
  let dataQuery: OrderSearchQuery = {
    ...initQuery,
    ...getQueryParams(query),
  };
  let [params, setPrams] = useState<OrderSearchQuery>(dataQuery);
  const [data, setData] = useState<PageResponse<OrderModel>>({
    metadata: {
      limit: 30,
      page: 1,
      total: 0,
    },
    items: [],
  });

  const [columns, setColumn]  = useState<Array<ICustomTableColumType<OrderModel>>>([
    {
      title: "ID đơn hàng",
      dataIndex: "id",
      key: "id",
      visible: true,
    },
    {
      title: "Khách hàng",
      dataIndex: "customer",
      key: "customer",
      visible: true,
    },
    {
      title: "Sản phẩm",
      dataIndex: "items",
      key: "items.name",
      render: (items: Array<OrderItemModel>) => (
        <div className="items">
          {items.map((item, i) => {
            return (
              <div className="item-details">{item.variant_id}</div>
            )
          })}
        </div>
      ),
      visible: true,
    },
    {
      title: "Số lượng",
      dataIndex: "items",
      key: "item.quantity",
      render: (items: Array<OrderItemModel>) => (
        <div className="items">
          {items.map((item, i) => {
            return (
              <div className="item-details">{item.sku}</div>
            )
          })}
        </div>
      ),
      visible: true,
    },
    {
      title: "Khách phải trả",
      dataIndex: "total_line_amount_after_line_discount",
      key: "customer.amount_money",
      visible: true,
    },
    {
      title: "Hình thức vận chuyển",
      dataIndex: "fulfillments",
      key: "shipment.type",
      render: (fulfillments: Array<OrderFulfillmentsModel>) => (
        fulfillments && fulfillments[0].shipment ? fulfillments[0].shipment.delivery_service_provider_id : ""
      ),
      visible: true,
    },
    {
      title: "Trạng thái đơn",
      dataIndex: "status",
      key: "status",
      visible: true,
      align: "center",
    },
    {
      title: "Đóng gói",
      dataIndex: "packed_status",
      render: (value: string) => {
        let processIcon = null;
        switch (value) {
          case "partial_paid":
            processIcon = "icon-partial";
            break;
          case "paid":
            processIcon = "icon-full";
            break;
          default:
            processIcon = "icon-blank";
            break;
        }
        return (
          <div className="text-center">
            <div className={processIcon} />
          </div>
        );
      },
      visible: true,
      align: "center",
      width: 120,
    },
    {
      title: "Xuất kho",
      dataIndex: "received_status",
      render: (value: string) => {
        let processIcon = null;
        switch (value) {
          case "partial_paid":
            processIcon = "icon-partial";
            break;
          case "paid":
            processIcon = "icon-full";
            break;
          default:
            processIcon = "icon-blank";
            break;  
        }
        return (
          <div className="text-center">
            <div className={processIcon} />
          </div>
        );
      },
      visible: true,
      align: "center",
      width: 120,
    },
    {
      title: "Thanh toán",
      dataIndex: "payment_status",
      render: (value: string) => {
        let processIcon = null;
        switch (value) {
          case "partial_paid":
            processIcon = "icon-partial";
            break;
          case "paid":
            processIcon = "icon-full";
            break;
          default:
            processIcon = "icon-blank";
            break;  
        }
        return (
          <div className="text-center">
            <div className={processIcon} />
          </div>
        );
      },
      visible: true,
      align: "center",
      width: 120,
    },
    {
      title: "Trả hàng",
      dataIndex: "return_status",
      render: (value: string) => {
        let processIcon = null;
        switch (value) {
          case "partial_paid":
            processIcon = "icon-partial";
            break;
          case "paid":
            processIcon = "icon-full";
            break;
          default:
            processIcon = "icon-blank";
            break;  
        }
        return (
          <div className="text-center">
            <div className={processIcon} />
          </div>
        );
      },
      visible: true,
      align: "center",
      width: 120,
    },
    {
      title: "Tổng SL sản phẩm",
      dataIndex: "items",
      key: "item.quantity.total",
      render: (items) => (
        items.length
      ),
      visible: true,
      align: "center",
    },
    {
      title: "Khu vực",
      dataIndex: "area",
      key: "area",
      visible: true,
    },
    {
      title: "Kho cửa hàng",
      dataIndex: "store",
      key: "store",
      visible: true,
    },
    {
      title: "Nguồn đơn hàng",
      dataIndex: "source",
      key: "source",
      visible: true,
    },
    {
      title: "Khách đã trả",
      dataIndex: "payments",
      key: "customer.paid",
      render: (payments: Array<OrderPaymentModel>) => {
        let total = 0
        payments.forEach(payment => {
          total +=payment.amount
        })
        return (
          total
      )},
      visible: true,
    },

    {
      title: "Còn phải trả",
      key: "customer.pay",
      render: (order: OrderModel) => {
        let paid = 0
        order.payments.forEach(payment => {
          paid +=payment.amount
        })
        const missingPaid = order.total_line_amount_after_line_discount ? order.total_line_amount_after_line_discount - paid : 0
        return (
          missingPaid > 0 ? missingPaid : 0
      )},
      visible: true,
    },
    {
      title: "Phương thức thanh toán",
      dataIndex: "payments",
      key: "payments.type",
      render: (payments: Array<OrderPaymentModel>) => (
          123
          // payments.map(payment => {
          //   return (
          //     <div>{payment.payment_method}</div>
          //   )
          // })
      ),
      visible: true,
    },
    {
      title: "Nhân viên bán hàng",
      dataIndex: "assignee",
      key: "assignee",
      visible: true,
      align: "center",
    },
    {
      title: "Nhân viên tạo đơn",
      dataIndex: "account",
      key: "account",
      visible: true,
      align: "center",
    },
    {
      title: "Ngày hoàn tất đơn",
      dataIndex: "finalized_on",
      key: "finalized_on",
      visible: true,
    },
    {
      title: "Ngày huỷ đơn",
      dataIndex: "cancelled_on",
      key: "cancelled_on",
      visible: true,
    },
    {
      title: "Ghi chú nội bộ",
      dataIndex: "note",
      key: "note",
      visible: true,
    },
    {
      title: "Ghi chú của khách",
      dataIndex: "customer_note",
      key: "customer_note",
      visible: true,
    },
    {
      title: "Tag",
      dataIndex: "tags",
      key: "tags",
      visible: true,
    },
    {
      title: "Mã tham chiếu",
      dataIndex: "reference_code",
      key: "reference_code",
      visible: true,
    }
  ]);

  const onPageChange = useCallback(
    (page, size) => {
      params.page = page;
      params.limit = size;
      let queryParam = generateQuery(params);
      setPrams({ ...params });
      history.replace(`${UrlConfig.PRODUCT}?${queryParam}`);
    },
    [history, params]
  );
  const onFilter = useCallback(
    (values) => {
      let newPrams = { ...params, ...values, page: 1 };
      setPrams(newPrams);
      let queryParam = generateQuery(newPrams);
      history.push(`${UrlConfig.PRODUCT}?${queryParam}`);
    },
    [history, params]
  );
  const onMenuClick = useCallback((index: number) => {}, []);

  const setSearchResult = useCallback(
    (result: PageResponse<OrderModel>|false) => {
      console.log('result', result)
      setTableLoading(false);
      if(!!result) {
        setData(result);
      }
    },
    []
  );

  const columnFinal = useMemo(() => columns.filter((item) => item.visible === true), [columns]);
  
  useEffect(() => {
    if (isFirstLoad.current) {
      setTableLoading(true);
    }
    isFirstLoad.current = false;
    dispatch(getListOrderAction(params, setSearchResult));
  }, [dispatch, params, setSearchResult]);

  return (
    <ContentContainer
      title="Quản lý đơn hàng"
      breadcrumb={[
        {
          name: "Tổng quản",
         path: UrlConfig.HOME,
        },
        {
          name: "Danh sách đơn hàng",
        },
      ]}
      extra={<ButtonCreate path={`${UrlConfig.ORDER}/create`} />}
    >
      <Card>
        <div className="padding-20">
        <OrderFilter
          onMenuClick={onMenuClick}
          actions={actions}
          onFilter={onFilter}
          params={params}
          listStatus={listStatus}
          onShowColumnSetting={() => setShowSettingColumn(true)}
        />
        <CustomTable
          isRowSelection
          isLoading={tableLoading}
          // showColumnSetting={true}
          scroll={{ x: 4320 }}
          pagination={{
            pageSize: data.metadata.limit,
            total: data.metadata.total,
            current: data.metadata.page,
            showSizeChanger: true,
            onChange: onPageChange,
            onShowSizeChange: onPageChange,
          }}
          onShowColumnSetting={() => setShowSettingColumn(true)}
          dataSource={data.items}
          columns={columnFinal}
          rowKey={(item: OrderModel) => item.id}
          className="order-list"
        />
        </div>
      </Card>
      
      <ModalSettingColumn
          visible={showSettingColumn}
          onCancel={() => setShowSettingColumn(false)}
          onOk={(data) => {
            setShowSettingColumn(false);
            setColumn(data)
          }}
          data={columns}
        />
    </ContentContainer>
  );
};

export default ListOrderScreen;
