import {
  Input,
  Form,
  Row,
  Col,
  DatePicker,
  Select,
  Button,
  Card,
  Collapse,
  Tag,
  Space,
} from "antd";
import { CountryGetAllAction } from "domain/actions/content/content.action";
import CustomTable from "component/table/CustomTable";
import { ICustomTableColumType } from "component/table/CustomTable";
import { PlusOutlined } from "@ant-design/icons";
import { modalActionType } from "model/modal/modal.model";
import CustomModal from "component/modal/CustomModal";
import delivery from "../../assets/icon/delivery.svg";
import people from "../../assets/icon/people.svg";

import {
  CustomerDetail,
  CustomerGroups,
  CustomerLevels,
  CustomerTypes,
  UpdateCustomer,
  CreateContact,
  UpdateContact,
  DeleteContact,
  CreateBillingAddress,
  CreateShippingAddress,
  DeleteBillingAddress,
  DeleteShippingAddress,
  UpdateBillingAddress,
  UpdateShippingAddress,
} from "domain/actions/customer/customer.action";
import { CountryResponse } from "model/content/country.model";
import React from "react";
import { useDispatch } from "react-redux";
import { Link, useHistory, useParams } from "react-router-dom";
import "./customer.scss";
import moment from "moment";
import { showSuccess, showError } from "utils/ToastUtils";
import ContentContainer from "component/container/content.container";
import UrlConfig from "config/UrlConfig";
import { AccountResponse } from "model/account/account.model";
import { PageResponse } from "model/base/base-metadata.response";
import { AccountSearchAction } from "domain/actions/account/account.action";
import {
  contact,
  CustomerResponse,
  shippingAddress,
  billingAddress,
} from "model/response/customer/customer.response";
import {
  CustomerContact,
  CustomerShippingAddress,
  CustomerBillingAddress,
} from "model/request/customer.request";
import FormCustomerContact from "component/forms/FormCustomerContact";
import FormCustomerShippingAddress from "component/forms/FormCustomerShippingAddress";
import FormCustomerBillingAddress from "component/forms/FormCustomerBillingAddress";

const { Panel } = Collapse;
const { Option } = Select;

const CustomerEdit = (props: any) => {
  const params = useParams() as any;
  const [customerForm] = Form.useForm();
  const history = useHistory();
  const dispatch = useDispatch();
  const [customer, setCustomer] = React.useState<CustomerResponse>();
  const [groups, setGroups] = React.useState<Array<any>>([]);
  const [types, setTypes] = React.useState<Array<any>>([]);
  const [levels, setLevels] = React.useState<Array<any>>([]);
  const [countries, setCountries] = React.useState<Array<CountryResponse>>([]);
  const [companies, setCompanies] = React.useState<Array<any>>([]);
  const [accounts, setAccounts] = React.useState<Array<AccountResponse>>([]);
  const [customerDetail, setCustomerDetail] = React.useState([]) as any;
  const [customerDetailCollapse, setCustomerDetailCollapse] = React.useState(
    []
  ) as any;
  const [customerPointInfo, setCustomerPoint] = React.useState([]) as any;
  const [customerBuyDetail, setCustomerBuyDetail] = React.useState([]) as any;

  const setDataAccounts = React.useCallback(
    (data: PageResponse<AccountResponse> | false) => {
      if (!data) {
        return;
      }
      setAccounts(data.items);
    },
    []
  );
  React.useEffect(() => {
    let details: any = [];
    if (customer) {
      details = [
        { name: "Họ tên khách hàng", value: customer.full_name },

        {
          name: "Giới tính",
          value: customer.gender === "male" ? "Nam" : "Nữ",
        },
        {
          name: "Số điện thoại",
          value: customer.phone,
        },
        {
          name: "Loại khách hàng",
          value: customer.customer_type,
        },
        {
          name: "Ngày sinh",
          value: moment(customer.birthday).format("DD/MM/YYYY"),
        },
        {
          name: "Nhóm khách hàng",
          value: customer.customer_group,
        },
      ];
    }
    setCustomerDetail(details);
  }, [customer, setCustomerDetail]);

  React.useEffect(() => {
    let details: any = [];
    if (customer) {
      details = [
        // {
        //   name: "Giới tính",
        //   value: customer.gender === "male" ? "Nam" : "Nữ",
        // },
        {
          name: "Nhân viên phụ trách",
          value: customer.responsible_staff_code,
        },
        {
          name: "Email",
          value: customer.email,
        },
        {
          name: "Mã khách hàng",
          value: customer.code,
        },
        {
          name: "Ngày cưới",
          value: moment(customer.wedding_date).format("DD/MM/YYYY"),
        },
        {
          name: "Website/Facebook",
          value: customer.website,
        },
        {
          name: "Đơn vị",
          value: customer.company,
        },
        {
          name: "Mã số thuế",
          value: customer.tax_code,
        },
        {
          name: "Địa chỉ",
          value: customer.full_address,
        },
        {
          name: "Ghi chú",
          value: customer.description,
        },
      ];
    }
    setCustomerDetailCollapse(details);
  }, [customer, setCustomerDetailCollapse]);
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
  // contact column
  const columns: Array<ICustomTableColumType<contact>> = [
    {
      title: "Tiêu đề",
      dataIndex: "title",
      visible: true,
      width: "20%",
    },
    {
      title: "Tên người liên hệ",
      dataIndex: "name",
      visible: true,
      width: "20%",
    },

    {
      title: "Email",
      dataIndex: "email",
      visible: true,
      width: "20%",
    },

    {
      title: "Số điện thoại",
      dataIndex: "phone",
      visible: true,
      width: "20%",
    },
    {
      title: "Ghi chú",
      dataIndex: "note",
      visible: true,
      width: "20%",
      render: (value, row, index) => {
        return (
          <span className="text" title={value} style={{ color: "#666666" }}>
            {value}
          </span>
        );
      },
    },
  ];
  // shiping column

  const shippingColumns: Array<ICustomTableColumType<shippingAddress>> = [
    {
      title: "Họ tên người nhận",
      dataIndex: "name",
      align: "center",
      visible: true,
      width: "15%",
    },
    {
      title: "Số điện thoại",
      dataIndex: "phone",align: "center",
      visible: true,
      width: "15%",
    },
    {
      title: "Quốc gia",
      dataIndex: "country",align: "center",
      visible: true,
      width: "10%",
    },
    {
      title: "Tỉnh/TP",
      dataIndex: "city",align: "center",
      visible: true,
      width: "10%",
    },
    {
      title: "Quận/Huyện",
      dataIndex: "district",align: "center",
      visible: true,
      width: "10%",
    },
    {
      title: "Phường/Xã",
      dataIndex: "ward",align: "center",
      visible: true,
      width: "10%",
    },
    {
      title: "Địa chỉ chi tiết",
      dataIndex: "full_address",align: "center",
      visible: true,
      width: "20%",
      render: (value, row, index) => {
        return (
          <span className="text" title={value} style={{ color: "#666666" }}>
            {value}
          </span>
        );
      },
    },
    {
      title: "",
      dataIndex: "default",align: "center",
      visible: true,
      width: "10%",
      render: (l: shippingAddress, item: any, index: number) => {
        return item.default && <div style={{ color: "#2a2a86" }}>Mặc định</div>;
      },
    },
  ];
  // billing columns
  const billingColumns: Array<ICustomTableColumType<billingAddress>> = [
    {
      title: "Họ tên người nhận",
      dataIndex: "name",align: "center",
      visible: true,
      width: "10%",
    },
    {
      title: "Số điện thoại",
      dataIndex: "phone",align: "center",
      visible: true,
      width: "10%",
    },
    {
      title: "Email",
      dataIndex: "email",align: "center",
      visible: true,
      width: "10%",
    },
    {
      title: "Mã số thuế",
      dataIndex: "tax_code",align: "center",
      visible: true,
      width: "10%",
    },
    {
      title: "Quốc gia",
      dataIndex: "country",align: "center",
      visible: true,
      width: "10%",
    },
    {
      title: "Tỉnh/TP",
      dataIndex: "city",align: "center",
      visible: true,
      width: "10%",
    },
    {
      title: "Quận/Huyện",
      dataIndex: "district",align: "center",
      visible: true,
      width: "10%",
    },
    {
      title: "Phường/Xã",
      dataIndex: "ward",align: "center",
      visible: true,
      width: "10%",
    },
    {
      title: "Địa chỉ chi tiết",
      dataIndex: "full_address",align: "center",
      visible: true,
      width: "15%",
      render: (value, row, index) => {
        return (
          <span className="text" title={value} style={{ color: "#666666" }}>
            {value}
          </span>
        );
      },
    },
    {
      title: "",
      dataIndex: "default",align: "center",
      visible: true,
      width: "10%",
      render: (l: shippingAddress, item: any, index: number) => {
        return item.default && <div style={{ color: "#2a2a86" }}>Mặc định</div>;
      },
    },
  ];

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
    dispatch(CustomerGroups(setGroups));
    dispatch(CountryGetAllAction(setCountries));
    dispatch(CustomerTypes(setTypes));
    dispatch(CustomerLevels(setLevels));
  }, [dispatch]);
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

  const columnFinal = () => columns.filter((item) => item.visible === true);
  const shippingColumnFinal = () =>
    shippingColumns.filter((item) => item.visible === true);
  const billingColumnFinal = () =>
    billingColumns.filter((item) => item.visible === true);

  const [modalSingleContact, setModalSingleContact] =
    React.useState<CustomerContact>();
  const [modalSingleShippingAddress, setModalShippingAddress] =
    React.useState<CustomerShippingAddress>();
  const [modalSingleBillingAddress, setModalBillingAddress] =
    React.useState<CustomerBillingAddress>();

  const [modalAction, setModalAction] =
    React.useState<modalActionType>("create");
  const [isShowModalShipping, setIsShowModalShipping] = React.useState(false);
  const [isShowModalBilling, setIsShowModalBilling] = React.useState(false);
  const [isShowModalContacts, setIsShowModalContacts] = React.useState(false);
  const [customerDetailState, setCustomerDetailState] =
    React.useState<number>(1);
  interface ShipmentButtonModel {
    name: string | null;
    value: number;
    icon: any | undefined;
  }

  const customerDetailButtons: Array<ShipmentButtonModel> = [
    {
      name: "Thông tin liên hệ",
      value: 1,
      icon: people,
    },
    {
      name: "Địa chỉ giao hàng",
      value: 2,
      icon: delivery,
    },
    {
      name: "Địa chỉ nhận hóa đơn",
      value: 3,
      icon: delivery,
    },
  ];

  // add contact
  const handleContactForm = {
    create: (formValue: CustomerContact) => {
      if (customer)
        dispatch(
          CreateContact(customer.id, formValue, (data: contact) => {
            setIsShowModalContacts(false);
            gotoFirstPage(customer.id);
            data
              ? showSuccess("Tạo mới liên hệ thành công")
              : showError("Tạo mới liên hệ thất bại");
          })
        );
    },
    edit: (formValue: CustomerContact) => {
      console.log(formValue);
      if (modalSingleContact) {
        if (customer)
          dispatch(
            UpdateContact(
              modalSingleContact.id,
              customer.id,
              formValue,
              (data: contact) => {
                setIsShowModalContacts(false);
                gotoFirstPage(customer.id);
                data
                  ? showSuccess("Cập nhật liên hệ thành công")
                  : showError("Cập nhật liên hệ thất bại");
              }
            )
          );
      }
    },
    delete: () => {
      if (modalSingleContact) {
        if (customer)
          dispatch(
            DeleteContact(
              modalSingleContact.id,
              customer.id,
              (data: contact) => {
                setIsShowModalContacts(false);
                gotoFirstPage(customer.id);
                data
                  ? showSuccess("Xóa liên hệ thành công")
                  : showError("Xóa liên hệ thất bại");
              }
            )
          );
      }
    },
  };
  // add shipping

  const handleShippingAddressForm = {
    create: (formValue: CustomerShippingAddress) => {
      if (customer)
        dispatch(
          CreateShippingAddress(
            customer.id,
            formValue,
            (data: shippingAddress) => {
              setIsShowModalShipping(false);
              gotoFirstPage(customer.id);
              data
                ? showSuccess("Thêm mới địa chỉ thành công")
                : showError("Thêm mới địa chỉ thất bại");
            }
          )
        );
    },
    edit: (formValue: CustomerShippingAddress) => {
      if (modalSingleShippingAddress) {
        if (customer)
          dispatch(
            UpdateShippingAddress(
              modalSingleShippingAddress.id,
              customer.id,
              formValue,
              (data: shippingAddress) => {
                setIsShowModalShipping(false);
                gotoFirstPage(customer.id);
                data
                  ? showSuccess("Cập nhật địa chỉ thành công")
                  : showError("Cập nhật địa chỉ thất bại");
              }
            )
          );
      }
    },
    delete: () => {
      if (modalSingleShippingAddress) {
        if (customer)
          dispatch(
            DeleteShippingAddress(
              modalSingleShippingAddress.id,
              customer.id,
              (data: shippingAddress) => {
                setIsShowModalShipping(false);
                gotoFirstPage(customer.id);
                data
                  ? showSuccess("Xóa địa chỉ thành công")
                  : showError("Xóa địa chỉ thất bại");
              }
            )
          );
      }
    },
  };
  // handle billing
  const handleBillingAddressForm = {
    create: (formValue: CustomerBillingAddress) => {
      if (customer)
        dispatch(
          CreateBillingAddress(
            customer.id,
            formValue,
            (data: billingAddress) => {
              setIsShowModalBilling(false);
              gotoFirstPage(customer.id);
              data
                ? showSuccess("Thêm mới địa chỉ thành công")
                : showError("Thêm mới địa chỉ thất bại");
            }
          )
        );
    },
    edit: (formValue: CustomerBillingAddress) => {
      if (modalSingleBillingAddress) {
        if (customer)
          dispatch(
            UpdateBillingAddress(
              modalSingleBillingAddress.id,
              customer.id,
              formValue,
              (data: billingAddress) => {
                setIsShowModalBilling(false);
                gotoFirstPage(customer.id);
                data
                  ? showSuccess("Cập nhật địa chỉ thành công")
                  : showError("Cập nhật địa chỉ thất bại");
              }
            )
          );
      }
    },
    delete: () => {
      if (modalSingleBillingAddress) {
        if (customer)
          dispatch(
            DeleteBillingAddress(
              modalSingleBillingAddress.id,
              customer.id,
              (data: billingAddress) => {
                setIsShowModalBilling(false);
                gotoFirstPage(customer.id);
                data
                  ? showSuccess("Xóa địa chỉ thành công")
                  : showError("Xóa địa chỉ thất bại");
              }
            )
          );
      }
    },
  };
  // end
  const gotoFirstPage = (customerId: any) => {
    history.replace(`${UrlConfig.CUSTOMER}/` + customerId);
    window.scrollTo(0, 0);
  };

  const addContact = () => {
    return (
      <Button
        type="primary"
        className="ant-btn-primary"
        size="large"
        onClick={() => {
          setModalAction("create");
          setIsShowModalContacts(true);
        }}
        icon={<PlusOutlined />}
      >
        Thêm mới liên hệ
      </Button>
    );
  };
  console.log(customer);
  const addShippingAddress = () => {
    return (
      <Button
        type="primary"
        className="ant-btn-primary"
        size="large"
        onClick={() => {
          setModalAction("create");
          setIsShowModalShipping(true);
        }}
        icon={<PlusOutlined />}
      >
        Thêm mới địa chỉ giao hàng
      </Button>
    );
  };
  const addBillingAddress = () => {
    return (
      <Button
        type="primary"
        className="ant-btn-primary"
        size="large"
        onClick={() => {
          setModalAction("create");
          setIsShowModalBilling(true);
        }}
        icon={<PlusOutlined />}
      >
        Thêm mới địa chỉ nhận hóa đơn
      </Button>
    );
  };
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
          <Card
            className="customer-information-card"
            title={
              <div style={{ display: "flex", alignItems: "center" }}>
                <span className="title-card">THÔNG TIN CÁ NHÂN</span>
                {customer && customer.status === "active" ? (
                  <Tag
                    className="orders-tag"
                    style={{
                      marginLeft: 10,
                      backgroundColor: "#27AE60",
                      color: "#ffffff",
                      fontSize: 12,
                      fontWeight: 400,
                      marginBottom: 6,
                    }}
                  >
                    Đang hoạt động
                  </Tag>
                ) : (
                  <Tag
                    className="orders-tag"
                    style={{
                      marginLeft: 10,
                      backgroundColor: "#aaaaaa",
                      color: "#ffffff",
                      fontSize: 12,
                      fontWeight: 400,
                      marginBottom: 6,
                    }}
                  >
                    Không hoạt động
                  </Tag>
                )}
              </div>
            }
            extra={[<Link to={`/customers/edit/${params.id}`}>Cập nhật</Link>]}
          >
            <Row style={{ padding: "16px 30px" }}>
              {customerDetail &&
                customerDetail.map((detail: any, index: number) => (
                  <Col
                    key={index}
                    span={12}
                    style={{
                      display: "flex",
                      marginBottom: 20,
                      color: "#222222",
                    }}
                  >
                    <Col span={12}>
                      <span>{detail.name}</span>
                    </Col>
                    <Col span={12}>
                      <b>: {detail.value ? detail.value : "---"}</b>
                    </Col>
                  </Col>
                ))}
              <Col span={24}>
                <Collapse ghost>
                  <Panel
                    key="1"
                    header={[
                      <span style={{ color: "#5656A1" }}>Xem thêm</span>,
                    ]}
                  >
                    <Row>
                      {customerDetailCollapse &&
                        customerDetailCollapse.map(
                          (detail: any, index: number) => (
                            <Col
                              key={index}
                              span={12}
                              style={{
                                display: "flex",
                                marginBottom: 20,
                                color: "#222222",
                              }}
                            >
                              <Col span={12}>
                                <span>{detail.name}</span>
                              </Col>
                              <Col span={12}>
                                <b>: {detail.value ? detail.value : "---"}</b>
                              </Col>
                            </Col>
                          )
                        )}
                    </Row>
                  </Panel>
                </Collapse>
              </Col>
            </Row>
          </Card>
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
                      >
                        <img src={button.icon} alt="icon"></img>
                        <span>{button.name}</span>
                      </div>
                    ) : (
                      <div
                        className="saleorder_shipment_button_active"
                        key={button.value}
                      >
                        <img src={button.icon} alt="icon"></img>
                        <span>{button.name}</span>
                      </div>
                    )}
                  </div>
                ))}
              </Space>
            </div>
            {customerDetailState === 1 && (
              <Row>
                <div
                  style={{
                    padding: "0 16px 10px 0",
                    display: "flex",
                    justifyContent: "flex-end",
                    width: "100%",
                  }}
                >
                  {addContact()}
                </div>
                <Col span={24}>
                  <CustomTable
                    showColumnSetting={false}
                    // scroll={{ x: 1080 }}
                    pagination={{
                      pageSize: customer
                        ? customer.contacts
                          ? customer.contacts.length
                          : 0
                        : 0,
                      total: customer
                        ? customer.contacts
                          ? customer.contacts.length
                          : 0
                        : 0,
                      current: 1,
                      showSizeChanger: true,
                      // onChange: onPageChange,
                      // onShowSizeChange: onPageChange,
                    }}
                    dataSource={customer ? customer.contacts : []}
                    columns={columnFinal()}
                    rowKey={(item: contact) => item.id}
                    onRow={(record: CustomerContact) => {
                      return {
                        onClick: (event) => {
                          console.log(record);
                          setModalSingleContact(record);
                          setModalAction("edit");
                          setIsShowModalContacts(true);
                        }, // click row
                      };
                    }}
                  />
                  <CustomModal
                    visible={isShowModalContacts}
                    onCreate={(formValue: CustomerContact) =>
                      handleContactForm.create(formValue)
                    }
                    onEdit={(formValue: CustomerContact) =>
                      handleContactForm.edit(formValue)
                    }
                    onDelete={() => handleContactForm.delete()}
                    onCancel={() => setIsShowModalContacts(false)}
                    modalAction={modalAction}
                    modalTypeText="Địa chỉ liên hệ"
                    componentForm={FormCustomerContact}
                    formItem={modalSingleContact}
                    deletedItemTitle={modalSingleContact?.name}
                  />
                </Col>
              </Row>
            )}

            {customerDetailState === 2 && (
              <Row>
                <div
                  style={{
                    padding: "0 16px 10px 0",
                    display: "flex",
                    justifyContent: "flex-end",
                    width: "100%",
                  }}
                >
                  {addShippingAddress()}
                </div>
                <Col span={24}>
                  <CustomTable
                    showColumnSetting={false}
                    // scroll={{ x: 1080 }}
                    pagination={{
                      pageSize: customer
                        ? customer.shipping_addresses
                          ? customer.shipping_addresses.length
                          : 0
                        : 0,
                      total: customer
                        ? customer.shipping_addresses
                          ? customer.shipping_addresses.length
                          : 0
                        : 0,
                      current: 1,
                      showSizeChanger: true,
                      // onChange: onPageChange,
                      // onShowSizeChange: onPageChange,
                    }}
                    dataSource={customer ? customer.shipping_addresses : []}
                    columns={shippingColumnFinal()}
                    rowKey={(item: shippingAddress) => item.id}
                    onRow={(record: CustomerShippingAddress) => {
                      return {
                        onClick: (event) => {
                          console.log(record);
                          setModalShippingAddress(record);
                          setModalAction("edit");
                          setIsShowModalShipping(true);
                        }, // click row
                      };
                    }}
                  />
                  <CustomModal
                    visible={isShowModalShipping}
                    onCreate={(formValue: CustomerShippingAddress) =>
                      handleShippingAddressForm.create(formValue)
                    }
                    onEdit={(formValue: CustomerShippingAddress) =>
                      handleShippingAddressForm.edit(formValue)
                    }
                    onDelete={() => handleShippingAddressForm.delete()}
                    onCancel={() => setIsShowModalShipping(false)}
                    modalAction={modalAction}
                    modalTypeText="Địa chỉ giao hàng"
                    componentForm={FormCustomerShippingAddress}
                    formItem={modalSingleShippingAddress}
                    deletedItemTitle={modalSingleShippingAddress?.name}
                  />
                </Col>
              </Row>
            )}
            {customerDetailState === 3 && (
              <Row>
                <div
                  style={{
                    padding: "0 16px 10px 0",
                    display: "flex",
                    justifyContent: "flex-end",
                    width: "100%",
                  }}
                >
                  {addBillingAddress()}
                </div>
                <Col span={24}>
                  <CustomTable
                    showColumnSetting={false}
                    // scroll={{ x: 1080 }}
                    pagination={{
                      pageSize: customer
                        ? customer.billing_addresses
                          ? customer.billing_addresses.length
                          : 0
                        : 0,
                      total: customer
                        ? customer.billing_addresses
                          ? customer.billing_addresses.length
                          : 0
                        : 0,
                      current: 1,
                      showSizeChanger: true,
                      // onChange: onPageChange,
                      // onShowSizeChange: onPageChange,
                    }}
                    dataSource={customer ? customer.billing_addresses : []}
                    columns={billingColumnFinal()}
                    rowKey={(item: billingAddress) => item.id}
                    onRow={(record: CustomerBillingAddress) => {
                      return {
                        onClick: (event) => {
                          console.log(record);
                          setModalBillingAddress(record);
                          setModalAction("edit");
                          setIsShowModalBilling(true);
                        }, // click row
                      };
                    }}
                  />
                  <CustomModal
                    visible={isShowModalBilling}
                    onCreate={(formValue: CustomerBillingAddress) =>
                      handleBillingAddressForm.create(formValue)
                    }
                    onEdit={(formValue: CustomerBillingAddress) =>
                      handleBillingAddressForm.edit(formValue)
                    }
                    onDelete={() => handleBillingAddressForm.delete()}
                    onCancel={() => setIsShowModalBilling(false)}
                    modalAction={modalAction}
                    modalTypeText="Địa chỉ nhận hóa đơn"
                    componentForm={FormCustomerBillingAddress}
                    formItem={modalSingleBillingAddress}
                    deletedItemTitle={modalSingleBillingAddress?.name}
                  />
                </Col>
              </Row>
            )}
          </Card>
        </Col>
      </Row>
      {/* <Row style={{ marginTop: 16 }}>
        <Col span={24}>
          <Card
            style={{ marginTop: 16 }}
            title={
              <div className="d-flex">
                <span className="title-card">THÔNG TIN LIÊN HỆ</span>
              </div>
            }
            extra={addContact()}
          ></Card>
        </Col>
      </Row> */}
      {/** shipping*/}
      {/* <Row>
        <Col span={24}>
          <Card
            style={{ marginTop: 16 }}
            title={
              <div className="d-flex">
                <span className="title-card">ĐỊA CHỈ GIAO HÀNG</span>
              </div>
            }
            extra={addShippingAddress()}
          ></Card>
        </Col>
      </Row> */}

      {/* <Row>
        <Col span={24}>
          <Card
            style={{ marginTop: 16 }}
            title={
              <div className="d-flex">
                <span className="title-card">ĐỊA CHỈ NHẬN HÓA ĐƠN</span>
              </div>
            }
            extra={addBillingAddress()}
          ></Card>
        </Col>
      </Row> */}
    </ContentContainer>
  );
};

export default CustomerEdit;
