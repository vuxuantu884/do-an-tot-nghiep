import { Input, Select, Typography } from "antd";
import React, { useEffect, useState } from "react";
import { formatCurrency, replaceFormatString } from "utils/AppUtils";
import { MoneyType } from "utils/Constants";
import NumberInput from "./number-input.custom";

interface CustomInputChangeProps {
  placeholder?: string;
  value?: number;
  onChange?: (value: number) => void;
  dataPercent: number;
}

const CustomInputChange: React.FC<CustomInputChangeProps> = (
  props: CustomInputChangeProps
) => {
  const [selected, setSelected] = useState(MoneyType.PERCENT);
  const [data, setData] = useState<number>();
  useEffect(() => {
    if (props.value) {
      if (selected === MoneyType.PERCENT) {
        setData(
          parseFloat(((props.value / props.dataPercent) * 100).toFixed(1))
        );
      } else {
        setData(props.value);
      }
    } else {
      setData(0);
    }
  }, [props, props.value, selected]);
  return (
    <div>
      <Input.Group
        style={{
          display: "flex",
        }}
        compact
      >
        <Select
          onChange={(value: string) => {
            setSelected(value);
          }}
          value={selected}
        >
          <Select.Option value={MoneyType.PERCENT}>%</Select.Option>
          <Select.Option value={MoneyType.MONEY}>₫</Select.Option>
        </Select>
        <NumberInput
          format={(a: string) => formatCurrency(a ? Math.abs(parseInt(a)) : 0)}
          replace={(a: string) => replaceFormatString(a)}
          min={1}
          default={0}
          placeholder={props.placeholder}
          isFloat={selected === MoneyType.PERCENT}
          onChange={(value) => {
            if (value !== null) {
              if (selected === MoneyType.PERCENT) {
                props.onChange &&
                  props.onChange((value * props.dataPercent) / 100);
              } else {
                props.onChange && props.onChange(value);
              }
            }
          }}
          max={selected === MoneyType.PERCENT ? 100 : undefined}
          value={data}
        />
      </Input.Group>
      <div style={{textAlign: 'right', marginRight: 15}}>
        <Typography.Text type="danger">
          {selected === MoneyType.MONEY
            ? (props.value
                ? (props.value / props.dataPercent) * 100
                : 0
              ).toFixed(1)
            : formatCurrency(props.value ? props.value : 0)}
        </Typography.Text>
      </div>
    </div>
  );
};

export default CustomInputChange;
