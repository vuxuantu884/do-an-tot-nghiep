import { Button, Form, Row, FormInstance, Input, Select } from "antd";
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
import TreeStore from "component/tree-node/tree-store";
import { FilterWrapper } from "component/container/filter.container";

const { Item } = Form;

type OrderDuplicateFilterProps = {
  onMenuClick?: (id: number) => void;
  actions?: Array<MenuAction>;
  onShowColumnSetting?: () => void;
  listStore: StoreResponse[] | undefined;
  onFilter: (value: any) => void;
  initialValues?: DuplicateOrderSearchQuery;
};

const OrderDuplicateFilter: React.FC<OrderDuplicateFilterProps> = (
  props: OrderDuplicateFilterProps
) => {
  const { onShowColumnSetting, listStore, onFilter, initialValues } = props;

  const formSearchRef = createRef<FormInstance>();

  //useState

  // const initialValues=useMemo(() => {

  // },[])

  const onChangeDate = useCallback(
    () => {
      let value: any = {};
      value = formSearchRef?.current?.getFieldsValue(["issued_on_min", "issued_on_max"])
      if (value["issued_on_min"] && value["issued_on_max"] && (+moment(value["issued_on_min"], 'DD-MM-YYYY') > + moment(value["issued_on_max"], 'DD-MM-YYYY'))) {
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

    console.log("listStore",listStore)

  return (
    <React.Fragment>
      <Form onFinish={onFilter} ref={formSearchRef} layout="inline" initialValues={initialValues}>
        <FilterWrapper>
          <div style={{ display: "flex", paddingRight: "16px" }}>
            <Item name="issued_on_min" style={{ width: "150px", margin: 0 }}>
              <CustomDatePicker
                format="DD-MM-YYYY"
                placeholder="Từ ngày"
                style={{ width: "100%", borderRadius: 0 }}
                onChange={() => onChangeDate()}
              />
            </Item>
            <div style={{ width: "5%", padding: "10px 0px 10px 3px" }}>
              <SwapRightOutlined />
            </div>
            <Item name="issued_on_max" style={{ width: "150px", margin: 0 }}>
              <CustomDatePicker
                format="DD-MM-YYYY"
                placeholder="Đến ngày"
                style={{ width: "100%", borderRadius: 0 }}
                onChange={() => onChangeDate()}
              />
            </Item>
          </div>
          <Item name="store_id">
            {/* <TreeStore  style={{ width: "280px"}} listStore={listStore} placeholder="Cửa hàng" /> */}
            <Select
              showSearch
              showArrow
              optionFilterProp="children"
              placeholder="Chọn kho"
              style={{ width: "280px"}} 
            >
              {listStore?.map((item) => (
                <Select.Option
                  key={item.id}
                  value={item.id}
                >
                  {item.name}
                </Select.Option>
              ))}
            </Select>
          </Item>

          <Item name="search_term" className="search">
            <Input placeholder="Tên, Số điện thoại khách hàng" prefix={<SearchOutlined />} />
          </Item>

          <Item >
            <Button type="primary" htmlType="submit" style={{ width: "50px" }}>
              Lọc
            </Button>
          </Item>
          <Button icon={<SettingOutlined />} onClick={onShowColumnSetting} style={{ width: "65px" }}></Button>
        </FilterWrapper>
      </Form>
    </React.Fragment>
  );
};
export default OrderDuplicateFilter;
