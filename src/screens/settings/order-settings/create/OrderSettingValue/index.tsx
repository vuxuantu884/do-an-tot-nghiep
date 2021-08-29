import {
  Card,
  Switch,
  Form,
  Input,
  DatePicker,
  Row,
  Col,
  Button,
  Table,
} from "antd";
import CustomDatepicker from "component/custom/date-picker.custom";
import CustomTable from "component/table/CustomTable";
import moment from "moment";
import React, { useState } from "react";
import { StyledComponent } from "./styles";

type PropType = {};
type EditableTableProps = Parameters<typeof Table>[0];
type ColumnTypes = Exclude<EditableTableProps["columns"], undefined>;

function OrderSettingValue(props: PropType) {
  const [tableLoading, setTableLoading] = useState(false);
  const { RangePicker } = DatePicker;
  const renderCardExtra = () => {
    return (
      <div>
        Cho phép bán khi tồn kho <Switch defaultChecked onChange={onChange} />
      </div>
    );
  };
  const onChange = (checked: any) => {
    console.log("checked", checked);
  };

  function range(start: any, end: any) {
    const result = [];
    for (let i = start; i < end; i++) {
      result.push(i);
    }
    return result;
  }

  function disabledDate(current: any) {
    // Can not select days before today and today
    return current && current < moment().endOf("day");
  }

  function disabledDateTime() {
    return {
      disabledHours: () => range(0, 24).splice(4, 20),
      disabledMinutes: () => range(30, 60),
      disabledSeconds: () => [55, 56],
    };
  }

  const renderDate = () => {
    return (
      <Form.Item name="from_date" label="Ngày bắt đầu:">
        <DatePicker
          placeholder="dd/mm/yyyy  hh:mm"
          format="YYYY-MM-DD HH:mm"
          disabledDate={disabledDate}
          disabledTime={disabledDateTime}
          showTime={{ defaultValue: moment("00:00:00", "HH:mm") }}
        />
      </Form.Item>
    );
  };

  const FAKE_LOGISTIC_SETTINGS = [
    {
      key: "1",
      name: "1",
      style: "Kiểu 1",
      fromDate: "",
      toDate: "",
      isActive: true,
    },
    {
      key: "2",
      name: "2",
      style: "Kiểu 2",
      fromDate: "",
      toDate: "",
      isActive: false,
    },
    {
      key: "3",
      name: "3",
      style: "Kiểu 3",
      fromDate: "",
      toDate: "",
      isActive: true,
    },
  ];

  const columns = [
    {
      title: "Giá trị từ",
      dataIndex: "fromDate",
      key: "fromDate",
      render: (value: any, row: any, index: number) => {
        return renderDate();
      },
    },
    {
      title: "Giá trị đến",
      dataIndex: "toDate",
      key: "toDate",
      render: (value: any, row: any, index: number) => {
        return renderDate();
      },
    },
  ];

  const components = {
    body: {
      // row: EditableRow,
      // cell: EditableCell,
    },
  };

  const [dataSource, setDataSource] = useState<any>(FAKE_LOGISTIC_SETTINGS);
  const [count, setCount] = useState(2);

  const handleAdd = () => {
    const newData: any = {
      key: "4",
      name: "4",
      style: "Kiểu 4",
      fromDate: "",
      toDate: "",
      isActive: true,
    };
    setDataSource({
      dataSource: [...dataSource, newData],
      count: count + 1,
    });
  };

  return (
    <StyledComponent>
      <Card title="Cài đặt theo giá trị đơn hàng">
        <Table
          components={components}
          rowClassName={() => "editable-row"}
          bordered
          dataSource={dataSource}
          columns={columns as ColumnTypes}
        />
        <Button
          onClick={() => {
            handleAdd();
          }}
        >
          Thêm cài đặt
        </Button>
      </Card>
    </StyledComponent>
  );
}

export default OrderSettingValue;
