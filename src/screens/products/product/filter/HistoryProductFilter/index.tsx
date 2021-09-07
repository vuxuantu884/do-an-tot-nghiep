import CustomFilter from "component/table/custom.filter";
import { Button, Form, Input } from "antd";
import { MenuAction } from "component/table/ActionButton";
import { useCallback } from "react";
import search from "assets/img/search.svg";
import { StyledComponent } from "./styles";
import ButtonSetting from "component/table/ButtonSetting";

interface HistoryProductFIlterProps {
  actions: Array<MenuAction>;
  onMenuClick?: (index: number) => void;
}

const { Item } = Form;

const HistoryProductFIlter: React.FC<HistoryProductFIlterProps> = (
  props: HistoryProductFIlterProps
) => {
  const { actions, onMenuClick } = props;
  const onActionClick = useCallback(
    (index: number) => {
      onMenuClick && onMenuClick(index);
    },
    [onMenuClick]
  );

  return (
    <StyledComponent>
      <div className="history-filter">
        <CustomFilter onMenuClick={onActionClick} menu={actions}>
          <Form layout="inline">
            <Item name="" className="search">
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
              <ButtonSetting />
            </Item>
          </Form>
        </CustomFilter>
      </div>
    </StyledComponent>
  );
};

export default HistoryProductFIlter;
