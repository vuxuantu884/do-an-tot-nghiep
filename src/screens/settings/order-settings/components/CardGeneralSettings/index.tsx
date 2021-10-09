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
import { useState } from "react";
import { StyledComponent } from "./styles";

type PropType = {
  isAllowToSellWhenNotAvailableStock: boolean;
  listPrintConfig: OrderConfigPrintResponseModel[] | null;
  listActionsOrderPreview: OrderConfigActionOrderPreviewResponseModel[] | null;
  listOrderConfigs: OrderConfigResponseModel | null;

  onChangeAllowToSellWhenNotAvailableStock: (checked: any) => void;
};

function CardGeneralSettings(props: PropType) {
  const {
    listPrintConfig,
    listActionsOrderPreview,
    isAllowToSellWhenNotAvailableStock,
    onChangeAllowToSellWhenNotAvailableStock,
  } = props;

  const [valueCustomerCanViewOrder, setValueCustomerCanViewOrder] =
    useState("luaChonTheoTungDon");

  const onChangeCustomerCanViewOrder = (e: RadioChangeEvent) => {
    console.log("radio checked", e.target.value);
    setValueCustomerCanViewOrder(e.target.value);
  };

  const onChangeSelectChonChoTatCaDonHang = (value: string) => {
    console.log(`selected ${value}`);
  };

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
                    <Radio value="luaChonTheoTungDon">
                      Lựa chọn theo từng đơn
                    </Radio>
                  </div>
                  <div className="single">
                    <Radio value="chonChoTatCaDonHang">
                      Chọn cho tất cả đơn hàng
                    </Radio>
                  </div>
                </Radio.Group>
                <div>
                  <Select
                    placeholder="Chọn hành động"
                    onChange={onChangeSelectChonChoTatCaDonHang}
                    className="selectChonChoTatCaDonHang"
                  >
                    {listActionsOrderPreview &&
                      listActionsOrderPreview.length > 0 &&
                      listActionsOrderPreview.map((single) => {
                        return (
                          <Select.Option value={single.id} key={single.id}>
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
                      defaultChecked={undefined}
                      // onChange={onChange}
                      className="ant-switch-primary"
                    />
                    Cài đặt chọn cửa hàng trước mới cho chọn sản phẩm
                  </div>
                  <div>
                    <Switch
                      checked={isAllowToSellWhenNotAvailableStock}
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
                  placeholder="Chọn số lượng"
                  onChange={onChangeSelectChonChoTatCaDonHang}
                  className="selectInNhieuDonHang"
                >
                  {listPrintConfig &&
                    listPrintConfig.length > 0 &&
                    listPrintConfig.map((single) => {
                      return (
                        <Select.Option value={single.id} key={single.id}>
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
