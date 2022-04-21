import {Button, Col, Modal, Progress, Row, Typography, Upload} from "antd";
import {UploadFile} from "antd/lib/upload/interface";
import {ImportResponse} from "model/other/files/export-model";
import {STATUS_IMPORT_EXPORT} from "../..";
import {ImportStatusWrapper} from "./styles";

const {Text} = Typography;

type ImportModalProps = {
  visible: boolean;
  onCancel: () => void;
  importProgress: number;
  statusImport: number;
  fileList: Array<UploadFile>;
  onImport: () => void;
  dataImport?: ImportResponse;
  hasImportUrl: boolean;
};

const InventoryTransferImportModal: React.FC<ImportModalProps> = (
  props: ImportModalProps
) => {
  const {
    visible,
    onCancel,
    onImport,
    fileList,
    importProgress,
    dataImport,
    hasImportUrl,
    statusImport = STATUS_IMPORT_EXPORT.DEFAULT,
  } = props;

  const renderModalFooter = () => {

    return (
      <>
        <Button
          key="cancel"
          type="default"
          className="create-button-custom ant-btn-outline fixed-button"
          onClick={onCancel}
        >
          Huỷ
        </Button>
        {statusImport === STATUS_IMPORT_EXPORT.DEFAULT && (
          <Button
            key="cancel"
            type="primary"
            disabled={!hasImportUrl}
            className="create-button-custom ant-btn-outline fixed-button"
            onClick={onImport}
          >
            Import
          </Button>
        )}
        {(statusImport === STATUS_IMPORT_EXPORT.CREATE_JOB_SUCCESS ||
          statusImport === STATUS_IMPORT_EXPORT.JOB_FINISH) && (
          <Button
            key="cancel"
            type="primary"
            disabled={statusImport === STATUS_IMPORT_EXPORT.CREATE_JOB_SUCCESS}
            className="create-button-custom ant-btn-outline fixed-button"
            onClick={onCancel}
          >
            Xác nhận
          </Button>
        )}
      </>
    );
  };

  return (
    <Modal
      onCancel={onCancel}
      visible={visible}
      centered
      title="Nhập file"
      footer={renderModalFooter()}
      width={600}
      maskClosable={false}
    >
      <ImportStatusWrapper>
        {statusImport !== STATUS_IMPORT_EXPORT.DEFAULT && (
          <>
            <Row className="status">
              <Col span={6}>
                <div>
                  <Text>Tổng cộng</Text>
                </div>
                <div>
                  <b>{dataImport?.total_process ? dataImport?.total_process : 0}</b>
                </div>
              </Col>
              <Col span={6}>
                <div>
                  <Text>Đã xử lí</Text>
                </div>
                <div>
                  <b>{dataImport?.processed ? dataImport?.processed : 0}</b>
                </div>
              </Col>
              <Col span={6}>
                <div>
                  <Text>Thành công</Text>
                </div>
                <div>
                  <Text type="success">
                    <b>{dataImport?.success ? dataImport?.success : 0}</b>
                  </Text>
                </div>
              </Col>
              <Col span={6}>
                <div>Lỗi</div>
                <div>
                  <Text type="danger">
                    <b>{dataImport?.error ? dataImport?.error : 0}</b>
                  </Text>
                </div>
              </Col>
            </Row>
            <Row className="status">
              <Progress percent={importProgress} />
            </Row>
          </>
        )}
        <Row className="import-info">
          <div className="title">
            <b>Chi tiết: </b>
          </div>
          <Upload showUploadList={{showRemoveIcon: false}} fileList={fileList} />
          {statusImport !== STATUS_IMPORT_EXPORT.DEFAULT && (
            <div className="content">
              <ul>
                {dataImport?.message ? (
                  dataImport?.message?.map((item) => {
                    return (
                      <li>
                        <span className="danger">&#8226;</span>
                        <Text type="danger">{item}</Text>
                      </li>
                    );
                  })
                ) : dataImport?.status === "FINISH" ? (
                  <li>
                    <span className="success">&#8226;</span>
                    <Text type="success">Import thành công!</Text>
                  </li>
                ) : (
                  <li>
                    <span className="success">&#8226;</span>
                    <Text type="success">Đang xử lý...</Text>
                  </li>
                )}
              </ul>
            </div>
          )}
        </Row>
      </ImportStatusWrapper>
    </Modal>
  );
};

export default InventoryTransferImportModal;
