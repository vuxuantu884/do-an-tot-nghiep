import { DeleteOutlined, StarOutlined } from "@ant-design/icons";
import { Button, Drawer, Row, Space } from "antd";
import { Scrollbars } from "react-custom-scrollbars";

type BaseFilterProps = {
  visible: boolean;
  width?: number;
  className?: string;
  confirmButtonTitle?: any;
  deleteButtonTitle?: any;
  footerStyle?: any;
  children: React.ReactNode;
  allowSave?: boolean;
  onCancel?: () => void;
  onFilter?: () => void;
  onClearFilter?: () => void;
  onSaveFilter?: () => void;
};

const BaseFilter: React.FC<BaseFilterProps> = (props: BaseFilterProps) => {
  const { visible, allowSave, width, className, children, onFilter, onClearFilter, onCancel, onSaveFilter, confirmButtonTitle, deleteButtonTitle, footerStyle } = props;
  return (
    <Drawer
      placement="right"
      title="Thêm bộ lọc"
      width={width}
      closable={false}
      onClose={onCancel}
      visible={visible}
      className={className}
      footer={
        <Row style={footerStyle} justify="end">
          <Space size="middle">
            <Button style={{ color: '#E24343' }} icon={<DeleteOutlined />} onClick={onClearFilter}>
              {deleteButtonTitle || "Xóa bộ lọc"}
            </Button>
            {
              allowSave &&
              <Button icon={<StarOutlined />} onClick={onSaveFilter}>
                Lưu bộ lọc
              </Button>
            }
            <Button onClick={onFilter} type="primary">
              {confirmButtonTitle || "Áp dụng bộ lọc"}
            </Button>
          </Space>
        </Row>
      }
    >
      <Scrollbars
        className="body-container"
        autoHide
        style={{ height: "100%" }}
      >
        <div className="body-container-form">{children}</div>
      </Scrollbars>
    </Drawer>
  );
};

export default BaseFilter;
