import { Modal, Form, Radio, Space, Button, Checkbox, Row, Col } from "antd";
import { useCallback, useState, Fragment } from "react";
import { ArrowLeftOutlined } from "@ant-design/icons";

type ExportModalProps = {
  visible: boolean;
  onCancel: () => void;
  onOk: () => void;
};
const allMode = {
  DEFAULT: "DEFAULT",
  CUSTOM: "CUSTOM",
};
type ModalTitleProps = {
  mode: string;
  onClick?: () => void;
};

const customFields = [
  {
    name: "Đơn nhập hàng",
    value: "1",
  },
  {
    name: "Mã đơn nhập hàng",
    value: "2",
  },
  {
    name: "Trạng thái thanh toán",
    value: "3",
  },
  {
    name: "Chi phí",
    value: "4",
  },
  {
    name: "Ngày tạo đơn",
    value: "5",
  },
  {
    name: "Mã nhà cung cấp",
    value: "6",
  },
  {
    name: "Tiền cần trả",
    value: "7",
  },
  {
    name: "Ngày duyệt đơn",
    value: "8",
  },
  {
    name: "Tên nhà cung cấp",
    value: "9",
  },
  {
    name: "Cửa hàng đã trả",
    value: "10",
  },
  {
    name: "Ngày sửa",
    value: "11",
  },
  {
    name: "Số điện thoại",
    value: "12",
  },
  {
    name: "Số lượng trả hàng",
    value: "13",
  },
  {
    name: "Ngày hoàn thành",
    value: "14",
  },
  {
    name: "Liên hệ",
    value: "15",
  },
  {
    name: "Giá trị trả hàng",
    value: "16",
  },
  {
    name: "Ngày hủy",
    value: "17",
  },
  {
    name: "Email",
    value: "18",
  },
  {
    name: "Số tiền nhận lại",
    value: "19",
  },
  {
    name: "Chi nhánh",
    value: "20",
  },
  {
    name: "Địa chỉ",
    value: "21",
  },
  {
    name: "Ghi chú đơn",
    value: "22",
  },
  {
    name: "Nhân viên tạo đơn",
    value: "23",
  },
  {
    name: "Áp dụng thuế",
    value: "24",
  },
  {
    name: "Tham chiếu",
    value: "25",
  },
  {
    name: "Hẹn giao hàng",
    value: "26",
  },
  {
    name: "Số lượng sản phẩm",
    value: "27",
  },
  {
    name: "Thẻ tag",
    value: "28",
  },
  {
    name: "Trạng thái đơn nhập hàng",
    value: "29",
  },
  {
    name: "Tổng tiền",
    value: "30",
  },
  {
    name: "Tình trạng nhập kho",
    value: "31",
  },
  {
    name: "Chiết khấu đơn nhập hàng(VND)",
    value: "32",
  },
];

const ModalTitle = ({ mode, onClick }: ModalTitleProps) => {
  if (mode === allMode.CUSTOM)
    return (
      <Space direction="horizontal">
        <Button icon={<ArrowLeftOutlined />} onClick={onClick} />
        <div>Xuất file danh sách đơn nhập hàng</div>
      </Space>
    );
  return <div>Xuất file danh sách đơn nhập hàng</div>;
};
const ExportModal: React.FC<ExportModalProps> = (props: ExportModalProps) => {
  const { visible, onCancel, onOk } = props;
  const [mode, setMode] = useState(allMode.DEFAULT);
  const onCancelClick = useCallback(() => {
    onCancel();
  }, [onCancel]);
  const onOkClick = useCallback(() => {
    onOk();
  }, [onOk]);
  return (
    <Modal
      onCancel={onCancelClick}
      width={600}
      visible={visible}
      cancelText="Hủy"
      onOk={onOkClick}
      // confirmLoading={loading}
      title={<ModalTitle mode={mode} onClick={() => setMode(allMode.DEFAULT)} />}
      okText="Xuất file"
    >
      <Form
        initialValues={{
          record: "all",
        }}
        layout="vertical"
      >
        <Space direction="vertical" style={{ width: "100%" }}>
          {mode === allMode.DEFAULT && (
            <Fragment>
              <div className="title-address">Giới hạn kết quả xuất</div>
              <Form.Item name="record">
                <Radio.Group>
                  <Space direction="vertical">
                    <Radio value="a">Tất cả đơn nhập hàng</Radio>
                    <Radio value="b">Đơn nhập hàng trên trang này</Radio>
                    <Radio value="c">Các đơn nhập hàng được chọn</Radio>
                    <Radio value="d">34 đơn nhập hàng phù hợp với kết quả tìm kiếm hiện tại</Radio>
                  </Space>
                </Radio.Group>
              </Form.Item>
              <Form.Item>
                <div className="title-address">Loại file xuất</div>
                <Radio.Group>
                  <Space direction="vertical">
                    <Radio value="e">File tổng quan theo đơn nhập hàng</Radio>
                    <Radio value="f">File chi tiết</Radio>
                  </Space>
                </Radio.Group>
              </Form.Item>
              <Button
                type="link"
                onClick={() => {
                  setMode(allMode.CUSTOM);
                }}
              >
                Tùy chọn trường hiển thị
              </Button>
            </Fragment>
          )}
          {mode === allMode.CUSTOM && (
            <Fragment>
              <Checkbox.Group style={{ width: "100%" }}>
                <Checkbox value={customFields[0].value}>{customFields[0].name}</Checkbox>
                {customFields.map((field, index) => {
                  if (index === 0) return null;
                  if (index % 3 === 1)
                    return (
                      <Row>
                        <Col span={8}>
                          <Checkbox value={customFields[index].value}>
                            {customFields[index].name}
                          </Checkbox>
                        </Col>
                        {index + 1 < customFields.length && (
                          <Col span={8}>
                            <Checkbox value={customFields[index + 1].value}>
                              {customFields[index + 1].name}
                            </Checkbox>
                          </Col>
                        )}
                        {index + 2 < customFields.length && (
                          <Col span={8}>
                            <Checkbox value={customFields[index + 2].value}>
                              {customFields[index + 2].name}
                            </Checkbox>
                          </Col>
                        )}
                      </Row>
                    );
                  return null;
                })}
              </Checkbox.Group>
            </Fragment>
          )}
        </Space>
      </Form>
    </Modal>
  );
};

export default ExportModal;
