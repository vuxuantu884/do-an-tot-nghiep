import { createRef, useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { useHistory } from "react-router";
import NumberFormat from "react-number-format";
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
  InputNumber,
} from "antd";

import CustomTable, {
  ICustomTableColumType,
} from "component/table/CustomTable";
import UrlConfig from "config/url.config";
import { useQuery } from "utils/useQuery";
import { showError, showSuccess, showWarning } from "utils/ToastUtils";

import _ from "lodash";
import {
  CustomerSearch,
  getCustomerListAction,
} from "domain/actions/customer/customer.action";
import {
  createCustomerPointAdjustmentAction,
  getLoyaltyPoint,
} from "domain/actions/loyalty/loyalty.action";
import { hideLoading, showLoading } from "domain/actions/loading.action";
import { LoyaltyPoint } from "model/response/loyalty/loyalty-points.response";
import { CustomerResponse } from "model/response/customer/customer.response";
import { PageResponse } from "model/base/base-metadata.response";
import { CustomerSearchQuery } from "model/query/customer.query";

import ContentContainer from "component/container/content.container";
import AuthWrapper from "component/authorization/AuthWrapper";
import NoPermission from "screens/no-permission.screen";
import { LoyaltyPermission } from "config/permissions/loyalty.permission";

import closeIcon from "assets/icon/X_close.svg";
import arrowBack from "assets/icon/arrow-back.svg";
import { StyledCreatePointAdjustment } from "screens/customer/point-adjustment/StyledPointAdjustment";
import { StyledComponent } from "screens/ecommerce/products/tab/not-connected-items/styles";
import { StyledFooterAction } from "screens/customer/common/CommonStyled";

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

const CreatePointAdjustment = () => {
  const history = useHistory();
  const query = useQuery();
  const paramCustomerIds = query.get("customer_ids");
  
  const formRef = createRef<FormInstance>();
  const dispatch = useDispatch();

  const [customers, setCustomers] = useState<CustomerResponse[]>([]);
  const [selectedCustomers, setSelectedCustomers] = useState<any[]>([]);
  const [type, setType] = useState<string>(query.get("type") || "ADD");
  const [keyword, setKeyword] = useState<string>("");
  const [fieldName, setFieldName] = useState<string>("");

  const initFormValues = {
    type: type,
    reason: "Khác",
    point_change: 1,
    note: null,
    search: "",
    name: ""
  };


  const callBackGetCustomerList = useCallback((result: PageResponse<any> | false) => {
    if (!!result) {
      setSelectedCustomers(result.items);
    }
  }, []);

  useEffect(() => {
    if (paramCustomerIds) {
      const customerIds = paramCustomerIds.split(",").map((id) => Number(id));
      const params: CustomerSearchQuery = {
        page: 1,
        limit: customerIds.length,
        ids: customerIds,
        search_type: "SIMPLE"
      }
      
      dispatch(getCustomerListAction(params, callBackGetCustomerList));
    }
  }, [callBackGetCustomerList, dispatch, paramCustomerIds]);


  const handleRemoveCustomer = (customer: any) => {
    const newSelectedCustomers = selectedCustomers.filter(item => item.id !== customer.id);
    setSelectedCustomers(newSelectedCustomers);
  };
  
  const columns: Array<ICustomTableColumType<any>> = [
    {
      title: "STT",
      visible: true,
      align: "center",
      render: (value: any, item: any, index: number) => <div>{index + 1}</div>,
      width: "70px",
    },
    {
      title: "Số điện thoại",
      visible: true,
      dataIndex: "phone",
    },
    {
      title: "Tên khách hàng",
      visible: true,
      dataIndex: "full_name",
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
      dataIndex: "point",
      align: "center",
      render: (value: any, item: any, index: number) => (
        value ?
        <NumberFormat
          value={value}
          displayType={"text"}
          thousandSeparator={true}
        /> : 0
      ),
    },
    {
      width: "60px",
      render: (value: any, item: any, index: number) => {
        return (
          <StyledComponent>
            <img
              src={closeIcon}
              className="delete-item-icon"
              alt=""
              onClick={() => handleRemoveCustomer(item)}
            />
          </StyledComponent>
        );
      }
    },
  ];

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
    const customer = option?.customer;
    if (customer) {
      const newSelectedCustomers = [...selectedCustomers];
      const isExistCustomer = newSelectedCustomers.find(item => item.id === customer.id);
      if (isExistCustomer) {
        showWarning("Khách hàng đã được chọn!");
      } else {
        dispatch(
          getLoyaltyPoint(customer.id, (data: LoyaltyPoint) => {
            customer.point = data ? data.point : 0;
            newSelectedCustomers.unshift(customer);
            setSelectedCustomers(newSelectedCustomers);
          })
        );
      }
    }
  };

  const onUpdateEnd = useCallback(
    (data: any) => {
      formRef.current?.resetFields();
      setType("ADD");
      setSelectedCustomers([]);
      dispatch(hideLoading());
      showSuccess("Tạo mới phiếu điều chỉnh thành công");
      history.replace(`${UrlConfig.CUSTOMER}/point-adjustments/${data?.id}`)
    },
    [formRef, dispatch, history]
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

      if (values.point_change === 0) {
        showError("Giá trị điều chỉnh phải lớn hơn 0");
        return;
      }

      const customerIds: Array<any> = [];
      selectedCustomers.forEach((customer) => {
        customerIds.push(customer.id);
      });

      const params = {
        customer_ids: customerIds,
        note: values.note,
        reason: values.reason,
        point_change: values.point_change,
        type: values.type,
        name: values.name,
      }

      dispatch(showLoading());
      dispatch(createCustomerPointAdjustmentAction(params, onUpdateEnd, handleError));
    },
    [dispatch, handleError, onUpdateEnd, selectedCustomers]
  );

  const onChangeName = (e: any) => {
    setFieldName(e.target.value.trim());
  };

  const onBlur = (e: any) => {
    const nameValue = e.target.value.trim();
    setFieldName(nameValue);
    formRef.current?.setFieldsValue({
      name: nameValue,
    });
  };


  const onChangeType = useCallback(
    (value: string) => {
      setType(value);
      formRef.current?.setFieldsValue({
        reason: "Khác",
      });
    },
    [formRef]
  );

  
  const goBack = () => {
    if (paramCustomerIds?.length) {
      history.replace(`${UrlConfig.CUSTOMER}`)
    } else {
      history.replace(`${UrlConfig.CUSTOMER}/point-adjustments`)
    }
  };

  const checkDisableCreateButton = useCallback(() => {
    if (selectedCustomers.length === 0 || !fieldName) {
      return true;
    } else {
      return false;
    }
  }, [fieldName, selectedCustomers.length]);


  return (
    <StyledCreatePointAdjustment>
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
                title="THÔNG TIN ĐIỀU CHỈNH"
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
                        <div className="row-label">
                          <span>Tên phiếu điều chỉnh </span>
                          <span className="text-error">*</span>
                        </div>
                        <div className="row-content">
                          <Item
                            name="name"
                            rules={[
                              {
                                required: true,
                                message: "Vui lòng nhập tên phiếu điều chỉnh",
                              },
                            ]}
                          >
                            <Input
                              onChange={onChangeName}
                              onBlur={onBlur}
                              maxLength={255}
                              placeholder="Nhập tên phiếu điều chỉnh"
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
                              <Select.Option key="ADD" value="ADD">
                                Tăng
                              </Select.Option>
                              <Select.Option key="SUBTRACT" value="SUBTRACT">
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
                              {type === "ADD" &&
                                POINT_ADD_REASON.map((reason, idx) => (
                                  <Select.Option key={idx} value={reason}>
                                    {reason}
                                  </Select.Option>
                                ))}
                              {type === "SUBTRACT" &&
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
                            name="point_change"
                            rules={[
                              {
                                required: true,
                                message: "Vui lòng nhập giá trị",
                              },
                            ]}
                          >
                            <InputNumber
                              style={{ width: "100%" }}
                              formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                              placeholder="Nhập giá trị"
                              min="0"
                              max="1000000000"
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

                    <Row className="row">
                      <Col span={17}>
                        <div className="row-label">
                          <span>Khách hàng </span>
                          <span className="text-error">*</span>
                        </div>
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

                    <Row>
                      <Col span={24}>
                        <CustomTable
                          bordered
                          dataSource={selectedCustomers}
                          columns={columns}
                          pagination={false}
                          rowKey={(item: any) => item.id}
                        />
                      </Col>
                    </Row>

                    <StyledFooterAction>
                      <div className="footer-action">
                        <Button
                          onClick={goBack}
                          type="text"
                          className="go-back-button"
                        >
                          <span>
                            <img style={{ marginRight: "10px" }} src={arrowBack} alt="" />
                            <span>Quay lại</span>
                          </span>
                        </Button>
                        
                        <div className="confirm-button">
                          <Button
                            onClick={goBack}
                            style={{ marginRight: 10 }}
                            type="default"
                          >
                            Huỷ
                          </Button>

                          <Button
                            type="primary"
                            onClick={() => { formRef.current?.submit() }}
                            disabled={checkDisableCreateButton()}
                          >
                            Thêm mới
                          </Button>
                        </div>
                      </div>
                    </StyledFooterAction>
                  </Form>
                </div>
              </Card>
              : <NoPermission />)}
          </AuthWrapper>
      </ContentContainer>
    </StyledCreatePointAdjustment>
  );
};

export default CreatePointAdjustment;
