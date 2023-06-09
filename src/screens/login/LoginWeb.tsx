import { Button, Col, Form, Input, Row, Space, Tooltip } from "antd";
import { StylesWrapperLeft, StylesWrapperRight } from "./styles";
import logoLogin from "assets/img/LOGIN/logo.svg";
import fashionTech from "assets/img/LOGIN/FashionTech.png";
import logoMain from "assets/img/LOGIN/LogoMain.png";
import hotlineIcon from "assets/icon/hotline.svg";
import hotlineCBIcon from "assets/icon/cb.svg";
import gapoIcon from "assets/icon/gapo.svg";
import { hotlineCBNumber, hotlineNumber } from "config/app.config";
import { LockOutlined, UserOutlined } from "@ant-design/icons";

type IProps = {
  callHotlineSupport: () => void;
  callHotlineCBSupport: () => void;
  onFinish: (values: any) => void;
  loading: boolean;
};

export const LoginWeb = (props: IProps) => {
  const { callHotlineSupport, onFinish, loading, callHotlineCBSupport } = props;
  return (
    <Row gutter={24} style={{ width: "100%", height: "100%" }}>
      <StylesWrapperLeft span={12}>
        <div className="container-left">
          <div className="header">
            <img src={logoLogin} alt="logo" />
            <img src={fashionTech} alt="fashionTech" />
          </div>
          <div className="yody-hello">YODY XIN CHÀO!</div>
          <div className="logo-main">
            <img src={logoMain} alt="logo-main" />
          </div>
          <div className="des1">UNICORN - Phần mềm quản lý kho và bán hàng đa kênh O2O</div>
          <div className="des2">
            Phần mềm quản lý với tốc độ xử lý nhanh, với các tính năng phù hợp với nghiệp vụ thực tế
            vận hành
          </div>
        </div>
      </StylesWrapperLeft>
      <StylesWrapperRight span={12}>
        <Row gutter={24} align="middle">
          <Col span={8}>
            <div className="hotline-info">
              <img style={{ marginRight: 5 }} src={hotlineCBIcon} alt="hotlineCB" />
              <span className="hotline-group">
                <span style={{ marginBottom: "-3px", color: "#595959" }}> {"C&B - Hotline"}</span>
                <Tooltip title="Click để gọi Vân Anh C&B" color="blue" placement="bottom">
                  <span className="phone-number" onClick={callHotlineCBSupport}>
                    {hotlineCBNumber}
                  </span>
                </Tooltip>
              </span>
            </div>
          </Col>
          <Col span={8}>
            <div className="hotline-info">
              <img style={{ marginRight: 5 }} src={hotlineIcon} alt="hotline" />
              <span className="hotline-group">
                <span style={{ marginBottom: "-3px", color: "#595959" }}>
                  {" "}
                  {"Hotline hỗ trợ: "}
                </span>
                <Tooltip title="Click để gọi hỗ trợ" color="blue" placement="bottom">
                  <span className="phone-number" onClick={callHotlineSupport}>
                    {hotlineNumber}
                  </span>
                </Tooltip>
              </span>
            </div>
          </Col>
          <Col span={8}>
            <a
              style={{ color: "#595959" }}
              className="hotline-info"
              href="https://www.gapowork.vn/group/unicorn"
              target="_bank"
            >
              <img style={{ marginRight: 5 }} src={gapoIcon} alt="gapo" />
              <span>
                {" "}
                {"Nhóm hỗ trợ "} <span style={{ fontWeight: 600 }}>Gapo</span>
              </span>
            </a>
          </Col>
        </Row>
        <div
          className="container-right"
          style={{
            marginLeft: "auto !important",
            marginRight: "auto !important",
          }}
        >
          <div className="login">
            <div className="login-group">
              <div className="login-title">
                <b>VUI LÒNG ĐIỀN THÔNG TIN ĐĂNG NHẬP HỆ THỐNG</b>
              </div>
              <Form
                className="login-form"
                layout="vertical"
                initialValues={{ username: "", password: "" }}
                onFinish={onFinish}
              >
                <Form.Item
                  className="row-form"
                  label="Tên đăng nhập"
                  name="username"
                  rules={[
                    {
                      required: true,
                      message: "Tên đăng nhập không được bỏ trống",
                    },
                    {
                      pattern: /^[a-zA-Z0-9]{4,20}$/,
                      message: "Tên đăng nhập sai định dạng",
                    },
                  ]}
                >
                  <Input
                    className="username"
                    prefix={<UserOutlined style={{ color: "#c5c5c5", marginRight: 8 }} />}
                    size="large"
                    disabled={loading}
                    placeholder="Tên đăng nhập"
                  />
                </Form.Item>

                <Form.Item
                  className="row-form"
                  label="Mật khẩu"
                  name="password"
                  rules={[{ required: true, message: "Mật khẩu không được bỏ trống" }]}
                >
                  <Input.Password
                    prefix={<LockOutlined style={{ color: "#c5c5c5", marginRight: 8 }} />}
                    disabled={loading}
                    size="large"
                    placeholder="Mật khẩu"
                  />
                </Form.Item>
                {/* <div className="forget-password">
                  <Form.Item name="forgot" style={{ margin: "0" }}>
                    <Checkbox>Ghi nhớ mật khẩu</Checkbox>
                  </Form.Item>
                  <span className="quen-mk"> Quên mật khẩu?</span>
                </div> */}

                <Form.Item>
                  <Button
                    loading={loading}
                    size="large"
                    type="primary"
                    htmlType="submit"
                    className="login-form-button"
                  >
                    Đăng nhập
                  </Button>
                </Form.Item>
              </Form>
            </div>
          </div>
          <div className="copy-right">© 2021 Copyright Yody Fashion Tech. All Rights Reserved</div>
        </div>
      </StylesWrapperRight>
    </Row>
  );
};
