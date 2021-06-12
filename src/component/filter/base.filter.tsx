import { Button, Col, Drawer, Row, Space } from "antd";

type BaseFilterProps = {
  visible: boolean;
  children: React.ReactNode;
  onCancel?: () => void;
  onFilter?: () => void;
  onClearFilter?: () => void;
};

const BaseFilter: React.FC<BaseFilterProps> = (props: BaseFilterProps) => {
  const { visible, children, onFilter, onClearFilter, onCancel } = props;
  return (
    <Drawer
      placement="right"
      title="Thêm bộ lọc"
      width={396}
      closable={false}
      onClose={onCancel}
      visible={visible}
      footer={
        <Row gutter={10}>
          <Col md={24}>
            <Space direction="vertical" style={{ width: "100%" }}>
              <Button onClick={onFilter} type="primary" block>
                Lọc
              </Button>
              <Button onClick={onClearFilter} block>
                Xoá bộ lọc
              </Button>
            </Space>
          </Col>
        </Row>
      }
    >
      {children}
    </Drawer>
  );
};

export default BaseFilter;
