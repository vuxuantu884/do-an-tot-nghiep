import { Button } from "antd"
import setting from 'assets/img/setting.svg';

type ButtonSettingProps = {
  onClick?: () => void;
}

const ButtonSetting: React.FC<ButtonSettingProps> = (props: ButtonSettingProps) => {
  return (
    <Button onClick={() => props.onClick && props.onClick()} className="button-setting" icon={<img src={setting} alt="setting" />} />
  )
}

export default ButtonSetting;