import { Button, Space } from "antd";
import BottomBarContainer from "component/container/bottom-bar.container";
import UrlConfig from "config/url.config";
import React from "react";
import { useHistory } from "react-router-dom";

const AddOrderBottomBar: React.FC<any> = (props: any) => {
  const history = useHistory();
  return (
    <React.Fragment>
      <BottomBarContainer
        backAction={() => {
          history.push(`${UrlConfig.HANDOVER}`);
        }}
        back={"Quay lại danh sách"}
        rightComponent={
          <React.Fragment>
            <Space>
              <Button
                style={{ width: 90, fontWeight: 400 }}
                className="ant-btn-outline fixed-button cancle-button"
                onClick={() => window.location.reload()}
              >
                Đóng
              </Button>
              <Button
                loading={props?.isLoading}
                style={{ width: 120, fontWeight: 400 }}
                type="primary"
                className="create-button-custom"
                onClick={props.onOkPress}
              >
                Thêm mới
              </Button>
            </Space>
          </React.Fragment>
        }
      />
    </React.Fragment>
  );
};

export default AddOrderBottomBar;
