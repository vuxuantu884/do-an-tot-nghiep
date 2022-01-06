import { Checkbox, Col, Form, FormInstance, Radio, Row } from "antd";
import AccountCustomSearchSelect from "component/custom/AccountCustomSearchSelect";
import NumberInput from "component/custom/number-input.custom";
import CustomSelect from "component/custom/select.custom";
import { AccountResponse } from "model/account/account.model";
import { thirdPLModel } from "model/order/shipment.model";
import { SelfDeliveryData } from "model/response/order/order.response";
// import { AccountResponse } from "model/account/account.model";
import React, { useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { searchAccountPublicApi } from "service/accounts/account.service";
import { formatCurrency, handleFetchApiError, isFetchApiSuccessful, replaceFormatString } from "utils/AppUtils";
import { StyledComponent } from "./styles";

type PropType = {
  totalAmountCustomerNeedToPay: number;
  levelOrder?: number;
  isCancelValidateDelivery: boolean;
  listExternalShippers: any;
	storeId?: number | null;
  setShippingFeeInformedToCustomer: (value: number) => void;
  renderButtonCreateActionHtml: () => JSX.Element | null;
  setThirdPL: (thirdPl: thirdPLModel) => void;
  form: FormInstance<any>;
  initSelfDelivery? : SelfDeliveryData;
  isEcommerceOrder?: boolean;
};
function ShipmentMethodSelfDelivery(props: PropType) {
  const {
    levelOrder = 0,
    totalAmountCustomerNeedToPay,
    isCancelValidateDelivery,
		storeId,
    listExternalShippers,
    setShippingFeeInformedToCustomer,
    renderButtonCreateActionHtml,
    setThirdPL,
    form,
    initSelfDelivery,
    isEcommerceOrder,
  } = props;
  const [is4h, setIs4h] = useState(false);
  const [typeDelivery, setTypeDelivery] = useState('employee');

	const [storeAccountData, setStoreAccountData] = useState<Array<AccountResponse>>([]);
	const [assigneeAccountData, setYodyAccountData] = useState<Array<AccountResponse>>(
    []
  );
	const [initValueYodyCode, setInitValueYodyCode] = useState("");
	const [initYodyAccountData, setInitYodyAccountData] = useState<
    Array<AccountResponse>
  >([]);

	const dispatch = useDispatch();
console.log('storeId', storeId)
console.log('initYodyAccountData', initYodyAccountData)
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
					setInitYodyAccountData(response.data.items);
				} else {
					handleFetchApiError(response, "Danh sách tài khoản", dispatch)
				}
			})
			.catch((error) => {
				console.log("error", error);
			})
	}, [dispatch, storeId])

  const onChange = useCallback((e) => {
    setIs4h(e.target.checked);
  }, []);

  const onChangeType = useCallback((e) => {
    setTypeDelivery(e.target.value);
    form?.setFieldsValue({shipper_code: undefined});
  }, [form]);

  useEffect(() => {
    setThirdPL({
      delivery_service_provider_code: typeDelivery,
      delivery_service_provider_id: null,
      insurance_fee: null,
      delivery_service_provider_name: "",
      delivery_transport_type: "",
      service: is4h ? '4h_delivery' : "",
      shipping_fee_paid_to_three_pls: null,
    })
  }, [is4h, setThirdPL, typeDelivery])

	useEffect(() => {
    const pushCurrentValueToDataAccount = (fieldName: string) => {
			let fieldNameValue = form.getFieldValue(fieldName);
      if (fieldNameValue) {
        switch (fieldName) {
          case "shipper_code":
            setInitValueYodyCode(fieldNameValue);
            break;
          default:
            break;
        }
        if (storeAccountData.some((single) => single.code === fieldNameValue)) {
					setYodyAccountData(storeAccountData);
        } else {
					searchAccountPublicApi({
						condition: fieldNameValue,
					})
						.then((response) => {
							if (isFetchApiSuccessful(response)) {
								if(response.data.items.length === 0) {
									return;
								}
								if (storeAccountData.length > 0) {
									let result = [...storeAccountData];
									result.push(response.data.items[0]);
									switch (fieldName) {
										case "shipper_code":
											setInitYodyAccountData(result);
											setYodyAccountData(result);
											break;
										default:
											break;
									}
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
    pushCurrentValueToDataAccount("shipper_code");
  }, [dispatch, form, storeAccountData]);
  useEffect(() => {
    if (isEcommerceOrder && initSelfDelivery) {
      setShippingFeeInformedToCustomer(initSelfDelivery.shipping_fee_informed_to_customer || 0);
      form.setFieldsValue({ shipping_fee_informed_to_customer: initSelfDelivery.shipping_fee_informed_to_customer  || 0 });
    }
  }, [form, initSelfDelivery, isEcommerceOrder, setShippingFeeInformedToCustomer])


  return (
    <StyledComponent>
      <div>
        <Row className="options">
          <Checkbox value={is4h} onChange={onChange} className="shipment4h">Đơn giao 4H</Checkbox>
          <Radio.Group value={typeDelivery} onChange={onChangeType}>
            <Radio value="employee">Nhân viên YODY</Radio>
            <Radio value="external_shipper">Đối tác khác</Radio>
          </Radio.Group>
        </Row>
        <Row gutter={20}>
          <Col md={12}>
            <Form.Item
              label={typeDelivery === 'employee' ? "Nhân viên Yody" : "Đối tác khác"}
              name="shipper_code"
              rules={
                // khi lưu nháp không validate
                !isCancelValidateDelivery
                  ? [
                      {
                        required: true,
                        message: "Vui lòng chọn đối tác giao hàng",
                      },
                    ]
                  : undefined
              }
            >
							{typeDelivery === 'employee' ?
								(
									<AccountCustomSearchSelect
										placeholder="Tìm theo họ tên hoặc mã nhân viên"
										initValue={initValueYodyCode}
										dataToSelect={assigneeAccountData}
										setDataToSelect={setYodyAccountData}
										initDataToSelect={initYodyAccountData}
										disabled={levelOrder > 3}
									/>
								)
								:
								(
									<CustomSelect
										className="select-with-search"
										showSearch
										notFoundContent="Không tìm thấy kết quả"
										style={{width: "100%"}}
										placeholder="Chọn đối tác giao hàng"
										filterOption={(input, option) => {
											if (option) {
												return (
													option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
												);
											}
											return false;
										}}
										disabled={levelOrder > 3}
									>
										{listExternalShippers?.map((item: any, index: number) => (
											<CustomSelect.Option
												style={{width: "100%"}}
												key={index.toString()}
												value={item.code}
											>
												{`${item.name} - ${item.phone}`}
											</CustomSelect.Option>
										))}
									</CustomSelect>
								)
							}
            </Form.Item>

            {/* {paymentMethod === PaymentMethodOption.COD && ( */}
            <Form.Item label="Tiền thu hộ">
              <NumberInput
                format={(a: string) => formatCurrency(a)}
                replace={(a: string) => replaceFormatString(a)}
                placeholder="0"
                value={
                  totalAmountCustomerNeedToPay && totalAmountCustomerNeedToPay > 0
                    ? totalAmountCustomerNeedToPay
                    : 0
                }
                style={{
                  textAlign: "right",
                  width: "100%",
                  color: "#222222",
                }}
                maxLength={999999999999}
                minLength={0}
                disabled
              />
            </Form.Item>
            {/* )} */}
          </Col>
          <Col md={12}>
            <Form.Item
              name="shipping_fee_paid_to_three_pls"
              label="Phí ship trả đối tác giao hàng"
            >
              <NumberInput
                format={(a: string) => formatCurrency(a)}
                replace={(a: string) => replaceFormatString(a)}
                placeholder="0"
                style={{
                  textAlign: "right",
                  width: "100%",
                  color: "#222222",
                }}
                maxLength={15}
                minLength={0}
                disabled={levelOrder > 3}
              />
            </Form.Item>
            <Form.Item
              name="shipping_fee_informed_to_customer"
              label="Phí ship báo khách"
            >
              <NumberInput
                format={(a: string) => formatCurrency(a)}
                replace={(a: string) => replaceFormatString(a)}
                placeholder="0"
                style={{
                  textAlign: "right",
                  width: "100%",
                  color: "#222222",
                }}
                maxLength={15}
                minLength={0}
                onChange={(value) => {
                  if (value) {
                    setShippingFeeInformedToCustomer(value);
                  } else {
                    setShippingFeeInformedToCustomer(0);
                  }
                }}
                disabled={levelOrder > 3}
              />
            </Form.Item>
          </Col>
        </Row>
        {renderButtonCreateActionHtml && renderButtonCreateActionHtml()}
      </div>
    </StyledComponent>
  );
}

export default ShipmentMethodSelfDelivery;
