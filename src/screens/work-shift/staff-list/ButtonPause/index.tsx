import { Button } from "antd";
import React, { CSSProperties, useState } from "react";
import PauseModal from "../PauseModal";

type Props = {
  children?: React.ReactNode;
  className?: string;
  style?: CSSProperties;
};
const ButtonPause: React.FC<Props> = (props: Props) => {
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

      <PauseModal visible={visible} onCancel={() => setVisible(false)} />
    </>
  );
};

export default ButtonPause;
