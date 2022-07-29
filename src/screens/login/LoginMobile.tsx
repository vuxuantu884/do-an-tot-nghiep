import logoLogin from "assets/img/LOGIN/logo.svg";
import fashionTech from "assets/img/LOGIN/FashionTech.png";
import styled from "styled-components";
import { Button, Checkbox, Col, Form, Input, Row, Space, Tooltip } from "antd";
import { LockOutlined, UserOutlined } from "@ant-design/icons";
import hotlineIcon from "assets/icon/hotline.svg";
import { hotlineNumber } from "config/app.config";
import questionICon from "assets/icon/LOGIN/question.svg";

type IProps = {
  onFinish: (values: any) => void;
  loading: boolean;
  callHotlineSupport: () => void;
};

export const LoginMobile = (props: IProps) => {
  const { onFinish, loading, callHotlineSupport } = props;
  return (
    <StyledLoginMobile>
      <div className="container-header">
        <div className="header">
          <img src={logoLogin} alt="logo" />
          <img src={fashionTech} alt="fashionTech" />
        </div>
        <div className="yody-hello">YODY XIN CHÀO!</div>
      </div>
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
      <Row gutter={24} justify="center" align="middle" className="login-bottom">
        <Col>
          <div className="hotline-info">
            <img
              style={{ marginRight: 5, width: "20px", height: "20px" }}
              src={questionICon}
              alt="hotline"
            />
            <span style={{ cursor: "pointer" }}>
              {" "}
              <a href="https://hdsd.yody.io/faq-cau-hoi-thuong-gap" target="_bank">
                {" "}
                {"Câu hỏi thường gặp"}
              </a>
            </span>
          </div>
        </Col>
        <Col>
          <Space size={15}>
            <div className="hotline-info">
              <img style={{ marginRight: 5 }} src={hotlineIcon} alt="hotline" />
              <span className="hotline-group">
                <span style={{ marginBottom: "-8px" }}> {"Hotline hỗ trợ: "}</span>
                <Tooltip title="Click để gọi hỗ trợ" color="blue" placement="bottom">
                  <span className="phone-number" onClick={callHotlineSupport}>
                    {hotlineNumber}
                  </span>
                </Tooltip>
              </span>
            </div>
          </Space>
        </Col>
      </Row>
    </StyledLoginMobile>
  );
};

const StyledLoginMobile = styled.div`
  min-height: 100vh;
  position: relative;
  display: flex;
  flex-direction: column;
  .container-header {
    text-align: center;
    padding: 12px 0;
    background: #000349;
  }
  .header {
    display: flex;
    align-items: center;
    gap: 12px;
    justify-content: center;
    img {
      width: 80px;
    }
  }
  .yody-hello {
    text-align: center;
    font-family: "utm-aptima";
    font-style: normal;
    font-weight: 700;
    font-size: 24px;
    line-height: 35px;
    color: #ffffff;
  }
  .login {
    width: 65%;
    margin: 0 auto;
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    background-color: #fff;
    padding: 20px 40px;
    -webkit-border-radius: 4px;
    -moz-border-radius: 4px;
    border-radius: 4px;
    @media screen and (max-width: 768px) {
      width: 80%;
    }
    @media screen and (max-width: 500px) {
      width: 450px;
    }

    @media screen and (max-width: 450px) {
      width: 100%;
      padding: 10px 20px;
    }

    .forget-password {
      margin: -12px auto !important;
      display: flex;
      justify-content: space-between;
      align-items: center;
      .quen-mk {
        color: #5656a2;
        cursor: pointer;
      }
    }
    .login-form {
      margin-top: 20px;
      .row-form {
        margin-top: 10px;
      }
      label {
        ::before {
          content: "";
        }
        ::after {
          display: inline-block;
          margin-right: 4px;
          color: #ff4d4f;
          font-size: 14px;
          font-family: "Inner";
          line-height: 1;
          content: "*";
        }
      }
    }
    .login-form-button {
      margin-top: 20px;
      width: 100%;
    }
    .login-title {
      text-align: center;
    }
    .username.ant-input-affix-wrapper {
      padding-right: 0 !important;
    }
  }
  .login-bottom {
    bottom: 16px;
    width: 65%;
    margin: 0 auto !important;
    padding: 20px 40px;
    @media screen and (max-width: 768px) {
      width: 80%;
    }
    @media screen and (max-width: 500px) {
      width: 450px;
    }

    @media screen and (max-width: 450px) {
      width: 100%;
      padding: 10px 20px;
    }
  }
  .hotline-info {
    display: flex;
    align-items: center;
    font-size: 16px;
    .hotline-group {
      display: flex;
      flex-direction: column;
    }
    .phone-number {
      font-weight: bold;
      &:hover {
        cursor: pointer;
        text-decoration: underline;
      }
    }
    a {
      color: #000000;
    }
  }
`;
