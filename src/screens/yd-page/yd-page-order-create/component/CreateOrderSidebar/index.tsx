import { InfoCircleOutlined } from "@ant-design/icons";
import {Card, Col, Form, FormInstance, Input, Row} from "antd";
import AccountCustomSearchSelect from "component/custom/AccountCustomSearchSelect";
import UrlConfig from "config/url.config";
import {AccountResponse} from "model/account/account.model";
import {OrderResponse} from "model/response/order/order.response";
import React, {useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import {Link} from "react-router-dom";
import { searchAccountPublicApi } from "service/accounts/account.service";
import { handleFetchApiError, isFetchApiSuccessful } from "utils/AppUtils";
import {StyledComponent} from "./styles";

type PropType = {
  form: FormInstance<any>;
  storeId?: number | null;
  accounts: AccountResponse[];
  tags: string;
  levelOrder?: number;
  updateOrder?: boolean;
  customerId?: number | undefined;
  orderDetail?: OrderResponse | null;
  onChangeTag: (value: []) => void;
};

/**
 * sử dụng trong tạo đơn hàng, sửa đơn hàng, clone
 *
 * accounts: danh sách nhân viên
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
const CreateOrderSidebar: React.FC<PropType> = (props: PropType) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const {accounts, onChangeTag, tags, orderDetail, form, storeId} = props;

  const dispatch = useDispatch();

  const [initValueAssigneeCode, setInitValueAssigneeCode] = useState("");
  const [initValueMarketerCode, setInitValueMarketerCode] = useState("");

  const [storeAccountData, setStoreAccountData] = useState<Array<AccountResponse>>([]);

  const [assigneeAccountData, setAssigneeAccountData] = useState<Array<AccountResponse>>(
    []
  );
  const [marketingAccountData, setMarketingAccountData] = useState<
    Array<AccountResponse>
  >([]);

  const [initAssigneeAccountData, setInitAssigneeAccountData] = useState<
    Array<AccountResponse>
  >([]);
  const [initMarketingAccountData, setInitMarketingAccountData] = useState<
    Array<AccountResponse>
  >([]);

  useEffect(() => {
    const pushCurrentValueToDataAccount = (fieldName: string) => {
			let fieldNameValue = form.getFieldValue(fieldName);
      if (fieldNameValue) {
        switch (fieldName) {
          case "assignee_code":
            setInitValueAssigneeCode(fieldNameValue);
            break;
          case "marketer_code":
            setInitValueMarketerCode(fieldNameValue);
            break;
          default:
            break;
        }
        if (storeAccountData.some((single) => single.code === fieldNameValue)) {
					setAssigneeAccountData(storeAccountData);
					setMarketingAccountData(storeAccountData);
        } else {
					searchAccountPublicApi({
						condition: fieldNameValue,
					})
						.then((response) => {
							if (isFetchApiSuccessful(response)) {
								if(response.data.items.length === 0) {
									return;
								}
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
									default:
										break;
								}
							} else {
								handleFetchApiError(response, "Danh sách tài khoản", dispatch)
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
  }, [dispatch, form, storeAccountData]);

	useEffect(() => {
		if(!storeId) {
			return;
		}
		searchAccountPublicApi({
			store_ids: [storeId],
		})
      .then((response) => {
        if (isFetchApiSuccessful(response)) {
          setStoreAccountData(response.data.items);
          setInitAssigneeAccountData(response.data.items);
          setInitMarketingAccountData(response.data.items);
        } else {
          handleFetchApiError(response, "Danh sách tài khoản", dispatch)
        }
      })
			.catch((error) => {
				console.log("error", error);
			})
	}, [dispatch, storeId])
 
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

  return (
    <StyledComponent>
      <Card className="padding-12 order-create-shipment" title="THÔNG TIN ĐƠN HÀNG">
        <Row gutter={20}>
          <Col span={12}
           style={{padding: "0 5px 0 10px"}}
          >
            <Form.Item
              name="assignee_code"
              rules={[
                {
                  required: true,
                  message: "Vui lòng chọn nhân viên bán hàng",
                },
              ]}
              className={"staff-form-input"}
              >
                <AccountCustomSearchSelect
                  placeholder="Nhân viên bán hàng"
                  initValue={initValueAssigneeCode}
                  dataToSelect={assigneeAccountData}
                  setDataToSelect={setAssigneeAccountData}
                  initDataToSelect={initAssigneeAccountData}
                />
            </Form.Item>
          </Col>

          <Col span={12}
           style={{padding: "0 10px 0 5px"}}
          >
          <Form.Item
            name="marketer_code"
            rules={[
              {
                message: "Vui lòng chọn nhân viên marketing",
              },
            ]}
            className={"staff-form-input"}
          >
           <AccountCustomSearchSelect
            placeholder="Nhân viên MKT"
            initValue={initValueMarketerCode}
            dataToSelect={marketingAccountData}
            setDataToSelect={setMarketingAccountData}
            initDataToSelect={initMarketingAccountData}
          />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={20} style={{marginTop: 8}}>
          <Col span={12}
           style={{padding: "0 5px 0 10px"}}
          >
          <Form.Item
          name="note"
          tooltip={{
            title: "Thêm thông tin ghi chú chăm sóc khách hàng",
            icon: <InfoCircleOutlined />,
          }}
          className={"staff-form-input"}
        >
          <Input.TextArea
            className="note-form-input"
            placeholder="Ghi chú nội bộ"
            maxLength={500}
            style={{minHeight: "60px"}}
          />
        </Form.Item>
          </Col>

          <Col span={12}
           style={{padding: "0 10px 0 5px"}}
          >
          <Form.Item 
           name="customer_note"
           className={"staff-form-input"}
          >
          <Input.TextArea
            className="note-form-input"
            placeholder="Ghi chú của KH"
            maxLength={500}
            style={{minHeight: "60px"}}
          />
        </Form.Item>
          </Col>
        </Row>
        {renderSplitOrder()}
      </Card>
        
        {/* <Form.Item label="NV điều phối" name="coordinator_code">
          <Select
            className="select-with-search"
            notFoundContent="Không tìm thấy kết quả"
            showSearch
            allowClear
            placeholder={
              <React.Fragment>
                <SearchOutlined />
                <span> Tìm, chọn nhân viên</span>
              </React.Fragment>
            }
            filterOption={(input, option) => {
              if (option) {
                return option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0;
              }
              return false;
            }}
          >
            {accounts.map((item, index) => (
              <Select.Option key={index.toString()} value={item.code}>
                {`${item.code} - ${item.full_name}`}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item
          label="NV marketing"
          name="marketer_code"
          rules={[
            {
              required: true,
              message: "Vui lòng chọn nhân viên marketing",
            },
          ]}
        >
          <Select
            className="select-with-search"
            notFoundContent="Không tìm thấy kết quả"
            showSearch
            allowClear
            placeholder={
              <React.Fragment>
                <SearchOutlined />
                <span> Tìm, chọn nhân viên</span>
              </React.Fragment>
            }
            filterOption={(input, option) => {
              if (option) {
                return option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0;
              }
              return false;
            }}
          >
            {accounts.map((item, index) => (
              <Select.Option key={index.toString()} value={item.code}>
                {`${item.code} - ${item.full_name}`}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item label="NV điều phối" name="coordinator_code">
          <Select
            className="select-with-search"
            notFoundContent="Không tìm thấy kết quả"
            showSearch
            allowClear
            placeholder={
              <React.Fragment>
                <SearchOutlined />
                <span> Tìm, chọn nhân viên</span>
              </React.Fragment>
            }
            filterOption={(input, option) => {
              if (option) {
                return option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0;
              }
              return false;
            }}
          >
            {accounts.map((item, index) => (
              <Select.Option key={index.toString()} value={item.code}>
                {`${item.code} - ${item.full_name}`}
              </Select.Option>
            ))}
          </Select>
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
        <Card style={{padding: 12}}>
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
      {/*<SidebarOrderHistory customerId={customerId} />*/}
    </StyledComponent>
  );
};

export default CreateOrderSidebar;
