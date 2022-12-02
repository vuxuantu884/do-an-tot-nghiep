import { Modal, Form, Radio, Space, Row, Progress } from "antd";
import React, { useCallback, Fragment } from "react";
import { STATUS_IMPORT_EXPORT, TYPE_EXPORT } from "utils/Constants";
import { START_PROCESS_PERCENT } from "screens/products/helper";

type ExportModalProps = {
  isVisible: boolean;
  onCancel: () => void;
  onOk: (record: string) => void;
  exportProgress?: number;
  statusExport?: number;
};

const CategoryExportModal: React.FC<ExportModalProps> = (props: ExportModalProps) => {
  const [form] = Form.useForm();
  const { isVisible, onCancel, onOk, exportProgress, statusExport = START_PROCESS_PERCENT } = props;

  const clickCancel = useCallback(() => {
    onCancel();
  }, [onCancel]);

  const clickOk = useCallback(() => {
    onOk(form.getFieldValue("record"));
  }, [onOk, form]);

  return (
    <Modal
      onCancel={clickCancel}
      width={600}
      visible={isVisible}
      cancelText="Hủy"
      onOk={clickOk}
      title="Xuất file danh sách danh mục"
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
                    <Radio value={TYPE_EXPORT.page}>Danh mục trên trang này</Radio>
                    <Radio value={TYPE_EXPORT.selected}>Các danh mục được chọn</Radio>
                    <Radio value={TYPE_EXPORT.all}>Tất cả danh mục đủ điều kiện lọc</Radio>
                    <Radio value={TYPE_EXPORT.allin}>Tất cả danh mục</Radio>
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

export default CategoryExportModal;
