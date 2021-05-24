import { Button } from "antd"
import setting from 'assets/img/setting.svg';


const ButtonSetting = () => {
  return (
    <Button className="button-setting" icon={<img src={setting} alt="setting" />} />
  )
}

export default ButtonSetting;