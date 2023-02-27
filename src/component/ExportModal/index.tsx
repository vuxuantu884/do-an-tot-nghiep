import { Modal, Form, Radio, Space, Row, Progress } from "antd";
import React, { useCallback } from "react";
import { STATUS_IMPORT_EXPORT, TYPE_EXPORT } from "utils/Constants";

type ExportModalProps = {
  isVisible: boolean;
  isLoading?: boolean;
  exportProgress?: number;
  statusExport?: number;
  onCancel: () => void;
  onOk: (record: string) => void;
  exportError?: string;
  title?: string;
  moduleText: string;
  isHideOptionAll?: boolean;
};

const ExportModal: React.FC<ExportModalProps> = (props: ExportModalProps) => {
  const [form] = Form.useForm();
  const {
    isVisible,
    onCancel,
    onOk,
    isLoading = false,
    exportProgress = 0,
    statusExport = STATUS_IMPORT_EXPORT.NONE,
    exportError,
    title,
    moduleText,
    isHideOptionAll = false,
  } = props;
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
      visible={isVisible}
      cancelText="Hủy"
      onOk={onOkClick}
      confirmLoading={isLoading}
      title={title}
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
          {statusExport === STATUS_IMPORT_EXPORT.NONE ? (
            <>
              <div className="title-address">Giới hạn kết quả xuất</div>
              <Form.Item name="record">
                <Radio.Group>
                  <Space direction="vertical">
                    <Radio value={TYPE_EXPORT.page}>Các {moduleText} trên trang này</Radio>
                    <Radio value={TYPE_EXPORT.selected}>Các {moduleText} được chọn</Radio>
                    <Radio value={TYPE_EXPORT.all}>Tất cả {moduleText} đủ điều kiện lọc</Radio>
                    {!isHideOptionAll && (
                      <Radio value={TYPE_EXPORT.allin}>Tất cả {moduleText}</Radio>
                    )}
                  </Space>
                </Radio.Group>
              </Form.Item>
            </>
          ) : (
            <>
              {statusExport === 1 && (
                <Row style={{ justifyContent: "center" }}>
                  <p>Đang gửi yêu cầu, vui lòng đợi trong giây lát ...</p>
                </Row>
              )}
              {statusExport !== 1 && (
                <Row style={{ justifyContent: "center" }}>
                  {statusExport === STATUS_IMPORT_EXPORT.CREATE_JOB_SUCCESS && (
                    <p>Đang tạo file, vui lòng đợi trong giây lát</p>
                  )}
                  {statusExport === STATUS_IMPORT_EXPORT.JOB_FINISH && (
                    <p>Đã tạo file thành công</p>
                  )}
                  {statusExport === STATUS_IMPORT_EXPORT.ERROR && (
                    <p>{exportError ? exportError : "Đã có lỗi xảy ra!!!"}</p>
                  )}
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
            </>
          )}
        </Space>
      </Form>
    </Modal>
  );
};

export default ExportModal;
