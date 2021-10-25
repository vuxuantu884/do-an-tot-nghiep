import { InfoCircleOutlined, SearchOutlined } from "@ant-design/icons";
import { Card, Col, Form, Input, Row, Select } from "antd";
import { AccountResponse } from "model/account/account.model";
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
  isSplitOrder?: boolean;
  customerId?: number | undefined;
};

const OrderDetailSidebar: React.FC<PropType> = (props: PropType) => {
  const { accounts, onChangeTag, tags, isCloneOrder, isSplitOrder, customerId } = props;

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
          <Input placeholder="Điền tham chiếu" maxLength={255} disabled={isSplitOrder} />
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
      <Card title="Lịch sử mua hàng">
        <Row className="" gutter={5} style={{ flexDirection: "column" }}>
          <Col span={24} style={{ marginBottom: 6 }}>
            <b>Ghi chú nội bộ:</b>
          </Col>
          <Col span={24}>
            <span className="text-focus" style={{ wordWrap: "break-word" }}>
              "Không có ghi chú"
            </span>
          </Col>
        </Row>
      </Card>
      <SidebarOrderHistory customerId={customerId} />
    </StyledComponent>
  );
};

export default OrderDetailSidebar;
