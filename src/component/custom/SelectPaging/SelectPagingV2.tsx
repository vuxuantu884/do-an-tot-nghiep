import { LeftOutlined, RightOutlined } from "@ant-design/icons";
import { Button, Row, Select as ANTSelect, SelectProps, Space } from "antd";
import { AppConfig } from "config/app.config";
import _ from "lodash";
import { BaseMetadata } from "model/base/base-metadata.response";
import React, { CSSProperties, ReactNode, useState } from "react";

interface Props extends SelectProps<any> {
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

const SelectPagingV2 = (props: Props) => {
  const { suffix, searchPlaceholder, metadata, onPageChange, onSearch, ...rest } = props;

  const totalPage = metadata ? Math.ceil((metadata.total || 1) / (metadata.limit || 1)) : 1;
  const [key, setKey] = useState("");

  return (
    <ANTSelect
      onSearch={_.debounce((value) => {
        setKey(value);
        onSearch?.(value);
      }, AppConfig.TYPING_TIME_REQUEST)}
      dropdownRender={(menu) => (
        <div>
          {menu}
          <Row justify="center" style={{ marginTop: 10 }}>
            <Space>
              <Button
                disabled={metadata.page === 1}
                style={{ width: 30, height: 30, padding: 0, lineHeight: "20px" }}
                onClick={() => {
                  let newPage = metadata.page - 1;
                  if (newPage >= 1) {
                    onPageChange && onPageChange(key, newPage);
                  }
                }}>
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
                style={{ width: 30, height: 30, padding: 0, lineHeight: "20px" }}>
                <RightOutlined />
              </Button>
            </Space>
          </Row>
        </div>
      )}
      {...rest}
    />
  );
};

SelectPagingV2.Option = Option;
SelectPagingV2.OptGroup = OptGroup;

export default SelectPagingV2;
