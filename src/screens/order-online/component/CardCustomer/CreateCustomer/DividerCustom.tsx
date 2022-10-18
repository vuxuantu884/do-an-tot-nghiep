import { DownOutlined, UpOutlined } from "@ant-design/icons";
import { Button, Divider } from "antd";
import React from "react";

type Props = {
  type: string | "extend" | "collapse";
  setVisibleCollapse: (v: boolean) => void;
  isVisibleCollapse: boolean;
};

const DividerCustom: React.FC<Props> = (props: Props) => {
  return (
    <React.Fragment>
      {props.type === "extend" && props.isVisibleCollapse === false && (
        <Divider orientation="left" style={{ padding: 0, margin: 0 }}>
          <div>
            <Button
              type="link"
              icon={<DownOutlined />}
              style={{ padding: "0px" }}
              onClick={() => {
                props.setVisibleCollapse(true);
              }}
            >
              Xem thêm
            </Button>
          </div>
        </Divider>
      )}

      {props.type === "collapse" && props.isVisibleCollapse === true && (
        <Divider orientation="left" style={{ padding: 0, margin: 0, color: "#5656A1" }}>
          <div>
            <Button
              type="link"
              icon={<UpOutlined />}
              style={{ padding: "0px" }}
              onClick={() => {
                props.setVisibleCollapse(false);
              }}
            >
              Thu gọn
            </Button>
          </div>
        </Divider>
      )}
    </React.Fragment>
  );
};

export default DividerCustom;
