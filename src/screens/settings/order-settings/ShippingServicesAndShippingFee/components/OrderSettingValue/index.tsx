import { PlusOutlined } from "@ant-design/icons";
import { Card, Form, InputNumber, Select, Table } from "antd";
import Column from "antd/lib/table/Column";
import { ProvinceModel } from "model/content/district.model";
import { formatCurrency } from "utils/AppUtils";
import { StyledComponent } from "./styles";

type PropType = {
  listProvinces: ProvinceModel[];
};

function OrderSettingValue(props: PropType) {
  const { listProvinces } = props;

  const formatterCurrency = (value: number | undefined) => {
    let result = "";
    if (value) {
      result = formatCurrency(value);
    }
    return result;
  };

  const OrderSettingTable = (props: any) => {
    const { shipping_fee_configs, add } = props;
    return (
      <Table
        dataSource={shipping_fee_configs}
        pagination={false}
        footer={() => {
          return (
            <Form.Item>
              <div className="buttonAdd" onClick={add}>
                <PlusOutlined style={{ marginRight: 5 }} /> Thêm cài đặt
              </div>
            </Form.Item>
          );
        }}
      >
        <Column
          dataIndex="from_price"
          title="Giá trị từ"
          render={(value, row, index) => {
            return (
              <Form.Item
                name={[index, "from_price"]}
                rules={[{ required: true, message: "Vui lòng nhập giá trị" }]}
              >
                <InputNumber formatter={formatterCurrency} min={0} />
              </Form.Item>
            );
          }}
        />
        <Column
          dataIndex={"to_price"}
          title={"Giá trị đến"}
          render={(value, row, index) => {
            return (
              <Form.Item
                name={[index, "to_price"]}
                rules={[{ required: true, message: "Vui lòng nhập giá trị" }]}
              >
                <InputNumber formatter={formatterCurrency} min={0} />
              </Form.Item>
            );
          }}
        />
        <Column
          dataIndex="city_name"
          title="Tỉnh/Thành phố"
          width="30%"
          render={(value, row, index) => {
            return (
              <Form.Item
                name={[index, "city_name"]}
                rules={[{ required: true, message: "Vui lòng chọn thành phố" }]}
              >
                <Select
                  showSearch
                  style={{ width: "100%" }}
                  placeholder="Chọn tỉnh/thành phố"
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    option?.children
                      .toLowerCase()
                      .indexOf(input.toLowerCase()) >= 0
                  }
                  notFoundContent="Không tìm thấy tỉnh/thành phố"
                >
                  {listProvinces &&
                    listProvinces.map((single) => {
                      return (
                        <Select.Option value={single.name} key={single.id}>
                          {single.name}
                        </Select.Option>
                      );
                    })}
                </Select>
              </Form.Item>
            );
          }}
        />
        <Column
          dataIndex={"transport_fee"}
          title={"Phí vận chuyển"}
          width="20%"
          render={(value, row, index) => {
            return (
              <Form.Item
                name={[index, "transport_fee"]}
                rules={[
                  { required: true, message: "Vui lòng nhập phí vận chuyển" },
                ]}
              >
                <InputNumber formatter={formatterCurrency} />
              </Form.Item>
            );
          }}
        />
      </Table>
    );
  };

  return (
    <StyledComponent>
      <Card title="Cài đặt theo giá trị đơn hàng">
        <div>
          <Form.List name="shipping_fee_configs">
            {(shipping_fee_configs, { add, remove }) => {
              return (
                <OrderSettingTable
                  shipping_fee_configs={shipping_fee_configs}
                  add={add}
                  remove={remove}
                />
              );
            }}
          </Form.List>
        </div>
      </Card>
    </StyledComponent>
  );
}

export default OrderSettingValue;
