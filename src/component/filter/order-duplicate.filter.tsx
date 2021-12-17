import { Button, Form,Row, FormInstance, Input, Select } from "antd";
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
import { DuplicateOrderSearchQuery } from "model/order/order.model";

const { Item } = Form;
const { Option } = Select;

type OrderDuplicateFilterProps = {
  onMenuClick?: (id: number) => void;
  actions?: Array<MenuAction>;
  onShowColumnSetting?: () => void;
  listStore: StoreResponse[] | undefined;
  onFilter:(value:any)=>void;
  initialValues?:DuplicateOrderSearchQuery;
};

const OrderDuplicateFilter: React.FC<OrderDuplicateFilterProps> = (
  props: OrderDuplicateFilterProps
) => {
  const { onMenuClick, onShowColumnSetting, listStore,onFilter,initialValues } = props;

  const formSearchRef = createRef<FormInstance>();

  //useState

  // const initialValues=useMemo(() => {

  // },[])

  const onChangeDate = useCallback(
    () => {
      let value: any = {};
      value = formSearchRef?.current?.getFieldsValue(["issued_on_min", "issued_on_max"])
      if (value["issued_on_min"] && value["issued_on_max"] && (+moment(value["issued_on_min"], 'DD-MM-YYYY') > + moment(value["issued_on_max"], 'DD-MM-YYYY'))) {
        console.log('invalid')
        formSearchRef?.current?.setFields([
          {
            name: "issued_on_min",
            errors: ['Khoảng thời gian chưa chính xác'],
          },
          {
            name: "issued_on_max",
            errors: [''],
          },
        ])
      } else {
        formSearchRef?.current?.setFields([
          {
            name: "issued_on_min",
            errors: undefined,
          },
          {
            name: "issued_on_max",
            errors: undefined,
          },
        ])
      }
    }, [formSearchRef]);

  return (
    <React.Fragment>
      <div className="order-filter dupticate-filter">
        <CustomFilter onMenuClick={onMenuClick}>
          <Form onFinish={onFilter} ref={formSearchRef} layout="inline" initialValues={initialValues}>
            <Row style={{ display: "flex", marginRight:"42px", width:"35%" }}>
              <Item name="issued_on_min" style={{ width: "47%", margin: 0 }}>
                <CustomDatePicker
                  format="DD-MM-YYYY"
                  placeholder="Từ ngày"
                  style={{ width: "100%", borderRadius:0 }}
                  onChange={() => onChangeDate()}
                />
              </Item>
              <div style={{width: "5%", padding:"10px 0px 10px 3px" }}>
                <SwapRightOutlined />
              </div>
              <Item name="issued_on_max" style={{ width: "48%", margin: 0 }}>
                <CustomDatePicker
                  format="DD-MM-YYYY"
                  placeholder="Đến ngày"
                  style={{ width: "100%", borderRadius:0 }}
                  onChange={() => onChangeDate()}
                />
              </Item>
            </Row>
            <Item name="store_id" style={{ width: "20%", marginRight:"42px" }}>
              <Select
                showSearch
                allowClear
                optionFilterProp="children"
                placeholder={
                  <div style={{ color: "#878790" }}>
                    <SearchOutlined />
                    <span>Cửa hàng</span>
                  </div>
                }
              >
                {listStore?.map((item, index) => (
                  <Option key={index.toString()} value={item.id}>{item.name}</Option>
                ))}

                <Option value="2">Closed</Option>
              </Select>
            </Item>

            <Item name="search_term" style={{ width: "200px" ,marginRight:"42px"}}>
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
