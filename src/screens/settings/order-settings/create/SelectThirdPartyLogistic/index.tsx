import { Card, Form, Input, Table } from "antd";
import Checkbox from "antd/lib/checkbox/Checkbox";
import Column from "antd/lib/table/Column";
import { useEffect } from "react";
import { StyledComponent } from "./styles";

type PropType = {
  initialFormValue: any;
};

function SelectThirdPartyLogistic(props: PropType) {
  const { initialFormValue } = props;
  console.log("props", props);
  const ThirdPartyLogisticsTable = (props: any) => {
    const { third_party_logistics } = props;
    console.log("third_party_logistics", third_party_logistics);
    return (
      <Table dataSource={third_party_logistics} pagination={false}>
        <Column
          title={"Hãng vận chuyển"}
          render={(value, row: any, index) => {
            return (
              <>
                <Form.Item valuePropName="checked" name={[index, "checked"]}>
                  <Checkbox>
                    {value.name}
                    <img src={value.logo} alt="" style={{ width: 100 }} />
                  </Checkbox>
                </Form.Item>
              </>
            );
          }}
        />
        <Column
          dataIndex="fast_deliver"
          title={"Dịch vụ"}
          colSpan={2}
          render={(value, row, index) => {
            return (
              <Form.Item valuePropName="checked" name={[index, "fast_deliver"]}>
                <Checkbox>Giao nhanh</Checkbox>
              </Form.Item>
            );
          }}
        />
        <Column
          dataIndex="slow_deliver"
          colSpan={0}
          render={(value, row, index) => {
            return (
              <Form.Item valuePropName="checked" name={[index, "slow_deliver"]}>
                <Checkbox>Giao chậm</Checkbox>
              </Form.Item>
            );
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
              <ThirdPartyLogisticsTable
                initialFormValue={initialFormValue}
                third_party_logistics={initialFormValue.third_party_logistics}
              />
            );
          }}
        </Form.List>
      </Card>
    </StyledComponent>
  );
}

export default SelectThirdPartyLogistic;
