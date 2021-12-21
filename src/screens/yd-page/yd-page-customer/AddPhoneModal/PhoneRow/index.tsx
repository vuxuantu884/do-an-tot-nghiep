import React, {useCallback} from "react";
import {Space, Button, Checkbox} from "antd";
import close from "assets/icon/close.svg";
import {StyledComponent} from "./styles";

type PhoneRowProps = {
  phone: string;
  isDefaultPhone: boolean;
  onSetDefault: (phone: string) => void;
  onDelete: (phone: string) => void;
};

const PhoneRow: React.FC<PhoneRowProps> = (props: PhoneRowProps) => {
  const {phone, onSetDefault, onDelete, isDefaultPhone} = props;
  const deletePhone = useCallback(() => {
    onDelete(phone);
  }, [phone, onDelete]);

  return (
    <StyledComponent>
      <div className="phone-row-container">
        <Space className="phone-container">
          <div className="phone-txt">{phone}</div>
          <Button
            type="link"
            className="p-0 ant-btn-custom"
            icon={<img src={close} alt="" />}
            onClick={deletePhone}
          />
        </Space>
        <Space className="phone-default-container">
          <Checkbox checked={isDefaultPhone} onClick={() => onSetDefault(phone)} />
          Mặc định
        </Space>
      </div>
    </StyledComponent>
  );
};

export default PhoneRow;
