import { DeleteOutlined, StarOutlined } from "@ant-design/icons";
import { Button, Drawer, DrawerProps, Row, Space } from "antd";
import { Scrollbars } from "react-custom-scrollbars";

type BaseFilterProps = DrawerProps & {
  visible: boolean;
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
  const { allowSave, width, className, children, onFilter, onClearFilter, onCancel, onSaveFilter, confirmButtonTitle, deleteButtonTitle, footerStyle } = props;
  return (
    <Drawer
      placement="right"
      title="Thêm bộ lọc"
      width={width}
      closable={false}
      onClose={onCancel}
      className={className}
      {...props}
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
