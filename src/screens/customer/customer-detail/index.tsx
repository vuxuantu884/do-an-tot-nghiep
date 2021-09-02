import { Form, Row, Col, Button, Card, Space, Dropdown, Menu } from "antd";
import { modalActionType } from "model/modal/modal.model";
import threeDot from "assets/icon/three-dot.svg";
import editIcon from "assets/icon/edit.svg";
import deleteIcon from "assets/icon/deleteIcon.svg";
import customerShipping from "assets/icon/c-shipping.svg";
import customerRecipt from "assets/icon/c-recipt.svg";
import customerContact from "assets/icon/c-contact.svg";
import customerBuyHistory from "assets/icon/c-bag.svg";
import { CustomerDetail } from "domain/actions/customer/customer.action";
import React from "react";
import { useDispatch } from "react-redux";
import { Link, useParams } from "react-router-dom";
import moment from "moment";
import ContentContainer from "component/container/content.container";
import UrlConfig from "config/url.config";
import { AccountResponse } from "model/account/account.model";
import { PageResponse } from "model/base/base-metadata.response";
import { AccountSearchAction } from "domain/actions/account/account.action";
import { CustomerResponse } from "model/response/customer/customer.response";
import CustomerInfo from "./customer.info";
import CustomerContactInfo from "./customer.contact";
import CustomerShippingAddressInfo from "./customer.shipping";
import CustomerShippingInfo from "./customer.billing";

const CustomerEdit = (props: any) => {
  const params = useParams() as any;
  const dispatch = useDispatch();
  const [customerForm] = Form.useForm();
  const [customer, setCustomer] = React.useState<CustomerResponse>();
  const [customerPointInfo, setCustomerPoint] = React.useState([]) as any;
  const [customerBuyDetail, setCustomerBuyDetail] = React.useState([]) as any;
  const setDataAccounts = React.useCallback(
    (data: PageResponse<AccountResponse> | false) => {
      if (!data) {
        return;
      }
    },
    []
  );

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

  const actionColumn = (handleEdit: any, handleDelete: any) => {
    const _actionColumn = {
      title: "",
      visible: true,
      width: "5%",
      className: "saleorder-product-card-action ",
      render: (l: any, item: any, index: number) => {
        const menu = (
          <Menu className="yody-line-item-action-menu saleorders-product-dropdown">
            <Menu.Item key="1">
              <Button
                icon={<img style={{ marginRight: 12 }} alt="" src={editIcon} />}
                type="text"
                className=""
                style={{
                  paddingLeft: 24,
                  background: "transparent",
                  border: "none",
                }}
                onClick={handleEdit}
              >
                Chỉnh sửa
              </Button>
            </Menu.Item>
            {customerDetailState !== 2 && (
              <Menu.Item key="2">
                <Button
                  icon={
                    <img style={{ marginRight: 12 }} alt="" src={deleteIcon} />
                  }
                  type="text"
                  className=""
                  style={{
                    paddingLeft: 24,
                    background: "transparent",
                    border: "none",
                    color: "red",
                  }}
                  onClick={handleDelete}
                >
                  Xóa
                </Button>
              </Menu.Item>
            )}
          </Menu>
        );
        return (
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "0 4px",
            }}
          >
            <div
              className="site-input-group-wrapper saleorder-input-group-wrapper"
              style={{
                borderRadius: 5,
              }}
            >
              <Dropdown
                overlay={menu}
                trigger={["click"]}
                placement="bottomRight"
              >
                <Button
                  type="text"
                  className="p-0 ant-btn-custom"
                  icon={<img src={threeDot} alt=""></img>}
                ></Button>
              </Dropdown>
            </div>
          </div>
        );
      },
    };
    return _actionColumn;
  };

  // shiping column

  React.useEffect(() => {
    let details: any = [];
    if (customer) {
      details = [
        { name: "Tổng chi tiêu", value: null },

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
      ];
    }
    setCustomerBuyDetail(details);
  }, [customer, setCustomerBuyDetail]);

  React.useEffect(() => {
    dispatch(AccountSearchAction({}, setDataAccounts));
  }, [dispatch, setDataAccounts]);

  React.useEffect(() => {
    dispatch(CustomerDetail(params.id, setCustomer));
  }, [dispatch, params]);
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

  const [modalAction, setModalAction] =
    React.useState<modalActionType>("create");
  const [customerDetailState, setCustomerDetailState] =
    React.useState<number>(1);

  interface ShipmentButtonModel {
    name: string | null;
    value: number;
    icon: any | undefined;
  }

  const customerDetailButtons: Array<ShipmentButtonModel> = [
    {
      name: "Lịch sử mua hàng",
      value: 1,
      icon: customerBuyHistory,
    },
    {
      name: "Thông tin liên hệ",
      value: 2,
      icon: customerContact,
    },
    {
      name: "Địa chỉ nhận hóa đơn",
      value: 3,
      icon: customerRecipt,
    },
    {
      name: "Địa chỉ giao hàng",
      value: 4,
      icon: customerShipping,
    },
    {
      name: "Ghi chú",
      value: 5,
      icon: customerShipping,
    },
  ];

  // add contact

  console.log(customer);

  return (
    <ContentContainer
      title={customer ? customer.full_name : ""}
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
      ]}
    >
      <Row gutter={24}>
        <Col span={18}>
          <CustomerInfo customer={customer} />
          <Card
            style={{ marginTop: 16 }}
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
                      marginBottom: 20,
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
                      marginBottom: 20,
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
      <Row style={{ marginTop: 16 }}>
        <Col span={24}>
          <Card style={{ padding: "16px 24px" }}>
            <div className="saleorder_shipment_method_btn">
              <Space size={10}>
                {customerDetailButtons.map((button) => (
                  <div key={button.value}>
                    {customerDetailState !== button.value ? (
                      <div
                        className="saleorder_shipment_button"
                        key={button.value}
                        onClick={() => setCustomerDetailState(button.value)}
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
                  </div>
                ))}
              </Space>
            </div>
            {customerDetailState === 2 && (
              <CustomerContactInfo
                customer={customer}
                customerDetailState={customerDetailState}
                setModalAction={setModalAction}
                modalAction={modalAction}
              />
            )}

            {customerDetailState === 4 && (
              <CustomerShippingAddressInfo
                customer={customer}
                customerDetailState={customerDetailState}
                setModalAction={setModalAction}
                modalAction={modalAction}
              />
            )}
            {customerDetailState === 3 && (
              <CustomerShippingInfo
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

export default CustomerEdit;
