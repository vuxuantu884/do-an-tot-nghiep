import { Checkbox, Col, Form, FormInstance, Radio, Row } from "antd";
import AccountCustomSearchSelect from "component/custom/AccountCustomSearchSelect";
import NumberInput from "component/custom/number-input.custom";
import CustomSelect from "component/custom/select.custom";
import { AccountResponse } from "model/account/account.model";
import { thirdPLModel } from "model/order/shipment.model";
// import { AccountResponse } from "model/account/account.model";
import { useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { searchAccountPublicApi } from "service/accounts/account.service";
import {
  formatCurrency,
  handleFetchApiError,
  isFetchApiSuccessful,
  replaceFormatString,
} from "utils/AppUtils";
import { SHIPPING_TYPE } from "utils/Constants";
import { StyledComponent } from "./styles";

type PropTypes = {
  totalAmountCustomerNeedToPay: number;
  levelOrder?: number;
  isCancelValidateDelivery: boolean;
  externalShippers: any;
  storeId?: number | null;
  renderButtonCreateActionHtml: () => JSX.Element | null;
  setThirdPL: (thirdPl: thirdPLModel) => void;
  form: FormInstance<any>;
  thirdPL?: thirdPLModel;
};
function ShipmentMethodSelfDelivery(props: PropTypes) {
  const {
    levelOrder = 0,
    totalAmountCustomerNeedToPay,
    isCancelValidateDelivery,
    storeId,
    externalShippers,
    renderButtonCreateActionHtml,
    setThirdPL,
    form,
    thirdPL,
  } = props;

  const DELIVERY_TYPES = {
    employee: {
      title: "Nhân viên YODY",
      value: "employee",
    },
    external_shipper: {
      title: "Đối tác khác",
      value: "external_shipper",
    },
  };

  const [is4h, setIs4h] = useState(false);
  const [typeDelivery, setTypeDelivery] = useState(DELIVERY_TYPES.employee.value);

  const [storeAccountData, setStoreAccountData] = useState<Array<AccountResponse>>([]);
  const [assigneeAccountData, setYodyAccountData] = useState<Array<AccountResponse>>([]);
  const [initValueYodyCode, setInitValueYodyCode] = useState("");
  const [initYodyAccountData, setInitYodyAccountData] = useState<Array<AccountResponse>>([]);

  const DELIVERY_TYPES_ARRAY = Object.entries(DELIVERY_TYPES).map((single) => {
    const [, value] = single;
    return value;
  });

  const dispatch = useDispatch();
  useEffect(() => {
    if (!storeId) {
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
          handleFetchApiError(response, "Danh sách tài khoản", dispatch);
        }
      })
      .catch((error) => {
        console.log("error", error);
      });
  }, [dispatch, storeId]);

  const onChange = useCallback(
    (e) => {
      if (setIs4h) {
        setIs4h(e.target.checked);
      }
    },
    [setIs4h],
  );

  const onChangeType = useCallback(
    (e) => {
      setTypeDelivery(e.target.value);
      form?.setFieldsValue({ shipper_code: undefined });
    },
    [form],
  );

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
                if (response.data.items.length === 0) {
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
                handleFetchApiError(response, "Danh sách tài khoản", dispatch);
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
    if (thirdPL?.service === SHIPPING_TYPE.DELIVERY_4H) {
      setIs4h(true);
    }
  }, [thirdPL?.service]);

  useEffect(() => {
    setThirdPL({
      delivery_service_provider_code: typeDelivery,
      delivery_service_provider_id: null,
      insurance_fee: null,
      delivery_service_provider_name: "",
      delivery_transport_type: "",
      service: is4h ? SHIPPING_TYPE.DELIVERY_4H : "",
      shipping_fee_paid_to_three_pls: thirdPL?.shipping_fee_paid_to_three_pls || null,
    });
  }, [is4h, setThirdPL, thirdPL?.shipping_fee_paid_to_three_pls, typeDelivery]);

  return (
    <StyledComponent>
      <div>
        <Row className="options">
          <Checkbox value={is4h} checked={is4h} onChange={onChange} className="shipment4h">
            Đơn giao 4H
          </Checkbox>
          <Radio.Group value={typeDelivery} onChange={onChangeType}>
            {DELIVERY_TYPES_ARRAY.map((type) => {
              return <Radio value={type.value}>{type.title}</Radio>;
            })}
          </Radio.Group>
        </Row>
        <Row gutter={20}>
          <Col md={12}>
            <Form.Item
              label={DELIVERY_TYPES_ARRAY.find((type) => type.value === typeDelivery)?.title || ""}
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
              {typeDelivery === DELIVERY_TYPES.employee.value ? (
                <AccountCustomSearchSelect
                  placeholder="Tìm theo họ tên hoặc mã nhân viên"
                  initValue={initValueYodyCode}
                  dataToSelect={assigneeAccountData}
                  setDataToSelect={setYodyAccountData}
                  initDataToSelect={initYodyAccountData}
                  disabled={levelOrder > 3}
                />
              ) : (
                <CustomSelect
                  className="select-with-search"
                  showSearch
                  notFoundContent="Không tìm thấy kết quả"
                  style={{ width: "100%" }}
                  placeholder="Chọn đối tác giao hàng"
                  filterOption={(input, option) => {
                    if (option) {
                      return option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0;
                    }
                    return false;
                  }}
                  disabled={levelOrder > 3}
                >
                  {externalShippers?.map((item: any, index: number) => (
                    <CustomSelect.Option
                      style={{ width: "100%" }}
                      key={index.toString()}
                      value={item.code}
                    >
                      {`${item.name} - ${item.phone}`}
                    </CustomSelect.Option>
                  ))}
                </CustomSelect>
              )}
            </Form.Item>

            <Form.Item label="Tiền thu hộ">
              <NumberInput
                className="numberInput"
                format={(a: string) => formatCurrency(a)}
                replace={(a: string) => replaceFormatString(a)}
                placeholder="0"
                value={
                  totalAmountCustomerNeedToPay && totalAmountCustomerNeedToPay > 0
                    ? totalAmountCustomerNeedToPay
                    : 0
                }
                maxLength={999999999999}
                minLength={0}
                disabled
              />
            </Form.Item>
          </Col>
          <Col md={12}>
            <Form.Item name="shipping_fee_paid_to_three_pls" label="Phí ship trả đối tác giao hàng">
              <NumberInput
                className="numberInput"
                format={(a: string) => formatCurrency(a)}
                replace={(a: string) => replaceFormatString(a)}
                placeholder="0"
                maxLength={15}
                minLength={0}
                disabled={levelOrder > 3}
                onChange={(value) => {
                  if (thirdPL) {
                    setThirdPL({
                      ...thirdPL,
                      shipping_fee_paid_to_three_pls: value || null,
                    });
                  }
                }}
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
