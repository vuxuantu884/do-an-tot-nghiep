import { Input, InputNumber, Select, Typography } from "antd";
import React, { useState } from "react";
import styled from "styled-components";
import { formatCurrency } from "utils/AppUtils";
import { MoneyType } from "utils/Constants";

interface CustomInputChangeProps {
  placeholder?: string;
  value?: number;
  onChange?: (value: number) => void;
  dataPercent: number;
  remainPayment: number;
}

const InputStyle = styled.div`
  .ant-input-number-handler-wrap{
    display: none;
  }
  .ant-input-number-input{
    text-align: right;
  }
`

const CustomInputChange: React.FC<CustomInputChangeProps> = (
  props: CustomInputChangeProps
) => {
  const { remainPayment = 0, value, onChange } = props;
  const [selected, setSelected] = useState(MoneyType.PERCENT);
  const [data, setData] = useState<number>();

  const handleChangeSelect = (value: string) => {
    setSelected(value);
    onChange?.(0);
    setData(0);
  };

  const handleChangeInput = (value: number | null) => {
    let money = value || 0;
    if (typeof value === "number") {
      if (selected === MoneyType.PERCENT && typeof remainPayment === "number" && remainPayment > 0) {
        money = (value * remainPayment) / 100
      } else if (selected === MoneyType.PERCENT) {
        money = 0
      }
    }

    onChange?.(money);
    setData(value || 0);
  }

  return (
    <InputStyle>
      <Input.Group
        style={{
          display: "flex",
        }}
        compact
      >
        <Select
          onChange={(value: string) => {
            handleChangeSelect(value);
          }}
          value={selected}
        >
          <Select.Option value={MoneyType.PERCENT}>%</Select.Option>
          <Select.Option value={MoneyType.MONEY}>₫</Select.Option>
        </Select>
        <InputNumber<number>
          style={{ textAlign: 'right', width: '100%' }}
          step={selected === MoneyType.MONEY ? 1 : 0.01}
          placeholder={props.placeholder}
          min={0}
          onChange={(e) => {
            handleChangeInput(e);
          }}
          formatter={(value?: number) => formatCurrency(value||0)}
          max={selected === MoneyType.PERCENT ? 100 : remainPayment}
          value={data}
        />
      </Input.Group>
      <div style={{ textAlign: 'right', marginRight: 15 }}>
        <Typography.Text type="danger">
          {selected === MoneyType.MONEY
            ? (value && remainPayment
              ? (value / remainPayment) * 100
              : 0
            ).toFixed(1) + " %"
            : formatCurrency(value ?? 0)}

        </Typography.Text>
      </div>

    </InputStyle>
  );
};

export default CustomInputChange;
