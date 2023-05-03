import { Col, DatePicker, Form, Modal, Row, Space } from "antd";
import React from "react";
import CustomSelect from "component/custom/select.custom";
import "./styled.scss";

const { RangePicker } = DatePicker;
type Props = {
  visible?: boolean;
  onCancel?: () => void;
};
const TransferModal: React.FC<Props> = (props: Props) => {
  const { visible, onCancel } = props;
  return (
    <>
      <Modal
        title="Điều chuyển nhân viên"
        visible={visible}
        onCancel={onCancel}
        className="transfer-modal"
        okText="Xác nhận điều chuyển"
        cancelText="Hủy"
      >
        <>
          <Form>
            <Space direction="vertical" style={{ width: "100%" }} size={"large"}>
              <Form.Item name="store_id">
                <CustomSelect
                  showSearch
                  showArrow
                  allowClear
                  optionFilterProp="children"
                  placeholder="Chọn cửa hàng"
                  style={{ width: "100%" }}
                >
                  <CustomSelect.Option key={1} value={1}>
                    CH 1
                  </CustomSelect.Option>
                  <CustomSelect.Option key={2} value={2}>
                    CH 2
                  </CustomSelect.Option>
                </CustomSelect>
              </Form.Item>
              <Form.Item name="issued_date">
                <RangePicker
                  style={{ width: "100%" }}
                  placeholder={["Từ ngày", "Đến ngày"]}
                  format="DD/MM/YYYY"
                />
              </Form.Item>

              <Form.Item name="li_do_dieu_chuyen">
                <CustomSelect
                  showSearch
                  showArrow
                  allowClear
                  optionFilterProp="children"
                  placeholder="Lí do điều chuyển"
                  style={{ width: "100%" }}
                >
                  <CustomSelect.Option key={1} value={1}>
                    lí do 1
                  </CustomSelect.Option>
                  <CustomSelect.Option key={2} value={2}>
                    lí do 2
                  </CustomSelect.Option>
                </CustomSelect>
              </Form.Item>
            </Space>
          </Form>
        </>
      </Modal>
    </>
  );
};

export default TransferModal;
