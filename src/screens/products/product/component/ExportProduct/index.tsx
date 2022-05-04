import { Modal, Form, Radio, Space, Row, Progress } from "antd";
import { useCallback } from "react";
import { TYPE_EXPORT } from "screens/products/constants"; 
import { STATUS_IMPORT_EXPORT } from "utils/Constants";

type ExportModalProps = {
  visible: boolean;
  loading?: boolean;
  exportProgress?: number;
  statusExport?: number;
  onCancel: () => void;
  onOk: (record: string) => void;
};
   
 
const ExportProduct: React.FC<ExportModalProps> = (props: ExportModalProps) => {
  const [form] = Form.useForm();
  const { visible, onCancel, onOk,loading= false,exportProgress=0,statusExport=0 } = props;
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
      confirmLoading={loading}
      title="Xuất file danh sách sản phẩm"
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
              {
                !loading ? <>
                <div className="title-address">Giới hạn kết quả xuất</div>
                <Form.Item name="record">
                  <Radio.Group>
                    <Space direction="vertical">
                      <Radio value={TYPE_EXPORT.page}>Sản phẩm trên trang này</Radio>
                      <Radio value={TYPE_EXPORT.selected}>Các sản phẩm được chọn</Radio>
                      <Radio value={TYPE_EXPORT.all}>Tất cả sản phẩm đủ điều kiện lọc</Radio>
                      <Radio value={TYPE_EXPORT.allin}>Tất cả sản phẩm</Radio>
                    </Space>
                  </Radio.Group>
                </Form.Item>
              </> : 
              <>
                {
                  statusExport === 1 && (
                    <Row style={{ justifyContent: 'center'}}>
                      <p>Đang gửi yêu cầu, vui lòng đợi trong giây lát ...</p>
                    </Row>
                  )
                }
                {statusExport !== 1 && (
                <Row style={{ justifyContent: 'center'}}>
                  {statusExport === STATUS_IMPORT_EXPORT.CREATE_JOB_SUCCESS && <p>Đang tạo file, vui lòng đợi trong giây lát</p>}
                  {statusExport === STATUS_IMPORT_EXPORT.JOB_FINISH && <p>Đã tạo file thành công</p>}
                  {statusExport === STATUS_IMPORT_EXPORT.ERROR && <p>Đã có lỗi xảy ra!!!</p>}
                  <Row style={{ justifyContent: 'center', width: '100%'}}><Progress
                    type="circle"
                    strokeColor={{
                      '0%': '#108ee9',
                      '100%': '#87d068',
                    }}
                    percent={exportProgress}
                  /></Row>
                </Row>)}
              </>
              }
        </Space>
      </Form>
    </Modal>
  );
};

export default ExportProduct;
