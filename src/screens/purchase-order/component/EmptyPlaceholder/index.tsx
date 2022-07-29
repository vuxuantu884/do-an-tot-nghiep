import { Row, Space } from "antd";
import emptyIcon from "assets/icon/empty-return.svg";
import "./styles.scss";
type PlaceholderComponentProps = {
  text?: string;
};
const PlaceholderComponent: React.FC<PlaceholderComponentProps> = (
  props: PlaceholderComponentProps,
) => {
  return (
    <Row align="middle" className="empty-placeholder">
      <Space>
        <img
          src={emptyIcon}
          style={{
            width: 40,
            height: 40,
            objectFit: "none",
            borderRadius: "50%",
            background: "#2a2a86",
          }}
          alt=""
        />
        <div>{props.text}</div>
      </Space>
    </Row>
  );
};
export default PlaceholderComponent;
