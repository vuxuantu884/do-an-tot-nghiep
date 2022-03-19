import { InfoCircleOutlined } from "@ant-design/icons";
import { Card, Form, FormInstance, Input } from "antd";
import AccountCustomSearchSelect from "component/custom/AccountCustomSearchSelect";
import CustomInputTags from "component/custom/custom-input-tags";
import SubStatusOrder from "component/main-sidebar/sub-status-order";
import UrlConfig from "config/url.config";
import { AccountResponse } from "model/account/account.model";
import { OrderResponse, OrderSubStatusResponse } from "model/response/order/order.response";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import SidebarOrderHistory from "screens/yd-page/yd-page-order-create/component/CreateOrderSidebar/SidebarOrderHistory";
import { searchAccountPublicApi } from "service/accounts/account.service";
import { handleFetchApiError, isFetchApiSuccessful, isOrderFinishedOrCancel } from "utils/AppUtils";
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
  const {onChangeTag, tags, customerId, orderDetail, listOrderSubStatus, form, storeId, updateOrder} =
    props;

  const dispatch = useDispatch();
  const [initValueAssigneeCode, setInitValueAssigneeCode] = useState("");
  const [initValueMarketerCode, setInitValueMarketerCode] = useState("");
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [initValueCoordinatorCode, setInitValueCoordinatorCode] = useState("");

  const [storeAccountData, setStoreAccountData] = useState<Array<AccountResponse>>([]);

  const [assigneeAccountData, setAssigneeAccountData] = useState<Array<AccountResponse>>(
    []
  );
  const [marketingAccountData, setMarketingAccountData] = useState<
    Array<AccountResponse>
  >([]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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

  const [countChangeSubStatus, setCountChangeSubStatus] = useState<number>(0);

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

  const handleUpdateSubStatus = () => {
    setCountChangeSubStatus(countChangeSubStatus + 1);
  };

  useEffect(() => {
  }, [dispatch, form, storeAccountData]);

	useEffect(() => {
		if(!storeId) {
			return;
		}
    const pushCurrentValueToDataAccount = (fieldName: string, storeAccountData: AccountResponse[]) => {
			let fieldNameValue = form.getFieldValue(fieldName);
      if (fieldNameValue) {
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
                  case "coordinator_code":
                    setInitCoordinatorAccountData(result);
                    setCoordinatorAccountData(result);
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
		searchAccountPublicApi({
      store_ids: [storeId],
		})
    .then((response) => {
      if (isFetchApiSuccessful(response)) {
          setStoreAccountData(response.data.items);
          pushCurrentValueToDataAccount("assignee_code", response.data.items);
          pushCurrentValueToDataAccount("marketer_code", response.data.items);
          pushCurrentValueToDataAccount("coordinator_code", response.data.items);
          setInitAssigneeAccountData(response.data.items);
          setInitMarketingAccountData(response.data.items);
        } else {
          handleFetchApiError(response, "Danh sách tài khoản", dispatch)
        }
      })
			.catch((error) => {
				console.log("error", error);
			})
	}, [dispatch, form, storeId])

  return (
    <StyledComponent>
      <Card title="THÔNG TIN ĐƠN HÀNG">
        <Form.Item
          label="Nhân viên bán hàng"
          name="assignee_code"
          rules={[
            {
              required: true,
              message: "Vui lòng chọn nhân viên bán hàng!",
            },
          ]}
        >
          <AccountCustomSearchSelect
            placeholder="Tìm theo họ tên hoặc mã nhân viên"
            initValue={initValueAssigneeCode}
            dataToSelect={assigneeAccountData}
            setDataToSelect={setAssigneeAccountData}
            initDataToSelect={initAssigneeAccountData}
            disabled = {isOrderFinishedOrCancel(orderDetail)}
          />
        </Form.Item>
        <Form.Item
          label="Nhân viên marketing"
          name="marketer_code"
          // rules={
          //   // nguồn POS thì không validate
          //   !isOrderFromPOS(orderDetail)
          //     ? [
          //         {
          //           required: true,
          //           message: "Vui lòng chọn nhân viên marketing!",
          //         },
          //       ]
          //     : undefined
          // }
          // rules={[
          //   {
          //     required: true,
          //     message: "Vui lòng chọn nhân viên marketing!",
          //   },
          // ]}
        >
          <AccountCustomSearchSelect
            placeholder="Tìm theo họ tên hoặc mã nhân viên"
            initValue={initValueMarketerCode}
            dataToSelect={marketingAccountData}
            setDataToSelect={setMarketingAccountData}
            initDataToSelect={initMarketingAccountData}
            disabled = {isOrderFinishedOrCancel(orderDetail)}
          />
        </Form.Item>
        {updateOrder ? (
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
        ) : (
          <Form.Item
            label="Nhân viên điều phối"
            name="coordinator_code"
            hidden
          ></Form.Item>
        )}
        <Form.Item
          label="Tham chiếu"
          name="reference_code"
          tooltip={{
            title: "Thêm số tham chiếu hoặc ID đơn hàng gốc trên kênh bán hàng",
            icon: <InfoCircleOutlined />,
          }}
        >
          <Input placeholder="Điền tham chiếu" maxLength={255} disabled = {isOrderFinishedOrCancel(orderDetail)} />
        </Form.Item>
        <Form.Item
          label="Đường dẫn"
          name="url"
          tooltip={{
            title: "Thêm đường dẫn đơn hàng gốc trên kênh bán hàng",
            icon: <InfoCircleOutlined />,
          }}
        >
          <Input placeholder="Điền đường dẫn" maxLength={255} disabled = {isOrderFinishedOrCancel(orderDetail)}/>
        </Form.Item>
        {renderSplitOrder()}
      </Card>
      {listOrderSubStatus && (
        <SubStatusOrder
          subStatusCode={orderDetail?.sub_status_code}
          status={orderDetail?.status}
          orderId={orderDetail?.id}
          fulfillments={orderDetail?.fulfillments}
          handleUpdateSubStatus={handleUpdateSubStatus}
          setReload={() => {}}
          OrderDetailAllFulfillment={orderDetail}
        />
      )}
      <Card title="THÔNG TIN BỔ SUNG">
        <Form.Item name="customer_note" label="Ghi chú của khách">
          <Input.TextArea
            placeholder="Điền ghi chú"
            maxLength={500}
            style={{minHeight: "80px"}}
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
            style={{minHeight: "80px"}}
          />
        </Form.Item>
        <Form.Item
          label="Nhãn"
          tooltip={{
            title: "Thêm từ khóa để tiện lọc đơn hàng",
            icon: <InfoCircleOutlined />,
          }}
          // name="tags"
        >
          <CustomInputTags onChangeTag={onChangeTag} tags={tags} />
        </Form.Item>
      </Card>
			{customerId && (
				<SidebarOrderHistory customerId={customerId} />
			)}
    </StyledComponent>
  );
};

export default CreateOrderSidebar;
