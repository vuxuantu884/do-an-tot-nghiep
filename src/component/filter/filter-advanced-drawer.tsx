import { DeleteOutlined } from "@ant-design/icons";
import { Button, Drawer, DrawerProps, Row, Space } from "antd";
import React, { ReactNode } from "react";
import styled from "styled-components";

type FilterAdvancedDrawerProps = DrawerProps & {
  children?: ReactNode;
  onSubmit?: () => void;
  onClearFilter?: () => void;
  fullWith?: boolean
};

const FilterAdvancedDrawer = ({
  title = "Thêm bộ lọc",
  width,
  fullWith,
  onClose,
  visible,
  onSubmit,
  onClearFilter,
  children,
  ...props
}: FilterAdvancedDrawerProps) => {
  return (
    <>
      <DrawerContainer
        title={title}
        width={fullWith ? "100%" : width}
        onClose={onClose}
        visible={visible}
        bodyStyle={{ padding: 20 }}
        footer={
          <Row justify="end">
            <Space size="middle">
              <Button
                onClick={onClearFilter}
                style={{ color: "#E24343" }}
                icon={<DeleteOutlined />}>
                Xóa bộ lọc
              </Button>
              <Button type="primary" htmlType="submit" onClick={onSubmit}>
                Áp dụng bộ lọc
              </Button>
            </Space>
          </Row>
        }
        {...props}>
          {children} 
      </DrawerContainer>
    </>
  );
};

export default FilterAdvancedDrawer;

const DrawerContainer = styled(Drawer)`
`;
