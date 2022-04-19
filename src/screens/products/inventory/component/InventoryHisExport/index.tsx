import { Modal, Form, Radio, Space } from "antd";
import { useCallback, Fragment } from "react";
import { TYPE_EXPORT } from "screens/products/constants"; 

type ExportModalProps = {
  visible: boolean;
  onCancel: () => void;
  onOk: (record: string) => void;
};
   
 
const InventoryHisExport: React.FC<ExportModalProps> = (props: ExportModalProps) => {
  const [form] = Form.useForm();
  const { visible, onCancel, onOk } = props;
  const onCancelClick = useCallback(() => {
    onCancel();
  }, [onCancel]);
  const onOkClick = useCallback(() => {
    onOk(form.getFieldValue("record"));
  }, [onOk,form]);
  return (
    <Modal
      onCancel={onCancelClick}
      width={600}
      visible={visible}
      cancelText="Hủy"
      onOk={onOkClick}
      title="Xuất file Lịch sử tồn"
      okText="Xuất file"
    >
      <Form
        form={form}
        initialValues={{
          record: TYPE_EXPORT.page,
        }} 
        layout="vertical"
      >
        <Space direction="vertical" style={{ width: "100%" }}>
            <Fragment>
              <div className="title-address">Giới hạn kết quả xuất</div>
              <Form.Item name="record">
                <Radio.Group>
                  <Space direction="vertical">
                    <Radio value={TYPE_EXPORT.page}>Lịch sử tồn trên trang này</Radio>
                    <Radio value={TYPE_EXPORT.selected}>Các dòng được chọn</Radio>
                    <Radio value={TYPE_EXPORT.all}>Tất cả lịch sử tồn đủ điểu kiện lọc</Radio>
                    <Radio value={TYPE_EXPORT.allin}>Tất cả lịch sử tồn</Radio>
                  </Space>
                </Radio.Group>
              </Form.Item>
            </Fragment>
        </Space>
      </Form>
    </Modal>
  );
};

export default InventoryHisExport;
