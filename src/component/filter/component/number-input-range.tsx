import { SwapRightOutlined } from "@ant-design/icons";
import React, { useCallback, useMemo, useState } from "react";
import classNames from "classnames";
import NumberInput from "component/custom/number-input.custom";

export interface NumberInputRangeProps {
  placeholderFrom?: string;
  placeholderTo?: string;
  value?: Array<number | undefined>;
  onChange?: (value: Array<number | undefined>) => void;
}

const NumberInputRange: React.FC<NumberInputRangeProps> = (props: NumberInputRangeProps) => {
  const { placeholderFrom, placeholderTo } = props;
  const p1 = useMemo(() => (placeholderFrom ? placeholderFrom : "Từ"), [placeholderFrom]);
  const p2 = useMemo(() => (placeholderTo ? placeholderTo : "Đến"), [placeholderTo]);
  const [focus1, setFocus1] = useState(false);
  const [focus2, setFocus2] = useState(false);
  const style = useMemo(() => {
    if (focus1) {
      let i1 = document.getElementById("input1")?.offsetWidth;
      return { left: "14px", width: `${i1}px` };
    }
    if (focus2) {
      let i2 = document.getElementById("input2")?.offsetWidth;
      let i1 = document.getElementById("input1")?.offsetWidth;
      let left = 0;
      if (i1) {
        left = i1 + 14 + 14 + 14 + 14;
      }
      return { left: left, width: `${i2}px` };
    }

    return {};
  }, [focus1, focus2]);
  const value = useMemo(() => {
    if (props.value && props.value.length > 0) {
      return [props.value[0], props.value[1]];
    }
    return [undefined, undefined];
  }, [props.value]);
  const onChangeInput1 = useCallback(
    (a) => {
      props.onChange && props.onChange([a, value[1]]);
    },
    [props, value],
  );
  const onChangeInput2 = useCallback(
    (a) => {
      props.onChange && props.onChange([value[0], a]);
    },
    [props, value],
  );
  return (
    <div className="range">
      <div className={classNames("number-r", (focus1 || focus2) && "focus")}>
        <NumberInput
          id="input1"
          onBlur={() => setFocus1(false)}
          onFocus={() => {
            setFocus1(true);
            setFocus2(false);
          }}
          style={{ textAlign: "left" }}
          value={value[0]}
          onChange={onChangeInput1}
          className="r-input"
          placeholder={p1}
        />
        <SwapRightOutlined size={20} />
        <NumberInput
          id="input2"
          onBlur={() => {
            setFocus2(false);
          }}
          onFocus={() => {
            setFocus1(false);
            setFocus2(true);
          }}
          style={{ textAlign: "left" }}
          value={value[1]}
          onChange={onChangeInput2}
          className="r-input"
          placeholder={p2}
        />
        <div style={style} className={classNames("line-focus")} />
      </div>
      {value[0] !== undefined && value[1] !== undefined && value[0] > value[1] ? (
        <p>Số sau phải lớn hơn số trước</p>
      ) : null}
    </div>
  );
};

export default NumberInputRange;
