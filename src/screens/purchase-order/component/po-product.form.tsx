import { SearchOutlined } from "@ant-design/icons";
import {
  AutoComplete,
  Button,
  Card,
  Checkbox,
  Divider,
  Form,
  Input,
  Select,
  Space,
} from "antd";
import { useState } from "react";

const POProductForm: React.FC = () => {
  const [splitLine, setSplitLine] = useState<boolean>(false);
  return (
    <Form>
      <Card
        className="po-form margin-top-20"
        title={
          <div className="d-flex">
            <span className="title-card">THÔNG TIN SẢN PHẨM</span>
          </div>
        }
        extra={
          <Space size={20}>
            <Checkbox
              checked={splitLine}
              onChange={() => setSplitLine(!splitLine)}
            >
              Tách dòng
            </Checkbox>
            <span>Chính sách giá:</span>
            <Form.Item name="price_type" style={{ margin: "0px" }}>
              <Select
                style={{ minWidth: 145, height: 38 }}
                placeholder="Chính sách giá"
              >
                <Select.Option value="import_price" color="#222222">
                  Giá nhập
                </Select.Option>
              </Select>
            </Form.Item>
          </Space>
        }
      >
        <div className="padding-20">
          <Input.Group className="display-flex">
            <AutoComplete
              dropdownMatchSelectWidth={456}
              maxLength={255}
              style={{ width: "100%" }}
              dropdownRender={(menu) => (
                <div>
                  <div
                    className="row-search w-100"
                    style={{
                      minHeight: "42px",
                      lineHeight: "50px",
                      cursor: "pointer",
                    }}
                  >
                    <div className="rs-left w-100">
                      <div className="rs-info w-100">
                        <span
                          className="text"
                          style={{ marginLeft: "23px", lineHeight: "18px" }}
                        >
                          Thêm mới sản phẩm
                        </span>
                      </div>
                    </div>
                  </div>
                  <Divider style={{ margin: "4px 0" }} />
                  {menu}
                </div>
              )}
            >
              <Input
                size="middle"
                className="yody-search"
                placeholder="Tìm kiếm sản phẩm theo tên, mã SKU, mã vạch ... (F1)"
                prefix={<SearchOutlined style={{ color: "#ABB4BD" }} />}
              />
            </AutoComplete>
            <Button style={{ width: 132, marginLeft: 10}}>Chọn nhiều</Button>
          </Input.Group>
        </div>
      </Card>
    </Form>
  );
};

export default POProductForm;
