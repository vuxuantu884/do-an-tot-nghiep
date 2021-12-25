import {
  Button,
  Card,
  Col,
  Input,
  Row,
  Select,
  Form,
  FormInstance,
  AutoComplete,
} from "antd";
import ContentContainer from "component/container/content.container";
import NumberInput from "component/custom/number-input.custom";
import CustomTable, {
  ICustomTableColumType,
} from "component/table/CustomTable";
import UrlConfig from "config/url.config";
import { CustomerResponse } from "model/response/customer/customer.response";
import { createRef, useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { useHistory } from "react-router";
import { Link } from "react-router-dom";
import "./point-adjustment.scss";
import _ from "lodash";
import {
  CustomerSearch,
  getCustomerDetailAction,
} from "domain/actions/customer/customer.action";
import {
  addLoyaltyPoint,
  getLoyaltyPoint,
  subtractLoyaltyPoint,
} from "domain/actions/loyalty/loyalty.action";
import { LoyaltyPoint } from "model/response/loyalty/loyalty-points.response";
import { showError, showSuccess, showWarning } from "utils/ToastUtils";
import { useQuery } from "utils/useQuery";
import { hideLoading, showLoading } from "domain/actions/loading.action";
import AuthWrapper from "component/authorization/AuthWrapper";
import NoPermission from "screens/no-permission.screen";
import { LoyaltyPermission } from "config/permissions/loyalty.permission";

const initFormValues = {
  type: "add",
  reason: "Khác",
  value: 1,
  note: null,
  search: "",
};
const { Item } = Form;
const POINT_ADD_REASON = [
  "Tặng điểm sinh nhật",
  "Tặng điểm ngày cưới",
  "Tặng điểm bù",
  "Tặng điểm sự cố",
  "Khác",
];
const POINT_SUBTRACT_REASON = ["Trừ điểm bù", "Khác"];

const createPointAdjustmentPermission = [LoyaltyPermission.points_update];

const pageColumns: Array<ICustomTableColumType<any>> = [
  {
    title: "STT",
    visible: true,
    align: "center",
    render: (value: any, item: any, index: number) => <div>{index + 1}</div>,
    width: "150px",
  },
  {
    title: "Số điện thoại",
    visible: true,
    dataIndex: "phone",
    fixed: "left",
  },
  {
    title: "Tên khách hàng",
    visible: true,
    dataIndex: "full_name",
    fixed: "left",
  },
  {
    title: "Mã khách hàng",
    visible: true,
    dataIndex: "code",
    align: "center",
  },
  {
    title: "Số điểm hiện tại",
    visible: true,
    dataIndex: "current_point",
    align: "center",
  },
];

const CreatePointAdjustment = () => {
  const history = useHistory();
  const query = useQuery();
  const formRef = createRef<FormInstance>();
  const dispatch = useDispatch();
  const [customers, setCustomers] = useState<CustomerResponse[]>([]);
  const [selectedCustomers, setSelectedCustomers] = useState<any[]>([]);
  const [type, setType] = useState<string>(query.get("type") || "add");
  const [keyword, setKeyword] = useState<string>("");

  useEffect(() => {
    const paramCustomerIds = query.get("customer_ids");
    if (paramCustomerIds) {
      const customerIds = paramCustomerIds.split(",").map((id) => Number(id));
      // fetch first id only
      const customerId = customerIds[0];
      if (customerId) {
        dispatch(
          getCustomerDetailAction(customerId, (data: CustomerResponse) => {
            let customer = data as any;
            formRef.current?.setFieldsValue({
              search: `${customer.full_name} - ${customer.phone}`,
              type,
            });
            dispatch(
              getLoyaltyPoint(customer.id, (data: LoyaltyPoint) => {
                customer.current_point = data ? data.point : 0;
                setSelectedCustomers([customer]);
              })
            );
          })
        );
      }
    }
  }, [dispatch, formRef, query, type]);

  const fetchCustomer = _.debounce((keyword: string) => {
    let query: any = { request: keyword };
    dispatch(CustomerSearch(query, setCustomers));
  }, 300);

  const transformCustomers = useMemo(() => {
    return customers.map((customer) => {
      return {
        label: customer.full_name + " - " + customer.phone,
        value: customer.full_name + " - " + customer.phone,
        customer: customer,
      };
    });
  }, [customers]);

  const onChange = (data: string) => {
    setKeyword(data);
  };

  const onSelect = (value: any, option: any) => {
    const customer = option.customer;
    if (customer) {
      const newSelectedCustomers = [...selectedCustomers];
      const isExistCustomer = newSelectedCustomers.find(item => item.id === customer.id);
      if (isExistCustomer) {
        showWarning("Khách hàng đã được chọn!");
      } else {
        dispatch(
          getLoyaltyPoint(customer.id, (data: LoyaltyPoint) => {
            customer.current_point = data ? data.point : 0;
            newSelectedCustomers.unshift(customer);
            setSelectedCustomers(newSelectedCustomers);
          })
        );
      }
    }
  };

  const onUpdateEnd = useCallback(
    (data: LoyaltyPoint) => {
      formRef.current?.resetFields();
      setType("add");
      let _selectedCustomers = selectedCustomers;
      _selectedCustomers = _selectedCustomers.map((customer) => {
        if (customer.id === data.customer_id) {
          customer.current_point = data.current_point;
        }
        return customer;
      });
      showSuccess("Thành công");
      setSelectedCustomers(_selectedCustomers);
      dispatch(hideLoading());
    },
    [selectedCustomers, formRef, dispatch]
  );

  const handleError = useCallback(() => {
    dispatch(hideLoading());
  }, [dispatch]);

  const onFinish = useCallback(
    (values) => {
      if (selectedCustomers.length === 0) {
        showError("Không có khách hàng nào được chọn");
        return;
      }
      if (values.value === 0) {
        showError("Giá trị điều chỉnh phải lớn hơn 0");
        return;
      }
      const customer = selectedCustomers[0];
      const params = {
        current_point: customer.current_point,
        customer_id: customer.id,
        note: values.note
          ? values.note.trim()
            ? values.note.trim()
            : null
          : null,
        reason: values.reason,
      } as any;
      dispatch(showLoading());
      if (values.type === "add") {
        params.add_point = values.value;
        dispatch(
          addLoyaltyPoint(customer.id, params, onUpdateEnd, handleError)
        );
      } else {
        params.subtract_point = values.value;
        dispatch(
          subtractLoyaltyPoint(customer.id, params, onUpdateEnd, handleError)
        );
      }
    },
    [selectedCustomers, dispatch, onUpdateEnd, handleError]
  );

  const onChangeType = useCallback(
    (value: string) => {
      setType(value);
      formRef.current?.setFieldsValue({
        reason: "Khác",
      });
    },
    [formRef]
  );

  return (
    <ContentContainer
      title="Phiếu điều chỉnh"
      breadcrumb={[
        {
          name: "Tổng quan",
          path: UrlConfig.HOME,
        },
        {
          name: "Phiếu điều chỉnh",
          path: `${UrlConfig.CUSTOMER}/point-adjustments`,
        },
        {
          name: "Thêm mới",
        },
      ]}
      extra={<></>}
    >
      <AuthWrapper acceptPermissions={createPointAdjustmentPermission} passThrough>
          {(allowed: boolean) => (allowed ?
            <Card
              title={
                <div className="d-flex">
                  <span>THÔNG TIN ĐIỀU CHỈNH</span>
                </div>
              }
            >
              <div className="create-point-adjustments">
                <Form
                  onFinish={onFinish}
                  initialValues={initFormValues}
                  layout="vertical"
                  ref={formRef}
                >
                  <Row className="row">
                    <Col span={17}>
                      <div className="row-label">Khách hàng</div>
                      <div className="row-content">
                        <Item
                          name="search"
                          rules={[
                            {
                              message: "",
                            },
                          ]}
                        >
                          <AutoComplete
                            className="dropdown-rule"
                            allowClear
                            notFoundContent={
                              customers.length === 0
                                ? "Không có bản ghi nào"
                                : undefined
                            }
                            onSearch={fetchCustomer}
                            options={transformCustomers}
                            onSelect={onSelect}
                            onChange={onChange}
                            placeholder="Tìm kiếm theo mã khách hàng, tên, SĐT khách hàng"
                            value={keyword}
                          />
                        </Item>
                      </div>
                    </Col>
                  </Row>
                  <Row className="row">
                    <Col span={8}>
                      <div className="row-label">
                        Kiểu điều chỉnh <span className="text-error">*</span>
                      </div>
                      <div className="row-content">
                        <Item
                          name="type"
                          rules={[
                            {
                              required: true,
                              message: "Vui lòng chọn kiểu điều chỉnh",
                            },
                          ]}
                        >
                          <Select
                            placeholder="Chọn kiểu điều chỉnh"
                            style={{ width: "100%" }}
                            onChange={onChangeType}
                          >
                            <Select.Option key="add" value="add">
                              Tăng
                            </Select.Option>
                            <Select.Option key="subtract" value="subtract">
                              Giảm
                            </Select.Option>
                          </Select>
                        </Item>
                      </div>
                    </Col>
                    <Col span={1} />
                    <Col span={8}>
                      <div className="row-label">
                        Lý do điều chỉnh <span className="text-error">*</span>
                      </div>
                      <div className="row-content">
                        <Item
                          name="reason"
                          rules={[
                            {
                              required: true,
                              message: "Vui lòng chọn lý do điều chỉnh",
                            },
                          ]}
                        >
                          <Select
                            placeholder="Chọn lý do điều chỉnh"
                            style={{ width: "100%" }}
                          >
                            {type === "add" &&
                              POINT_ADD_REASON.map((reason, idx) => (
                                <Select.Option key={idx} value={reason}>
                                  {reason}
                                </Select.Option>
                              ))}
                            {type === "subtract" &&
                              POINT_SUBTRACT_REASON.map((reason, idx) => (
                                <Select.Option key={idx} value={reason}>
                                  {reason}
                                </Select.Option>
                              ))}
                          </Select>
                        </Item>
                      </div>
                    </Col>
                  </Row>
                  <Row className="row">
                    <Col span={8}>
                      <div className="row-label">
                        Giá trị <span className="text-error">*</span>
                      </div>
                      <div className="row-content">
                        <Item
                          name="value"
                          rules={[
                            {
                              required: true,
                              message: "Vui lòng nhập giá trị",
                            },
                          ]}
                        >
                          <NumberInput
                            placeholder="Nhập giá trị"
                            style={{ textAlign: "left" }}
                            max={999999999999999}
                          />
                        </Item>
                      </div>
                    </Col>
                    <Col span={1} />
                    <Col span={8}>
                      <div className="row-label">Ghi chú</div>
                      <div className="row-content">
                        <Item name="note">
                          <Input placeholder="Nhập ghi chú" />
                        </Item>
                      </div>
                    </Col>
                  </Row>
                  <Row>
                    <Col span={24}>
                      <CustomTable
                        bordered
                        dataSource={selectedCustomers}
                        columns={pageColumns}
                        style={{ width: "100%" }}
                        pagination={false}
                        rowKey={(item: any) => item.id}
                      />
                    </Col>
                  </Row>
                  <Row className="footer-controller">
                    <Col span={6} className="back">
                      <div className="back-wrapper" onClick={() => history.goBack()}>
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 14 14"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M13.3281 6.33203H3.04317L9.19903 0.988281C9.29746 0.902148 9.2377 0.742188 9.10762 0.742188H7.55196C7.4834 0.742188 7.41836 0.766797 7.36739 0.810742L0.724614 6.57461C0.663774 6.62735 0.614981 6.69255 0.58154 6.76579C0.548099 6.83903 0.530792 6.91861 0.530792 6.99912C0.530792 7.07964 0.548099 7.15921 0.58154 7.23245C0.614981 7.3057 0.663774 7.37089 0.724614 7.42363L7.40606 13.2227C7.43243 13.2455 7.46407 13.2578 7.49746 13.2578H9.10586C9.23594 13.2578 9.29571 13.0961 9.19727 13.0117L3.04317 7.66797H13.3281C13.4055 7.66797 13.4688 7.60469 13.4688 7.52734V6.47266C13.4688 6.39531 13.4055 6.33203 13.3281 6.33203Z"
                            fill="#666666"
                          />
                        </svg>
                        <span>Quay lại</span>
                      </div>
                    </Col>
                    <Col span={18} className="action-group">
                      <Link to={`${UrlConfig.CUSTOMER}`}>
                        <Button type="default" className="cancel-btn">
                          Hủy
                        </Button>
                      </Link>
                      <Button
                        type="primary"
                        className="save-btn"
                        onClick={() => {
                          formRef.current?.submit();
                        }}
                      >
                        Thêm mới
                      </Button>
                    </Col>
                  </Row>
                </Form>
              </div>
            </Card>
            : <NoPermission />)}
        </AuthWrapper>
    </ContentContainer>
  );
};

export default CreatePointAdjustment;
