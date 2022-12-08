import { ArrowLeftOutlined } from "@ant-design/icons";
import { Modal, Row, Progress, Form, Radio, Space } from "antd";
import React, { Fragment, useCallback, useState } from "react";
import { STATUS_IMPORT_EXPORT, TYPE_EXPORT } from "utils/Constants";

type ExportModalProps = {
  visible: boolean;
  onCancel: () => void;
  onOk: (record: string) => void;
  exportProgress?: number;
  statusExport?: number;
};

const InventoryExportModal: React.FC<ExportModalProps> = (props: ExportModalProps) => {
  const { visible, onOk, onCancel, exportProgress, statusExport = STATUS_IMPORT_EXPORT.NONE } = props;
  const [editFields, setEditFields] = useState(false);
  const [form] = Form.useForm();

  const onOkClick = useCallback(() => {
    onOk(form.getFieldValue("record"));
  }, [onOk, form]);

  return (
    <Modal
      onCancel={onCancel}
      onOk={onOkClick}
      confirmLoading={statusExport === STATUS_IMPORT_EXPORT.DEFAULT}
      cancelText="Hủy"
      okText="Xuất file"
      visible={visible}
      centered
      title={[
        <span style={{ fontWeight: 600, fontSize: 16 }}>
          {editFields && (
            <span style={{ color: "#2a2a86", marginRight: "10px" }}>
              <ArrowLeftOutlined onClick={() => setEditFields(false)} />
            </span>
          )}
          Xuất file
        </span>,
      ]}
      width={600}
    >
      <Form
        form={form}
        initialValues={{
          record: TYPE_EXPORT.page,
        }}
        layout="vertical"
      >
        {statusExport === 0 && (
          <Fragment>
            <p>
              <span className="title-address">Giới hạn kết quả xuất:</span>
            </p>
            <Form.Item name="record">
              <Radio.Group>
                <Space direction="vertical">
                  <Radio value={TYPE_EXPORT.page}>Các sản phẩm trên trang này</Radio>
                  <Radio value={TYPE_EXPORT.all}>Tất cả tồn đủ điều kiện lọc</Radio>
                </Space>
              </Radio.Group>
            </Form.Item>
            <p>
              <span className="red">Trong file chỉ hiển thị những sản phẩm còn tồn.</span>
            </p>
          </Fragment>
        )}
        {statusExport === STATUS_IMPORT_EXPORT.DEFAULT && (
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
      </Form>
    </Modal>
  );
};

export default InventoryExportModal;
