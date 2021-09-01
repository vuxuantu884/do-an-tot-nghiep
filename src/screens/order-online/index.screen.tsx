/* eslint-disable @typescript-eslint/no-unused-vars */
import { Button, Card, Row, Space, Tag } from "antd";
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
import importIcon from "assets/icon/import.svg";
import exportIcon from "assets/icon/export.svg";
import UrlConfig from "config/url.config";
import ButtonCreate from "component/header/ButtonCreate";
import ContentContainer from "component/container/content.container";
import { hideLoading, showLoading } from "domain/actions/loading.action";
import ModalSettingColumn from "component/table/ModalSettingColumn";
import { DeliveryServicesGetList, getListOrderAction } from "domain/actions/order/order.action";
import './scss/index.screen.scss'
import { DeliveryServiceResponse } from "model/response/order/order.response";
import { ConvertUtcToLocalDate } from "utils/DateUtils";
import { AccountSearchAction } from "domain/actions/account/account.action";
import { getListSourceRequest } from "domain/actions/product/source.action";
import { SourceResponse } from "model/response/order/source.response";
import { StoreResponse } from "model/core/store.model";
import { StoreGetListAction } from "domain/actions/core/store.action";
import NumberFormat from "react-number-format";
import { actionFetchListOrderProcessingStatus } from "domain/actions/settings/order-processing-status.action";
import { OrderProcessingStatusModel, OrderProcessingStatusResponseModel } from "model/response/order-processing-status.response";

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
  sub_status: [],
  fulfillment_status: [],
  payment_status: [],
  return_status: [],
  account: [],
  assignee: [],
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
  const [listSource, setListSource] = useState<Array<SourceResponse>>([]);
  const [listStore, setStore] = useState<Array<StoreResponse>>();
  const [accounts, setAccounts] = useState<Array<AccountResponse>>([]);
  const [listOrderProcessingStatus, setListOrderProcessingStatus] = useState<
    OrderProcessingStatusModel[]
  >([]);
  const [data, setData] = useState<PageResponse<OrderModel>>({
    metadata: {
      limit: 30,
      page: 1,
      total: 0,
    },
    items: [],
  });
  const [deliveryServices, setDeliveryServices] =
    useState<Array<DeliveryServiceResponse>>([]);
  const status_order = [
    {name: "Nháp", value: "draft"},
    {name: "Đóng gói", value: "packed"},
    {name: "Xuất kho", value: "shipping"},
    {name: "Đã xác nhận", value: "finalized"},
    {name: "Hoàn thành", value: "completed"},
    {name: "Kết thúc", value: "finished"},
    {name: "Đã huỷ", value: "cancelled"},
    {name: "Đã hết hạn", value: "expired"},
  ]
  const delivery_service = [
    {
      code: "ghtk",
      id: 1,
      logo: "https://yody-file.s3.ap-southeast-1.amazonaws.com/%22delivery%22/2021-07-28-03-02-12_8d45e336-6f25-4cec-9fe6-a52162839f35.svg",
      name: "Giao hàng tiết kiệm"
    },
    {
      code: "ghn",
      id: 2,
      logo: "https://yody-file.s3.ap-southeast-1.amazonaws.com/%22%22delivery%22%22/2021-07-28-03-09-37_b2a5b9d2-6061-4fbd-99ad-2804eb78d82d.png",
      name: "Giao hàng nhanh"
    },
    {
      code: "vtp",
      id: 3,
      logo: "https://yody-file.s3.ap-southeast-1.amazonaws.com/%22delivery%22/2021-07-28-03-02-12_7f5b5e68-b208-43b8-bd42-4927ffd45dd4.svg",
      name: "Viettel Post"
    },
    {
      code: "dhl",
      id: 4,
      logo: "https://yody-file.s3.ap-southeast-1.amazonaws.com/%22delivery%22/2021-07-28-03-02-12_c8c71c38-5753-4159-b8df-5643dc400c7e.svg",
      name: "DHL"
    }
  ]
  const [columns, setColumn]  = useState<Array<ICustomTableColumType<OrderModel>>>([
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      visible: true,
      fixed: 'left',
      width:"80px",
    },
    {
      title: "Khách hàng",
      dataIndex: "shipping_address",
      render: (shipping_address: any) => (
        <div className="customer">
          <div className="name">{shipping_address.name}</div>
          <div>{shipping_address.phone}</div>
          <div>{shipping_address.full_address}</div>
        </div>
      ),
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
              <div className="item" style={{textAlign: "left"}}>
                <div className="item-sku">{item.sku}</div>
                <div className="item-quantity">x {item.quantity}</div>
              </div>
            )
          })}
        </div>
      ),
      visible: true,
      align: "left",
    },
    
    {
      title: "Khách phải trả",
      dataIndex: "total_line_amount_after_line_discount",
      render: (value: number) => (
        <NumberFormat
          value={value}
          className="foo"
          displayType={"text"}
          thousandSeparator={true}
        />
      ),
      key: "customer.amount_money",
      visible: true,
    },
    {
      title: "Hình thức vận chuyển",
      dataIndex: "fulfillments",
      key: "shipment.type",
      render: (fulfillments: Array<OrderFulfillmentsModel>) => {
        const service_id = fulfillments.length && fulfillments[0].shipment ? fulfillments[0].shipment.delivery_service_provider_id : null
        const service = delivery_service.find(service => service.id === service_id)
        return(
          service && (
            <img
              src={service.logo ? service.logo : ""}
              alt=""
              style={{ width: "200px", height: "41px" }}
            />
          )
        )
      },
      visible: true,
      // width: '250px'
    },
    {
      title: "Trạng thái đơn",
      dataIndex: "status",
      key: "status",
      render: (status_value: string) => {
        const status = status_order.find(status => status.value === status_value)
        return(
          status?.name
        )
      },
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
      dataIndex: "shipping_address",
      render: (shipping_address: any) => (
          <div className="name">{`${shipping_address.ward}, ${shipping_address.district}, ${shipping_address.city}`}</div>
      ),
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
          <NumberFormat
              value={total}
              className="foo"
              displayType={"text"}
              thousandSeparator={true}
            />
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
          <NumberFormat
              value={missingPaid > 0 ? missingPaid : 0}
              className="foo"
              displayType={"text"}
              thousandSeparator={true}
            />
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
      console.log('values filter 1', values)
      let newPrams = { ...params, ...values, page: 1 };
      setPrams(newPrams);
      let queryParam = generateQuery(newPrams);
      console.log('filter start', `${UrlConfig.ORDER}/list?${queryParam}`)
      history.push(`${UrlConfig.ORDER}/list?${queryParam}`);
    },
    [history, params]
  );
  const onMenuClick = useCallback((index: number) => {}, []);

  const setSearchResult = useCallback(
    (result: PageResponse<OrderModel>|false) => {
      // console.log('result', result)
      // console.log('deliveryServices', deliveryServices)
      setTableLoading(false);
      if(!!result && !!deliveryServices) {
        setData(result);
      }
    },
    [deliveryServices]
  );
  
  // const onGetDeliverService = useCallback(
  //   (id: number|null,) => {
  //     console.log('onGetDeliverService', id,  deliveryServices)

  //     const service = deliveryServices?.find(service => service.id === id)
  //     return service?.logo
  //   },
  //   [deliveryServices]
  // );

  const columnFinal = useMemo(() => columns.filter((item) => item.visible === true), [columns]);
  
  const setDataAccounts = useCallback(
    (data: PageResponse<AccountResponse> | false) => {
      if (!data) {
        return;
      }
      setAccounts(data.items);
    },
    []
  );
  
  useEffect(() => {
    if (isFirstLoad.current) {
      dispatch(DeliveryServicesGetList(setDeliveryServices));
      // (async () => {
      //   await dispatch(DeliveryServicesGetList(setDeliveryServices));
      // })()
      setTableLoading(true);
    }
    isFirstLoad.current = false;
    setTableLoading(true);
    dispatch(getListOrderAction(params, setSearchResult));
  }, [dispatch, params, setSearchResult]);

  useEffect(() => {
    dispatch(AccountSearchAction({}, setDataAccounts));
    dispatch(getListSourceRequest(setListSource));
    dispatch(StoreGetListAction(setStore));
    dispatch(
      actionFetchListOrderProcessingStatus(
        {},
        (data: OrderProcessingStatusResponseModel) => {
          setListOrderProcessingStatus(data.items);
        }
      )
    );
  }, [dispatch, setDataAccounts]);
  
  return (
    <ContentContainer
      title="Quản lý đơn hàng"
      breadcrumb={[
        {
          name: "Tổng quan",
         path: UrlConfig.HOME,
        },
        {
          name: "Danh sách đơn hàng",
        },
      ]}
      extra={
        <Row>
          <Space>
            <Button
              type="default"
              className="light"
              size="large"
              icon={<img src={importIcon} style={{ marginRight: 8 }} alt="" />}
              onClick={() => {}}
            >
              Nhập file
            </Button>
            <Button
              type="default"
              className="light"
              size="large"
              icon={<img src={exportIcon} style={{ marginRight: 8 }} alt="" />}
              // onClick={onExport}
              onClick={() => {
                // setShowExportModal(true);
              }}
            >
              Xuất file
            </Button>
            <ButtonCreate path={`${UrlConfig.ORDER}/create`} />
          </Space>
        </Row>
      }
    >
      <Card>
        <div className="padding-20">
        <OrderFilter
          onMenuClick={onMenuClick}
          actions={actions}
          onFilter={onFilter}
          params={params}
          listSource={listSource}
          listStore={listStore}
          accounts={accounts}
          deliveryService={delivery_service}
          subStatus={listOrderProcessingStatus}
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
function setDataAccounts(arg0: {}, setDataAccounts: any): import("../../base/base.action").YodyAction {
  throw new Error("Function not implemented.");
}

