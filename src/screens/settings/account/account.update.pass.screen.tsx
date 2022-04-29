import { EyeInvisibleOutlined, EyeTwoTone } from "@ant-design/icons";
import {
  Button,
  Card,
  Col,
  Form,
  Input,
  Row,
  Space
} from "antd";
import { RuleObject } from "antd/lib/form";
import BottomBarContainer from "component/container/bottom-bar.container";
import ContentContainer from "component/container/content.container";
import { AccountPermissions } from "config/permissions/account.permisssion";
import UrlConfig from "config/url.config";
import { AccountUpdatePassAction } from "domain/actions/account/account.action";
import { loadUserFromStorageAction } from "domain/actions/app.action";
import useAuthorization from "hook/useAuthorization";
import {
  AccountRequest, AccountResponse
} from "model/account/account.model";
import { RootReducerType } from "model/reducers/RootReducerType";
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router";
import { showSuccess } from "utils/ToastUtils";
import { PASSWORD_RULES } from "./account.rules";

const AccountUpdatePassScreen: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState<boolean>(false);
  const { Item } = Form;
  const allowUpdateAcc = useAuthorization({
    acceptPermissions: [AccountPermissions.UPDATE],
  });
  const history = useHistory();
  const dispatch = useDispatch();
  const isFirstChangePassword = useSelector((state: RootReducerType) => state.userReducer.account?.is_first_change_password);

  const backAction = () => {
    history.push(`${UrlConfig.ACCOUNTS}/me`);
  };

  const onRes = (res: AccountResponse) => {
    if (res) {
      showSuccess("Đặt lại mật khẩu thành công.");
      dispatch(loadUserFromStorageAction(() => {
        history.push(UrlConfig.HOME);
      }));
    }
    setLoading(false);
  };

  // const validateRePassNew = useCallback((): boolean => {
  //   setLoading(false);
  //   const password = form.getFieldValue('password'),
  //     confirmPassword = form.getFieldValue('confirm_password');

  //   if (password !== confirmPassword) {
  //     showError("Mật khẩu không khớp nhau, xin vui lòng thử lại.");
  //     return false;
  //   }
  //   return true;
  // }, [form])

  const onFinish = (values: AccountRequest) => {
    setLoading(true);
    // if (validateRePassNew()) {
      dispatch(AccountUpdatePassAction(values, onRes));
    // }
  };

  return (
    <ContentContainer
      title={`Đặt lại mật khẩu ${isFirstChangePassword ? "lần đầu" : ""}`}
      breadcrumb={[
        {
          name: "Tổng quan",
          path: UrlConfig.HOME,
        },
        {
          name: "Thông tin tài khoản",
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
                <Col span={24} style={{ maxWidth: 400 }}>
                  {/* <Item
                    rules={[{ required: true, message: "Vui lòng nhập mật khẩu mới" },
                    { min: 6, max: 12, message: "Mật khẩu mới từ 6 đến 12 ký tự" }]}
                    label="Mật khẩu mới"
                    name="password">
                    <Input.Password prefix={<LockOutlined className="site-form-item-icon" />} placeholder="Mật khẩu mới" />
                  </Item> */}
                  <Item name="password" label="Mật khẩu" hasFeedback rules={PASSWORD_RULES}>
                    <Input.Password
                      placeholder="Nhập mật khẩu"
                      size="large"
                      allowClear
                      autoComplete="new-password"
                      iconRender={(visible) =>
                        visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
                      }
                    />
                  </Item>
                </Col>
              </Row>
              <Row>
                <Col span={24} style={{ maxWidth: 400 }}>
                  {/* <Item
                    rules={[{ required: true, message: "Vui lòng nhập lại mật khẩu mới" },
                    { min: 6, max: 12, message: "Mật khẩu mới từ 6 đến 12 ký tự" }]}
                    label="Nhập lại mật khẩu mới"
                    name="confirm_password">
                    <Input.Password prefix={<LockOutlined className="site-form-item-icon" />} placeholder="Mật khẩu mới" />
                  </Item> */}
                  <Item
                    name="confirm_password"
                    label="Nhập lại mật khẩu"
                    dependencies={["password"]}
                    hasFeedback
                    rules={[
                      ({ getFieldValue }) => ({
                        validator(_: RuleObject, value: string) {
                          const password = getFieldValue("password");
                          if (password === value || (!value && !password)) {
                            return Promise.resolve();
                          }
                          return Promise.reject(new Error("Nhập lại mật khẩu không đúng"));
                        },
                      }),
                    ]}
                  >
                    <Input.Password
                      placeholder="Nhập lại mật khẩu"
                      allowClear
                      autoComplete="new-password"
                    />
                  </Item>
                </Col>
              </Row>
            </Col>
          </Row>

        </Form>
      </Card>
      <BottomBarContainer
        back="Quay lại thông tin tài khoản"
        backAction={backAction}
        rightComponent={
          <Space>
            {allowUpdateAcc && <Button loading={loading} type="primary" onClick={()=> form.submit()}>
              Đặt lại mật khẩu
            </Button>}
          </Space>
        }
      />
    </ContentContainer>
  );
};

export default AccountUpdatePassScreen;
