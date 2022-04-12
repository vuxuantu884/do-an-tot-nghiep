import { Input, InputNumber, Select, Typography } from "antd";
import React, { useState } from "react";
import styled from "styled-components";
import { formatCurrency } from "utils/AppUtils";
import { MoneyType } from "utils/Constants";

interface CustomInputChangeProps {
  placeholder?: string;
  value?: number;
  onChange?: (value: number) => void;
  totalPayment: number;
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
  const { remainPayment = 0, value, onChange, totalPayment } = props;
  const [selected, setSelected] = useState(MoneyType.PERCENT);
  const [data, setData] = useState<number>(0);

  const handleChangeSelect = (value: string) => {
    setSelected(value);
    onChange?.(0);
    setData(0);
  };

  const handleChangeInput = (value: number | null) => {
    let money = value || 0;
    if (typeof value === "number") {
      if (selected === MoneyType.PERCENT && typeof remainPayment === "number" && remainPayment > 0) {
        money = (value * totalPayment) / 100
      } else if (selected === MoneyType.PERCENT) {
        money = 0
      }
    }

    onChange?.(money);
    setData(value || 0);
  }

  const getMaxInput = () => {
    if (selected === MoneyType.PERCENT && remainPayment > 0 && totalPayment > 0) {
      return (remainPayment / totalPayment) * 100;
    } else if (selected === MoneyType.MONEY) {
      return remainPayment;
    } else {
      return 0;
    }
  }

  const getMoneyLabel = () => {
    let label: number | string = 0;

    if (selected === MoneyType.MONEY && value && remainPayment) {
      label = ((data / totalPayment) * 100).toFixed(2) + " %";
    } else if (value && selected === MoneyType.PERCENT) {
      label = formatCurrency(value);
    }

    return label;
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
          placeholder={props.placeholder}
          min={0}
          onChange={(e) => {
            handleChangeInput(e);
          }}
          formatter={(value?: number) => formatCurrency(value || 0)}
          max={getMaxInput()}
          value={data}
        />
      </Input.Group>
      <div style={{ textAlign: 'right', marginRight: 15 }}>
        <Typography.Text type="danger">
          {getMoneyLabel()}
        </Typography.Text>
      </div>

    </InputStyle>
  );
};

export default CustomInputChange;
