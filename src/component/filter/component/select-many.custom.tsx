import { Button, Col, Row } from "antd";
import { useCallback } from "react";
import classNames from 'classnames/'

type CustomSelectManyProps = {
  value?: Array<string> | string | null;
  data?: any;
  onChange?: (value: Array<string>) => void;
  span?: number;
};

const CustomSelectMany: React.FC<CustomSelectManyProps> = (
  props: CustomSelectManyProps
) => {
  const isActive = useCallback((key: string) => {
    if (!props.value || props.value === null) {
      return false;
    }
    if (props.value instanceof Array) {
      return props.value.findIndex((item, index) => item === key) !== -1;
    }
    return key === props.value;
  }, [props.value]);
  return (
    <Row gutter={5}>
      {Object.keys(props.data)?.map((key) => (
        <Col key={key} span={props.span}>
          <Button
            className={classNames("button-select", isActive(key) ? "active" : "")}
            onClick={() => {
              let newData: Array<string> = [];
              if (props.value && props.value !== null) {
                newData = [...props.value];
              }
              let index = newData.findIndex((item) => item === key);
              if (index === -1) {
                newData.push(key);
              } else {
                newData.splice(index, 1);
              }
              props.onChange && props.onChange(newData);
            }}
            type="default"
            style={{ width: "100%", textAlign: "center", padding: 0 }}
          >
            {props.data[key]}
          </Button>
        </Col>
      ))}
    </Row>
  );
};

export default CustomSelectMany;
