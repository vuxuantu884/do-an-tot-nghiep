import { InfoCircleOutlined } from "@ant-design/icons";
import { Card, Form, FormInstance, Input, Select } from "antd";
import AccountCustomSearchSelect from "component/custom/AccountCustomSearchSelect";
import CustomInputTags from "component/custom/custom-input-tags";
import { HttpStatus } from "config/http-status.config";
import UrlConfig from "config/url.config";
import { unauthorizedAction } from "domain/actions/auth/auth.action";
import { AccountResponse } from "model/account/account.model";
import { OrderResponse, OrderSubStatusResponse } from "model/response/order/order.response";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import SidebarOrderHistory from "screens/yd-page/yd-page-order-create/component/CreateOrderSidebar/SidebarOrderHistory";
import { searchAccountPublicApi } from "service/accounts/account.service";
import { showError } from "utils/ToastUtils";
import { StyledComponent } from "./styles";

type PropType = {
  form: FormInstance<any>;
  tags: string;
  levelOrder?: number;
  storeId?: number | null;
  updateOrder?: boolean;
  customerId?: number | undefined;
  orderDetail?: OrderResponse | null;
  listOrderSubStatus?: OrderSubStatusResponse[];
  onChangeTag: (value: []) => void;
};

/**
 * sử dụng trong tạo đơn hàng, sửa đơn hàng, clone
 *
 * leverOrder: phân quyền
 *
 * updateOrder: sửa đơn hàng
 *
 * customerId: id khách hàng, để lấy thông tin lịch sử giao dịch
 *
 * orderDetail: chi tiết đơn hàng
 *
 * onChangeTag: xử lý khi thay đổi tag
 */
function CreateOrderSidebar(props: PropType): JSX.Element {
  const {onChangeTag, tags, customerId, orderDetail, listOrderSubStatus, form, storeId} =
    props;

  const dispatch = useDispatch();
  const [initValueAssigneeCode, setInitValueAssigneeCode] = useState("");
  const [initValueMarketerCode, setInitValueMarketerCode] = useState("");
  const [initValueCoordinatorCode, setInitValueCoordinatorCode] = useState("");

  const [storeAccountData, setStoreAccountData] = useState<Array<AccountResponse>>([]);

  const [assigneeAccountData, setAssigneeAccountData] = useState<Array<AccountResponse>>(
    []
  );
  const [marketingAccountData, setMarketingAccountData] = useState<
    Array<AccountResponse>
  >([]);
  const [coordinatorAccountData, setCoordinatorAccountData] = useState<
    Array<AccountResponse>
  >([]);

  const [initAssigneeAccountData, setInitAssigneeAccountData] = useState<
    Array<AccountResponse>
  >([]);
  const [initMarketingAccountData, setInitMarketingAccountData] = useState<
    Array<AccountResponse>
  >([]);
  const [initCoordinatorAccountData, setInitCoordinatorAccountData] = useState<
    Array<AccountResponse>
  >([]);
  // const [storeAccountData, setStoreAccountData] = useState<Array<AccountResponse>>([]);

  const renderSplitOrder = () => {
    const splitCharacter = "-";
    if (!orderDetail?.linked_order_code) {
      return;
    }
    let result = orderDetail.linked_order_code.split(splitCharacter);
    if (result.length > 1) {
      return (
        <div>
          <label>Đơn tách:{"   "}</label>
          {result.map((single, index) => {
            return (
              <React.Fragment>
                <Link target="_blank" to={`${UrlConfig.ORDER}/${single}`}>
                  <strong>{single}</strong>
                </Link>
                {index < result.length - 1 && ", "}
              </React.Fragment>
            );
          })}
        </div>
      );
    } else {
      return (
        <div>
          <label>Đơn gốc tách đơn:{"   "}</label>
          <Link
            target="_blank"
            to={`${UrlConfig.ORDER}/${orderDetail.linked_order_code}`}
          >
            <strong>{orderDetail.linked_order_code}</strong>
          </Link>
        </div>
      );
    }
  };

  useEffect(() => {
    const pushCurrentValueToDataAccount = (fieldName: string) => {
			let fieldNameValue = form.getFieldValue(fieldName);
      if (fieldNameValue) {
				console.log('fieldNameValue', fieldNameValue)
        switch (fieldName) {
          case "assignee_code":
            setInitValueAssigneeCode(fieldNameValue);
            break;
          case "marketer_code":
            setInitValueMarketerCode(fieldNameValue);
            break;
          case "coordinator_code":
            setInitValueCoordinatorCode(fieldNameValue);
            break;
          default:
            break;
        }
        if (storeAccountData.some((single) => single.code === fieldNameValue)) {
					setAssigneeAccountData(storeAccountData);
					setMarketingAccountData(storeAccountData);
					setCoordinatorAccountData(storeAccountData);
        } else {
					searchAccountPublicApi({
						condition: fieldNameValue,
					})
						.then((response) => {
							if (response) {
								switch (response.code) {
									case HttpStatus.SUCCESS:
										if (storeAccountData.length > 0) {
											let result = [...storeAccountData];
											result.push(response.data.items[0]);
											switch (fieldName) {
												case "assignee_code":
													setInitAssigneeAccountData(result);
													setAssigneeAccountData(result);
													break;
												case "marketer_code":
													setInitMarketingAccountData(result);
													setMarketingAccountData(result);
													break;
												case "coordinator_code":
													setInitCoordinatorAccountData(result);
													setCoordinatorAccountData(result);
													break;
												default:
													break;
											}
										}
										break;
									case HttpStatus.UNAUTHORIZED:
										dispatch(unauthorizedAction());
										break;
									default:
										response.errors.forEach((e) => showError(e));
										break;
								}
							}
						})
						.catch((error) => {
							console.log("error", error);
						});

				}
      }
    };
    pushCurrentValueToDataAccount("assignee_code");
    pushCurrentValueToDataAccount("marketer_code");
    pushCurrentValueToDataAccount("coordinator_code");
  }, [dispatch, form, storeAccountData]);

	useEffect(() => {
		if(!storeId) {
			return;
		}
		searchAccountPublicApi({
			store_ids: [storeId],
		})
			.then((response) => {
				if (response) {
					switch (response.code) {
						case HttpStatus.SUCCESS:
							setStoreAccountData(response.data.items);
							break;
						case HttpStatus.UNAUTHORIZED:
							dispatch(unauthorizedAction());
							break;
						default:
							response.errors.forEach((e) => showError(e));
							break;
					}
				}
			})
			.catch((error) => {
				console.log("error", error);
			})
	}, [dispatch, storeId])

  return (
    <StyledComponent>
      <Card title="THÔNG TIN ĐƠN HÀNG">
        <Form.Item
          label="Nhân viên bán hàng"
          name="assignee_code"
          rules={[
            {
              required: true,
              message: "Vui lòng chọn nhân viên bán hàng",
            },
          ]}
        >
          <AccountCustomSearchSelect
            placeholder="Tìm theo họ tên hoặc mã nhân viên"
            initValue={initValueAssigneeCode}
            dataToSelect={assigneeAccountData}
            setDataToSelect={setAssigneeAccountData}
            initDataToSelect={initAssigneeAccountData}
          />
        </Form.Item>
        <Form.Item
          label="Nhân viên marketing"
          name="marketer_code"
          rules={[
            {
              required: true,
              message: "Vui lòng chọn nhân viên marketing!",
            },
          ]}
        >
          <AccountCustomSearchSelect
            placeholder="Tìm theo họ tên hoặc mã nhân viên"
            initValue={initValueMarketerCode}
            dataToSelect={marketingAccountData}
            setDataToSelect={setMarketingAccountData}
            initDataToSelect={initMarketingAccountData}
          />
        </Form.Item>
        <Form.Item
          label="Nhân viên điều phối"
          name="coordinator_code"
        >
          <AccountCustomSearchSelect
            placeholder="Tìm theo họ tên hoặc mã nhân viên"
            initValue={initValueCoordinatorCode}
            dataToSelect={coordinatorAccountData}
            setDataToSelect={setCoordinatorAccountData}
            initDataToSelect={initCoordinatorAccountData}
          />
        </Form.Item>
        <Form.Item
          label="Tham chiếu"
          name="reference_code"
          tooltip={{
            title: "Thêm số tham chiếu hoặc ID đơn hàng gốc trên kênh bán hàng",
            icon: <InfoCircleOutlined />,
          }}
        >
          <Input placeholder="Điền tham chiếu" maxLength={255} />
        </Form.Item>
        <Form.Item
          label="Đường dẫn"
          name="url"
          tooltip={{
            title: "Thêm đường dẫn đơn hàng gốc trên kênh bán hàng",
            icon: <InfoCircleOutlined />,
          }}
        >
          <Input placeholder="Điền đường dẫn" maxLength={255} />
        </Form.Item>
        {renderSplitOrder()}
      </Card>
      {listOrderSubStatus && (
        <Card title="XỬ LÝ ĐƠN HÀNG">
          <Form.Item name="sub_status_code">
            <Select
              showSearch
              style={{width: "100%"}}
              placeholder="Chọn trạng thái phụ"
              optionFilterProp="children"
              filterOption={(input, option) =>
                option?.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
              notFoundContent="Không tìm thấy trạng thái phụ"
              key={Math.random()}
            >
              {listOrderSubStatus.map((single) => {
                return (
                  <Select.Option value={single.code} key={single.code}>
                    {single.sub_status}
                  </Select.Option>
                );
              })}
            </Select>
          </Form.Item>
        </Card>
      )}
      <Card title="THÔNG TIN BỔ SUNG">
        <Form.Item name="customer_note" label="Ghi chú của khách">
          <Input.TextArea
            placeholder="Điền ghi chú"
            maxLength={500}
            style={{minHeight: "130px"}}
          />
        </Form.Item>
        <Form.Item
          name="note"
          label="Ghi chú nội bộ"
          tooltip={{
            title: "Thêm thông tin ghi chú chăm sóc khách hàng",
            icon: <InfoCircleOutlined />,
          }}
        >
          <Input.TextArea
            placeholder="Điền ghi chú"
            maxLength={500}
            style={{minHeight: "130px"}}
          />
        </Form.Item>
        <Form.Item
          label="Tag"
          tooltip={{
            title: "Thêm từ khóa để tiện lọc đơn hàng",
            icon: <InfoCircleOutlined />,
          }}
          // name="tags"
        >
          <CustomInputTags onChangeTag={onChangeTag} tags={tags} />
        </Form.Item>
      </Card>
      <SidebarOrderHistory customerId={customerId} />
    </StyledComponent>
  );
};

export default CreateOrderSidebar;
