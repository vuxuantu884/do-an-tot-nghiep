import { Button, Col, Drawer, Row, Space } from "antd";
import { Scrollbars } from "react-custom-scrollbars";

type BaseFilterProps = {
  visible: boolean;
  width?: number;
  className?: string;
  confirmButtonTitle?: any;
  deleteButtonTitle?: any;
  children: React.ReactNode;
  onCancel?: () => void;
  onFilter?: () => void;
  onClearFilter?: () => void;
};

const BaseFilter: React.FC<BaseFilterProps> = (props: BaseFilterProps) => {
  const { visible, width, className, children, onFilter, onClearFilter, onCancel, confirmButtonTitle, deleteButtonTitle } = props;
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
        <Row gutter={10}>
          <Col md={24}>
            <Space direction="vertical" style={{ width: "100%" }}>
              <Button onClick={onFilter} type="primary" block>
                {confirmButtonTitle || "Lọc"}
              </Button>
              <Button onClick={onClearFilter} block>
                {deleteButtonTitle || "Xoá bộ lọc"}
              </Button>
            </Space>
          </Col>
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
