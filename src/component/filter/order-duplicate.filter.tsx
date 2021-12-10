import { Button, Form, FormInstance, Input, Select } from "antd";
import { MenuAction } from "component/table/ActionButton";
import CustomFilter from "component/table/custom.filter";
import React, { createRef, useCallback } from "react";
import {
  SearchOutlined,
  SettingOutlined,
  SwapRightOutlined,
} from "@ant-design/icons";
import "./order.filter.scss";
import CustomDatePicker from "component/custom/new-date-picker.custom";
import moment from "moment";
import { StoreResponse } from "model/core/store.model";

const { Item } = Form;
const { Option } = Select;

type OrderDuplicateFilterProps = {
  onMenuClick?: (id: number) => void;
  actions?: Array<MenuAction>;
  onShowColumnSetting?: () => void;
  listStore: StoreResponse[] | undefined;
};

const OrderDuplicateFilter: React.FC<OrderDuplicateFilterProps> = (
  props: OrderDuplicateFilterProps
) => {
  const { onMenuClick, actions, onShowColumnSetting, listStore } = props;

  const formSearchRef = createRef<FormInstance>();

  //useState

  const onFinish = useCallback((value: any) => { }, []);

  const onChangeDate = useCallback(
    () => {
      let value: any = {};
      value = formSearchRef?.current?.getFieldsValue(["form_date", "to_date"])
      if (value["form_date"] && value["to_date"] && (+moment(value["form_date"], 'DD-MM-YYYY') > + moment(value["to_date"], 'DD-MM-YYYY'))) {
        console.log('invalid')
        formSearchRef?.current?.setFields([
          {
            name: "form_date",
            errors: ['Khoảng thời gian chưa chính xác'],
          },
          {
            name: "to_date",
            errors: [''],
          },
        ])
      } else {
        formSearchRef?.current?.setFields([
          {
            name: "form_date",
            errors: undefined,
          },
          {
            name: "to_date",
            errors: undefined,
          },
        ])
      }
    }, [formSearchRef]);

  return (
    <React.Fragment>
      <div className="order-filter">
        <CustomFilter onMenuClick={onMenuClick} menu={actions}>
          <Form onFinish={onFinish} ref={formSearchRef} layout="inline">
            <div style={{ width: "35%", display: "flex" }}>
              <Item name="form_date" style={{ width: "45%", margin: 0 }}>
                <CustomDatePicker
                  format="DD-MM-YYYY"
                  placeholder="Từ ngày"
                  style={{ width: "100%" }}
                  onChange={() => onChangeDate()}
                />
              </Item>
              <div style={{ margin: "0 2px", paddingTop: "10px" }}>
                <SwapRightOutlined />
              </div>
              <Item name="to_date" style={{ width: "45%", margin: 0 }}>
                <CustomDatePicker
                  format="DD-MM-YYYY"
                  placeholder="Đến ngày"
                  style={{ width: "100%" }}
                  onChange={() => onChangeDate()}
                />
              </Item>
            </div>
            <Item name="store_id" style={{ width: "20%" }}>
              <Select
                showSearch
                optionFilterProp="children"
                placeholder={
                  <div style={{ color: "#878790" }}>
                    <SearchOutlined />
                    <span>Cửa hàng</span>
                  </div>
                }
              >
                {listStore?.map((item, index) => (
                  <Option key={index.toString()} value={item.code}>{item.name}</Option>
                ))}

                <Option value="2">Closed</Option>
              </Select>
            </Item>

            <Item name="" style={{ width: "200px" }}>
              <Input placeholder="Tên, Số điện thoại khách hàng" prefix={<SearchOutlined />} />
            </Item>

            <Item>
              <Button type="primary" htmlType="submit">
                Lọc
              </Button>
            </Item>
            <Button icon={<SettingOutlined />} onClick={onShowColumnSetting}></Button>
          </Form>
        </CustomFilter>
      </div>
    </React.Fragment>
  );
};
export default OrderDuplicateFilter;
