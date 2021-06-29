//#region Import
import {
  UserOutlined,
  SearchOutlined,
  UnorderedListOutlined,
} from "@ant-design/icons";
import {
  Button,
  Card,
  Input,
  Row,
  Col,
  Form,
  Checkbox,
  Space,
  AutoComplete,
} from "antd";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useHistory } from "react-router";
import SupplierInfo from "./supplier-info";
import PurchaseItem from "./purchase-item";
import PurchaseInfo from "./purchase-info";

const CreatePO = () => {
  //#region state
  const dispatch = useDispatch();
  const history = useHistory();
  const onFinish = () => {};
  const onChangeSearchSupplier = (val:string) => {
    console.log("test:"+val)
  };
  useEffect(() => {

  }, []);

  return (
    <div className="orders">
      <Form layout="vertical">
        <Row gutter={20}>
          {/* Left Side */}
          <Col md={18}>
            <Card
              title={
                <Space>
                  <UserOutlined />
                  Khách hàng
                </Space>
              }
            >
              <div className="padding-20">
                <AutoComplete
                  dropdownClassName="search-layout dropdown-search-header"
                  className="w-100"
                  style={{ width: "100%" }}
                  onChange={onChangeSearchSupplier}
                >
                  <Input
                    placeholder="Tìm hoặc thêm khách hàng"
                    className="border-input"
                    prefix={<SearchOutlined style={{ color: "#ABB4BD" }} />}
                  />
                </AutoComplete>
              </div>

              <SupplierInfo />
            </Card>
            <Card
              className="margin-top-20"
              title={
                <Space>
                  <UnorderedListOutlined />
                  Sản phẩm
                </Space>
              }
              extra={
                <Space size={20}>
                  <Checkbox>Tách dòng</Checkbox>
                </Space>
              }
            >
              <div className="padding-20">
                <Row gutter={20}>
                  <Col md={24}>
                    <Form.Item label="Sản phẩm">
                      <Input
                        prefix={<SearchOutlined />}
                        placeholder="Tìm sản phẩm/ SKU/ mã vạch (F3)"
                      />
                    </Form.Item>
                  </Col>
                </Row>
              </div>
              <PurchaseItem />
            </Card>
          </Col>
          {/* Right Side */}
          <Col md={6}>
            <PurchaseInfo />
          </Col>
        </Row>
        <div className="margin-top-20 text-right">
          <Space size={12}>
            <Button>Huỷ</Button>
            <Button type="primary" htmlType="submit">
              Lưu
            </Button>
          </Space>
        </div>
      </Form>
    </div>
  );
};

export default CreatePO;
