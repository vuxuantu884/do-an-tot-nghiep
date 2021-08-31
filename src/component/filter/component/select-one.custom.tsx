import { Button, Col, Row } from "antd";

type CustomSelectOneProps = {
  value?: string
  data?: any,
  onChange?: (value: string) => void;
  span?: number
};

const CustomSelectOne: React.FC<CustomSelectOneProps> = (props: CustomSelectOneProps) => {
  return (
    <Row gutter={5}>
      {Object.keys(props.data)?.map((key) => (
        <Col span={props.span}>
          <Button
             className={props.value === key ? "active" : ""}
             onClick={() => props.onChange && props.onChange(key)}
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