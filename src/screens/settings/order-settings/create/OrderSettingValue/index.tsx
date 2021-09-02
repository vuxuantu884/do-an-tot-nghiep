import { PlusOutlined } from "@ant-design/icons";
import { Button, Card, DatePicker, Form, Input, Select, Table } from "antd";
import Column from "antd/lib/table/Column";
import moment from "moment";
import React, { useEffect, useState } from "react";
import { StyledComponent } from "./styles";

type PropType = {};
type ListProvincesType = {
  name: string;
  code: string;
}[];

function OrderSettingValue(props: PropType) {
  const [listProvinces, setListProvinces] = useState<ListProvincesType>([]);

  const range = (start: any, end: any) => {
    const result = [];
    for (let i = start; i < end; i++) {
      result.push(i);
    }
    return result;
  };

  const disabledDate = (current: any) => {
    // Can not select days before today and today
    return current && current < moment().endOf("day");
  };

  const disabledDateTime = () => {
    return {
      disabledHours: () => range(0, 24).splice(4, 20),
      disabledMinutes: () => range(30, 60),
      disabledSeconds: () => [55, 56],
    };
  };

  const renderDate = () => {
    return (
      <DatePicker
        placeholder="dd/mm/yyyy  hh:mm"
        format="YYYY-MM-DD HH:mm"
        disabledDate={disabledDate}
        disabledTime={disabledDateTime}
        showTime={{ defaultValue: moment("00:00:00", "HH:mm") }}
      />
    );
  };

  useEffect(() => {
    const FAKE_LIST_PROVINCES = [
      {
        name: "Hà Nội",
        code: "hn",
      },
      {
        name: "TP HCM",
        code: "tphcm",
      },
      {
        name: "Hải Dương",
        code: "hd",
      },
    ];
    let response = FAKE_LIST_PROVINCES;
    setListProvinces(response);
  }, []);

  const EditableUsersTable = (props: any) => {
    const { users, add, remove } = props;
    return (
      <Table
        dataSource={users}
        pagination={false}
        footer={() => {
          return (
            <Form.Item>
              <Button onClick={add}>
                <PlusOutlined /> Add field
              </Button>
            </Form.Item>
          );
        }}
      >
        <Column
          dataIndex={"value_date_from"}
          title={"Giá trị từ"}
          render={(value, row, index) => {
            return (
              <Form.Item name={[index, "value_date_from"]}>
                {renderDate()}
              </Form.Item>
            );
          }}
        />
        <Column
          dataIndex={"value_date_to"}
          title={"Giá trị đến"}
          render={(value, row, index) => {
            return (
              <Form.Item name={[index, "value_date_to"]}>
                {renderDate()}
              </Form.Item>
            );
          }}
        />
        <Column
          dataIndex={"tinhTp"}
          title={"Tỉnh/Thành phố"}
          render={(value, row, index) => {
            return (
              <Form.Item name={[index, "tinhTp"]}>
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
                        <Select.Option value={single.code} key={single.code}>
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
          dataIndex={"fee"}
          title={"Phí vận chuyển"}
          render={(value, row, index) => {
            return (
              <Form.Item name={[index, "fee"]}>
                <Input />
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
          <Form.List name="users">
            {(users, { add, remove }) => {
              return (
                <EditableUsersTable users={users} add={add} remove={remove} />
              );
            }}
          </Form.List>
        </div>
        {/* <Form.List name="value">
          {(fields) => (
          )}
        </Form.List> */}
      </Card>
    </StyledComponent>
  );
}

export default OrderSettingValue;
