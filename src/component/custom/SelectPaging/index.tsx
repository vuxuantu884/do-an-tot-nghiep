import React, { CSSProperties, ReactNode, useState } from "react";
import { SelectProps, Select as ANTSelect, Input, Row, Button, Space } from "antd";
import { BaseMetadata } from "model/base/base-metadata.response";
import { LeftOutlined, RightOutlined } from "@ant-design/icons";

interface IProps extends SelectProps<any> {
  style?: CSSProperties;
  containerStyle?: CSSProperties;
  className?: string;
  containerClassName?: string;
  suffix?: ReactNode;
  searchPlaceholder?: string;
  metadata: BaseMetadata;
  onPageChange?: (key: string, page: number) => void;
  onSearch?: (key: string) => void;
}

const { Option, OptGroup } = ANTSelect;

const SelectPaging = (props: IProps) => {
  const {
    suffix,
    style,
    className,
    containerClassName,
    containerStyle,
    searchPlaceholder,
    metadata,
    onPageChange,
    onSearch,
    ...rest
  } = props;
  const totalPage = metadata ? Math.ceil((metadata.total || 1) / (metadata.limit || 1)) : 1;
  const [key, setKey] = useState("");
  return (
    <ANTSelect
      onSelect={() => {
        setKey("");
        onSearch && onSearch("");
      }}
      dropdownRender={(menu) => (
        <div className="dropdown-custom">
          <Input
            value={key}
            onChange={(e) => {
              setKey(e.target.value);
              onSearch && onSearch(e.target.value);
            }}
            placeholder={searchPlaceholder}
          />
          {menu}
          <Row justify="center" style={{ marginTop: 10 }}>
            <Space>
              <Button
                disabled={metadata.page === 1}
                style={{
                  width: 30,
                  height: 30,
                  padding: 0,
                  lineHeight: "20px",
                }}
                onClick={() => {
                  let newPage = metadata.page - 1;
                  if (newPage >= 1) {
                    onPageChange && onPageChange(key, newPage);
                  }
                }}
              >
                <LeftOutlined />
              </Button>
              <Button
                disabled={metadata.page >= totalPage}
                onClick={() => {
                  let newPage = metadata.page + 1;
                  if (newPage <= totalPage) {
                    onPageChange && onPageChange(key, newPage);
                  }
                }}
                style={{
                  width: 30,
                  height: 30,
                  padding: 0,
                  lineHeight: "20px",
                }}
              >
                <RightOutlined />
              </Button>
            </Space>
          </Row>
        </div>
      )}
      className={containerClassName}
      style={containerStyle}
      {...rest}
    />
  );
};

SelectPaging.Option = Option;
SelectPaging.OptGroup = OptGroup;

export default SelectPaging;
