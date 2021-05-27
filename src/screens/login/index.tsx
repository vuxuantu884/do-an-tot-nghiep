import './login.scss'
import logo from 'assets/img/logo.svg';
import { Button, Form, Input } from 'antd';
import { useCallback, useState } from 'react';
import { Redirect } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import { RootReducerType } from 'model/reducers/RootReducerType';
import { loginRequestAction } from 'domain/actions/auth.action';
import { useQuery } from 'utils/useQuery';



const Login = () => {
  const query = useQuery();
  const dispatch  = useDispatch();
  const userReducer = useSelector((state: RootReducerType) => state.userReducer)
  const [loading, setLoading] = useState(false);
  let {isLogin} = userReducer;
  const onFinish = useCallback((values) => {
    dispatch(loginRequestAction(values.username, values.password, setLoading));
  }, [dispatch]);
  if(isLogin) {
    let url = query.get('returnUrl');
    return <Redirect to={url !== null ? url: '/'} />
  }
  return (
    <div className={'container'}>
      <div className={'login'}>
        <img src={logo} alt="logo" />
        <Form
          className='login-form'
          layout="vertical"
          initialValues={{ username: '', password: '' }}
          onFinish={onFinish}>
          <Form.Item
            className="row-form"
            label="Tên đăng nhập"
            name="username"
            rules={[{ required: true, message: 'Tên đăng nhập không được bỏ trống'}, {pattern: /^[a-zA-Z0-9]{4,20}$/, message: "Tên đăng nhập sai định dạng"}]}
          >
            <Input size="large" placeholder="Tên đăng nhập" />
          </Form.Item>

          <Form.Item
             className="row-form"
            label="Mật khẩu"
            name="password"
            rules={[{ required: true, message: 'Mật khẩu không được bỏ trống' }, {min: 6, message: "Mật khẩu sai định dạng"}]}
          >
            <Input.Password size="large" placeholder="Mật khẩu" />
          </Form.Item>
          <Form.Item>
            <Button loading={loading}  size="large" type="primary" htmlType="submit" className="login-form-button">
              Đăng nhập
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  )
}

export default Login;