import { Form, Row, Col, Button, Table, Card, Tooltip, Tag } from "antd";
import { CountryGetAllAction } from "domain/actions/content/content.action";
import {
  DistrictGetByCountryAction,
  WardGetByDistrictAction,
} from "domain/actions/content/content.action";
import urlCrimson from "assets/icon/url-crimson.svg";
import {
  CreateCustomer,
  CustomerGroups,
  CustomerTypes,
  CreateNote,
  DeleteNote,
} from "domain/actions/customer/customer.action";
import { CountryResponse } from "model/content/country.model";
import { WardResponse } from "model/content/ward.model";
import {
  CustomerModel,
  CustomerContactClass,
} from "model/request/customer.request";
import React from "react";
import { useDispatch } from "react-redux";
import { useHistory } from "react-router-dom";
import { showSuccess, showError } from "utils/ToastUtils";
import "./customer.scss";
import ContentContainer from "component/container/content.container";
import UrlConfig from "config/url.config";
import GeneralInformation from "./general.information";
import {
  AccountResponse,
  AccountSearchQuery,
} from "model/account/account.model";
import { PageResponse } from "model/base/base-metadata.response";
import { AccountSearchAction } from "domain/actions/account/account.action";
import moment from "moment";
import {
  formatCurrency,
} from "utils/AppUtils";

const initQueryAccount: AccountSearchQuery = {
  info: "",
};
const CustomerAdd = (props: any) => {
  const {
    setCustomerDetail,
    setIsButtonSelected,
    customerDetail,
    customerPhoneList,
    setCustomerPhoneList,
    getCustomerWhenPhoneChange,
    orderHistory,
  } = props;
  const [customerForm] = Form.useForm();
  const history = useHistory();
  const dispatch = useDispatch();
  const [groups, setGroups] = React.useState<Array<any>>([]);
  const [types, setTypes] = React.useState<Array<any>>([]);
  const [countries, setCountries] = React.useState<Array<CountryResponse>>([]);
  const [areas, setAreas] = React.useState<Array<any>>([]);
  const [wards, setWards] = React.useState<Array<WardResponse>>([]);
  const [countryId] = React.useState<number>(233);
  const [districtId, setDistrictId] = React.useState<any>(null);
  const [accounts, setAccounts] = React.useState<Array<AccountResponse>>([]);
  const [status, setStatus] = React.useState<string>("active");
  const notes = customerDetail && customerDetail.notes;
  const customerId = customerDetail && customerDetail.id;

  const setDataAccounts = React.useCallback(
    (data: PageResponse<AccountResponse> | false) => {
      if (!data) {
        return;
      }
      const _items = data.items.filter((item) => item.status === "active");
      setAccounts(_items);
    },
    [setAccounts]
  );
  const AccountChangeSearch = React.useCallback(
    (value) => {
      initQueryAccount.info = value;
      dispatch(AccountSearchAction(initQueryAccount, setDataAccounts));
    },
    [dispatch, setDataAccounts]
  );
  //m

  const status_order = [
    {
      name: "Nháp",
      value: "draft",
      color: "#FCAF17",
      background: "rgba(252, 175, 23, 0.1)",
    },
    {
      name: "Đóng gói",
      value: "packed",
      color: "#FCAF17",
      background: "rgba(252, 175, 23, 0.1)",
    },
    {
      name: "Xuất kho",
      value: "shipping",
      color: "#FCAF17",
      background: "rgba(252, 175, 23, 0.1)",
    },
    {
      name: "Đã xác nhận",
      value: "finalized",
      color: "#FCAF17",
      background: "rgba(252, 175, 23, 0.1)",
    },
    {
      name: "Hoàn thành",
      value: "completed",
      color: "#27AE60",
      background: "rgba(39, 174, 96, 0.1)",
    },
    {
      name: "Kết thúc",
      value: "finished",
      color: "#27AE60",
      background: "rgba(39, 174, 96, 0.1)",
    },
    {
      name: "Đã huỷ",
      value: "cancelled",
      color: "#ae2727",
      background: "rgba(223, 162, 162, 0.1)",
    },
    {
      name: "Đã hết hạn",
      value: "expired",
      color: "#ae2727",
      background: "rgba(230, 171, 171, 0.1)",
    },
  ];

  const recentOrder: any = [
    {
      title: "Ngày",
      render: (value: any, row: any, index: any) => {
        return (
          <div>{moment(row.created_date).format("DD/MM/YYYY HH:mm:ss")}</div>
        );
      },
    },
    {
      title: "Tổng thu", 
      align: "center",
      render: (value: any, row: any, index: any) => {
        return (
          <div>{formatCurrency(row.total_line_amount_after_line_discount)}</div>
        )
      }
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      align: "center",
      render: (value: any, row: any, index: any) => {
        const statusTag = status_order.find(
          (status) => status.value === row.status
        );
        return (
          <div>
            <Tag
              className="fpage-recent-tag"
              style={{
                color: `${statusTag?.color}`,
                backgroundColor: `${statusTag?.background}`,
              }}
            >
              {statusTag?.name}
            </Tag>
          </div>
        );
      },
    },
    {
      title: "",
      align: "center",
      render: (value: any, row: any, index: any) => {
        let href = `https://dev.yody.io/unicorn/admin/orders/${row.id}`;
        return (
          <Tooltip placement="topLeft" title="Xem chi tiết">
            <a target="blank" href={href}>
              <img src={urlCrimson} alt="link"></img>
            </a>
          </Tooltip>
        );
      },
    },
  ];

  //end
  React.useEffect(() => {
    dispatch(DistrictGetByCountryAction(countryId, setAreas));
  }, [dispatch, countryId]);

  const handleChangeArea = (districtId: string) => {
    if (districtId) {
      setDistrictId(districtId);
      let area = areas.find((area) => area.id === districtId);
      let value = customerForm.getFieldsValue();
      value.city_id = area.city_id;
      value.city = area.city_name;
      value.district_id = districtId;
      value.district = area.name;
      value.ward_id = null;
      value.ward = "";
      customerForm.setFieldsValue(value);
    }
  };

  React.useEffect(() => {
    if (districtId) {
      dispatch(WardGetByDistrictAction(districtId, setWards));
    }
  }, [dispatch, districtId]);

  React.useEffect(() => {
    dispatch(AccountSearchAction({}, setDataAccounts));
  }, [dispatch, setDataAccounts]);

  React.useEffect(() => {
    dispatch(CustomerGroups(setGroups));
    dispatch(CountryGetAllAction(setCountries));
    dispatch(CustomerTypes(setTypes));
  }, [dispatch]);
  React.useEffect(() => {
    let customer_type_id = 2;
    customerForm.setFieldsValue({ ...new CustomerModel(), customer_type_id });
  }, [customerForm]);
  React.useEffect(() => {
    if (customerDetail) {
      const field = {
        full_name: customerDetail.full_name,
        birthday: customerDetail.birthday
          ? moment(customerDetail.birthday, "YYYY-MM-DD")
          : "",
        phone: customerDetail.phone,
        email: customerDetail.email,
        gender: customerDetail.gender,
        district_id: customerDetail.district_id,
        ward_id: customerDetail.ward,
        full_address: customerDetail.full_address,
      };
      customerForm.setFieldsValue(field);
    } else {
      const field = {
        full_name: null,
        birthday: "",
        email: null,
        gender: null,
        district_id: null,
        ward_id: null,
        full_address: null,
      };
      customerForm.setFieldsValue(field);
    }
  }, [customerDetail, customerForm]);
  const setResult = React.useCallback(
    (result) => {
      if (result) {
        showSuccess("Thêm khách hàng thành công");
        setCustomerDetail(result);
        setIsButtonSelected(true);
      }
    },
    [setCustomerDetail, setIsButtonSelected]
  );

  const handleSubmit = (values: any) => {
    let area = areas.find((area) => area.id === districtId);
    let piece = {
      ...values,
      birthday: values.birthday
        ? new Date(values.birthday).toUTCString()
        : null,
      wedding_date: values.wedding_date
        ? new Date(values.wedding_date).toUTCString()
        : null,
      status: status,
      city_id: area ? area.city_id : null,
      contacts: [
        {
          ...CustomerContactClass,
          name: values.contact_name,
          phone: values.contact_phone,
          note: values.contact_note,
          email: values.contact_email,
        },
      ],
    };
    dispatch(CreateCustomer({ ...new CustomerModel(), ...piece }, setResult));
  };
  const handleSubmitFail = (errorInfo: any) => {
    console.error("Failed:", errorInfo);
  };
  
  const reloadPage = () => {
    getCustomerWhenPhoneChange(customerDetail.phone);
  }
  
  const handleNote = {
    create: (noteContent: any) => {
      if (noteContent && customerDetail) {
        dispatch(
          CreateNote(customerDetail.id, {content: noteContent}, (data: any) => {
            if (data) {
              showSuccess("Thêm mới ghi chú thành công")
              reloadPage();
            } else {
              showError("Thêm mới ghi chú thất bại");
            }
          })
        );
      }
    },
    delete: (note: any, customerId: any) => {
      if (note && customerId) {
        dispatch(
          DeleteNote(note.id, customerId, (data: any) => {
            if (data) {
              showSuccess("Xóa ghi chú thành công")
              reloadPage();
            } else {
              showError("Xóa ghi chú thất bại");
            }
          })
        );
      }
    }
  };

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
          path: `/customer`,
        },
        {
          name: "Thêm khách hàng",
        },
      ]}
    >
      <Form
        form={customerForm}
        name="customer_add"
        onFinish={handleSubmit}
        onFinishFailed={handleSubmitFail}
        layout="vertical"
      >
        <Row gutter={24}>
          <Col span={24}>
            <GeneralInformation
              form={customerForm}
              name="general_add"
              accounts={accounts}
              groups={groups}
              types={types}
              status={status}
              setStatus={setStatus}
              areas={areas}
              countries={countries}
              wards={wards}
              handleChangeArea={handleChangeArea}
              AccountChangeSearch={AccountChangeSearch}
              phones={customerPhoneList}
              setPhones={setCustomerPhoneList}
              getCustomerWhenPhoneChange={getCustomerWhenPhoneChange}
              customerId={customerId}
              notes={notes}
              handleNote={handleNote}
              customerDetail={customerDetail}
            />
          </Col>
        </Row>
        <Card
          title={
            <div>
              <span style={{ fontWeight: 500 }} className="title-card">
                ĐƠN GẦN NHẤT
              </span>
            </div>
          }
        >
          <Table
            columns={recentOrder}
            dataSource={orderHistory}
            pagination={false}
          />
        </Card>
        <div className="customer-bottom-button">
          <Button
            style={{ marginRight: "10px" }}
            onClick={() => history.goBack()}
            type="ghost"
          >
            Hủy
          </Button>
         {!customerDetail &&  <Button type="primary" htmlType="submit">
            Tạo mới khách hàng
          </Button>}
          {customerDetail &&  <Button type="primary" htmlType="submit">
          Lưu khách hàng
          </Button>}
        </div>
      </Form>
    </ContentContainer>
  );
};

export default CustomerAdd;
