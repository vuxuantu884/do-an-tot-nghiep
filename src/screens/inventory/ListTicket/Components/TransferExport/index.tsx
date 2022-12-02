import { Modal, Form, Radio, Space, Row, Progress } from "antd";
import { useCallback, Fragment } from "react";
import { STATUS_IMPORT_EXPORT, TYPE_EXPORT } from "utils/Constants";

type ExportModalProps = {
  visible: boolean;
  onCancel: () => void;
  onOk: (record: string) => void;
  exportProgress?: number;
  statusExport?: number;
};

const TransferExport: React.FC<ExportModalProps> = (props: ExportModalProps) => {
  const [form] = Form.useForm();
  const { visible, onCancel, onOk, exportProgress, statusExport = 0 } = props;
  const onCancelClick = useCallback(() => {
    onCancel();
  }, [onCancel]);
  const onOkClick = useCallback(() => {
    onOk(form.getFieldValue("record"));
  }, [onOk, form]);

  return (
    <Modal
      onCancel={onCancelClick}
      width={600}
      visible={visible}
      cancelText="Hủy"
      onOk={onOkClick}
      title="Xuất file chuyển kho"
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
          {statusExport === 0 && (
            <Fragment>
              <div className="title-address">Giới hạn kết quả xuất</div>
              <Form.Item name="record">
                <Radio.Group>
                  <Space direction="vertical">
                    <Radio value={TYPE_EXPORT.page}>Phiếu chuyển trên trang này</Radio>
                    <Radio value={TYPE_EXPORT.selected}>Các dòng được chọn</Radio>
                    <Radio value={TYPE_EXPORT.all}>Tất cả phiếu chuyển theo điều kiện lọc</Radio>
                    <Radio value={TYPE_EXPORT.allin}>Tất cả phiếu chuyển</Radio>
                  </Space>
                </Radio.Group>
              </Form.Item>
            </Fragment>
          )}
          {statusExport !== 0 && statusExport === STATUS_IMPORT_EXPORT.DEFAULT && (
            <Row style={{ justifyContent: "center" }}>
              <p>Đang gửi yêu cầu, vui lòng đợi trong giây lát ...</p>
            </Row>
          )}
          {statusExport !== 0 && statusExport !== STATUS_IMPORT_EXPORT.DEFAULT && (
            <Row style={{ justifyContent: "center" }}>
              {statusExport === STATUS_IMPORT_EXPORT.CREATE_JOB_SUCCESS && (
                <p>Đang tạo file, vui lòng đợi trong giây lát</p>
              )}
              {statusExport === STATUS_IMPORT_EXPORT.JOB_FINISH && <p>Đã tạo file thành công</p>}
              {statusExport === STATUS_IMPORT_EXPORT.ERROR && <p>Đã có lỗi xảy ra!!!</p>}
              <Row style={{ justifyContent: "center", width: "100%" }}>
                <Progress
                  type="circle"
                  strokeColor={{
                    "0%": "#108ee9",
                    "100%": "#87d068",
                  }}
                  percent={exportProgress}
                />
              </Row>
            </Row>
          )}
        </Space>
      </Form>
    </Modal>
  );
};

export default TransferExport;
