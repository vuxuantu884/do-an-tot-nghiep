import {Button, Form, Input} from "antd";
import {useCallback, useState} from "react";
import {Redirect} from "react-router";
import {useDispatch, useSelector} from "react-redux";
import {RootReducerType} from "model/reducers/RootReducerType";
import {loginRequestAction} from "domain/actions/auth/auth.action";
import {useQuery} from "utils/useQuery";
import UrlConfig from "config/url.config";
import {StylesWrapper} from "./styles"; 
import { DEFAULT_COMPANY } from "utils/Constants";
import { 
  UserOutlined,
  LockOutlined
} from "@ant-design/icons";

const Login = () => {
  const query = useQuery();
  const dispatch = useDispatch();
  const userReducer = useSelector((state: RootReducerType) => state.userReducer);
  const [loading, setLoading] = useState(false);
  let {isLogin} = userReducer;
  const onFinish = useCallback(
    (values) => {
      dispatch(loginRequestAction(values.username, values.password, setLoading));
    },
    [dispatch]
  );
  if (isLogin) {
    let url = query.get("returnUrl");
    return <Redirect to={url !== null ? url : UrlConfig.HOME} />;
  }
  return (
    <StylesWrapper> 
      <div className={"container-login"}>
        <div className="info-company">
          <div className="logo-fashion">
            <div className="lg-fashion">
            </div>
          </div>
          <div className="hello">{DEFAULT_COMPANY.company} XIN CHÀO!</div>
          <div className="hello-info">Phần mềm quản lý bán hàng đa kênh O2O</div>
        </div>
        <div className="login">
          <div className="login-title"><b>VUI LÒNG ĐIỀN THÔNG TIN ĐĂNG NHẬP HỆ THỐNG</b></div>
          <Form
            className="login-form"
            layout="vertical"
            initialValues={{username: "", password: ""}}
            onFinish={onFinish}
          >
            <Form.Item
              className="row-form"
              label="Điền tên đăng nhập"
              name="username"
              rules={[
                {required: true, message: "Tên đăng nhập không được bỏ trống"},
                {pattern: /^[a-zA-Z0-9]{4,20}$/, message: "Tên đăng nhập sai định dạng"},
              ]}
            >
              <Input className="username" prefix={<UserOutlined style={{color: "#c5c5c5", marginRight: 8}} />} size="large" disabled={loading} placeholder="Tên đăng nhập" />
            </Form.Item>

            <Form.Item
              className="row-form"
              label="Mật khẩu"
              name="password"
              rules={[
                {required: true, message: "Mật khẩu không được bỏ trống"},
              ]}
            >
              <Input.Password prefix={<LockOutlined style={{color: "#c5c5c5", marginRight: 8}} />} disabled={loading} size="large" placeholder="Mật khẩu" />
            </Form.Item>
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
    </StylesWrapper>
  );
};

export default Login;
