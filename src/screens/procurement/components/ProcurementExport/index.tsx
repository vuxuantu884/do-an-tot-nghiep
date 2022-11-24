import { Modal, Form, Radio, Space, Row, Progress } from "antd";
import { useCallback, Fragment } from "react";
import { EnumTypeExport } from "screens/procurement/helper";
import { STATUS_IMPORT_EXPORT } from "utils/Constants";

type ExportModalProps = {
  isVisible: boolean;
  onCancel: () => void;
  onOk: (record: string) => void;
  exportProgress?: number;
  statusExport?: number;
  exportError?: string;
  isLoadingExport?: boolean;
};

const ProcurementExport: React.FC<ExportModalProps> = (props: ExportModalProps) => {
  const [form] = Form.useForm();
  const {
    isVisible,
    onCancel,
    onOk,
    exportProgress,
    statusExport = 0,
    exportError,
    isLoadingExport = false,
  } = props;
  const onOkClick = useCallback(() => {
    onOk(form.getFieldValue("record"));
  }, [onOk, form]);
  return (
    <Modal
      onCancel={onCancel}
      width={600}
      visible={isVisible}
      cancelText="Thoát"
      onOk={onOkClick}
      confirmLoading={isLoadingExport}
      title="Xuất file nhập kho"
      okText="Xuất file"
    >
      <Form
        form={form}
        initialValues={{
          record: EnumTypeExport.PAGE,
        }}
        layout="vertical"
      >
        <Space direction="vertical" style={{ width: "100%" }}>
          {statusExport === 0 ? (
            <Fragment>
              <div className="title-address">Giới hạn kết quả xuất</div>
              <Form.Item name="record">
                <Radio.Group>
                  <Space direction="vertical">
                    <Radio value={EnumTypeExport.PAGE}>Phiếu chuyển trên trang này</Radio>
                    <Radio value={EnumTypeExport.SELECTED}>Các dòng được chọn</Radio>
                    <Radio value={EnumTypeExport.ALL}>
                      Tất cả phiếu nhập kho theo điều kiện lọc
                    </Radio>
                    <Radio value={EnumTypeExport.ALLIN}>Tất cả phiếu nhập kho</Radio>
                  </Space>
                </Radio.Group>
              </Form.Item>
            </Fragment>
          ) : (
            <Fragment>
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
                      status={statusExport === STATUS_IMPORT_EXPORT.ERROR ? "exception" : "normal"}
                      percent={exportProgress}
                    />
                  </Row>
                </Row>
              )}
            </Fragment>
          )}
        </Space>
      </Form>
    </Modal>
  );
};

export default ProcurementExport;
