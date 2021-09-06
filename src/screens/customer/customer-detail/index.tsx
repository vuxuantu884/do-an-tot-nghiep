import { Form, Row, Col, Card, Space } from "antd";
import { modalActionType } from "model/modal/modal.model";
import customerShipping from "assets/icon/c-shipping.svg";
import customerRecipt from "assets/icon/c-recipt.svg";
import customerContact from "assets/icon/c-contact.svg";
import customerBuyHistory from "assets/icon/c-bag.svg";
import editIcon from "assets/icon/edit.svg";
import React from "react";
import { useDispatch } from "react-redux";
import { Link, useParams, useRouteMatch } from "react-router-dom";
import moment from "moment";
import ContentContainer from "component/container/content.container";
import UrlConfig from "config/url.config";
import { CustomerResponse } from "model/response/customer/customer.response";
import CustomerInfo from "./customer.info";
import CustomerContactInfo from "./customer-contact/customer.contact";
import CustomerShippingAddressInfo from "./customer-shipping/customer.shipping";
import CustomerShippingInfo from "./customer-billing/customer.billing";
import CustomerNoteInfo from "./customer-note/customer.note";
import CustomerHistoryInfo from "./customer.history";
import { PageResponse } from "model/base/base-metadata.response";
import { OrderModel } from "model/order/order.model";
import { useQuery } from "utils/useQuery";
import { CustomerDetail } from "domain/actions/customer/customer.action";
import { getListOrderActionFpage } from "domain/actions/order/order.action";
import { formatCurrency } from "utils/AppUtils";
import { ConvertUtcToLocalDate, DATE_FORMAT } from "utils/DateUtils";

const CustomerDetailIndex = () => {
  const tabQuery = useQuery();
  const params = useParams() as any;
  const dispatch = useDispatch();
  let { url } = useRouteMatch();
  const [customerForm] = Form.useForm();
  const [customer, setCustomer] = React.useState<CustomerResponse>();
  const [customerPointInfo, setCustomerPoint] = React.useState([]) as any;
  const [orderHistory, setOrderHistory] = React.useState<Array<OrderModel>>();
  const [modalAction, setModalAction] =
    React.useState<modalActionType>("create");
  const [customerDetailState, setCustomerDetailState] = React.useState<string>(
    tabQuery.get("tab") || "history"
  );
  // history
  const [querySearchOrder, setQuerySearchOrderFpage] = React.useState<any>({
    limit: 10,
    page: 1,
    customer_ids: null,
  });
  const [customerBuyDetail, setCustomerBuyDetail] = React.useState<any>([
    {
      name: "Tổng chi tiêu",
      value: null,
    },

    {
      name: "Ngày đầu tiên mua hàng",
      value: null,
    },
    {
      name: "Tổng đơn hàng",
      value: null,
    },
    {
      name: "Ngày cuối cùng mua hàng",
      value: null,
    },
  ]);

  const onPageChange = React.useCallback(
    (page, limit) => {
      setQuerySearchOrderFpage({ ...querySearchOrder, page, limit });
    },
    [querySearchOrder, setQuerySearchOrderFpage]
  );
  const [metaData, setMetaData] = React.useState<any>({});

  React.useEffect(() => {
    if (params?.id) {
      querySearchOrder.customer_ids = [params?.id];
      dispatch(getListOrderActionFpage(querySearchOrder, setOrderHistoryItems));
    }
  }, [params, dispatch, querySearchOrder]);

  const setOrderHistoryItems = (data: PageResponse<OrderModel> | false) => {
    if (data) {
      handlePaymentHistory(data);
      setOrderHistory(data.items);
      setMetaData(data.metadata);
    }
  };
  function handlePaymentHistory(data: any) {
    let _details: any = [];
    const _orderSorted = data.items.sort((a: any, b: any) => {
      // return  new Date(a.created_date).getTime() - new Date(b.created_date).getTime()
      return a.id - b.id;
    });
    const lastIndex = _orderSorted.length - 1;

    const _successPayment = data.items
      .filter((item: any) => item.payment_status === "paid")
      .reduce(
        (acc: any, item: any) =>
          acc + item.total_line_amount_after_line_discount,
        0
      );
    _details = [
      {
        name: "Tổng chi tiêu",
        value: formatCurrency(_successPayment),
      },

      {
        name: "Ngày đầu tiên mua hàng",
        value: ConvertUtcToLocalDate(
          _orderSorted[0].created_date,
          DATE_FORMAT.DDMMYYY
        ),
      },
      {
        name: "Tổng đơn hàng",
        value: data.metadata.total,
      },
      {
        name: "Ngày cuối cùng mua hàng",
        value: ConvertUtcToLocalDate(
          _orderSorted[lastIndex].created_date,
          DATE_FORMAT.DDMMYYY
        ),
      },
    ];
    setCustomerBuyDetail(_details);
  }
  // end

  React.useEffect(() => {
    let details: any = [];
    if (customer) {
      details = [
        { name: "Điểm hiện tại", value: null },
        {
          name: "Hạng thẻ hiện tại",
          value: null,
        },
        {
          name: "Mã số thẻ",
          value: null,
        },

        {
          name: "Ngày kích hoạt",
          value: null,
        },
        {
          name: "Ngày hết hạn",
          value: null,
        },
        {
          name: "Cửa hàng kích hoạt",
          value: null,
        },
      ];
    }
    setCustomerPoint(details);
  }, [customer, setCustomerPoint]);
  // total payment
  console.log(orderHistory);
  // first time payment

  // last time payment

  // end

  console.log(orderHistory);
  React.useEffect(() => {
    dispatch(CustomerDetail(params.id, setCustomer));
  }, [dispatch, params, setCustomer]);

  React.useEffect(() => {
    if (customer) {
      customerForm.setFieldsValue({
        ...customer,
        birthday: moment(customer.birthday, "YYYY-MM-DD"),
        wedding_date: customer.wedding_date
          ? moment(customer.wedding_date, "YYYY-MM-DD")
          : null,
      });
    }
  }, [customer, customerForm]);

  interface ShipmentButtonModel {
    name: string | null;
    value: number;
    icon: any | undefined;
    queryString: string;
  }

  const customerDetailButtons: Array<ShipmentButtonModel> = [
    {
      name: "Lịch sử mua hàng",
      value: 1,
      icon: customerBuyHistory,
      queryString: "history",
    },
    {
      name: "Thông tin liên hệ",
      value: 2,
      icon: customerContact,
      queryString: "contact",
    },
    {
      name: "Địa chỉ nhận hóa đơn",
      value: 3,
      icon: customerRecipt,
      queryString: "billing",
    },
    {
      name: "Địa chỉ giao hàng",
      value: 4,
      icon: customerShipping,
      queryString: "shipping",
    },
    {
      name: "Ghi chú",
      value: 5,
      icon: editIcon,
      queryString: "note",
    },
  ];

  return (
    <ContentContainer
      title=""
      breadcrumb={[
        {
          name: "Tổng quan",
          path: UrlConfig.HOME,
        },
        {
          name: "Khách hàng",
          path: `/customers`,
        },
        {
          name: "Chi tiết khách hàng",
        },
        {
          name: `${customer ? customer?.full_name : ""}`
        }
      ]}
    >
      <Row gutter={24} className="customer-info-detail">
        <Col span={18}>
          <CustomerInfo customer={customer} />
          <Card
            style={{ marginTop: 20 }}
            title={
              <div className="d-flex">
                <span className="title-card">THÔNG TIN MUA HÀNG</span>
              </div>
            }
            extra={[<Link to={``}>Chi tiết</Link>]}
          >
            <Row gutter={30} style={{ padding: "16px" }}>
              {customerBuyDetail &&
                customerBuyDetail.map((info: any, index: number) => (
                  <Col
                    key={index}
                    span={12}
                    style={{
                      display: "flex",
                      marginBottom: 10,
                      color: "#222222",
                    }}
                  >
                    <Col span={14}>
                      <span>{info.name}</span>
                    </Col>
                    <Col span={10}>
                      <b>: {info.value ? info.value : "---"}</b>
                    </Col>
                  </Col>
                ))}
            </Row>
          </Card>
        </Col>
        <Col span={6}>
          <Card
          className="customer-point-detail"
           style={{height: "100%"}}
            title={
              <div className="d-flex">
                <span className="title-card">THÔNG TIN TÍCH ĐIỂM</span>
              </div>
            }
          >
            <Row gutter={30} style={{ padding: "16px" }}>
              {customerPointInfo &&
                customerPointInfo.map((detail: any, index: number) => (
                  <Col
                    key={index}
                    span={24}
                    style={{
                      display: "flex",
                      marginBottom: 10,
                      color: "#222222",
                    }}
                  >
                    <Col span={14}>
                      <span>{detail.name}</span>
                    </Col>
                    <Col span={10}>
                      <b>: {detail.value ? detail.value : "---"}</b>
                    </Col>
                  </Col>
                ))}
            </Row>
          </Card>
        </Col>
      </Row>
      <Row style={{ marginTop: 20 }}>
        <Col span={24}>
          <Card style={{ padding: "16px 24px" }}>
            <div className="saleorder_shipment_method_btn">
              <Space size={10}>
                {customerDetailButtons.map((button) => (
                  <Link
                    to={`${url}?tab=${button.queryString}`}
                    key={button.value}
                  >
                    {customerDetailState !== button.queryString ? (
                      <div
                        className="saleorder_shipment_button"
                        key={button.value}
                        onClick={() =>
                          setCustomerDetailState(button.queryString)
                        }
                        style={{ padding: "10px " }}
                      >
                        <img src={button.icon} alt="icon"></img>
                        <span style={{ fontWeight: 500 }}>{button.name}</span>
                      </div>
                    ) : (
                      <div
                        className="saleorder_shipment_button_active"
                        key={button.value}
                        style={{ padding: "10px " }}
                      >
                        <img src={button.icon} alt="icon"></img>
                        <span style={{ fontWeight: 500 }}>{button.name}</span>
                      </div>
                    )}
                  </Link>
                ))}
              </Space>
            </div>

            {customerDetailState === "history" && (
              <CustomerHistoryInfo
                orderHistory={orderHistory}
                metaData={metaData}
                onPageChange={onPageChange}
              />
            )}
            {customerDetailState === "contact" && (
              <CustomerContactInfo
                customer={customer}
                customerDetailState={customerDetailState}
                setModalAction={setModalAction}
                modalAction={modalAction}
              />
            )}

            {customerDetailState === "billing" && (
              <CustomerShippingInfo
                customer={customer}
                customerDetailState={customerDetailState}
                setModalAction={setModalAction}
                modalAction={modalAction}
              />
            )}
            {customerDetailState === "shipping" && (
              <CustomerShippingAddressInfo
                customer={customer}
                customerDetailState={customerDetailState}
                setModalAction={setModalAction}
                modalAction={modalAction}
              />
            )}
            {customerDetailState === "note" && (
              <CustomerNoteInfo
                customer={customer}
                customerDetailState={customerDetailState}
                setModalAction={setModalAction}
                modalAction={modalAction}
              />
            )}
          </Card>
        </Col>
      </Row>
    </ContentContainer>
  );
};

export default CustomerDetailIndex;
