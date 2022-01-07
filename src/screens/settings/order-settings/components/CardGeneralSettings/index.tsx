import {
  Card,
  Col,
  Radio,
  RadioChangeEvent,
  Row,
  Select,
  Space,
  Switch,
  TreeSelect,
} from "antd";
import { BaseBootstrapResponse } from "model/content/bootstrap.model";
import { OrderConfigRequestModel } from "model/request/settings/order-settings.resquest";
import {
  OrderConfigPrintResponseModel,
  OrderConfigResponseModel,
} from "model/response/settings/order-settings.response";
import { SHOW_PARENT } from "rc-tree-select";
import { useEffect, useState } from "react";
import { StyledComponent } from "./styles";

const { TreeNode } = TreeSelect;

type PropType = {
  listPrintConfig: OrderConfigPrintResponseModel[] | null;
  listActionsOrderPreview: BaseBootstrapResponse[] | undefined;
  listOrderConfigs: OrderConfigResponseModel | null;
  onUpdateOrderConfig: (params: OrderConfigRequestModel) => void;
};

function CardGeneralSettings(props: PropType) {
  const {
    listPrintConfig,
    listActionsOrderPreview,
    listOrderConfigs,
    onUpdateOrderConfig,
  } = props;

  const getInitParams = () => {
    let result = null;
    if (listOrderConfigs) {
      result = {
        sellable_inventory: listOrderConfigs.sellable_inventory,
        for_all_order: listOrderConfigs.for_all_order,
        allow_choose_item: listOrderConfigs.allow_choose_item,
        order_config_action: listOrderConfigs.order_config_action,
        order_config_print_id: listOrderConfigs.order_config_print.id,
        hide_gift:listOrderConfigs.hide_gift,
        hide_bonus_item:listOrderConfigs.hide_bonus_item
      };
    }
    return result;
  };
  const valueCustomerCanViewOrderOption = {
    forSingleOrder: "luaChonTheoTungDon",
    forAllOrders: "chonChoTatCaDonHang",
  };

  const valueApplyPrintOrderOption = {
    hideGift: "inHoaDonKhongHienThiQuaTang",
    hideBonusItem: "inHoaDonKhongCoSanPhamTangKem"
  }

  const [valueCustomerCanViewOrder, setValueCustomerCanViewOrder] = useState("");
  const [invoicePrintingConfiguration, setInvoicePrintingConfiguration] = useState<string[]>([]);

  const onChangeCustomerCanViewOrder = (e: RadioChangeEvent) => {
    let initParams = getInitParams();
    if (!listOrderConfigs || !initParams) {
      return;
    }
    setValueCustomerCanViewOrder(e.target.value);
    const for_all_order =
      e.target.value === valueCustomerCanViewOrderOption.forAllOrders;

    listOrderConfigs.for_all_order =
      e.target.value === valueCustomerCanViewOrderOption.forAllOrders;

    const params: OrderConfigRequestModel = {
      ...initParams,
      for_all_order,
    };
    onUpdateOrderConfig(params);
  };

  const onChangeSelectChonChoTatCaDonHang = (value: string) => {
    let initParams = getInitParams();
    if (!listOrderConfigs || !initParams) {
      return;
    }
    const order_config_action = value;

    listOrderConfigs.order_config_action = value;

    const params: OrderConfigRequestModel = {
      ...initParams,
      order_config_action,
    };
    onUpdateOrderConfig(params);
  };

  const onChangeSelectSettingPrinter = (value: string) => {
    let initParams = getInitParams();
    if (!listOrderConfigs || !initParams) {
      return;
    }
    const order_config_print_id = +value;
    listOrderConfigs.order_config_print.id = +value;
    const params: OrderConfigRequestModel = {
      ...initParams,
      order_config_print_id,
    };
    onUpdateOrderConfig(params);
  };

  // const onChangeAllowChooseItemBeforeChooseStore = (checked: boolean) => {
  //   let initParams = getInitParams();
  //   if (!listOrderConfigs || !initParams) {
  //     return;
  //   }
  //   const allow_choose_item = checked;
  //   listOrderConfigs.allow_choose_item = checked;
  //   const params: OrderConfigRequestModel = {
  //     ...initParams,
  //     allow_choose_item,
  //   };
  //   onUpdateOrderConfig(params);
  // };

  const onChangeAllowToSellWhenNotAvailableStock = (checked: boolean) => {
    let initParams = getInitParams();
    if (!listOrderConfigs || !initParams) {
      return;
    }
    const sellable_inventory = checked;
    listOrderConfigs.sellable_inventory = checked;
    const params: OrderConfigRequestModel = {
      ...initParams,
      sellable_inventory,
    };
    onUpdateOrderConfig(params);
  };

  useEffect(() => {
    if (listOrderConfigs?.for_all_order) {
      setValueCustomerCanViewOrder(
        valueCustomerCanViewOrderOption.forAllOrders
      );
    } else {
      setValueCustomerCanViewOrder(
        valueCustomerCanViewOrderOption.forSingleOrder
      );
    }

  }, [
    listOrderConfigs,
    valueCustomerCanViewOrderOption.forAllOrders,
    valueCustomerCanViewOrderOption.forSingleOrder,
  ]);

  useEffect(() => {
    let config: string[] = [];
    if (listOrderConfigs?.hide_gift === true)
      config.push(valueApplyPrintOrderOption.hideGift)
    if (listOrderConfigs?.hide_bonus_item === true)
      config.push(valueApplyPrintOrderOption.hideBonusItem)
    setInvoicePrintingConfiguration(config)
  }, [
    listOrderConfigs,
    valueApplyPrintOrderOption.hideBonusItem,
    valueApplyPrintOrderOption.hideGift
  ]);

  console.log("listOrderConfigs",listOrderConfigs)
  console.log("invoicePrintingConfiguration",invoicePrintingConfiguration)

  const onChangeApplyPrint = (value: string[]) => {
    let initParams = getInitParams();
    if (!listOrderConfigs || !initParams) {
      return;
    }

    const params: OrderConfigRequestModel = {
      ...initParams,
      hide_gift:value.findIndex(x=>x===valueApplyPrintOrderOption.hideGift)!==-1?true:false,
      hide_bonus_item:value.findIndex(x=>x===valueApplyPrintOrderOption.hideBonusItem)!==-1?true:false,
    };
    onUpdateOrderConfig(params);
  }

  return (
    <StyledComponent>
      <Card title="Cài đặt chung">
        <Row style={{ padding: "0px 30px" }} >
          <Col span={12}>
            <div className="singleSetting">
              <h4 className="title">Cho khách hàng xem hàng</h4>
              <div className="singleSetting__content">
                <Radio.Group
                  onChange={onChangeCustomerCanViewOrder}
                  value={valueCustomerCanViewOrder}
                >
                  <div className="single">
                    <Radio
                      value={valueCustomerCanViewOrderOption.forSingleOrder}
                    >
                      Lựa chọn theo từng đơn
                    </Radio>
                  </div>
                  <div className="single">
                    <Radio value={valueCustomerCanViewOrderOption.forAllOrders}>
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
                      listOrderConfigs?.order_config_action
                        ? listOrderConfigs?.order_config_action
                        : undefined
                    }
                  >
                    {listActionsOrderPreview &&
                      listActionsOrderPreview.length > 0 &&
                      listActionsOrderPreview.map((single) => {
                        return (
                          <Select.Option
                            value={single.value}
                            key={single.value}
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
              <h4 className="title">
                In hóa đơn
              </h4>
              <div className="singleSetting__content">
                <TreeSelect
                  key={Math.random()}
                  onChange={onChangeApplyPrint}
                  treeCheckable={true}
                  showCheckedStrategy={SHOW_PARENT}
                  placeholder="Chọn in hóa đơn"
                  className="selectInNhieuDonHang"
                  maxTagCount="responsive"
                  defaultValue={invoicePrintingConfiguration}
                >
                  <TreeNode value={valueApplyPrintOrderOption.hideGift} title="In hóa đơn không hiển thị quà tặng"></TreeNode>
                  <TreeNode value={valueApplyPrintOrderOption.hideBonusItem} title="In hóa đơn không có sản phẩm tặng kèm"></TreeNode>
                </TreeSelect>
                {/* <Select
                  key={Math.random()}
                  placeholder="Chọn in hóa đơn"
                  onChange={onChangeSelectSettingPrinter}
                  className="selectInNhieuDonHang"
                  defaultValue={
                    listOrderConfigs?.order_config_print.id.toString() ||
                    undefined
                  }
                >
                  <Select.Option value={1} key={1}>
                      In hóa đơn không hiển thị quà tặng
                  </Select.Option>
                   <Select.Option value={1} key={1}>
                      In hóa đơn không hiển thị quà tặng
                  </Select.Option>
                </Select> */}
              </div>
            </div>
          </Col>
        </Row>

        <Row style={{ marginTop: "10px", padding: "0px 30px" }}>
          <Col span={12}>
            <div className="singleSetting">
              <h4 className="title">Cài đặt khác</h4>
              <div className="singleSetting__content">
                <Space direction="vertical" size={15}>
                  {/* <div>
                    <Switch
                      key={Math.random()}
                      defaultChecked={listOrderConfigs?.allow_choose_item}
                      onChange={onChangeAllowChooseItemBeforeChooseStore}
                      className="ant-switch-primary"
                    />
                    Cài đặt chọn cửa hàng trước mới cho chọn sản phẩm
                  </div> */}
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

          </Col>
          <Col span={12}>
            <div className="singleSetting">
              <h4 className="title">
              Cấu hình cho phép in nhiều liên đơn hàng
              </h4>
              <div className="singleSetting__content">
                <Select
                  key={Math.random()}
                  placeholder="Chọn số lượng"
                  onChange={onChangeSelectSettingPrinter}
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
