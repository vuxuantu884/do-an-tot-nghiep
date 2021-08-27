/* eslint-disable @typescript-eslint/no-unused-vars */
import { Button, Card, Tag } from "antd";
import { MenuAction } from "component/table/ActionButton";
import { PageResponse } from "model/base/base-metadata.response";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Link, useHistory } from "react-router-dom";
import { generateQuery } from "utils/AppUtils";
import { getQueryParams, useQuery } from "utils/useQuery";
import { useDispatch, useSelector } from "react-redux";
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
import { DeliveryServicesGetList, getListOrderAction } from "domain/actions/order/order.action";
import './scss/index.screen.scss'
import { DeliveryServiceResponse } from "model/response/order/order.response";
import { ConvertUtcToLocalDate } from "utils/DateUtils";

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
  page: 1,
  limit: 30,
  sort_type: null,
  sort_column: null,
  code: null,
  store_ids: [],
  source_ids: [],
  issued_on_min: null,
  issued_on_max: null,
  issued_on_predefined: null,
  finalized_on_min: null,
  finalized_on_max: null,
  finalized_on_predefined: null,
  ship_on_min: null,
  ship_on_max: null,
  ship_on_predefined: null,
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
  fulfillment_status: [],
  payment_status: [],
  return_status: [],
  account: undefined,
  assignee: undefined,
  price_min: undefined,
  price_max: undefined,
  payment_method_ids: [],
  ship_by: null,
  note: null,
  customer_note: null,
  tags: [],
  reference_code: null
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
  const [deliveryServices, setDeliveryServices] =
    useState<Array<DeliveryServiceResponse> | null>(null);
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
              <div className="item">
                <div className="item-sku">{item.sku}</div>
                <div className="item-quantity">{item.quantity}</div>
              </div>
            )
          })}
        </div>
      ),
      visible: true,
      align: "center",
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
      render: (fulfillments: Array<OrderFulfillmentsModel>) => {
        // const service_id = fulfillments && fulfillments[0].shipment ? fulfillments[0].shipment.delivery_service_provider_id : null
        // const service = deliveryServices ? deliveryServices.find(service => service.id === service_id) : null
        return(
          <div></div>
          // service && (
          //   <img
          //     src={service.logo ? service.logo : ""}
          //     alt=""
          //     style={{ width: "184px", height: "41px" }}
          //   />
          // )
        )
    },
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
      key: "packed_status",
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
      key: "received_status",
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
      key: "payment_status",
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
      key: "return_status",
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
          payments.map(payment => {
            return (
              <Tag>{payment.payment_method}</Tag>
            )
          })
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
      render: (value: string) => <div>{ConvertUtcToLocalDate(value)}</div>,
      key: "finalized_on",
      visible: true,
    },
    {
      title: "Ngày huỷ đơn",
      dataIndex: "cancelled_on",
      render: (value: string) => <div>{ConvertUtcToLocalDate(value)}</div>,
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
      history.replace(`${UrlConfig.ORDER}/list?${queryParam}`);
    },
    [history, params]
  );
  const onFilter = useCallback(
    (values) => {
      console.log('values', values)
      let newPrams = {
        ...params,
        ...values,
        page: 1,
      };
      
      setPrams(newPrams);
      let queryParam = generateQuery({
        ...newPrams,
        issued: null,
        ship: null,
        completed: null,
        cancelled: null
      });
      console.log('filter start', `${UrlConfig.ORDER}/list?${queryParam}`)
      history.push(`${UrlConfig.ORDER}/list?${queryParam}`);
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
      // dispatch(DeliveryServicesGetList(setDeliveryServices));
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
