import CustomFilter from "component/table/custom.filter";
import { Button, Form, Input } from "antd";
import { MenuAction } from "component/table/ActionButton";
import React, { useCallback } from "react";
import search from "assets/img/search.svg";
import { StyledComponent } from "./styles";
import ButtonSetting from "component/table/ButtonSetting";
import { ProductHistoryQuery } from "model/product/product.model";
import CustomDatePicker from "component/custom/date-picker.custom";

type HistoryProductFilterProps = {
  actions: Array<MenuAction>;
  onMenuClick?: (index: number) => void;
  onShowColumnSetting?: () => void;
  onFinish: (value: ProductHistoryQuery) => void;
};

const { Item } = Form;

const HistoryProductFilter: React.FC<HistoryProductFilterProps> = (
  props: HistoryProductFilterProps,
) => {
  const { actions, onMenuClick, onShowColumnSetting, onFinish } = props;

  const clickMenuItem = useCallback(
    (index: number) => {
      onMenuClick && onMenuClick(index);
    },
    [onMenuClick],
  );

  const searchProductHistory = useCallback(
    (value: ProductHistoryQuery) => {
      onFinish(value);
    },
    [onFinish],
  );

  return (
    <StyledComponent>
      <div className="history-filter">
        <CustomFilter onMenuClick={clickMenuItem} menu={actions}>
          <Form onFinish={searchProductHistory} layout="inline">
            <Item name="condition" className="search">
              <Input
                prefix={<img src={search} alt="" />}
                style={{ width: "100%" }}
                placeholder="Tìm kiếm Tên/Mã sản phẩm"
                maxLength={255}
              />
            </Item>
            <Item name="from_action_date" className="date">
              <CustomDatePicker placeholder="Thời gian từ" style={{ width: "100%" }} />
            </Item>
            <Item name="to_action_date" className="date">
              <CustomDatePicker placeholder="Thời gian dến" style={{ width: "100%" }} />
            </Item>
            <Item>
              <Button type="primary" htmlType="submit">
                Lọc
              </Button>
            </Item>
            <Item>
              <ButtonSetting onClick={onShowColumnSetting} />
            </Item>
          </Form>
        </CustomFilter>
      </div>
    </StyledComponent>
  );
};

export default HistoryProductFilter;
