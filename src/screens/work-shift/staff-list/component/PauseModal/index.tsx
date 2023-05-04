import { DatePicker, Form, Modal, Space } from "antd";
import React from "react";
import "./styled.scss";
import { Input } from "antd";
const { TextArea } = Input;

const { RangePicker } = DatePicker;
type Props = {
  visible?: boolean;
  onCancel?: () => void;
};
const PauseModal: React.FC<Props> = (props: Props) => {
  const { visible, onCancel } = props;
  return (
    <>
      <Modal
        title="Tạm ngưng nhân viên"
        visible={visible}
        onCancel={onCancel}
        className="pause-modal"
        okText="Xác nhận"
        cancelText="Hủy"
      >
        <>
          <Form>
            <Space direction="vertical" style={{ width: "100%" }} size={"large"}>
              <Form.Item name="issued_date">
                <RangePicker
                  style={{ width: "100%" }}
                  placeholder={["Từ ngày", "Đến ngày"]}
                  format="DD/MM/YYYY"
                />
              </Form.Item>

              <Form.Item name="li_do_tam_ngung">
                <TextArea placeholder="Lý do tạm ngưng" autoSize={{ minRows: 2, maxRows: 6 }} />
              </Form.Item>
            </Space>
          </Form>
        </>
      </Modal>
    </>
  );
};

export default PauseModal;
