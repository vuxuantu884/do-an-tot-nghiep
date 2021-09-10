import { Row, Col, Card, Tabs } from "antd";
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
import { Link, useParams, useHistory } from "react-router-dom";
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
import { CustomerDetail } from "domain/actions/customer/customer.action";
import { GetListOrderCustomerAction } from "domain/actions/order/order.action";
// import { formatCurrency } from "utils/AppUtils";
// import { ConvertUtcToLocalDate, DATE_FORMAT } from "utils/DateUtils";

const { TabPane } = Tabs;

const CustomerDetailIndex = () => {
  const [activeTab, setActiveTab] = React.useState<string>("history");
  const params: any = useParams();
  const dispatch = useDispatch();
  const history = useHistory();
  const [customer, setCustomer] = React.useState<CustomerResponse>();
  const [customerPointInfo, setCustomerPoint] = React.useState<any>([]);
  const [modalAction, setModalAction] =
    React.useState<modalActionType>("create");

  const [queryParams, setQueryParams] = React.useState<any>({
    limit: 10,
    page: 1,
    customer_ids: null,
  });
  const [data, setData] = React.useState<PageResponse<OrderModel>>({
    metadata: {
      limit: 10,
      page: 1,
      total: 0,
    },
    items: [],
  });

  console.log(data)
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

  const [customerBuyDetail] = React.useState<any>([
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
      setQueryParams({ ...queryParams, page, limit });
    },
    [queryParams, setQueryParams]
  )

  const setOrderHistoryItems = React.useCallback(
    (data: PageResponse<OrderModel> | false) => {
      if (data) {
        setData(data);
      }
    },
    []
  );
  React.useEffect(() => {
    if (params?.id) {
      queryParams.customer_ids = [params?.id];
      dispatch(GetListOrderCustomerAction(queryParams, setOrderHistoryItems));
    }
  }, [params, dispatch, queryParams, setOrderHistoryItems]);

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
            extra={[
              <Link key="1" to={``}>
                Chi tiết
              </Link>,
            ]}
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
                  orderData={data}
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
