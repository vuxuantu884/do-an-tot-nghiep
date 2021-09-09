import { InfoCircleOutlined, SearchOutlined } from "@ant-design/icons";
import { Card, Form, Input, Select } from "antd";
import { AccountResponse } from "model/account/account.model";
import React from "react";
import CustomerInputTags from "../../custom-input-tags";
import { StyledComponent } from "./styles";

type PropType = {
  accounts: AccountResponse[];
  onChangeTag: (value: []) => void;
  tags: string;
  isCloneOrder?: boolean;
};

const OrderDetailSidebar: React.FC<PropType> = (props: PropType) => {
  const { accounts, onChangeTag, tags, isCloneOrder } = props;

  return (
    <StyledComponent>
      <Card
        title={
          <div className="d-flex">
            <span className="title-card">THÔNG TIN ĐƠN HÀNG</span>
          </div>
        }
      >
        <div className="padding-24">
          <Form.Item
            label="Nhân viên bán hàng"
            name="assignee_code"
            rules={[
              {
                required: true,
                message: "Vui lòng chọn nhân viên bán hàng",
              },
            ]}
          >
            <Select
              className="select-with-search"
              notFoundContent="Không tìm thấy kết quả"
              showSearch
              placeholder={
                <React.Fragment>
                  <SearchOutlined />
                  <span> Tìm, chọn nhân viên</span>
                </React.Fragment>
              }
              filterOption={(input, option) => {
                if (option) {
                  return (
                    option.children
                      .toLowerCase()
                      .indexOf(input.toLowerCase()) >= 0
                  );
                }
                return false;
              }}
            >
              {accounts.map((item, index) => (
                <Select.Option key={index.toString()} value={item.code}>
                  {`${item.full_name} - ${item.code}`}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            label="Tham chiếu"
            name="reference_code"
            tooltip={{
              title:
                "Thêm số tham chiếu hoặc ID đơn hàng gốc trên kênh bán hàng",
              icon: <InfoCircleOutlined />,
            }}
          >
            <Input placeholder="Điền tham chiếu" maxLength={255} />
          </Form.Item>
          <Form.Item
            label="Đường dẫn"
            name="url"
            tooltip={{
              title: "Thêm đường dẫn đơn hàng gốc trên kênh bán hàng",
              icon: <InfoCircleOutlined />,
            }}
          >
            <Input placeholder="Điền đường dẫn" maxLength={255} />
          </Form.Item>
        </div>
      </Card>
      <Card
        className="margin-top-20"
        title={
          <div className="d-flex">
            <span className="title-card">THÔNG TIN BỔ SUNG</span>
          </div>
        }
      >
        <div className="padding-24">
          <Form.Item
            name="note"
            label="Ghi chú nội bộ 3"
            tooltip={{
              title: "Thêm thông tin ghi chú chăm sóc khách hàng",
              icon: <InfoCircleOutlined />,
            }}
          >
            <Input.TextArea
              placeholder="Điền ghi chú"
              maxLength={500}
              style={{ minHeight: "130px" }}
            />
          </Form.Item>
          <Form.Item
            label="Tag"
            tooltip={{
              title: "Thêm từ khóa để tiện lọc đơn hàng",
              icon: <InfoCircleOutlined />,
            }}
            // name="tags"
          >
            <CustomerInputTags
              onChangeTag={onChangeTag}
              tags={tags}
              isCloneOrder={isCloneOrder}
            />
          </Form.Item>
        </div>
      </Card>
    </StyledComponent>
  );
};

export default OrderDetailSidebar;
