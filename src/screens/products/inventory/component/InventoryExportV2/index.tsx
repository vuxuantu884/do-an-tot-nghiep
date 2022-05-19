import { ArrowLeftOutlined } from "@ant-design/icons";
import { Modal, Row, Progress, Button, Alert } from "antd";
import { useEffect, useState } from "react";
import { STATUS_IMPORT_EXPORT } from "utils/Constants";

type ExportModalProps = {
  visible: boolean;
  onCancel: () => void;
  onOk: () => void;
  exportProgress?: number;
  statusExport?: number;
};   

const InventoryExportModal: React.FC<ExportModalProps> = (
  props: ExportModalProps
) => {
  const { visible, onOk, onCancel, exportProgress, statusExport = 0 } = props;
  const [editFields, setEditFields] = useState(false);

  useEffect(()=>{
    if (visible && statusExport ===1) {
      onOk();
    }
  },[onOk, statusExport, visible]);
  
  return (
    <Modal
      onCancel={onCancel}
      visible={visible}
      centered
      title={[
        <span style={{fontWeight: 600, fontSize: 16}}>
          {editFields && <span style={{ color: '#2a2a86', marginRight: '10px'}}><ArrowLeftOutlined onClick={() => setEditFields(false)}/></span>}
          Xuất file
        </span>
      ]}
      footer={[
        <Button
          key="cancel"
          type="primary"
          className="create-button-custom ant-btn-outline fixed-button"
          onClick={onCancel}
        >
          Thoát
        </Button>,
        
      ]}
      width={600}
    >
      {
        statusExport === STATUS_IMPORT_EXPORT.DEFAULT && (
          <Row style={{ justifyContent: 'center'}}>
            <p>Đang gửi yêu cầu, vui lòng đợi trong giây lát ...</p>
          </Row>
        )
      }
      {(statusExport !== 0 && statusExport !== STATUS_IMPORT_EXPORT.DEFAULT) && (
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
      {
        statusExport === 0 && (
        <Row style={{ justifyContent: 'center'}}>
         <Alert message="Bạn cần chọn ít nhất một cửa hàng" type="warning" />
        </Row>
        )
      }
    </Modal>
  );
};

export default InventoryExportModal;
