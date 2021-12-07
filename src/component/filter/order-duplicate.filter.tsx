import {Button, Col, Form, FormInstance, Input, Row, Select} from "antd";
import {MenuAction} from "component/table/ActionButton";
import CustomFilter from "component/table/custom.filter";
import React, {createRef, useCallback, useState} from "react";
import search from "assets/img/search.svg";
import {
  FilterOutlined,
  SearchOutlined,
  SettingOutlined,
  SwapRightOutlined,
} from "@ant-design/icons";
import "./order.filter.scss";
import BaseFilter from "./base.filter";
import CustomRangeDatePicker from "component/custom/new-date-range-picker";
import CustomDatePicker from "component/custom/new-date-picker.custom";

const {Item} = Form;
const {Option} = Select;

type OrderDuplicateFilterProps = {
  onMenuClick?: (id: number) => void;
  actions?: Array<MenuAction>;
};

const OrderDuplicateFilter: React.FC<OrderDuplicateFilterProps> = (
  props: OrderDuplicateFilterProps
) => {
  const {onMenuClick, actions} = props;

  const formRef = createRef<FormInstance>();
  const formSearchRef = createRef<FormInstance>();

  //useState
  const [visible, setVisible] = useState(false);

  const onFinish = useCallback((value: any) => {}, []);

  const clearFilter = () => {
    console.log("ok");
  };

  const onFilterClick = useCallback(() => {
    console.log("ok");
  }, []);

  const onCancelFilter = useCallback(() => {
    setVisible(false);
    // setRerender(false);
  }, []);

  const openFilter = useCallback(() => {
    setVisible(true);
  }, []);

  const onChangeDate = () => {};

  const widthScreen = () => {
    if (window.innerWidth >= 1600) {
      return 400;
    } else if (window.innerWidth < 1600 && window.innerWidth >= 1200) {
      return 350;
    } else {
      return 400;
    }
  };
  return (
    <React.Fragment>
      <div className="order-filter">
        <CustomFilter onMenuClick={onMenuClick} menu={actions}>
          <Form onFinish={onFinish} ref={formSearchRef} layout="inline">
            <div style={{width: "35%", display: "flex"}}>
              <Item name="" style={{width: "45%", marginBottom: 0}}>
                <CustomDatePicker
                  format="DD-MM-YYYY"
                  placeholder="Từ ngày"
                  style={{width: "100%"}}
                  onChange={() => onChangeDate()}
                />
              </Item>
              <div style={{margin: "0 10px", paddingTop: "10px"}}>
                <SwapRightOutlined />
              </div>
              <Item name="" style={{width: "45%", marginBottom: 0}}>
                <CustomDatePicker
                  format="DD-MM-YYYY"
                  placeholder="Đến ngày"
                  style={{width: "100%"}}
                  onChange={() => onChangeDate()}
                />
              </Item>
            </div>
            <Item name="" style={{width: "20%"}}>
              <Select
                showSearch
                optionFilterProp="children"
                placeholder={
                  <div style={{color: "#878790"}}>
                    <SearchOutlined />
                    <span>Cửa hàng</span>
                  </div>
                }
              >
                <Option value="1">Not Identified</Option>
                <Option value="2">Closed</Option>
              </Select>
            </Item>

            <Item name="" style={{width: "200px"}}>
              <Input placeholder="Enter your username" prefix={<SearchOutlined />} />
            </Item>

            <Item>
              <Button type="primary" htmlType="submit">
                Lọc
              </Button>
            </Item>
            <Button icon={<SettingOutlined />}></Button>
          </Form>
        </CustomFilter>
      </div>
    </React.Fragment>
  );
};
export default OrderDuplicateFilter;
