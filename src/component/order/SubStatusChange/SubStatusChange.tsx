import { Form } from "antd";
import CustomSelect from "component/custom/select.custom";
import ModalConfirm from "component/modal/ModalConfirm";
import { setSubStatusAction } from "domain/actions/order/order.action";
import { StoreResponse } from "model/core/store.model";
import { OrderResponse } from "model/response/order/order.response";
import React, { useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { ORDER_SUB_STATUS, SUB_STATUS_CANCEL_CODE } from "utils/Order.constants";
import { strForSearch } from "utils/StringUtils";
import { StyledComponent } from "./SubStatusChange.styles";

type PropTypes = {
  orderId?: number;
  toSubStatus?: string;
  isEcommerceOrder?: boolean;
  reasonId?: number;
  subReasonRequireWarehouseChange?: number;
  changeSubStatusCallback: (value: string, data?: any) => void;
  setToSubStatusCode: (value: string | undefined) => void;
  setOrderDetail?: (data: OrderResponse) => void;
  stores?: StoreResponse[];
  defaultReceiveReturnStore?: StoreResponse | null | undefined; //kho nhận
};

let isConfirmedChangeSubStatus = false;

function SubStatusChange(props: PropTypes): JSX.Element {
  const {
    orderId,
    toSubStatus,
    changeSubStatusCallback,
    setToSubStatusCode,
    isEcommerceOrder,
    reasonId,
    subReasonRequireWarehouseChange,
    setOrderDetail,
    stores,
    defaultReceiveReturnStore,
  } = props;
  const [isShowModalConfirm, setIsShowModalConfirm] = useState(false);
  const [subText, setSubText] = useState("");
  const [confirmModalContent, setConfirmModalContent] = useState<React.ReactNode>("");

  const dispatch = useDispatch();

  const [form] = Form.useForm();

  // eslint-disable-next-line react-hooks/exhaustive-deps

  const checkIfCanChange = useCallback(() => {
    if (!toSubStatus) {
      return;
    }
    let canChange = false;
    if (SUB_STATUS_CANCEL_CODE.includes(toSubStatus)) {
      canChange = false;
      setIsShowModalConfirm(true);
      setSubText(
        "Đơn hàng trạng thái khách hàng hủy, HVC hủy, Hệ thống hủy sẽ không thao tác được nữa.",
      );
    } else if (toSubStatus === ORDER_SUB_STATUS.out_of_stock) {
      setSubText("Đơn hàng trạng thái Hết Hàng sẽ không thao tác được nữa.");
      setIsShowModalConfirm(true);
      canChange = false;
    } else if (toSubStatus === ORDER_SUB_STATUS.returned) {
      setSubText(
        `Tồn kho sẽ được cộng về kho được chọn! Hãy chắc chắn bạn đã nhận được hàng trước khi đồng ý!`,
      );
      const initialValues = {
        storeId: defaultReceiveReturnStore?.id,
      };
      const html = (
        <div>
          <Form form={form} initialValues={initialValues} layout="horizontal">
            <Form.Item
              name="storeId"
              label="Chọn kho nhận"
              rules={[{ required: true, message: "Vui lòng chọn kho cửa hàng!" }]}
              style={{ marginBottom: 0 }}
            >
              <CustomSelect
                placeholder="Chọn kho cửa hàng"
                showArrow
                optionFilterProp="children"
                showSearch
                filterOption={(input: String, option: any) => {
                  if (option.props.value) {
                    return strForSearch(option.props.children).includes(strForSearch(input));
                  }

                  return false;
                }}
              >
                {Array.isArray(stores) &&
                  stores.length > 0 &&
                  stores.map((item) => (
                    <CustomSelect.Option key={item.id} value={item.id}>
                      {item.name}
                    </CustomSelect.Option>
                  ))}
              </CustomSelect>
            </Form.Item>
          </Form>
        </div>
      );
      setIsShowModalConfirm(true);
      setConfirmModalContent(html);
      canChange = false;
    } else {
      canChange = true;
    }
    return canChange;
  }, [toSubStatus, defaultReceiveReturnStore?.id, form, stores]);

  const resetValues = useCallback(() => {
    setIsShowModalConfirm(false);
    isConfirmedChangeSubStatus = false;
    setToSubStatusCode(undefined);
  }, [setToSubStatusCode]);

  const changeOrderSubStatus = useCallback(
    (param?: { returned_store_id?: number }) => {
      if (!toSubStatus) {
        return;
      }
      const reason_id =
        isEcommerceOrder && toSubStatus === ORDER_SUB_STATUS.require_warehouse_change
          ? reasonId
          : undefined;

      const sub_reason_id =
        isEcommerceOrder && toSubStatus === ORDER_SUB_STATUS.require_warehouse_change
          ? subReasonRequireWarehouseChange
          : undefined;

      const handleChangeSubStatus = (
        reason_id: number | undefined,
        sub_reason_id: number | undefined,
        returned_store_id: number | undefined,
      ) => {
        if (orderId) {
          dispatch(
            setSubStatusAction(
              orderId,
              toSubStatus,
              (data) => {
                resetValues();
                changeSubStatusCallback(toSubStatus, data);
                setToSubStatusCode(undefined);
                setOrderDetail && setOrderDetail(data);
              },
              () => {
                resetValues();
                setToSubStatusCode(undefined);
              },
              reason_id,
              sub_reason_id,
              returned_store_id,
            ),
          );
        }
      };
      let canChange = checkIfCanChange();
      if (canChange || isConfirmedChangeSubStatus) {
        handleChangeSubStatus(reason_id, sub_reason_id, param?.returned_store_id);
      }
    },
    [
      changeSubStatusCallback,
      checkIfCanChange,
      dispatch,
      isEcommerceOrder,
      orderId,
      reasonId,
      resetValues,
      setOrderDetail,
      setToSubStatusCode,
      subReasonRequireWarehouseChange,
      toSubStatus,
    ],
  );

  useEffect(() => {
    if (toSubStatus) {
      changeOrderSubStatus();
    } else {
      setIsShowModalConfirm(false);
    }
  }, [changeOrderSubStatus, toSubStatus]);

  return (
    <StyledComponent>
      <ModalConfirm
        onCancel={() => {
          resetValues();
        }}
        onOk={() => {
          if (toSubStatus === ORDER_SUB_STATUS.returned) {
            form.validateFields().then(() => {
              const returned_store_id = form.getFieldValue("storeId");
              isConfirmedChangeSubStatus = true;
              changeOrderSubStatus({
                returned_store_id,
              });
              resetValues();
            });
          } else {
            isConfirmedChangeSubStatus = true;
            changeOrderSubStatus();
            resetValues();
          }
        }}
        okText="Đồng ý"
        cancelText="Hủy"
        title={`Bạn chắc chắn muốn đổi trạng thái?`}
        subTitle={subText}
        visible={isShowModalConfirm}
      >
        {confirmModalContent}
      </ModalConfirm>
    </StyledComponent>
  );
}

export default SubStatusChange;
