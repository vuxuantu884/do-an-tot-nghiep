import { Modal, Form, Radio, Space, Row, Progress } from "antd";
import React, { useCallback, Fragment } from "react";
import { STATUS_IMPORT_EXPORT, TYPE_EXPORT } from "utils/Constants";

type ExportModalProps = {
  visible: boolean;
  onCancel: () => void;
  onOk: (record: string) => void;
  exportProgressDetail?: number;
  statusExportDetail?: number;
  isLoadingExportDetail: boolean;
};

const InventoryExport: React.FC<ExportModalProps> = (props: ExportModalProps) => {
  const [form] = Form.useForm();
  const {
    visible,
    onCancel,
    onOk,
    exportProgressDetail,
    statusExportDetail = STATUS_IMPORT_EXPORT.NONE,
    isLoadingExportDetail,
  } = props;
  const cancelClick = useCallback(() => {
    onCancel();
  }, [onCancel]);
  const onOkClick = useCallback(() => {
    onOk(form.getFieldValue("record"));
  }, [onOk, form]);

  return (
    <Modal
      onCancel={cancelClick}
      width={600}
      confirmLoading={isLoadingExportDetail}
      visible={visible}
      centered
      cancelText="Thoát"
      onOk={onOkClick}
      title="Xuất file tồn kho"
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
          {statusExportDetail === 0 && (
            <Fragment>
              <div className="title-address">Giới hạn kết quả xuất</div>
              <Form.Item name="record">
                <Radio.Group>
                  <Space direction="vertical">
                    <Radio value={TYPE_EXPORT.page}>Các sản phẩm trên trang này</Radio>
                    <Radio value={TYPE_EXPORT.all}>Tất cả tồn đủ điều kiện lọc</Radio>
                  </Space>
                </Radio.Group>
              </Form.Item>
            </Fragment>
          )}
          {statusExportDetail === STATUS_IMPORT_EXPORT.DEFAULT && (
            <Row style={{ justifyContent: "center" }}>
              <p>Đang gửi yêu cầu, vui lòng đợi trong giây lát ...</p>
            </Row>
          )}
          {statusExportDetail !== 0 && statusExportDetail !== STATUS_IMPORT_EXPORT.DEFAULT && (
            <Row style={{ justifyContent: "center" }}>
              {statusExportDetail === STATUS_IMPORT_EXPORT.CREATE_JOB_SUCCESS && (
                <p>Đang tạo file, vui lòng đợi trong giây lát</p>
              )}
              {statusExportDetail === STATUS_IMPORT_EXPORT.JOB_FINISH && (
                <p>Đã tạo file thành công</p>
              )}
              {statusExportDetail === STATUS_IMPORT_EXPORT.ERROR && <p>Đã có lỗi xảy ra!!!</p>}
              <Row style={{ justifyContent: "center", width: "100%" }}>
                <Progress
                  type="circle"
                  strokeColor={{
                    "0%": "#108ee9",
                    "100%": "#87d068",
                  }}
                  percent={exportProgressDetail}
                />
              </Row>
            </Row>
          )}
        </Space>
      </Form>
    </Modal>
  );
};

export default InventoryExport;
