import { InfoCircleOutlined, SearchOutlined } from "@ant-design/icons";
import { Card, Form, Input, Select } from "antd";
import { AccountResponse } from "model/account/account.model";
import { OrderResponse } from "model/response/order/order.response";
import React from "react";
import CustomerInputTags from "../../custom-input-tags";
import SidebarOrderHistory from "./SidebarOrderHistory";
import { StyledComponent } from "./styles";

type PropType = {
  accounts: AccountResponse[];
  onChangeTag: (value: []) => void;
  tags: string;
  isCloneOrder?: boolean;
  levelOrder?: number;
  updateOrder?: boolean;
  customerId?: number | undefined;
  orderDetail?: OrderResponse | null;
};

const OrderDetailSidebar: React.FC<PropType> = (props: PropType) => {
  const { accounts, onChangeTag, tags, isCloneOrder, customerId, orderDetail } = props;

  return (
    <StyledComponent>
      <Card title="THÔNG TIN ĐƠN HÀNG">
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
            allowClear
            placeholder={
              <React.Fragment>
                <SearchOutlined />
                <span> Tìm, chọn nhân viên</span>
              </React.Fragment>
            }
            filterOption={(input, option) => {
              if (option) {
                return option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0;
              }
              return false;
            }}
          >
            {accounts.map((item, index) => (
              <Select.Option key={index.toString()} value={item.code}>
                {`${item.code} - ${item.full_name}`}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item
          label="Nhân viên marketing"
          name="marketer_code"
          rules={[
            {
              required: true,
              message: "Vui lòng chọn nhân viên marketing",
            },
          ]}
        >
          <Select
            className="select-with-search"
            notFoundContent="Không tìm thấy kết quả"
            showSearch
            allowClear
            placeholder={
              <React.Fragment>
                <SearchOutlined />
                <span> Tìm, chọn nhân viên</span>
              </React.Fragment>
            }
            filterOption={(input, option) => {
              if (option) {
                return option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0;
              }
              return false;
            }}
          >
            {accounts.map((item, index) => (
              <Select.Option key={index.toString()} value={item.code}>
                {`${item.code} - ${item.full_name}`}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item
          label="Nhân viên điều phối"
          name="coordinator_code"
          rules={[
            {
              required: true,
              message: "Vui lòng chọn nhân viên điều phối",
            },
          ]}
        >
          <Select
            className="select-with-search"
            notFoundContent="Không tìm thấy kết quả"
            showSearch
            allowClear
            placeholder={
              <React.Fragment>
                <SearchOutlined />
                <span> Tìm, chọn nhân viên</span>
              </React.Fragment>
            }
            filterOption={(input, option) => {
              if (option) {
                return option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0;
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
            title: "Thêm số tham chiếu hoặc ID đơn hàng gốc trên kênh bán hàng",
            icon: <InfoCircleOutlined />,
          }}
        >
          {/* khi có link gốc khi tách, disable field này */}
          <Input
            placeholder="Điền tham chiếu"
            maxLength={255}
            disabled={orderDetail?.linked_order_code ? true : false}
          />
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
      </Card>
      <Card title="THÔNG TIN BỔ SUNG">
        <Form.Item name="customer_note" label="Ghi chú của khách">
          <Input.TextArea
            placeholder="Điền ghi chú"
            maxLength={500}
            style={{ minHeight: "130px" }}
          />
        </Form.Item>
        <Form.Item
          name="note"
          label="Ghi chú nội bộ"
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
      </Card>
      <SidebarOrderHistory customerId={customerId} />
    </StyledComponent>
  );
};

export default OrderDetailSidebar;
