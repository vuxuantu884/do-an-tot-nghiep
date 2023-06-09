import { Button, Form, FormInstance, InputNumber, Select, Space } from "antd";
import AccountCustomSearchSelect from "component/custom/AccountCustomSearchSelect";
import OrderCustomSearchSelect, {
  OrderInformationModel,
} from "component/custom/OrderCustomSearchSelect";
import ProductSkuMultiSelect from "component/order/ProductSkuMultiSelect";
import { hideLoading, showLoading } from "domain/actions/loading.action";
import { AccountResponse } from "model/account/account.model";
import { OrderPageTypeModel } from "model/order/order.model";
import {
  SpecialOrderFormValueModel,
  SpecialOrderModel,
  SpecialOrderOrderTypeInFormModel,
} from "model/order/special-order.model";
import React, { useMemo, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { searchAccountPublicApi } from "service/accounts/account.service";
import {
  formatCurrency,
  handleFetchApiError,
  isFetchApiSuccessful,
  replaceFormat,
} from "utils/AppUtils";
import { ECOMMERCE_CHANNEL_CODES_UPDATE_ORDER } from "utils/Constants";
import {
  checkIfECommerceByOrderChannelCodeUpdateOrder,
  checkIfOrderPageType,
  getArrayFromObject,
} from "utils/OrderUtils";
import {
  orderSpecialReason,
  specialOrderDisplayField,
  specialOrderTypes,
} from "../SideBarOrderSpecial/helper";
import { StyledComponent } from "./styles";

type Props = {
  displayOrderSpecialType: string | undefined;
  setDisplayOrderSpecialType: React.Dispatch<React.SetStateAction<string | undefined>>;
  exceptOrderTypeSelectArr: string[];
  initialFormValue: SpecialOrderFormValueModel;
  handleCancel: () => void;
  handleDelete: () => void;
  form: FormInstance<any>;
  handleSubmitForm: (value: SpecialOrderModel) => void;
  canDelete: boolean;
  orderPageType: OrderPageTypeModel;
  setOrderSpecialEcommerce?: (v?: string) => void;
};

function SpecialOrderCreateForm(props: Props) {
  const {
    exceptOrderTypeSelectArr,
    initialFormValue,
    handleCancel,
    form,
    displayOrderSpecialType,
    setDisplayOrderSpecialType,
    handleSubmitForm,
    handleDelete,
    canDelete,
    orderPageType,
  } = props;
  const dispatch = useDispatch();

  const isOrderCreatePage = checkIfOrderPageType.isOrderCreatePage(orderPageType);
  const isOrderUpdatePage = checkIfOrderPageType.isOrderUpdatePage(orderPageType);
  // const isOrderDetailPage = checkIfOrderPageType.isOrderDetailPage(orderPageType);

  const isEditSpecialOrder = useMemo(() => {
    if (
      !isOrderCreatePage &&
      initialFormValue?.type === specialOrderTypes.orders_replace.value &&
      checkIfECommerceByOrderChannelCodeUpdateOrder(initialFormValue.ecommerce)
    ) {
      return false;
    }
    return true;
  }, [initialFormValue?.ecommerce, initialFormValue?.type, isOrderCreatePage]);

  const [initAccountCodeAccountData, setInitAccountCodeAccountData] = useState<
    Array<AccountResponse>
  >([]);

  const [accountCodeAccountData, setAccountCodeAccountData] = useState<Array<AccountResponse>>([]);

  const [isShowDetail, setIsShowDetail] = useState(true);

  const [filteredOrders, setFilteredOrders] = useState<OrderInformationModel[]>([]);

  const specialOrderTypesArr = getArrayFromObject(specialOrderTypes);
  const orderSpecialReasonArr = getArrayFromObject(orderSpecialReason);

  const selectedSpecialOrder = specialOrderTypesArr.find(
    (type) => displayOrderSpecialType === type.value,
  );
  const checkIfDisplayField = (fieldName: string) => {
    return selectedSpecialOrder?.displayFields.includes(fieldName);
  };

  const handleSubmit = (value: SpecialOrderFormValueModel): Promise<SpecialOrderModel> => {
    return new Promise((resolve, reject) => {
      const variantSkus = value?.variant_skus;
      if (variantSkus && variantSkus.length > 0) {
        let { variant_skus, ...resultValue } = value;
        let result: SpecialOrderModel = {
          ...resultValue,
          variant_skus: value?.variant_skus?.join(","),
        };
        resolve(result);
      } else {
        resolve({
          ...value,
          variant_skus: null,
        });
      }
    });
  };

  useEffect(() => {
    if (!initialFormValue.order_carer_code) {
      return;
    }
    const pushCurrentValueToDataAccount = () => {
      searchAccountPublicApi({
        condition: initialFormValue.order_carer_code,
      })
        .then((response) => {
          if (isFetchApiSuccessful(response)) {
            if (response.data.items.length === 0) {
              return;
            }
            setInitAccountCodeAccountData([response.data.items[0]]);
          } else {
            handleFetchApiError(response, "Danh sách tài khoản", dispatch);
          }
        })
        .catch((error) => {
          console.log("error", error);
        });
    };
    pushCurrentValueToDataAccount();
  }, [dispatch, initialFormValue.order_carer_code]);

  useEffect(() => {
    form.setFieldsValue({
      variant_skus: initialFormValue.variant_skus,
    });
  }, [form, initialFormValue]);

  return (
    <StyledComponent>
      <Form
        layout="vertical"
        form={form}
        onFinish={async (value) => {
          console.log("value", value);
          try {
            await dispatch(showLoading());
            let result = await handleSubmit(value);
            await handleSubmitForm(result);
            await dispatch(hideLoading());
          } catch (error) {
            console.log("error", error);
            dispatch(hideLoading());
          }
        }}
        initialValues={initialFormValue}
      >
        <Form.Item
          label="Loại"
          name="type"
          hidden={
            selectedSpecialOrder && exceptOrderTypeSelectArr.includes(selectedSpecialOrder.value)
          }
          rules={[{ required: !isOrderCreatePage, message: "Vui lòng chọn loại!" }]}
        >
          <Select
            allowClear
            showSearch
            showArrow
            onChange={(value: string | undefined) => {
              setDisplayOrderSpecialType(value);
              if (value !== undefined) {
                setIsShowDetail(true);
              } else {
                setIsShowDetail(false);
              }
            }}
            placeholder="Chọn loại đơn hàng"
            disabled={!isEditSpecialOrder}
          >
            {Array.isArray(specialOrderTypesArr) &&
              specialOrderTypesArr
                .filter((type) => !exceptOrderTypeSelectArr.includes(type.value))
                .map((p) => (
                  <Select.Option
                    value={p.value}
                    key={p.value}
                    disabled={
                      !isOrderCreatePage && p.value === specialOrderTypes.orders_replace.value
                    }
                  >
                    {p.title}
                  </Select.Option>
                ))}
          </Select>
        </Form.Item>

        {(isShowDetail || true) && (
          <React.Fragment>
            {checkIfDisplayField(specialOrderDisplayField.nhanVienCSDH) && (
              <Form.Item
                label={
                  displayOrderSpecialType === specialOrderTypes.orders_split.value
                    ? "Nhân viên thao tác"
                    : "Nhân viên CSĐH"
                }
                name="order_carer_code"
                rules={[
                  {
                    required: true,
                    message:
                      displayOrderSpecialType === specialOrderTypes.orders_split.value
                        ? "Vui lòng chọn nhân viên thao tác"
                        : "Vui lòng chọn nhân viên CSĐH",
                  },
                ]}
              >
                <AccountCustomSearchSelect
                  placeholder="Tìm theo họ tên hoặc mã nhân viên"
                  dataToSelect={accountCodeAccountData}
                  setDataToSelect={setAccountCodeAccountData}
                  initDataToSelect={initAccountCodeAccountData}
                  isSearchAccountActive
                />
              </Form.Item>
            )}

            {checkIfDisplayField(specialOrderDisplayField.donGoc) && (
              <Form.Item
                // label="Đơn gốc"
                label={
                  displayOrderSpecialType === specialOrderTypes.orders_split.value
                    ? "Đơn tách"
                    : "Đơn gốc"
                }
                name="order_original_code"
                // name={
                //   !isShowCreateForm
                //     ? "order_original_code "
                //     : "order_create_page_special_order_order_original_code"
                // }
                // rules={[{ required: true, message: "Vui lòng chọn đơn gốc!" }]}
                rules={
                  displayOrderSpecialType === specialOrderTypes.orders_replace.value
                    ? [{ required: false }]
                    : [
                        {
                          required: true,
                          message:
                            displayOrderSpecialType === specialOrderTypes.orders_split.value
                              ? "Vui lòng chọn đơn tách"
                              : "Vui lòng chọn đơn gốc",
                        },
                      ]
                }
              >
                <OrderCustomSearchSelect
                  placeholder="Tìm theo mã đơn hàng"
                  dataToSelect={filteredOrders}
                  setDataToSelect={setFilteredOrders}
                  initDataToSelect={[]}
                  queryParam={{
                    limit: 10,
                  }}
                  orderType={SpecialOrderOrderTypeInFormModel.order}
                  disabled={
                    !isOrderCreatePage &&
                    displayOrderSpecialType === specialOrderTypes.orders_replace.value
                  }
                />
              </Form.Item>
            )}

            {checkIfDisplayField(specialOrderDisplayField.donTra) && (
              <Form.Item
                label="Đơn trả"
                name="order_return_code"
                // name={
                //   !isShowCreateForm
                //     ? "order_return_code "
                //     : "order_create_page_special_order_order_return_code"
                // }
                rules={[{ required: true, message: "Vui lòng chọn đơn trả!" }]}
              >
                <OrderCustomSearchSelect
                  placeholder="Tìm theo mã đơn hàng"
                  dataToSelect={filteredOrders}
                  setDataToSelect={setFilteredOrders}
                  initDataToSelect={[]}
                  queryParam={{
                    limit: 10,
                  }}
                  orderType={SpecialOrderOrderTypeInFormModel.orderReturn}
                />
              </Form.Item>
            )}

            {checkIfDisplayField(specialOrderDisplayField.sanPham) && (
              <Form.Item
                label="Sản phẩm"
                name="variant_skus"
                // name={!isOrderCreatePage ? "skus " : "order_create_page_special_order_skus"}
                rules={[{ required: true, message: "Vui lòng chọn sản phẩm!" }]}
              >
                <ProductSkuMultiSelect placeholder="Tìm sản phẩm" />
              </Form.Item>
            )}

            {checkIfDisplayField(specialOrderDisplayField.tien) && (
              <Form.Item
                label="Số tiền"
                name="amount"
                // name={!isOrderCreatePage ? "amount " : "order_create_page_special_order_amount"}
                rules={[
                  {
                    required: true,
                    message: "Vui lòng nhập số tiền!",
                  },
                  () => ({
                    validator(_, value) {
                      if (value && value < 1000) {
                        return Promise.reject(new Error("Nhập 0 hoặc ít nhất 4 chữ số!"));
                      }
                      return Promise.resolve();
                    },
                  }),
                ]}
              >
                <InputNumber
                  placeholder="Nhập số tiền"
                  className="site-input-right price_max"
                  formatter={(value) => {
                    return value ? formatCurrency(value) : "";
                  }}
                  parser={(value: string | undefined) => replaceFormat(value || "")}
                  min={0}
                  max={1000000000}
                  style={{ width: "100%" }}
                />
              </Form.Item>
            )}

            {checkIfDisplayField(specialOrderDisplayField.lyDo) && (
              <Form.Item
                label="Lý do"
                name="reason"
                hidden={
                  selectedSpecialOrder &&
                  exceptOrderTypeSelectArr.includes(selectedSpecialOrder.value)
                }
                rules={[{ required: true, message: "Vui lòng chọn lý do!" }]}
              >
                <Select allowClear showSearch showArrow placeholder="Chọn lý do">
                  {Array.isArray(orderSpecialReasonArr) &&
                    orderSpecialReasonArr.map((reason) => (
                      <Select.Option value={reason.value} key={reason.value}>
                        {reason.title}
                      </Select.Option>
                    ))}
                </Select>
              </Form.Item>
            )}
            {checkIfDisplayField(specialOrderDisplayField.san) && (
              <Form.Item
                label="Sàn"
                name="ecommerce"
                rules={[{ required: true, message: "Vui lòng sàn!" }]}
              >
                <Select
                  allowClear
                  showSearch
                  showArrow
                  placeholder="Chọn sàn"
                  onChange={(value) => {
                    props.setOrderSpecialEcommerce &&
                      props.setOrderSpecialEcommerce(value as string);
                  }}
                  disabled={!isOrderCreatePage}
                >
                  {ECOMMERCE_CHANNEL_CODES_UPDATE_ORDER.map((reason, index) => (
                    <Select.Option value={reason.channel_code} key={index}>
                      {reason.channel_code}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            )}
            {!isOrderCreatePage && !isOrderUpdatePage && (
              <Space direction="horizontal" align="end" className="row-btn buttonWrapper">
                <Button
                  onClick={() => {
                    handleCancel();
                  }}
                >
                  Hủy
                </Button>
                <Button
                  danger
                  disabled={!canDelete}
                  onClick={() => {
                    handleDelete();
                  }}
                >
                  Xóa
                </Button>
                <Button
                  type="primary"
                  onClick={() => {
                    form.validateFields().then(() => {
                      form.submit();
                    });
                  }}
                >
                  Lưu
                </Button>
              </Space>
            )}
          </React.Fragment>
        )}
      </Form>
    </StyledComponent>
  );
}

export default SpecialOrderCreateForm;
