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
import { showError } from "utils/ToastUtils";
import {
  AccountRequest,
} from "model/account/account.model";
import React, {useCallback, useEffect, useState} from "react";
import { useHistory, useParams } from "react-router";
import { LockOutlined } from "@ant-design/icons";
type AccountParam = {
  code: string;
};

const AccountUpdatePassScreen: React.FC = () => {
  const [form] = Form.useForm();
  const {code: userCode} = useParams<AccountParam>();
  const [loading, setLoading] = useState<boolean>(false);
  const {Item} = Form;
  const allowUpdateAcc = useAuthorization({
    acceptPermissions: [AccountPermissions.UPDATE],
  });
  const history = useHistory()

  const backAction = ()=>{    
    history.push(UrlConfig.ACCOUNTS + "/" + userCode);
  };

  useEffect(() => {
  }, [history]);

  // const onRes = useCallback((res: AccountResponse)=>{

  // },[]);

  const validateRePassNew = useCallback((): boolean => {
    const passNew = form.getFieldValue('passnew'),
         rePassNew = form.getFieldValue('repassnew');

  if (passNew !== rePassNew) {
    showError("Mật khẩu không khớp nhau, xin vui lòng thử lại.");
    return false;
  }
 return true ;
},[form])

  const onFinish = useCallback(
    (values: AccountRequest) => { 
      setLoading(true);
      if (!validateRePassNew()) {
        
      }
     },
    [validateRePassNew]
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
          name: "Quản lý người dùng",
          path: UrlConfig.ACCOUNTS,
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
                    rules={[{required: true, message: "Vui lòng nhập lại mật khẩu cũ"},
                            {min: 6, max: 12,message: "Mật khẩu cũ từ 6 đến 12 ký tự"}]}
                    label="Mật khẩu cũ" 
                    name="password">
                    <Input.Password prefix={<LockOutlined className="site-form-item-icon" />} placeholder="Mật khẩu cũ"/> 
                </Item> 
              </Col>
            </Row>
            <Row>
              <Col span={24} style={{maxWidth: 400}}>
                <Item  
                    rules={[{required: true, message: "Vui lòng nhập mật khẩu mới"},
                            {min: 6, max: 12,message: "Mật khẩu mới từ 6 đến 12 ký tự"}]}
                    label="Mật khẩu mới" 
                    name="passnew">
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
                  name="repassnew">
                  <Input.Password prefix={<LockOutlined className="site-form-item-icon" />} placeholder="Mật khẩu mới"/> 
                </Item> 
              </Col>
            </Row>
            </Col>
        </Row>
        <BottomBarContainer
            back="Quay lại"
            backAction={backAction}
            rightComponent={
              <Space>
                {allowUpdateAcc && <Button loading={loading} htmlType="submit" type="primary">
                    Lưu lại
                  </Button> }
              </Space>
            }
          />
        </Form>
      </Card>  
    </ContentContainer>
  );
}; 

export default AccountUpdatePassScreen;
