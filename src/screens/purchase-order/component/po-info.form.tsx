import { InfoCircleOutlined } from "@ant-design/icons";
import { Card, Form, Input, Select } from "antd";
import { AccountResponse } from "model/account/account.model";

type POInfoFormProps = {
  winAccount: Array<AccountResponse>,
  rdAccount: Array<AccountResponse>,
}

const POInfoForm: React.FC<POInfoFormProps> = (props: POInfoFormProps) => {
  const [form] = Form.useForm();
  
  return (
    <Form layout="vertical" form={form} name="po-info">
      <Card
        className="po-form"
        title={
          <div className="d-flex">
            <span className="title-card">THÔNG TIN ĐƠN MUA HÀNG</span>
          </div>
        }
      >
        <div className="padding-20">
          <Form.Item
            rules={[
              {
                required: true,
                message: "Vui lòng chọn Merchandiser",
              },
            ]}
            name="merchandiser_code"
            label="Merchandiser"
          >
            <Select
              showArrow
              showSearch
              placeholder="Chọn Merchandiser"
            >
              <Select.Option value="">Chọn Merchandiser</Select.Option>
              {props.winAccount.map((item) => (
                <Select.Option key={item.code} value={item.code}>
                  {item.full_name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="qc_code" label="QC">
            <Select
              showArrow
              showSearch
              placeholder="Chọn QC"
            >
              <Select.Option value="">Chọn QC</Select.Option>
              {props.rdAccount.map((item) => (
                <Select.Option key={item.code} value={item.code}>
                  {item.full_name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="reference" label="Mã tham chiếu">
            <Input placeholder="Nhập số tham chiếu" />
          </Form.Item>
        </div>
      </Card>
      <Card
        className="po-form margin-top-20"
        title={
          <div className="d-flex">
            <span className="title-card">THÔNG TIN BỔ SUNG</span>
          </div>
        }
      >
        <div className="padding-20">
          <Form.Item label="Ghi chú nội bộ" name="note">
            <Input.TextArea placeholder="Nhập ghi chú" />
          </Form.Item>
          <Form.Item
            tooltip={{
              title: "Thẻ ngày giúp tìm kiếm đơn hàng",
              icon: <InfoCircleOutlined />,
            }}
            name="tags"
            label="Từ khóa"
          >
            <Select
              className="ant-select-hashtag"
              dropdownClassName="ant-select-dropdown-hashtag"
              mode="tags"
              placeholder="Nhập từ khóa"
            />
          </Form.Item>
        </div>
      </Card>
    </Form>
  );
};

export default POInfoForm;
