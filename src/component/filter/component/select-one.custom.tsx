import { Button, Col, Row } from "antd";
import classNames from "classnames";

type CustomSelectOneProps = {
  value?: string
  data?: any,
  onChange?: (value: any) => void;
  span?: number
};

const CustomSelectOne: React.FC<CustomSelectOneProps> = (props: CustomSelectOneProps) => {
  return (
    <Row gutter={5}>
      {Object.keys(props.data)?.map((key, index) => (
        <Col span={props.span} key={key}>
          <Button
             className={classNames("button-select", props.value === key ? "active" : "")}
             onClick={() => {
               props.onChange && props.onChange(key === props.value ? null: key)
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

export default CustomSelectOne;
