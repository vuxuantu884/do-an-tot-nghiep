import { Button, Form, Input, Select } from "antd";
import { MenuAction } from "component/table/ActionButton";
import ButtonSetting from "component/table/ButtonSetting";
import CustomFilter from "component/table/custom.filter";
import search from "assets/img/search.svg";
import { useCallback } from "react";
import { InventoryFiltersWrapper } from "./styles";
import { FilterOutlined } from "@ant-design/icons";
import { Store } from "model/inventory/transfer";

type InventoryFiltersProps = {
  onMenuClick?: (index: number) => void;
  onClickOpen?: () => void;
  actions: Array<MenuAction>;
  params: any;
  stores: Array<Store>;
};

const { Item } = Form;
const { Option } = Select;

const InventoryFilters: React.FC<InventoryFiltersProps> = (
  props: InventoryFiltersProps
) => {
  const { onMenuClick, actions, params, onClickOpen, stores } = props;
  // const [form] = Form.useForm();

  // const [visible, setVisible] = useState(false);

  // validate
  // const validateStore = (rule: any, value: any, callback: any): void => {
  //   if (value) {
  //     const from_store_id = form.getFieldValue("from_store_id");
  //     const to_store_id = form.getFieldValue("to_store_id");
  //     if (from_store_id === to_store_id) {
  //       callback(`Kho gửi không được trùng với kho nhận`);
  //     } else {
  //       callback();
  //     }
  //   } else {
  //     callback();
  //   }
  // };

  const onActionClick = useCallback(
    (index: number) => {
      onMenuClick && onMenuClick(index);
    },
    [onMenuClick]
  );

  // const openFilter = useCallback(() => {
  //   setVisible(true);
  // }, []);

  const onFinish = () => {};

  return (
    <InventoryFiltersWrapper>
      <CustomFilter onMenuClick={onActionClick} menu={actions}>
        <Form onFinish={onFinish} initialValues={params} layout="inline">
              <Item
                name="from_store_id"
                className="select-item"
              >
                <Select
                  placeholder="Kho gửi"
                  showArrow
                >
                  {Array.isArray(stores) &&
                    stores.length > 0 &&
                    stores.map((item, index) => (
                      <Option
                        key={"from_store_id" + index}
                        value={item.id.toString()}
                      >
                        {item.name}
                      </Option>
                    ))}
                </Select>
              </Item>
              <Item
                name="to_store_id"
                className="select-item"
              >
                <Select
                  placeholder="Kho nhận"
                  showArrow
                  optionFilterProp="children"
                >
                  {Array.isArray(stores) &&
                    stores.length > 0 &&
                    stores.map((item, index) => (
                      <Option
                        key={"to_store_id" + index}
                        value={item.id.toString()}
                      >
                        {item.name}
                      </Option>
                    ))}
                </Select>
              </Item>
              <Item name="info" className="search">
                <Input
                  prefix={<img src={search} alt="" />}
                  placeholder="Tên/Mã sản phẩm"
                />
              </Item>
              <Item>
                <Button type="primary" htmlType="submit">
                  Lọc
                </Button>
              </Item>
              <Item>
                <Button icon={<FilterOutlined />} onClick={() => {}}>
                  Thêm bộ lọc
                </Button>
              </Item>
              <Item>
                <ButtonSetting onClick={onClickOpen} />
              </Item>
        </Form>
      </CustomFilter>
    </InventoryFiltersWrapper>
  );
};

export default InventoryFilters;
