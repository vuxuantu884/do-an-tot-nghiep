import { Button, Checkbox, Col, Form, Input, Modal, Row } from "antd";
import TextArea from "antd/lib/input/TextArea";
import { hideLoading, showLoading } from "domain/actions/loading.action";
import { OrderBillRequestFormModel } from "model/request/order.request";
import { OrderResponse } from "model/response/order/order.response";
import { useEffect, useMemo } from "react";
import { useDispatch } from "react-redux";
import { getDetailOrderApi } from "service/order/order.service";
import { handleFetchApiError, isFetchApiSuccessful } from "utils/AppUtils";
import { OrderStatus } from "utils/Constants";
import { RegUtil } from "utils/RegUtils";
import { StyledComponent } from "./styles";

type PropTypes = {
  modalTitle: string;
  isVisibleOrderBillRequestModal: boolean;
  handleOk: (values: any, orderBillId: number | null) => void;
  handleCancel: () => void;
  handleClickDelete?: () => void;
  isPageOrderUpdate?: boolean;
  orderDetail: OrderResponse | null | undefined;
  initOrderBillRequest: OrderBillRequestFormModel | undefined;
  orderBillId: number | null;
  setOrderBillId: (value: number | null) => void;
};

function OrderBillRequestModal(props: PropTypes) {
  const {
    modalTitle,
    isVisibleOrderBillRequestModal,
    handleCancel,
    handleClickDelete,
    isPageOrderUpdate = false,
    orderDetail,
    handleOk,
    initOrderBillRequest,
    orderBillId,
    setOrderBillId,
  } = props;
  const [form] = Form.useForm();

  const dispatch = useDispatch()

  const initialFormValues:OrderBillRequestFormModel = useMemo(() => {
    if(initOrderBillRequest) {
      return initOrderBillRequest
    }
    return {
      company: undefined,
      tax: undefined,
      address: undefined,
      pic: undefined,
      note: undefined,
      email: undefined,
      contract: false,
    };
  }, [initOrderBillRequest]);

  const handleSubmit = () => {
    form.validateFields().then(() => {
      const values = form.getFieldsValue();
      handleOk(values, orderBillId);
    });
  };

  const checkIfCanUpdateExportRequest = () => {
    const arrOrderStatusCanUpdate = [OrderStatus.CANCELLED, OrderStatus.COMPLETED, OrderStatus.FINISHED]
    return isPageOrderUpdate && (orderDetail?.status && !arrOrderStatusCanUpdate.includes(orderDetail?.status));
  };

  const isDisableUpdateExportRequest = !checkIfCanUpdateExportRequest()

  const renderModalFooter = () => {
    return (
      <StyledComponent>
        <Button type="default" onClick={() => handleCancel()}>
          Thoát
        </Button>
        {isPageOrderUpdate && (
          <Button
            type="default"
            danger
            onClick={() => {
              handleClickDelete && handleClickDelete();
            }} 
            className="cancelButton"
            disabled={!orderBillId}
          >
            Xóa
          </Button>
        )}
        <Button
          type="primary"
          onClick={() => {
            handleSubmit();
          }}
          disabled={isDisableUpdateExportRequest && !!orderBillId}
        >
          Lưu
        </Button>
      </StyledComponent>
    );
  };

  useEffect(() => {
    if(orderDetail && isVisibleOrderBillRequestModal) {
      dispatch(showLoading());
      getDetailOrderApi(orderDetail?.id).then(response => {
        if (isFetchApiSuccessful(response)) {
          console.log('response', response);
          const {bill} = response.data;
          if(bill) {
            setOrderBillId(bill.id);
            const initValueResult: OrderBillRequestFormModel = {
              company: bill.company,
              tax: bill.tax,
              address: bill.address,
              pic: bill.pic,
              note: bill.note,
              contract: bill.contract,
              email: bill.email,
            } 
            form.setFieldsValue(initValueResult);
          } else {
            form.setFieldsValue(initialFormValues);
          }
        } else {
          handleFetchApiError(response, "Chi tiết yêu cầu xuất hóa đơn", dispatch);
          form.setFieldsValue(initialFormValues);
        }
      }).finally(() => {
        dispatch(hideLoading())
      })
    } else {
      form.setFieldsValue(initialFormValues);
    }
  }, [dispatch, form, initialFormValues, isVisibleOrderBillRequestModal, orderDetail, orderDetail?.id, setOrderBillId]);

  return (
    <Modal
      title={modalTitle}
      width="680px"
      visible={isVisibleOrderBillRequestModal}
      onCancel={handleCancel}
      footer={renderModalFooter()}
    >
      <StyledComponent>
        <Form
          form={form}
          layout="vertical"
          initialValues={initialFormValues}
        >
          <div>
            <Form.Item
              name="company"
              label="Tên đơn vị mua hàng"
              rules={[
                {
                  required: true,
                  message: "Bạn chưa nhập tên đơn vị mua hàng",
                },
              ]}
            >
              <Input placeholder="Nhập tên đơn vị mua hàng" disabled={isDisableUpdateExportRequest && !!orderBillId}/>
            </Form.Item>
          </div>
          <Row gutter={30}>
            <Col span={12}>
              <Form.Item
                name="tax"
                label="Mã số thuế"
                rules={[
                  {
                    required: true,
                    message: "Bạn chưa nhập mã số thuế",
                  },
                ]}
              >
                <Input placeholder="Nhập mã số thuế" disabled={isDisableUpdateExportRequest && !!orderBillId} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="pic"
                label="Người đại diện theo pháp luật"
                rules={[
                  {
                    required: true,
                    message: "Bạn chưa nhập người đại diện theo pháp luật",
                  },
                ]}
              >
                <Input placeholder="Nhập người đại diện theo pháp luật" disabled={isDisableUpdateExportRequest && !!orderBillId} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            name="address"
            label="Địa chỉ xuất hóa đơn"
            rules={[
              {
                required: true,
                message: "Bạn chưa nhập địa chỉ xuất hóa đơn",
              },
            ]}
          >
            <Input placeholder="Nhập địa chỉ xuất hóa đơn" disabled={isDisableUpdateExportRequest && !!orderBillId} />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email nhận hóa đơn điện tử"
            rules={[
              {
                required: true,
                message: "Bạn chưa nhập email nhận hóa đơn điện tử",
              },
              {
                pattern: RegUtil.EMAIL,
                message: "Vui lòng nhập đúng định dạng email",
              },
            ]}
          >
            <Input placeholder="Nhập email nhận hóa đơn điện tử" disabled={isDisableUpdateExportRequest && !!orderBillId} />
          </Form.Item>

          <Form.Item
            name="contract"
            valuePropName="checked"
          >
            <Checkbox disabled={isDisableUpdateExportRequest && !!orderBillId}>
              Có hợp đồng
            </Checkbox>
          </Form.Item>
          
          <Form.Item
            name="note"
            label={
              <span>
                Ghi chú <span className="labelNote">(không bắt buộc)</span>
              </span>
            }
            className="lastItem"
          >
            <TextArea placeholder="Nhập ghi chú" rows={3} disabled={isDisableUpdateExportRequest && !!orderBillId} />
          </Form.Item>
        </Form>
      </StyledComponent>
    </Modal>
  );
}

export default OrderBillRequestModal;
