import { Form, Row, Col, Card, Tabs } from "antd";
import {
  HistoryOutlined,
  ContactsOutlined,
  CarOutlined,
  ProfileOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import { modalActionType } from "model/modal/modal.model";
import React from "react";
import { useDispatch } from "react-redux";
import { Link, useParams, useRouteMatch, useHistory } from "react-router-dom";
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

const { TabPane } = Tabs;

const CustomerDetailIndex = () => {
  const [activeTab, setActiveTab] = React.useState<string>("history");
  const params = useParams() as any;
  const dispatch = useDispatch();
  const history = useHistory();
  const [customerForm] = Form.useForm();
  const [customer, setCustomer] = React.useState<CustomerResponse>();
  const [customerPointInfo, setCustomerPoint] = React.useState([]) as any;
  const [orderHistory, setOrderHistory] = React.useState<Array<OrderModel>>();
  const [modalAction, setModalAction] =
    React.useState<modalActionType>("create");
  const [querySearchOrder, setQuerySearchOrderFpage] = React.useState<any>({
    limit: 10,
    page: 1,
    customer_ids: null,
  });

  React.useEffect(() => {
    if (history.location.hash) {
      switch (history.location.hash) {
        case "#history":
          setActiveTab("history");
          break;
        case "#contacts":
          setActiveTab("contacts");
          break;
        case "#billing":
          setActiveTab("billing");
          break;
        case "#shipping":
          setActiveTab("shipping");
          break;
        case "#notes":
          setActiveTab("notes");
          break;
      }
    }
  }, [history.location.hash]);

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
  const setOrderHistoryItems = React.useCallback(
    (data: PageResponse<OrderModel> | false) => {
      if (data) {
        handlePaymentHistory(data);
        setOrderHistory(data.items);
        setMetaData(data.metadata);
      }
    },
    []
  );
  React.useEffect(() => {
    if (params?.id) {
      querySearchOrder.customer_ids = [params?.id];
      dispatch(getListOrderActionFpage(querySearchOrder, setOrderHistoryItems));
    }
  }, [params, dispatch, querySearchOrder, setOrderHistoryItems]);

  function handlePaymentHistory(data: any) {
    let _details: any = [];
    const _orderSorted = data.items.sort((a: any, b: any) => {
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

  return (
    <ContentContainer
      title="Thông tin chi tiết"
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
          name: `${customer ? customer?.full_name : ""}`,
        },
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
            style={{ height: "100%" }}
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
      <Row className="customer-tabs-detail">
        <Col span={24}>
          <Card>
            <Tabs
              activeKey={activeTab}
              onChange={(active) =>
                history.replace(`${history.location.pathname}#${active}`)
              }
            >
              <TabPane
                tab={
                  <span>
                    <HistoryOutlined />
                    Lịch sử mua hàng
                  </span>
                }
                key="history"
              >
                <CustomerHistoryInfo
                  orderHistory={orderHistory}
                  metaData={metaData}
                  onPageChange={onPageChange}
                />
              </TabPane>
              <TabPane
                tab={
                  <span>
                    <ContactsOutlined />
                    Thông tin liên hệ
                  </span>
                }
                key="contacts"
              >
                <CustomerContactInfo
                  customer={customer}
                  customerDetailState={activeTab}
                  setModalAction={setModalAction}
                  modalAction={modalAction}
                />
              </TabPane>
              <TabPane
                tab={
                  <span>
                    <FileTextOutlined />
                    Địa chỉ nhận hóa đơn
                  </span>
                }
                key="billing"
              >
                <CustomerShippingInfo
                  customer={customer}
                  customerDetailState={activeTab}
                  setModalAction={setModalAction}
                  modalAction={modalAction}
                />
              </TabPane>
              <TabPane
                tab={
                  <span>
                    <CarOutlined />
                    Địa chỉ giao hàng
                  </span>
                }
                key="shipping"
              >
                <CustomerShippingAddressInfo
                  customer={customer}
                  customerDetailState={activeTab}
                  setModalAction={setModalAction}
                  modalAction={modalAction}
                />
              </TabPane>
              <TabPane
                tab={
                  <span>
                    <ProfileOutlined />
                    Ghi chú
                  </span>
                }
                key="notes"
              >
                <CustomerNoteInfo
                  customer={customer}
                  customerDetailState={activeTab}
                  setModalAction={setModalAction}
                  modalAction={modalAction}
                />
              </TabPane>
            </Tabs>
          </Card>
        </Col>
      </Row>
    </ContentContainer>
  );
};

export default CustomerDetailIndex;
