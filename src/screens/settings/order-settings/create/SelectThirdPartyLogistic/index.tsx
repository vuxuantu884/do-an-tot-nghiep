import { Card, Form, Table } from "antd";
import Column from "antd/lib/table/Column";
import { StyledComponent } from "./styles";

type PropType = {};

function SelectThirdPartyLogistic(props: PropType) {
  const EditableUsersTable = (props: any) => {
    const { third_party_logistics } = props;
    return (
      <Table dataSource={third_party_logistics} pagination={false}>
        <Column
          dataIndex="deliver_company"
          title={"Hãng vận chuyển"}
          render={(value, row, index) => {
            return (
              <Form.Item name={[index, "value_date_from"]}>
                Hãng vận chuyển
              </Form.Item>
            );
          }}
        />
        <Column
          dataIndex="fast_deliver"
          title={"Dịch vụ"}
          colSpan={2}
          render={(value, row, index) => {
            return (
              <Form.Item name={[index, "value_date_from"]}>
                Giao nhanh
              </Form.Item>
            );
          }}
        />
        <Column
          dataIndex="slow_deliver"
          colSpan={0}
          render={(value, row, index) => {
            return <Form.Item name={[index, "fee"]}>Giao chậm</Form.Item>;
          }}
        />
      </Table>
    );
  };

  return (
    <StyledComponent>
      <Card title="Chọn hãng vận chuyển sử dụng trên toàn quốc">
        <Form.List name="third_party_logistics">
          {(third_party_logistics) => {
            return (
              <EditableUsersTable
                third_party_logistics={third_party_logistics}
              />
            );
          }}
        </Form.List>
      </Card>
    </StyledComponent>
  );
}

export default SelectThirdPartyLogistic;
