import { Modal, Form, Radio, Space } from "antd";
import { useCallback, Fragment } from "react";

type ExportModalProps = {
  visible: boolean;
  onCancel: () => void;
  onOk: () => void;
};
   
 
const ExportProduct: React.FC<ExportModalProps> = (props: ExportModalProps) => {
  const { visible, onCancel, onOk } = props;
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
      title="Xuất file danh sách sản phẩm"
      okText="Xuất file"
    >
      <Form
        initialValues={{
          record: "b",
        }}
        layout="vertical"
      >
        <Space direction="vertical" style={{ width: "100%" }}>
            <Fragment>
              <div className="title-address">Giới hạn kết quả xuất</div>
              <Form.Item name="record">
                <Radio.Group>
                  <Space direction="vertical">
                    <Radio value="a">Tất cả sản phẩm</Radio>
                    <Radio value="b">Sản phẩm trên trang này</Radio>
                    <Radio value="c">Các sản phẩm được chọn</Radio>
                    <Radio value="d">
                        30 sản phẩm phù hợp với điều kiện tìm kiếm hiện tại
                    </Radio>
                  </Space>
                </Radio.Group>
              </Form.Item>
            </Fragment>
        </Space>
      </Form>
    </Modal>
  );
};

export default ExportProduct;
