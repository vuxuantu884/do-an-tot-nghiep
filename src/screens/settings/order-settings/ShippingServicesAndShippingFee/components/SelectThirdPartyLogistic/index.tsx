import { Card, Form, FormInstance, Input, Table } from "antd";
import Checkbox from "antd/lib/checkbox/Checkbox";
import Column from "antd/lib/table/Column";
import { CreateShippingServiceConfigReQuestFormModel } from "model/request/settings/order-settings.resquest";
import { DeliveryServiceResponse } from "model/response/order/order.response";
import { StyledComponent } from "./styles";

type PropType = {
  initialFormValue: CreateShippingServiceConfigReQuestFormModel;
  list3rdPartyLogistic: DeliveryServiceResponse[];
  form: FormInstance<any>;
};

function SelectThirdPartyLogistic(props: PropType) {
  const { initialFormValue, list3rdPartyLogistic, form } = props;
  const list3rdPartyLogisticFormat = list3rdPartyLogistic.map((single) => {
    return {
      ...single,
      key: single.id,
    };
  });
  let list_external_service_transport_type_ids: any[] =
    initialFormValue.external_service_transport_type_ids;

  const onChange = (e: any, fieldValueId: any) => {
    if (e.target.checked) {
      if (list_external_service_transport_type_ids.includes(fieldValueId)) {
        return;
      }
      list_external_service_transport_type_ids.push(fieldValueId);
    } else {
      let index = list_external_service_transport_type_ids.findIndex((item) => {
        return item === fieldValueId;
      });
      if (index > -1) {
        list_external_service_transport_type_ids.splice(index, 1);
      }
    }
    form.setFieldsValue({
      external_service_transport_type_ids:
        list_external_service_transport_type_ids,
    });
  };

  return (
    <StyledComponent>
      <Card title="Chọn hãng vận chuyển sử dụng trên toàn quốc">
        <Form.Item name="external_service_transport_type_ids" hidden>
          <Input />
        </Form.Item>
        <Table dataSource={list3rdPartyLogisticFormat} pagination={false}>
          <Column
            title={"Hãng vận chuyển"}
            render={(value, row: any, index) => {
              return (
                <div className="logoHVC">
                  <img src={value.logo} alt="" />
                </div>
              );
            }}
          />
          <Column
            title={"Dịch vụ"}
            className="columnService"
            render={(value, row: any, index) => {
              return (
                <div className="listServices clearfix">
                  {row.transport_types.map((singleType: any, index: number) => {
                    return (
                      <Checkbox
                        onChange={(e) => {
                          onChange(e, singleType.id);
                        }}
                        // random key to re-render
                        key={Math.random()}
                        defaultChecked={list_external_service_transport_type_ids.includes(
                          singleType.id
                        )}
                      >
                        {singleType.name}
                      </Checkbox>
                    );
                  })}
                </div>
              );
            }}
          />
        </Table>
      </Card>
    </StyledComponent>
  );
}

export default SelectThirdPartyLogistic;
