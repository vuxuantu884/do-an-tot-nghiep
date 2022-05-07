import { Form, FormInstance, Modal, ModalProps, Select } from "antd";
import NumberInput from "component/custom/number-input.custom";
import CustomSelect from "component/custom/select.custom";
import withWarrantyModalForm from "HOCs/warranty/withWarrantyModalForm";
import { PaymentMethodResponse } from "model/response/order/paymentmethod.response";
import {
  WarrantiesValueUpdateGetModel,
  WarrantyItemModel,
  WarrantyItemStatus,
  WarrantyReturnStatusModel,
} from "model/warranty/warranty.model";
import React, { useState } from "react";
import {
  formatCurrency,
  formatCurrencyInputValue,
  replaceFormatString,
} from "utils/AppUtils";
import {
  WARRANTY_ITEM_STATUS,
  WARRANTY_RETURN_STATUS,
} from "utils/Warranty.constants";

export type initialFormModalWarrantiesStatusType = {
  status: string;
  return_status: string;
  payment_method_id: number;
  value: number;
};

type PropTypes = ModalProps & {
  form: FormInstance<any>;
  handleOk: (values: any) => void;
  handleCancel: () => void;
  initialFormValues: initialFormModalWarrantiesStatusType;
  selectedData?: WarrantiesValueUpdateGetModel;
  setSelectedData?: (data: WarrantiesValueUpdateGetModel) => void;
  filteredPaymentMethod?: PaymentMethodResponse[];
  record?: WarrantyItemModel | undefined;
};

function WarrantyStatusModal(props: PropTypes) {
  const {
    onCancel,
    onOk,
    form,
    handleOk,
    handleCancel,
    initialFormValues,
    selectedData,
    filteredPaymentMethod,
    record,
    setSelectedData,
    ...rest
  } = props;

  const [isShowPaymentInModalStatus, setIsShowPaymentInModalStatus] =
    useState(false);

  const checkIfFromUnreturnedToReturned = (record: any, value: string) => {
    return (
      record.return_status === WarrantyReturnStatusModel.UNRETURNED &&
      value === WarrantyReturnStatusModel.RETURNED
    );
  };

  const handleChangeReturnStatus = (value: string) => {
    if (selectedData?.status === WarrantyItemStatus.NOT_FIXED) {
      setIsShowPaymentInModalStatus(false);
    } else if (checkIfFromUnreturnedToReturned(record, value)) {
      setIsShowPaymentInModalStatus(true);
    } else {
      setIsShowPaymentInModalStatus(false);
    }
  };

  const isReturned =
    record?.return_status === WarrantyReturnStatusModel.RETURNED;

  return (
    <Modal
      title={`Cập nhật trạng thái id "${record?.id}"`}
      onCancel={() => {
        setIsShowPaymentInModalStatus(false);
        handleCancel();
      }}
      onOk={(values) => {
        handleOk(values);
      }}
      okButtonProps={{
        style: { display: isReturned ? "none" : "inline-flex" },
      }}
      {...rest}
    >
      <Form form={form} layout="vertical" initialValues={initialFormValues}>
        <Form.Item
          label="Trạng thái xử lý sản phẩm"
          labelCol={{ span: 24 }}
          name="status"
          rules={[
            {
              required: true,
              message: "Vui lòng điền trạng thái xử lý sản phẩm!",
            },
          ]}
        >
          <CustomSelect
            showSearch
            showArrow
            allowClear
            optionFilterProp="children"
            placeholder="Chọn trạng thái xử lý sản phẩm"
            onChange={(value) => {
              setSelectedData &&
              setSelectedData({
                ...value,
                status: value,
              });
              setIsShowPaymentInModalStatus(false);
            }}
            disabled={isReturned}
          >
            {WARRANTY_ITEM_STATUS.length > 0 &&
              WARRANTY_ITEM_STATUS.map((status) => (
                <Select.Option key={status.code} value={status.code}>
                  {`${status.name}`}
                </Select.Option>
              ))}
          </CustomSelect>
        </Form.Item>
        <Form.Item
          label="Trạng thái trả khách"
          labelCol={{ span: 24 }}
          name="return_status"
          rules={[
            {
              required: true,
              message: "Vui lòng điền trạng thái trả khách!",
            },

            () => ({
              validator(_, value) {
                if (
                  value === WarrantyReturnStatusModel.RETURNED &&
                  selectedData?.status === WarrantyItemStatus.RECEIVED
                ) {
                  return Promise.reject(
                    new Error(
                      "Trạng thái mới tiếp nhận, ko chuyển được đã trả khách!",
                    ),
                  );
                }
                return Promise.resolve();
              },
            }),
            () => ({
              validator(_, value) {
                if (
                  value === WarrantyReturnStatusModel.RETURNED &&
                  selectedData?.status === WarrantyItemStatus.FIXING
                ) {
                  return Promise.reject(
                    new Error(
                      "Trạng thái đang xử lý, ko chuyển được đã trả khách!",
                    ),
                  );
                }
                return Promise.resolve();
              },
            }),
          ]}
        >
          <CustomSelect
            showSearch
            showArrow
            allowClear
            optionFilterProp="children"
            placeholder="Chọn trạng thái trả khách"
            onChange={(value) => {
              handleChangeReturnStatus(value);
            }}
            disabled={isReturned}
          >
            {WARRANTY_RETURN_STATUS.length > 0 &&
              WARRANTY_RETURN_STATUS.map((status) => (
                <Select.Option
                  key={status.code}
                  value={status.code}
                  disabled={
                    status.code === WarrantyReturnStatusModel.RETURNED &&
                    (selectedData?.status === WarrantyItemStatus.RECEIVED ||
                      selectedData?.status === WarrantyItemStatus.FIXING)
                  }
                >
                  {`${status.name}`}
                </Select.Option>
              ))}
          </CustomSelect>
        </Form.Item>
        {isShowPaymentInModalStatus ? (
          <React.Fragment>
            <Form.Item
              label="Hình thức thanh toán"
              labelCol={{ span: 24 }}
              name="payment_method_id"
              rules={[
                {
                  required: true,
                  message: "Vui lòng chọn hình thức thanh toán!",
                },
              ]}
            >
              <CustomSelect
                showSearch
                showArrow
                allowClear
                optionFilterProp="children"
                placeholder="Chọn hình thức thanh toán"
                disabled={isReturned}
              >
                {filteredPaymentMethod &&
                  filteredPaymentMethod.length > 0 &&
                  filteredPaymentMethod.map((method) => (
                    <Select.Option key={method.id} value={method.id}>
                      {`${method.name}`}
                    </Select.Option>
                  ))}
              </CustomSelect>
            </Form.Item>
            <Form.Item
              label={`Thanh toán (thanh toán đủ phí báo khách: ${formatCurrency(
                record?.customer_fee || 0,
              )})`}
              labelCol={{ span: 24 }}
              labelAlign={"left"}
              name="value"
              rules={[
                {
                  required: true,
                  message: "Vui lòng điền thanh toán!",
                },
                {
                  validator(_, value) {
                    if (value > (record?.customer_fee || 0)) {
                      return Promise.reject(
                        new Error("Vui lòng nhập đủ, không nhập thừa tiền!"),
                      );
                    }
                    return Promise.resolve();
                  },
                },
                () => ({
                  validator(_, value) {
                    if (value && value < 1000) {
                      return Promise.reject(
                        new Error("Nhập 0 hoặc ít nhất 4 chữ số!"),
                      );
                    }
                    return Promise.resolve();
                  },
                }),
              ]}
            >
              <NumberInput
                format={(a: string) => {
                  return formatCurrencyInputValue(a);
                }}
                replace={(a: string) => replaceFormatString(a)}
                placeholder="Nhập số tiền thanh toán"
                style={{
                  textAlign: "left",
                }}
                maxLength={10}
                minLength={0}
              />
            </Form.Item>
          </React.Fragment>
        ) : null}
      </Form>
    </Modal>
  );
}

export default withWarrantyModalForm(WarrantyStatusModal);
