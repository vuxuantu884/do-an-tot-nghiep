import {
  Form,
  Row,
  Col,
  Button,
  Card,
  Collapse,
  Tag,
  Space,
  Dropdown,
  Menu,
  Checkbox,
} from "antd";
import { CountryGetAllAction } from "domain/actions/content/content.action";
import CustomTable from "component/table/CustomTable";
import { ICustomTableColumType } from "component/table/CustomTable";
import { PlusOutlined } from "@ant-design/icons";
import { modalActionType } from "model/modal/modal.model";
import CustomerModal from "../customer/CustomerModal";
import threeDot from "../../assets/icon/three-dot.svg";
import editIcon from "../../assets/icon/edit.svg";
import deleteIcon from "../../assets/icon/deleteIcon.svg";
import customerShipping from "../../assets/icon/c-shipping.svg";
import customerRecipt from "../../assets/icon/c-recipt.svg";
import customerContact from "../../assets/icon/c-contact.svg";
import customerBuyHistory from "../../assets/icon/c-bag.svg";
import arrowLeft from "../../assets/icon/arrow-left.svg";

import {
  CustomerDetail,
  CustomerGroups,
  CustomerLevels,
  CustomerTypes,
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
import UrlConfig from "config/url.config";
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
import SaveAndConfirmOrder from "screens/order-online/modal/save-confirm.modal";
import DeleteIcon from "assets/icon/ydDeleteIcon.svg";

const { Panel } = Collapse;

const genreEnum: any = {
  male: "Nam",
  female: "Nữ",
  other: "Khác",
};

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
        {
          name: "Họ tên khách hàng",
          value: customer.full_name,
          position: "left",
        },

        {
          name: "Giới tính",
          value: genreEnum[customer.gender],
          position: "right",
        },
        {
          name: "Số điện thoại",
          value: customer.phone,
          position: "left",
        },
        {
          name: "Loại khách hàng",
          value: customer.customer_type,
          position: "right",
        },
        {
          name: "Ngày sinh",
          value: customer.birthday
            ? moment(customer.birthday).format("DD/MM/YYYY")
            : null,
          position: "left",
        },
        {
          name: "Nhóm khách hàng",
          value: customer.customer_group,
          position: "right",
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
          value: `${
            customer.responsible_staff_code
              ? customer.responsible_staff_code
              : ""
          }${
            customer.responsible_staff ? "-" + customer.responsible_staff : ""
          }`,
          position: "right",
        },
        {
          name: "Email",
          value: customer.email,
          position: "left",
        },
        {
          name: "Mã khách hàng",
          value: customer.code,
          position: "right",
        },
        {
          name: "Ngày cưới",
          value: customer.wedding_date
            ? moment(customer.wedding_date).format("DD/MM/YYYY")
            : null,
          position: "left",
        },
        {
          name: "Website/Facebook",
          value: customer.website,
          position: "right",
          isWebsite: true,
        },
        {
          name: "Tên đơn vị",
          value: customer.company,
          position: "left",
        },
        {
          name: "Mã số thuế",
          value: customer.tax_code,
          position: "right",
        },
        {
          name: "Địa chỉ",
          value: `${customer.full_address ? customer.full_address : ""}${
            customer.ward ? " - " + customer.ward : ""
          }${customer.district ? " - " + customer.district : ""}${
            customer.city ? " - " + customer.city : ""
          }`,
          position: "left",
        },
        {
          name: "Ghi chú",
          value: customer.description,
          position: "right",
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
                  icon={<img style={{ marginRight: 12 }} alt="" src={deleteIcon} />}
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
  const [isVisibleContactModal, setIsVisibleContactModal] =
    React.useState<boolean>(false);

  const handleContactEdit = () => {
    setIsShowModalContacts(true);
  };

  const handleContactDelete = () => {
    setIsVisibleContactModal(true);
  };
  const onOkContactDelete = () => {
    handleContactForm.delete();
    setIsVisibleContactModal(false);
  };
  const onCancelContactDelete = () => {
    setIsVisibleContactModal(false);
  };

  // contact column
  const columns: Array<ICustomTableColumType<contact>> = [
    {
      title: "STT",
      dataIndex: "",
      align: "center",
      visible: true,
      width: "5%",
      render: (value, row, index) => {
        return <span>{index + 1}</span>;
      },
    },
    {
      title: "Chức vụ/phòng ban",
      dataIndex: "title",
      visible: true,
      // width: "20%",
    },
    {
      title: "Tên người liên hệ",
      dataIndex: "",
      visible: true,
      // width: "20%",
      render: (value, row, index) => {
        return <div style={{ width: 200 }}>{row.name}</div>;
      },
    },

    {
      title: "Email",
      dataIndex: "email",
      visible: true,
      // width: "20%",
    },

    {
      title: "Số điện thoại",
      dataIndex: "phone",
      visible: true,
      // width: "20%",
    },
    {
      title: "Ghi chú",
      dataIndex: "note",
      visible: true,
      // width: "20%",
      render: (value, row, index) => {
        return (
          <div
            className="text"
            title={value}
            style={{ color: "#666666", width: 200 }}
          >
            {value}
          </div>
        );
      },
    },
    actionColumn(handleContactEdit, handleContactDelete),
  ];
  // shiping column

  const [isVisibleShippingModal, setIsVisibleShippingModal] =
    React.useState<boolean>(false);

  const handleShippingEdit = () => {
    setIsShowModalShipping(true);
  };

  const handleShippingDelete = () => {
    setIsVisibleShippingModal(true);
  };
  const onOkShippingDelete = () => {
    handleShippingAddressForm.delete();
    setIsVisibleShippingModal(false);
  };
  const onCancelShippingDelete = () => {
    setIsVisibleShippingModal(false);
  };
  const handleShippingDefault = (value: any, item: any) => {
    let _item = { ...item };
    if (_item.default === true) return showError("Không thể bỏ mặc định");
    _item.is_default = value.target.checked;
    if (customer)
      dispatch(
        UpdateShippingAddress(
          _item.id,
          customer.id,
          _item,
          (data: shippingAddress) => {
            history.replace(`${UrlConfig.CUSTOMER}/` + customer.id);
            if (data) {
              showSuccess("Đặt mặc định thành công");
            } else {
              showError("Đặt mặc định thất bại");
            }
          }
        )
      );
  };
  const shippingColumns: Array<ICustomTableColumType<shippingAddress>> = [
    {
      title: "STT",
      dataIndex: "",
      align: "center",
      visible: true,
      width: "5%",
      render: (value, row, index) => {
        return <span>{index + 1}</span>;
      },
    },
    {
      title: "Họ tên người nhận",
      dataIndex: "name",
      visible: true,
      width: "20%",
    },
    {
      title: "Số điện thoại",
      dataIndex: "phone",
      visible: true,
    },
    // {
    //   title: "Quốc gia",
    //   dataIndex: "country",
    //   visible: true,
    // },
    {
      title: "Khu vực",
      dataIndex: "full_address",
      visible: true,
      render: (value, row, index) => {
        return (
          <div>
            <span
              className="text"
              title={row.code}
              style={{ color: "#666666" }}
            >
              {`${row.full_address}`}
            </span>
            <span
              className="text"
              title={row.code}
              style={{ color: "#222222", display: "block" }}
            >
              {`${row.ward ? row.ward : ""}${
                row.district ? " - " + row.district : ""
              }${row.city ? " - " + row.city : ""}`}
            </span>
          </div>
        );
      },
    },
    {
      title: "Mặc định",
      dataIndex: "default",
      align: "center",
      visible: true,
      width: "10%",
      render: (l: shippingAddress, item: any, index: number) => {
        return (
          <Checkbox
            checked={item.default}
            onClick={(value) => handleShippingDefault(value, item)}
          />
        );
      },
    },
    actionColumn(handleShippingEdit, handleShippingDelete),
  ];

  // billing columns
  const [isVisibleBillingModal, setIsVisibleBillingModal] =
    React.useState<boolean>(false);
  const handleBillingEdit = () => {
    setIsShowModalBilling(true);
  };
  const handleBillingDelete = () => {
    setIsVisibleBillingModal(true);
  };
  const onOkBillingDelete = () => {
    handleBillingAddressForm.delete();
    setIsVisibleBillingModal(false);
  };
  const onCancelBillingDelete = () => {
    setIsVisibleBillingModal(false);
  };
  const billingColumns: Array<ICustomTableColumType<billingAddress>> = [
    {
      title: "STT",
      dataIndex: "",
      align: "center",
      visible: true,
      width: "5%",
      render: (value, row, index) => {
        return <span>{index + 1}</span>;
      },
    },
    {
      title: "Họ tên người nhận",
      dataIndex: "name",
      visible: true,
      width: "20%",
    },
    {
      title: "Số điện thoại",
      dataIndex: "phone",
      visible: true,
    },
    {
      title: "Email",
      dataIndex: "email",
      visible: true,
    },
    {
      title: "Mã số thuế",
      dataIndex: "tax_code",
      visible: true,
    },
    {
      title: "Khu vực",
      dataIndex: "full_address",
      visible: true,
      render: (value, row, index) => {
        return (
          <div>
            <span
              className="text"
              title={row.code}
              style={{ color: "#666666" }}
            >
              {`${row.full_address}`}
            </span>
            <span
              className="text"
              title={row.code}
              style={{ color: "#222222", display: "block" }}
            >
              {`${row.ward ? row.ward : ""}${
                row.district ? " - " + row.district : ""
              }${row.city ? " - " + row.city : ""}`}
            </span>
          </div>
        );
      },
    },
    {
      title: "Mặc định",
      dataIndex: "default",
      align: "center",
      visible: true,
      width: "10%",
      render: (l: billingAddress, item: any, index: number) => {
        return (
          <Checkbox
            checked={item.default}
            onClick={(value) => handleBillingDefault(value, item)}
          />
        );
      },
    },
    actionColumn(handleBillingEdit, handleBillingDelete),
  ];
  const handleBillingDefault = (value: any, item: any) => {
    let _item = { ...item };
    if (_item.default === true) return showError("Không thể bỏ mặc định");
    _item.is_default = value.target.checked;
    if (customer)
      dispatch(
        UpdateBillingAddress(
          _item.id,
          customer.id,
          _item,
          (data: billingAddress) => {
            history.replace(`${UrlConfig.CUSTOMER}/` + customer.id);
            if (data) {
              data.default
                ? showSuccess("Đặt mặc định thành công")
                : showSuccess("Bỏ mặc định thành công");
            } else {
              showError("Đặt mặc định thất bại");
            }
          }
        )
      );
  };
  //end
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
  const customerContactFiltered = customer?.contacts?.filter((contact) => {
    if (
      contact.title ||
      contact.name ||
      contact.email ||
      contact.phone ||
      contact.note
    ) {
      return true;
    }
    return false;
  });
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
      formValue.is_default = false;
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
      formValue.is_default = formValue.default;
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
      formValue.is_default = false;
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
      formValue.is_default = formValue.default;
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
            <Row gutter={30} style={{ paddingTop: 16 }}>
              <Col span={12}>
                {customerDetail &&
                  customerDetail
                    .filter((detail: any) => detail.position === "left")
                    .map((detail: any, index: number) => (
                      <Col
                        key={index}
                        span={24}
                        style={{
                          display: "flex",
                          marginBottom: 20,
                          color: "#222222",
                        }}
                      >
                        <Col
                          span={12}
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            padding: "0 4px 0 15px",
                          }}
                        >
                          <span>{detail.name}</span>
                          <span style={{ fontWeight: 600 }}>:</span>
                        </Col>
                        <Col span={12} style={{ paddingLeft: 0 }}>
                          <span
                            style={{
                              wordWrap: "break-word",
                              fontWeight: 500,
                            }}
                          >
                            {detail.value ? detail.value : "---"}
                          </span>
                        </Col>
                      </Col>
                    ))}
              </Col>
              <Col span={12}>
                {customerDetail &&
                  customerDetail
                    .filter((detail: any) => detail.position === "right")
                    .map((detail: any, index: number) => (
                      <Col
                        key={index}
                        span={24}
                        style={{
                          display: "flex",
                          marginBottom: 20,
                          color: "#222222",
                        }}
                      >
                        <Col
                          span={12}
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            padding: "0 4px 0 15px",
                          }}
                        >
                          <span>{detail.name}</span>
                          <span style={{ fontWeight: 600 }}>:</span>
                        </Col>
                        <Col span={12} style={{ paddingLeft: 0 }}>
                          <span
                            style={{
                              wordWrap: "break-word",
                              fontWeight: 500,
                            }}
                          >
                            {detail.value ? detail.value : "---"}
                          </span>
                        </Col>
                      </Col>
                    ))}
              </Col>
            </Row>
            <Row style={{ marginBottom: 16 }}>
              <Col span={24}>
                <Collapse ghost>
                  <Panel
                    key="1"
                    header={[
                      <span style={{ color: "#5656A1" }}>Xem thêm</span>,
                    ]}
                  >
                    <Row gutter={30}>
                      <Col span={12}>
                        {customerDetailCollapse &&
                          customerDetailCollapse
                            .filter((detail: any) => detail.position === "left")
                            .map((detail: any, index: number) => (
                              <Col
                                key={index}
                                span={24}
                                style={{
                                  display: "flex",
                                  marginBottom: 20,
                                  color: "#222222",
                                }}
                              >
                                <Col
                                  span={12}
                                  style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    padding: "0 4px 0 15px",
                                  }}
                                >
                                  <span>{detail.name}</span>
                                  <span style={{ fontWeight: 600 }}>:</span>
                                </Col>
                                <Col span={12} style={{ paddingLeft: 0 }}>
                                  <span
                                    style={{
                                      wordWrap: "break-word",
                                      fontWeight: 500,
                                    }}
                                  >
                                    {detail.value ? detail.value : "---"}
                                  </span>
                                </Col>
                              </Col>
                            ))}
                      </Col>
                      <Col span={12}>
                        {customerDetailCollapse &&
                          customerDetailCollapse
                            .filter(
                              (detail: any) => detail.position === "right"
                            )
                            .map((detail: any, index: number) => (
                              <Col
                                key={index}
                                span={24}
                                style={{
                                  display: "flex",
                                  marginBottom: 20,
                                  color: "#222222",
                                }}
                              >
                                <Col
                                  span={12}
                                  style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    padding: "0 4px 0 15px",
                                  }}
                                >
                                  <span>{detail.name}</span>
                                  <span style={{ fontWeight: 600 }}>:</span>
                                </Col>
                                <Col span={12} style={{ paddingLeft: 0 }}>
                                  <span
                                    style={{
                                      wordWrap: "break-word",
                                      fontWeight: 500,
                                    }}
                                  >
                                    {detail.isWebsite ? (
                                      <a href={detail.value}>{detail.value}</a>
                                    ) : detail.value ? (
                                      detail.value
                                    ) : (
                                      "---"
                                    )}
                                  </span>
                                </Col>
                              </Col>
                            ))}
                      </Col>
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
              <Row style={{ marginTop: 16 }}>
                <div
                  style={{
                    padding: "0 16px 10px 0",
                    display: "flex",
                    justifyContent: "flex-end",
                    alignItems: "center",
                    width: "100%",
                    color: "#2A2A86",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "flex-end",
                      alignItems: "center",
                      cursor: "pointer",
                    }}
                  >
                    <div>
                      <PlusOutlined />
                    </div>
                    <span
                      style={{
                        marginLeft: 10,
                      }}
                      onClick={() => {
                        setModalAction("create");
                        setIsShowModalContacts(true);
                      }}
                    >
                      Thêm liên hệ
                    </span>
                  </div>
                </div>
                <Col span={24}>
                  <CustomTable
                    showColumnSetting={false}
                    // scroll={{ x: 1080 }}
                    // pagination={{
                    //   pageSize: customer
                    //     ? customer.contacts
                    //       ? customer.contacts.length
                    //       : 0
                    //     : 0,
                    //   total: customer
                    //     ? customer.contacts
                    //       ? customer.contacts.length
                    //       : 0
                    //     : 0,
                    //   current: 1,
                    //   showSizeChanger: true,
                    //   // onChange: onPageChange,
                    //   // onShowSizeChange: onPageChange,
                    // }}
                    pagination={false}
                    dataSource={
                      customerContactFiltered ? customerContactFiltered : []
                    }
                    columns={columnFinal()}
                    rowKey={(item: contact) => item.id}
                    onRow={(record: CustomerContact) => {
                      return {
                        onClick: (event) => {
                          console.log(record);
                          setModalSingleContact(record);
                          setModalAction("edit");
                        }, // click row
                      };
                    }}
                  />
                  <CustomerModal
                    visible={isShowModalContacts}
                    onCreate={(formValue: CustomerContact) =>
                      handleContactForm.create(formValue)
                    }
                    onEdit={(formValue: CustomerContact) =>
                      handleContactForm.edit(formValue)
                    }
                    onDelete={() => {}}
                    onCancel={() => setIsShowModalContacts(false)}
                    modalAction={modalAction}
                    modalTypeText="Địa chỉ liên hệ"
                    componentForm={FormCustomerContact}
                    formItem={modalSingleContact}
                    deletedItemTitle={modalSingleContact?.name}
                  />
                </Col>
                <div
                  style={{
                    padding: "0 16px 10px 0",
                    display: "flex",
                    justifyContent: "flex-end",
                    width: "100%",
                  }}
                ></div>
              </Row>
            )}

            {customerDetailState === 4 && (
              <Row style={{ marginTop: 16 }}>
                <div
                  style={{
                    padding: "0 16px 10px 0",
                    display: "flex",
                    justifyContent: "flex-end",
                    alignItems: "center",
                    width: "100%",
                    color: "#2A2A86",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "flex-end",
                      alignItems: "center",
                      cursor: "pointer",
                    }}
                  >
                    <div>
                      <PlusOutlined />
                    </div>
                    <span
                      style={{
                        marginLeft: 10,
                      }}
                      onClick={() => {
                        setModalAction("create");
                        setIsShowModalShipping(true);
                      }}
                    >
                      Thêm địa chỉ
                    </span>
                  </div>
                </div>
                <Col span={24}>
                  <CustomTable
                    showColumnSetting={false}
                    // scroll={{ x: 1080 }}
                    // pagination={{
                    //   pageSize: customer
                    //     ? customer.shipping_addresses
                    //       ? customer.shipping_addresses.length
                    //       : 0
                    //     : 0,
                    //   total: customer
                    //     ? customer.shipping_addresses
                    //       ? customer.shipping_addresses.length
                    //       : 0
                    //     : 0,
                    //   current: 1,
                    //   showSizeChanger: true,
                    //   // onChange: onPageChange,
                    //   // onShowSizeChange: onPageChange,
                    // }}
                    pagination={false}
                    dataSource={customer ? customer.shipping_addresses : []}
                    columns={shippingColumnFinal()}
                    rowKey={(item: shippingAddress) => item.id}
                    onRow={(record: CustomerShippingAddress) => {
                      return {
                        onClick: (event) => {
                          console.log(record);
                          setModalShippingAddress(record);
                          setModalAction("edit");
                          // setIsShowModalShipping(true);
                        }, // click row
                      };
                    }}
                  />
                  <CustomerModal
                    visible={isShowModalShipping}
                    onCreate={(formValue: CustomerShippingAddress) =>
                      handleShippingAddressForm.create(formValue)
                    }
                    onEdit={(formValue: CustomerShippingAddress) =>
                      handleShippingAddressForm.edit(formValue)
                    }
                    onDelete={() => {}}
                    onCancel={() => setIsShowModalShipping(false)}
                    modalAction={modalAction}
                    modalTypeText="Địa chỉ giao hàng"
                    componentForm={FormCustomerShippingAddress}
                    formItem={modalSingleShippingAddress}
                    deletedItemTitle={modalSingleShippingAddress?.name}
                  />
                </Col>
                <div
                  style={{
                    padding: "0 16px 10px 0",
                    display: "flex",
                    justifyContent: "flex-end",
                    width: "100%",
                  }}
                ></div>
              </Row>
            )}
            {customerDetailState === 3 && (
              <Row style={{ marginTop: 16 }}>
                <div
                  style={{
                    padding: "0 16px 10px 0",
                    display: "flex",
                    justifyContent: "flex-end",
                    alignItems: "center",
                    width: "100%",
                    color: "#2A2A86",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "flex-end",
                      alignItems: "center",
                      cursor: "pointer",
                    }}
                  >
                    <div>
                      <PlusOutlined />
                    </div>
                    <span
                      style={{
                        marginLeft: 10,
                      }}
                      onClick={() => {
                        setModalAction("create");
                        setIsShowModalBilling(true);
                      }}
                    >
                      Thêm địa chỉ
                    </span>
                  </div>
                </div>
                <Col span={24}>
                  <CustomTable
                    showColumnSetting={false}
                    // scroll={{ x: 1080 }}
                    // pagination={{
                    //   pageSize: customer
                    //     ? customer.billing_addresses
                    //       ? customer.billing_addresses.length
                    //       : 0
                    //     : 0,
                    //   total: customer
                    //     ? customer.billing_addresses
                    //       ? customer.billing_addresses.length
                    //       : 0
                    //     : 0,
                    //   current: 1,
                    //   showSizeChanger: true,
                    //   // onChange: onPageChange,
                    //   // onShowSizeChange: onPageChange,
                    // }}
                    pagination={false}
                    dataSource={customer ? customer.billing_addresses : []}
                    columns={billingColumnFinal()}
                    rowKey={(item: billingAddress) => item.id}
                    onRow={(record: CustomerBillingAddress) => {
                      return {
                        onClick: (event) => {
                          console.log(record);
                          setModalBillingAddress(record);
                          setModalAction("edit");
                          // setIsShowModalBilling(true);
                        }, // click row
                      };
                    }}
                  />
                  <CustomerModal
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
      <SaveAndConfirmOrder
        onCancel={onCancelContactDelete}
        onOk={onOkContactDelete}
        visible={isVisibleContactModal}
        okText="Đồng ý"
        cancelText="Hủy"
        title=""
        text="Bạn có chắc chắn xóa thông tin liên hệ này không?"
        icon={DeleteIcon}
      />
      <SaveAndConfirmOrder
        onCancel={onCancelShippingDelete}
        onOk={onOkShippingDelete}
        visible={isVisibleShippingModal}
        okText="Đồng ý"
        cancelText="Hủy"
        title=""
        text="Bạn có chắc chắn xóa địa chỉ giao hàng này không?"
        icon={DeleteIcon}
      />
      <SaveAndConfirmOrder
        onCancel={onCancelBillingDelete}
        onOk={onOkBillingDelete}
        visible={isVisibleBillingModal}
        okText="Đồng ý"
        cancelText="Hủy"
        title=""
        text="Bạn có chắc chắn xóa địa chỉ gửi hóa đơn này không?"
        icon={DeleteIcon}
      />
      <div className="customer-bottom-button">
        <div onClick={() => history.goBack()} style={{ cursor: "pointer" }}>
          <img style={{ marginRight: "10px" }} src={arrowLeft} alt="" />
          Quay lại danh sách khách hàng
        </div>
        <div>
          <Button
            onClick={() => history.goBack()}
            style={{
              marginLeft: ".75rem",
              marginRight: ".75rem",
              color: "red",
            }}
            type="ghost"
          >
            Xóa khách hàng
          </Button>
          {/* <Button type="primary">Tạo phiếu thu chi</Button> */}
        </div>
      </div>
    </ContentContainer>
  );
};

export default CustomerEdit;
