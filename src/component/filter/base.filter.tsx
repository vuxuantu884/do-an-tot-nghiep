import { DeleteOutlined } from "@ant-design/icons";
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
  onCancel?: () => void;
  onFilter?: () => void;
  onClearFilter?: () => void;
};

const BaseFilter: React.FC<BaseFilterProps> = (props: BaseFilterProps) => {
  const { visible, width, className, children, onFilter, onClearFilter, onCancel, confirmButtonTitle, deleteButtonTitle, footerStyle } = props;
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
            <Button style={{ color: '#E24343'}} icon={<DeleteOutlined />} onClick={onClearFilter}>
              {deleteButtonTitle || "Xoá bộ lọc"}
            </Button>
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
