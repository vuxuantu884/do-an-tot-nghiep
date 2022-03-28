import { InfoCircleOutlined } from "@ant-design/icons";
import { Card, Form, FormInstance, Input, Tooltip } from "antd";
import AccountCustomSearchSelect from "component/custom/AccountCustomSearchSelect";
import UrlConfig from "config/url.config";
import { AccountResponse } from "model/account/account.model";
import { OrderResponse } from "model/response/order/order.response";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { searchAccountPublicApi } from "service/accounts/account.service";
import { handleFetchApiError, isFetchApiSuccessful, isOrderFinishedOrCancel, isOrderFromPOS } from "utils/AppUtils";
import { StyledComponent } from "./styles";

type PropType = {
  form: FormInstance<any>;
  storeId?: number | null;
  updateOrder?: boolean;
  orderDetail?: OrderResponse | null;
  isOrderReturn?: boolean;
  isExchange?: boolean;
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
function CreateOrderSidebarOrderInformation(props: PropType): JSX.Element {
  const {orderDetail, form, storeId, updateOrder, isOrderReturn, isExchange} =
    props;

  const dispatch = useDispatch();
  const [initValueAssigneeCode, setInitValueAssigneeCode] = useState("");
  const [initValueAccountCode, setInitValueAccountCode] = useState("");
  const [initValueMarketerCode, setInitValueMarketerCode] = useState("");
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [initValueCoordinatorCode, setInitValueCoordinatorCode] = useState("");

  const [storeAccountData, setStoreAccountData] = useState<Array<AccountResponse>>([]);

  const [assigneeAccountData, setAssigneeAccountData] = useState<Array<AccountResponse>>(
    []
  );
  const [accountCodeAccountData, setAccountCodeAccountData] = useState<Array<AccountResponse>>(
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
  const [initAccountCodeAccountData, setInitAccountCodeAccountData] = useState<
    Array<AccountResponse>
  >([]);
  const [initMarketingAccountData, setInitMarketingAccountData] = useState<
    Array<AccountResponse>
  >([]);
  const [initCoordinatorAccountData, setInitCoordinatorAccountData] = useState<
  Array<AccountResponse>
>([]);

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
          case "account_code":
            setInitValueAccountCode(fieldNameValue);
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
					setAccountCodeAccountData(storeAccountData);
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
                  case "account_code":
                    setInitAccountCodeAccountData(result);
                    setAccountCodeAccountData(result);
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
      <Card title={
        <React.Fragment>
          THÔNG TIN ĐƠN HÀNG
          {isOrderReturn ? (
            <Tooltip title="Thêm sản phẩm đổi có thể thay đổi thông tin đơn hàng!" >
              <span style={{margin: "0 0 0 5px"}}>
                <InfoCircleOutlined />
              </span>
            </Tooltip>
          ) : null}
        </React.Fragment>
      }>
        {isOrderReturn && isOrderFromPOS(orderDetail) ? (
          <Form.Item
            label="Nhân viên thu ngân"
            name="account_code"
            rules={[
              {
                required: true,
                message: "Vui lòng chọn nhân viên thu ngân!",
              },
            ]}
          >
            <AccountCustomSearchSelect
              placeholder="Tìm theo họ tên hoặc mã nhân viên"
              initValue={initValueAccountCode}
              dataToSelect={accountCodeAccountData}
              setDataToSelect={setAccountCodeAccountData}
              initDataToSelect={initAccountCodeAccountData}
              disabled = {isOrderFinishedOrCancel(orderDetail) && !(isOrderReturn && isExchange)}
            />
          </Form.Item>
        ) : null}
        <Form.Item
          label={isOrderFromPOS(orderDetail) ? "Chuyên viên tư vấn" : "Nhân viên bán hàng"}
          name="assignee_code"
          rules={[
            {
              required: true,
              message: isOrderFromPOS(orderDetail) ? "Vui lòng chọn nhân viên tư vấn" : "Vui lòng chọn nhân viên bán hàng",
            },
          ]}
        >
          <AccountCustomSearchSelect
            placeholder="Tìm theo họ tên hoặc mã nhân viên"
            initValue={initValueAssigneeCode}
            dataToSelect={assigneeAccountData}
            setDataToSelect={setAssigneeAccountData}
            initDataToSelect={initAssigneeAccountData}
            disabled = {isOrderFinishedOrCancel(orderDetail) && !(isOrderReturn && isExchange)}
          />
        </Form.Item>
        {!isOrderFromPOS(orderDetail) ? (
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
              disabled = {isOrderFinishedOrCancel(orderDetail) && !(isOrderReturn && isExchange)}
            />
          </Form.Item>
        ) : null}
        {!isOrderFromPOS(orderDetail) && updateOrder ? (
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
          <Input placeholder="Điền tham chiếu" maxLength={255} disabled = {isOrderFinishedOrCancel(orderDetail) && !(isOrderReturn && isExchange)} />
        </Form.Item>
        <Form.Item
          label="Đường dẫn"
          name="url"
          tooltip={{
            title: "Thêm đường dẫn đơn hàng gốc trên kênh bán hàng",
            icon: <InfoCircleOutlined />,
          }}
        >
          <Input placeholder="Điền đường dẫn" maxLength={255} disabled = {isOrderFinishedOrCancel(orderDetail) && !(isOrderReturn && isExchange)}/>
        </Form.Item>
        {renderSplitOrder()}
      </Card>
    </StyledComponent>
  );
};

export default CreateOrderSidebarOrderInformation;
