import { Button } from "antd";
import setting from "assets/img/setting.svg";
import Styled from "styled-components";
type ButtonSettingProps = {
  onClick?: () => void;
};
const StyledWrapper = Styled.div`
.button-setting{
  display: flex;
    align-items: center;
    justify-content: center;
}
`;
const ButtonSetting: React.FC<ButtonSettingProps> = (props: ButtonSettingProps) => {
  return (
    <StyledWrapper>
      <Button
        onClick={() => props.onClick && props.onClick()}
        className="button-setting"
        icon={<img src={setting} alt="setting" />}
      />
    </StyledWrapper>
  );
};

export default ButtonSetting;
