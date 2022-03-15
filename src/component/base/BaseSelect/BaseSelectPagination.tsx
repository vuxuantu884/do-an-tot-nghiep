import React from "react";
import { LeftOutlined, RightOutlined } from "@ant-design/icons";
import { Button, Row, Space } from "antd";
import { BaseSelectPaginationType } from "./BaseSelect.type";

const BaseSelectPagination = ({ onChange, page, totalPage, menu }: BaseSelectPaginationType) => {
  const buttons = [
    {
      key: "prev",
      onClick: () => onChange("prev"),
      disabled: page === 1,
      arrowComponent: <LeftOutlined />,
    },
    {
      key: "next",
      onClick: () => onChange("next"),
      disabled: page >= totalPage,
      arrowComponent: <RightOutlined />,
    },
  ];
  return (
    <div>
      {menu}
      <Row justify="center" style={{ marginTop: 10 }}>
        <Space>
          {buttons.map((btn) => (
            <Button
              key={btn.key}
              disabled={btn.disabled}
              onClick={btn.onClick}
              style={{ width: 30, height: 30, padding: 0, lineHeight: "20px" }}>
              {btn.arrowComponent}
            </Button>
          ))}
        </Space>
      </Row>
    </div>
  );
};

export default BaseSelectPagination;
