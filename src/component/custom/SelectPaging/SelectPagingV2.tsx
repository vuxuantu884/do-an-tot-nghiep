import { LeftOutlined, RightOutlined } from "@ant-design/icons";
import { Button, Row, Select as ANTSelect, SelectProps, Space } from "antd";
import { AppConfig } from "config/app.config";
import debounce from "lodash/debounce";
import { BaseMetadata } from "model/base/base-metadata.response";
import React, {CSSProperties, ReactNode, useState} from "react";

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

  const onChange = (type: 'next' | 'prev') => {
    let newPage = type === 'next' ? metadata.page + 1 :  metadata.page - 1
    if ( (type === 'prev' && newPage >= 1) ||  (type === 'next' && newPage <= totalPage)) {
      onPageChange && onPageChange(key, newPage);
    }
  }

  const onSearchValue = (value: string) => {
    setKey(value);
    onSearch && onSearch(value);
  }

  const buttons = [
    {
      key: 'prev',
      onClick: () => onChange('prev'),
      disabled: metadata.page === 1,
      arrowComponent: <LeftOutlined />
    },
    {
      key: 'next',
      onClick: () => onChange('next'),
      disabled: metadata.page >= totalPage,
      arrowComponent: <RightOutlined />
    }
  ]

  return (
    <ANTSelect
      onSearch={debounce(onSearchValue, AppConfig.TYPING_TIME_REQUEST)}
      dropdownRender={(menu) => (
        <div>
          {menu}
          <Row justify="center" style={{ marginTop: 10 }}>
            <Space>
              {
                buttons.map((btn) => (
                  <Button
                    key={btn.key}
                    disabled={btn.disabled}
                    onClick={btn.onClick}
                    style={{ width: 30, height: 30, padding: 0, lineHeight: "20px" }}>
                    {btn.arrowComponent}
                  </Button>
                ))
              }
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
