import { Modal, Select, Form, Input, Row, Col } from "antd";
import { useCallback, useState } from "react";
import { DeleteTicketWrapper } from "./styles";

type DeleteTicketModalProps = {
  visible: boolean;
  loading?: boolean;
  isMultiple?: boolean;
  onCancel: (e: React.MouseEvent<HTMLElement>) => void;
  onOk: (item: string | undefined) => void;
  title: string;
  icon: string;
  cancelText: string;
  okText: string;
  textStore?: string;
};
//mock api, delete when api avaiable
const reasons = [
  {
    value: 1,
    text: "Trùng phiếu chuyển hàng",
  },
  {
    value: 2,
    text: "Sai sản phẩm",
  },
  {
    value: 3,
    text: "Sai kho",
  },
  {
    value: 4,
    text: "Khác",
  },
];
//

const DeleteTicketModal: React.FC<DeleteTicketModalProps> = (props: DeleteTicketModalProps) => {
  const {
    visible,
    onCancel,
    onOk,
    title,
    icon,
    okText,
    cancelText,
    textStore,
    loading,
    isMultiple = false,
  } = props;

  const [deleteTicketForm] = Form.useForm();
  const [isShowReason, setIsShowReason] = useState<boolean>(false);

  const { Item } = Form;

  const onFinish = useCallback(
    (data) => {
      const choses_reason = reasons.find((element) => element.value === data.reason);

      switch (data.reason) {
        case 4:
          if (data.difference_reason) {
            onOk(data.difference_reason);
          } else {
            onOk(choses_reason?.text);
          }
          break;

        default:
          onOk(choses_reason?.text);
          break;
      }
    },
    [onOk],
  );

  return (
    <Modal
      confirmLoading={loading}
      onCancel={onCancel}
      onOk={() => deleteTicketForm.submit()}
      visible={visible}
      centered
      okText={okText}
      cancelText={cancelText}
      width={600}
    >
      <DeleteTicketWrapper>
        <Row>
          <Col span={4}>
            <img src={icon} alt="" />
          </Col>
          <Col span={20}>
            <div className="header" key="1">
              <div>
                <h3>{title}</h3>
                {!isMultiple && (
                  <div style={title ? { fontWeight: 400 } : { fontWeight: 600, fontSize: 16 }}>
                    <div>Thao tác này sẽ tính toán lại tồn kho {textStore}</div>
                    <div>Thao tác này không thể hoàn tác.</div>
                  </div>
                )}
              </div>
            </div>

            <Form
              layout="vertical"
              initialValues={{
                is_refund: false,
              }}
              form={deleteTicketForm}
              scrollToFirstError
              onFinish={onFinish}
            >
              <Form.Item noStyle hidden name="note">
                <Input />
              </Form.Item>
              <div className="orders-cancel-option" style={{ margin: 0, padding: 0 }}>
                <Item
                  label="Lý do hủy:"
                  name="reason"
                  rules={[{ required: true, message: "Vui lòng chọn lý do" }]}
                >
                  <Select
                    placeholder="Lý do trả hàng"
                    onChange={(value) => {
                      switch (value) {
                        case 4:
                          setIsShowReason(true);
                          break;
                        default:
                          setIsShowReason(false);
                          break;
                      }
                    }}
                  >
                    {reasons?.map((reason, index) => (
                      <Select.Option key={index} value={reason.value}>
                        {reason.text}
                      </Select.Option>
                    ))}
                  </Select>
                </Item>
              </div>
              {isShowReason && (
                <Item name="difference_reason" label="Ghi chú">
                  <Input maxLength={255} placeholder="Nhập lý do khác" />
                </Item>
              )}
            </Form>
          </Col>
        </Row>
      </DeleteTicketWrapper>
    </Modal>
  );
};

export default DeleteTicketModal;
