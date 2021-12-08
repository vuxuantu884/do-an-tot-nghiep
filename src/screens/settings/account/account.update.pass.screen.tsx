import { 
  Button,
  Card,
  Col,
  Form, 
  Input, 
  Row, 
  Space, 
} from "antd";
import BottomBarContainer from "component/container/bottom-bar.container";
import ContentContainer from "component/container/content.container";
import { AccountPermissions } from "config/permissions/account.permisssion";
import UrlConfig from "config/url.config";
import useAuthorization from "hook/useAuthorization";
import { showError, showSuccess } from "utils/ToastUtils";
import {
  AccountRequest, AccountResponse,
} from "model/account/account.model";
import React, {useCallback, useEffect, useState} from "react";
import { useHistory } from "react-router";
import { LockOutlined } from "@ant-design/icons";
import { useDispatch } from "react-redux";
import { AccountUpdatePassAction } from "domain/actions/account/account.action";


const AccountUpdatePassScreen: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState<boolean>(false);
  const {Item} = Form;
  const allowUpdateAcc = useAuthorization({
    acceptPermissions: [AccountPermissions.UPDATE],
  });
  const history = useHistory();
  const dispatch = useDispatch();

  const backAction = ()=>{    
    history.push(`${UrlConfig.ACCOUNTS}/me`);
  };

  useEffect(() => {
  }, [history]);

  const onRes = useCallback((res: AccountResponse)=>{
    if (res) {
      showSuccess("Đặt lại mật khẩu thành công."); 
      history.push(UrlConfig.HOME);
    }
  },[history]);

  const validateRePassNew = useCallback((): boolean => {
    const password = form.getFieldValue('password'),
        confirmPassword = form.getFieldValue('confirm_password');
 
  if (password !== confirmPassword) {
    showError("Mật khẩu không khớp nhau, xin vui lòng thử lại.");
    return false;
  }
 return true ;
},[form])

  const onFinish = useCallback(
    (values: AccountRequest) => { 
      setLoading(true);
      if (validateRePassNew()) {
         dispatch(AccountUpdatePassAction(values,onRes));
      }   
      
      setLoading(false);
     },
    [validateRePassNew, dispatch, onRes]
  );
  
  return (
    <ContentContainer
      title="Đặt lại mật khẩu"
      breadcrumb={[
        {
          name: "Tổng quan",
          path: UrlConfig.HOME,
        },
        {
          name: "Thông tin cá nhân",
          path: `${UrlConfig.ACCOUNTS}/me`,
        },
        {
          name: "Đặt lại mật khẩu",
        },
      ]}
    >
      <Card>
        <Form 
          form={form}
          layout="vertical"
          onFinish={onFinish}
        > 
        <Row>
          <Col span={24}> 
            <Row>
              <Col span={24} style={{maxWidth: 400}}>
                <Item  
                    rules={[{required: true, message: "Vui lòng nhập mật khẩu mới"},
                            {min: 6, max: 12,message: "Mật khẩu mới từ 6 đến 12 ký tự"}]}
                    label="Mật khẩu mới" 
                    name="password">
                    <Input.Password prefix={<LockOutlined className="site-form-item-icon" />} placeholder="Mật khẩu mới"/> 
                </Item> 
              </Col>
            </Row>
            <Row>
              <Col span={24} style={{maxWidth: 400}}>
                <Item  
                  rules={[{required: true, message: "Vui lòng nhập lại mật khẩu mới"},
                          {min: 6, max: 12,message: "Mật khẩu mới từ 6 đến 12 ký tự"}]}
                  label="Nhập lại mật khẩu mới" 
                  name="confirm_password">
                  <Input.Password prefix={<LockOutlined className="site-form-item-icon" />} placeholder="Mật khẩu mới"/> 
                </Item> 
              </Col>
            </Row>
            </Col>
        </Row> 
        </Form>
      </Card>  
      <BottomBarContainer
        back="Quay lại"
        backAction={backAction}
        rightComponent={
          <Space>
            {allowUpdateAcc && <Button loading={loading} htmlType="submit" type="primary">
                Đặt lại mật khẩu
              </Button> }
          </Space>
        }
      />
    </ContentContainer>
  );
}; 

export default AccountUpdatePassScreen;
