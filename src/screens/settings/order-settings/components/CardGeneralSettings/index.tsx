import {
  Card,
  Col,
  Radio,
  RadioChangeEvent,
  Row,
  Select,
  Space,
  Switch,
} from "antd";
import {
  OrderConfigActionOrderPreviewResponseModel,
  OrderConfigPrintResponseModel,
  OrderConfigResponseModel,
} from "model/response/settings/order-settings.response";
import { useEffect, useState } from "react";
import { StyledComponent } from "./styles";

type PropType = {
  listPrintConfig: OrderConfigPrintResponseModel[] | null;
  listActionsOrderPreview: OrderConfigActionOrderPreviewResponseModel[] | null;
  listOrderConfigs: OrderConfigResponseModel | null;

  onChangeAllowToSellWhenNotAvailableStock: (checked: any) => void;
};

function CardGeneralSettings(props: PropType) {
  const {
    listPrintConfig,
    listActionsOrderPreview,
    listOrderConfigs,
    onChangeAllowToSellWhenNotAvailableStock,
  } = props;

  const valueCustomerCanViewOrderOption = {
    isTrue: "luaChonTheoTungDon",
    isFalse: "chonChoTatCaDonHang",
  };

  const [valueCustomerCanViewOrder, setValueCustomerCanViewOrder] =
    useState("");

  const onChangeCustomerCanViewOrder = (e: RadioChangeEvent) => {
    setValueCustomerCanViewOrder(e.target.value);
  };

  const onChangeSelectChonChoTatCaDonHang = (value: string) => {
    console.log(`selected ${value}`);
  };

  useEffect(() => {
    if (listOrderConfigs?.for_all_order) {
      setValueCustomerCanViewOrder(valueCustomerCanViewOrderOption.isTrue);
    } else {
      setValueCustomerCanViewOrder(valueCustomerCanViewOrderOption.isFalse);
    }
  }, [
    listOrderConfigs,
    valueCustomerCanViewOrderOption.isFalse,
    valueCustomerCanViewOrderOption.isTrue,
  ]);

  return (
    <StyledComponent>
      <Card title="Cài đặt chung">
        <Row gutter={30}>
          <Col span={12}>
            <div className="singleSetting">
              <h4 className="title">Cho khách hàng xem hàng</h4>
              <div className="singleSetting__content">
                <Radio.Group
                  onChange={onChangeCustomerCanViewOrder}
                  value={valueCustomerCanViewOrder}
                >
                  <div className="single">
                    <Radio value={valueCustomerCanViewOrderOption.isTrue}>
                      Lựa chọn theo từng đơn
                    </Radio>
                  </div>
                  <div className="single">
                    <Radio value={valueCustomerCanViewOrderOption.isFalse}>
                      Chọn cho tất cả đơn hàng
                    </Radio>
                  </div>
                </Radio.Group>
                <div>
                  <Select
                    placeholder="Chọn hành động"
                    onChange={onChangeSelectChonChoTatCaDonHang}
                    key={Math.random()}
                    className="selectChonChoTatCaDonHang"
                    defaultValue={
                      listOrderConfigs?.order_config_action.id.toString() ||
                      undefined
                    }
                  >
                    {listActionsOrderPreview &&
                      listActionsOrderPreview.length > 0 &&
                      listActionsOrderPreview.map((single) => {
                        return (
                          <Select.Option
                            value={single.id.toString()}
                            key={single.id}
                          >
                            {single.name}
                          </Select.Option>
                        );
                      })}
                  </Select>
                </div>
              </div>
            </div>
          </Col>
          <Col span={12}>
            <div className="singleSetting">
              <h4 className="title">Cài đặt khác</h4>
              <div className="singleSetting__content">
                <Space direction="vertical" size={15}>
                  <div>
                    <Switch
                      key={Math.random()}
                      defaultChecked={listOrderConfigs?.allow_choose_item}
                      // onChange={onChange}
                      className="ant-switch-primary"
                    />
                    Cài đặt chọn cửa hàng trước mới cho chọn sản phẩm
                  </div>
                  <div>
                    <Switch
                      key={Math.random()}
                      defaultChecked={listOrderConfigs?.sellable_inventory}
                      onChange={onChangeAllowToSellWhenNotAvailableStock}
                      className="ant-switch-primary"
                    />
                    Cho phép bán khi tồn kho
                  </div>
                </Space>
              </div>
            </div>
            <div className="singleSetting">
              <h4 className="title">
                Cấu hình cho phép in nhiều liên đơn hàng
              </h4>
              <div className="singleSetting__content">
                <Select
                  key={Math.random()}
                  placeholder="Chọn số lượng"
                  onChange={onChangeSelectChonChoTatCaDonHang}
                  className="selectInNhieuDonHang"
                  defaultValue={
                    listOrderConfigs?.order_config_print.id.toString() ||
                    undefined
                  }
                >
                  {listPrintConfig &&
                    listPrintConfig.length > 0 &&
                    listPrintConfig.map((single) => {
                      return (
                        <Select.Option
                          value={single.id.toString()}
                          key={single.id}
                        >
                          {single.name}
                        </Select.Option>
                      );
                    })}
                </Select>
              </div>
            </div>
          </Col>
        </Row>
      </Card>
    </StyledComponent>
  );
}

export default CardGeneralSettings;
