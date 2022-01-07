//#region Import
import { Avatar, Card, Col, Divider, Form, Row, Space, Tag, Typography } from "antd";
import birthdayIcon from "assets/img/bithday.svg";
import callIcon from "assets/img/call.svg";
import pointIcon from "assets/img/point.svg";
import addressIcon from "assets/img/user-pin.svg";
import CustomSelect from "component/custom/select.custom";
import UrlConfig from "config/url.config";
import { departmentDetailAction } from "domain/actions/account/department.action";
import { getListSourceRequest } from "domain/actions/product/source.action";
import { RootReducerType } from "model/reducers/RootReducerType";
import { CustomerResponse } from "model/response/customer/customer.response";
import { LoyaltyPoint } from "model/response/loyalty/loyalty-points.response";
import { LoyaltyUsageResponse } from "model/response/loyalty/loyalty-usage.response";
import { OrderResponse } from "model/response/order/order.response";
import { SourceResponse } from "model/response/order/source.response";
import moment from "moment";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
//import { useState } from "react";
import { Link } from "react-router-dom";
import { sortSources } from "utils/AppUtils";
import * as CONSTANTS from "utils/Constants";
//#endregion

type CustomerCardUpdateProps = {
  OrderDetail: OrderResponse | null;
  customerDetail: CustomerResponse | null;
  loyaltyPoint: LoyaltyPoint | null;
  loyaltyUsageRules: Array<LoyaltyUsageResponse>;
	isShowSelectOrderSources?: boolean;
};

const UpdateCustomerCard: React.FC<CustomerCardUpdateProps> = (
  props: CustomerCardUpdateProps
) => {
  const { loyaltyPoint, loyaltyUsageRules, isShowSelectOrderSources = false } = props;
	const [departmentIds, setDepartmentIds] = useState<number[]|null>(null);
  // const [visibleShippingAddress, setVisibleShippingAddress] = useState(false);
  // const [visibleBillingAddress, setVisibleBillingAddress] = useState(false);
  // const [isVisibleCustomer, setVisibleCustomer] = useState(false);
  // const [isVisibleAddress, setVisibleAddress] = useState(false);
  //const [isVisibleBilling, setVisibleBilling] = useState(true);

  // const CancleConfirmAddress = useCallback(() => {
  //   setVisibleAddress(false);
  // }, []);

  // const OkConfirmAddress = useCallback(() => {
  //   setVisibleAddress(false);
  // }, []);

  // const CancleConfirmCustomer = useCallback(() => {
  //   setVisibleCustomer(false);
  // }, []);

  // const OkConfirmCustomer = useCallback(() => {
  //   setVisibleCustomer(false);
  // }, []);
  // const ShowAddressModal = () => {
  //   // setVisibleAddress(true);
  //   setVisibleShippingAddress(false);
  //   // setVisibleBillingAddress(false);
  // };

  // const ShowBillingAddress = () => {
  //   setVisibleBilling(!isVisibleBilling);
  // };

  // const handleVisibleBillingAddressChange = (value: boolean) => {
  //   // setVisibleBillingAddress(value);
  // };

	const dispatch = useDispatch();
	const userReducer = useSelector(
    (state: RootReducerType) => state.userReducer
  );
  let customerBirthday = moment(props.customerDetail?.birthday).format("DD/MM/YYYY");

	const [listSource, setListSource] = useState<Array<SourceResponse>>([]);

  const rankName = loyaltyUsageRules.find(
    (x) =>
      x.rank_id ===
      (loyaltyPoint?.loyalty_level_id === null ? 0 : loyaltyPoint?.loyalty_level_id)
  )?.rank_name;

  console.log(props.OrderDetail?.channel_code);
  //props.OrderDetail?.channel_code !== POS.channel_code
	const sortedSources = sortSources(listSource, departmentIds);

	useEffect(() => {
    dispatch(getListSourceRequest(setListSource));
  }, [dispatch]);

	useEffect(() => {
		let departmentId = userReducer.account?.account_jobs[0]?.department_id;
		if(departmentId) {
			let department:number[] = [];
			department.push(departmentId)
			dispatch(departmentDetailAction(departmentId, (response) => {
				if(response && response.parent_id) {
					department.push(response.parent_id)
				 setDepartmentIds(department)
				}
			}))

		}
	}, [dispatch, userReducer.account?.account_jobs])

	const renderSelectOrderSource = () => {
		return(
			<div>
          <span
            style={{
              float: "left",
              lineHeight: "40px",
              marginRight: "10px",
            }}
          >
            Nguồn <span className="text-error">*</span>
          </span>
          <Form.Item
            name="source_id"
            style={{ margin: "0px" }}
            rules={[
              {
                required: true,
                message: "Vui lòng chọn nguồn đơn hàng",
              },
            ]}
          >
            <CustomSelect
              style={{ width: 300, borderRadius: "6px" }}
              showArrow
              showSearch
              placeholder="Nguồn đơn hàng"
              notFoundContent="Không tìm thấy kết quả"
              filterOption={(input, option) => {
                if (option) {
                  return option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0;
                }
                return false;
              }}
            >
              {sortedSources.filter((x) => {
								return (
									x.name.toLowerCase() !== CONSTANTS.POS.channel_code.toLowerCase() && x.active
								)
							}).map((item, index) => (
                <CustomSelect.Option
                  style={{ width: "100%" }}
                  key={index.toString()}
                  value={item.id}
                >
                  {item.name}
                </CustomSelect.Option>
              ))}
            </CustomSelect>
          </Form.Item>
        </div>
		)
	};

  return (
    <Card
      className="card-block card-block-customer"
      title={
        <div className="d-flex">
          <span className="title-card">THÔNG TIN KHÁCH HÀNG</span>
        </div>
      }
      extra={
				!isShowSelectOrderSources ? (
					<div className="d-flex align-items-center form-group-with-search">
						<span
							style={{
								float: "left",
								lineHeight: "40px",
							}}
						>
							<span style={{ marginRight: "10px" }}>Nguồn:</span>
							<span className="text-error">
								<span style={{ color: "red" }}>{props.OrderDetail?.source}</span>
							</span>
						</span>
					</div>
				) : (
					renderSelectOrderSource()
				)
      }
    >
      <div>
        <Row align="middle" justify="space-between" className="row-customer-detail">
          <Space>
            <Avatar size={32}>A</Avatar>
            <Link
              target="_blank"
              to={`${UrlConfig.CUSTOMER}/${props.customerDetail?.id}`}
            >
              {props.customerDetail?.full_name}
            </Link>
            <Tag className="orders-tag orders-tag-vip">
              <b>{!rankName ? "Không có hạng" : rankName}</b>
            </Tag>
          </Space>
          <Space className="customer-detail-phone">
            <span className="customer-detail-icon">
              <img src={callIcon} alt="" className="icon-customer-info" />
            </span>
            <span className="customer-detail-text">{props.customerDetail?.phone}</span>
          </Space>

          <Space className="customer-detail-point">
            <span className="customer-detail-icon">
              <img src={pointIcon} alt="" />
            </span>
            <span className="customer-detail-text">
              Tổng điểm:
              <Typography.Text
                type="success"
                style={{ color: "#FCAF17", marginLeft: "5px" }}
                strong
              >
                {loyaltyPoint?.point === undefined ? "0" : loyaltyPoint?.point}
              </Typography.Text>
            </span>
          </Space>

          <Space className="customer-detail-birthday">
            <span className="customer-detail-icon">
              <img src={birthdayIcon} alt="" />
            </span>
            <span className="customer-detail-text">
              {props.customerDetail?.birthday !== null
                ? customerBirthday
                : "Không xác định"}
            </span>
          </Space>
        </Row>
        {props.OrderDetail?.channel_code?.toUpperCase() !== CONSTANTS.POS.channel_code.toUpperCase() && (
          <>
            <Divider className="margin-0" style={{ padding: 0, marginBottom: 0 }} />
            <div>
              <Row gutter={24}>
                <Col
                  xs={24}
                  style={{
                    paddingTop: "14px",
                  }}
                  className="font-weight-500 customer-info-left"
                >
                  <div className="title-address">
                    <img
                      src={addressIcon}
                      alt=""
                      style={{
                        width: "24px",
                        height: "24px",
                        marginRight: "10px",
                      }}
                    />
                    Địa chỉ giao hàng:
                    <span style={{ fontWeight: 400, marginLeft: "10px" }}>
                      {props.OrderDetail?.shipping_address?.name} -{" "}
                      {props.OrderDetail?.shipping_address?.phone} -{" "}
                      {props.OrderDetail?.shipping_address?.full_address} -{" "}
                      {props.OrderDetail?.shipping_address?.ward} -{" "}
                      {props.OrderDetail?.shipping_address?.district} -{" "}
                      {props.OrderDetail?.shipping_address?.city}
                    </span>
                  </div>
                </Col>
              </Row>


              <div className="send-order-box" hidden={true}>
                {/* <Row style={{ marginTop: 15 }}>
              <Checkbox
                className="checkbox-style"
                onChange={ShowBillingAddress}
                style={{ marginLeft: "3px" }}
              >
                Gửi hoá đơn
              </Checkbox>
            </Row> */}
                <Divider style={{ padding: 0, margin: 0 }} />
                <Row gutter={24}>
                  <Col
                    xs={24}
                    style={{
                      paddingTop: "14px",
                    }}
                    className="font-weight-500 customer-info-left"
                  >
                    <div className="title-address">
                      <img
                        src={addressIcon}
                        alt=""
                        style={{
                          width: "24px",
                          height: "24px",
                          marginRight: "10px",
                        }}
                      />
                      Địa chỉ nhận hóa đơn:
                      <span style={{ fontWeight: 400, marginLeft: "10px" }}>
                        {props.OrderDetail?.billing_address?.name} -{" "}
                        {props.OrderDetail?.billing_address?.phone} -{" "}
                        {props.OrderDetail?.billing_address?.full_address} -{" "}
                        {props.OrderDetail?.billing_address?.ward} -{" "}
                        {props.OrderDetail?.billing_address?.district} -{" "}
                        {props.OrderDetail?.billing_address?.city}
                      </span>
                    </div>
                  </Col>
                </Row>
              </div>
            </div>
          </>
        )}

      </div>
    </Card>
  );
};

export default UpdateCustomerCard;
