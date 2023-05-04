import { Button } from "antd";
import React, { CSSProperties, useState } from "react";
import TransferModal from "../TransferModal";

type Props = {
  children?: React.ReactNode;
  className?: string;
  style?: CSSProperties;
};
const ButtonTransfer: React.FC<Props> = (props: Props) => {
  const [visible, setVisible] = useState(false);
  return (
    <>
      <Button
        type="text"
        className={props.className}
        style={props.style}
        onClick={() => {
          setVisible(true);
        }}
      >
        {props.children}
      </Button>

      <TransferModal visible={visible} onCancel={() => setVisible(false)} />
    </>
  );
};

export default ButtonTransfer;
