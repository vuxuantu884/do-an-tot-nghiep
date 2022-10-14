import { DownOutlined, UpOutlined } from "@ant-design/icons";
import { Button, Divider, Row } from "antd";
import React from "react";

type Props = {
  type: string | "extend" | "collapse";
  setVisibleCollapse: (v: boolean) => void;
  isVisibleCollapse: boolean;
  content?: JSX.Element;
};

const DividerCustom: React.FC<Props> = (props: Props) => {
  const { type, setVisibleCollapse, isVisibleCollapse, content } = props;
  const dividerExtend = () => {
    return (
      <Row className="divider-custom">
        {isVisibleCollapse === false && (
          <div className="divider-left">
            <Button
              type="link"
              icon={<DownOutlined />}
              style={{ padding: "0px" }}
              onClick={() => {
                setVisibleCollapse(true);
              }}
            >
              Xem thêm
            </Button>
          </div>
        )}

        <Divider orientation="right" className="extend">
          {content}
        </Divider>
      </Row>
    );
  };

  const dividerCollapse = () => {
    return (
      <Divider orientation="left" className="divider-custom-collapse">
        <div>
          <Button
            type="link"
            icon={<UpOutlined />}
            style={{ padding: "0px" }}
            onClick={() => {
              setVisibleCollapse(false);
            }}
          >
            Thu gọn
          </Button>
        </div>
      </Divider>
    );
  };

  console.log("isVisibleCollapse", isVisibleCollapse);
  return (
    <React.Fragment>
      {type === "extend" && dividerExtend()}
      {isVisibleCollapse === true && type === "collapse" && dividerCollapse()}
    </React.Fragment>
  );
};

export default DividerCustom;
