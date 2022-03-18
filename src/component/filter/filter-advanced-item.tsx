import React, { useMemo } from "react";
import { Col, Form, FormItemProps } from "antd";

type FilterAdvancedItemProps = FormItemProps & {
  col?: number;
};

const FilterAdvancedItem: React.FC<FilterAdvancedItemProps> = ({ children, col = 3, ...props }) => {
  const colSpan = useMemo(() => Math.round(24 / col), [col]);

  return (
    <>
      <Col className="gutter-row" span={colSpan}>
        <Form.Item {...props}>{children}</Form.Item>
      </Col>
    </>
  );
};

export default FilterAdvancedItem;
