import { Avatar, Row } from "antd";
import { AvatarSize } from "antd/lib/avatar/SizeContext";

type TitleConfig = {
  size: AvatarSize,
  text?: string|null
  icon: React.ReactNode;
  bgColor?: string,
  color?: string
}; 

const TitleCustom: React.FC<TitleConfig> = (props: TitleConfig) => {
  return (
    <Row style={{display: "inline-block", alignItems: "center"}}>
      <Avatar style={{backgroundColor: props.bgColor, color: props.color}} size={props.size} icon={props.icon} /> {props.text}
    </Row>
  );
};

export default TitleCustom;
