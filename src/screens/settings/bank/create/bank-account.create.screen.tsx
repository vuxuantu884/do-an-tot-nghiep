import { Card, Checkbox, Col, Form, Input, Row } from "antd";
import ContentContainer from "component/container/content.container";
import TreeStore from "component/tree-node/tree-store";
import UrlConfig from "config/url.config";
import { getListStoresSimpleAction } from "domain/actions/core/store.action";
import { StoreResponse } from "model/core/store.model";
import React, { useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import AddBankAccountBottombar from "../component/add-bank-account-bottombar";

const BankAccountCreateScreen: React.FC = () => {
  const dispatch = useDispatch();
  const [listStore, setListStore] = useState<Array<StoreResponse>>();

  useEffect(() => {
      dispatch(
          getListStoresSimpleAction((stores) => {
              setListStore(stores);
          })
      );
  }, [dispatch]);

  const onOkPress = useCallback(() => {
    //goodsReceiptsForm.submit();
  }, []);
  return (
    <ContentContainer
      title="Thêm tài khoản ngân hàng"
      breadcrumb={[
        {
          name: "Tổng quan",
          path: UrlConfig.HOME,
        },
        {
          name: "Tài khoản ngân hàng",
        },
        {
          name: "Thêm tài khoản ngân hàng",
        },
      ]}
    >
      <Card>
        <Form
          layout="vertical"
        >
          <Row gutter={24}>
            <Col md={12}>
              <Form.Item
                label="Số tài khoản"
                name="account_number"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng nhập số tài khoản",
                  },
                ]}
              >
                <Input placeholder="Nhập số tài khoản" />
              </Form.Item>
            </Col>

            <Col md={12}>
              <Form.Item
                label="Chủ tài khoản"
                name="account_holder"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng nhập tên chủ tài khoản",
                  },
                ]}
              >
                <Input placeholder="Nhập tên chủ tài khoản" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={24}>
            <Col md={12}>
              <Form.Item
                label="Ngân hàng"
                name="bank_name"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng chọn ngân hàng",
                  },
                ]}
              >
                <Input placeholder="Nhập số tài khoản" />
              </Form.Item>
            </Col>

            <Col md={12}>
              <Form.Item
                label="Cửa hàng áp dụng"
                name="store"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng chọn cửa hàng áp dụng",
                  },
                ]}
              >
                <TreeStore listStore={listStore} placeholder="Chọn cửa hàng áp dụng"/>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={24} style={{alignItems:"end"}}>
            <Col md={12}>
              <Form.Item
                label="Trạng thái"
                name="account_number"
              >
                <Input placeholder="Nhập số tài khoản" />
              </Form.Item>
            </Col>

            <Col md={12}>
              <Form.Item
                name="account_holder"
              >
                 <Checkbox defaultChecked={true} onClick={e=>e.stopPropagation()}>Mặc định</Checkbox>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Card>
      <AddBankAccountBottombar onOkPress={onOkPress} />
    </ContentContainer>
  )
}

export default BankAccountCreateScreen;