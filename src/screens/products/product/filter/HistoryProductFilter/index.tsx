import CustomFilter from "component/table/custom.filter";
import { Button, Form, Input } from "antd";
import { MenuAction } from "component/table/ActionButton";
import { useCallback } from "react";
import search from "assets/img/search.svg";
import { StyledComponent } from "./styles";
import ButtonSetting from "component/table/ButtonSetting";
import { FilterOutlined } from "@ant-design/icons";
import { ProductHistoryQuery } from "model/product/product.model";

interface HistoryProductFilterProps {
  actions: Array<MenuAction>;
  onMenuClick?: (index: number) => void;
  onShowColumnSetting?: () => void;
  openFilter?: () => void;
  onFinish: (value: ProductHistoryQuery) => void
}

const { Item } = Form;

const HistoryProductFilter: React.FC<HistoryProductFilterProps> = (
  props: HistoryProductFilterProps
) => {
  const { actions, onMenuClick, onShowColumnSetting, openFilter, onFinish } = props;
  const onActionClick = useCallback(
    (index: number) => {
      onMenuClick && onMenuClick(index);
    },
    [onMenuClick]
  );

  const onSubmit = useCallback((value: ProductHistoryQuery) => {
    onFinish(value);
  }, [onFinish])

  return (
    <StyledComponent>
      <div className="history-filter">
        <CustomFilter onMenuClick={onActionClick} menu={actions}>
          <Form onFinish={onSubmit} layout="inline">
            <Item name="condition" className="search">
              <Input
                prefix={<img src={search} alt="" />}
                style={{ width: "100%" }}
                placeholder="Tìm kiếm sản phẩm theo Tên, Mã vạch, SKU"
              />
            </Item>
            <Item>
              <Button type="primary" htmlType="submit">
                Lọc
              </Button>
            </Item>
            <Item>
              <Button icon={<FilterOutlined />} onClick={openFilter}>
                Thêm bộ lọc
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
