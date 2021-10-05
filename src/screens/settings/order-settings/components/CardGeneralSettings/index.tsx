import { Card, Col, Radio, RadioChangeEvent, Row, Select, Switch } from "antd";
import { useState } from "react";
import { StyledComponent } from "./styles";

type PropType = {};

function CardGeneralSettings(props: PropType) {
  const chonChoTatCaDonHangSelect = [
    {
      name: "Cho xem và thử hàng",
      value: "a1",
    },
    {
      name: "Cho xem và không thử hàng",
      value: "a2",
    },
    {
      name: "Không cho xem hàng",
      value: "a3",
    },
  ];

  const cauHinhInLienDonHangSelect = [
    {
      name: "In 1 liên",
      value: "b1",
    },
    {
      name: "In 2 liên",
      value: "b2",
    },
    {
      name: "In 3 liên",
      value: "b3",
    },
    {
      name: "In 4 liên",
      value: "b4",
    },
  ];

  const [valueCustomerCanViewOrder, setValueCustomerCanViewOrder] =
    useState("luaChonTheoTungDon");

  const onChangeCustomerCanViewOrder = (e: RadioChangeEvent) => {
    console.log("radio checked", e.target.value);
    setValueCustomerCanViewOrder(e.target.value);
  };

  const onChangeSelectChonChoTatCaDonHang = (value: string) => {
    console.log(`selected ${value}`);
  };

  const [greenOrRed, setGreenOrRed] = useState(true);

  return (
    <StyledComponent abc={greenOrRed}>
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
                    defaultValue="a2"
                    onChange={onChangeSelectChonChoTatCaDonHang}
                    className="selectChonChoTatCaDonHang"
                  >
                    {chonChoTatCaDonHangSelect &&
                      chonChoTatCaDonHangSelect.length > 0 &&
                      chonChoTatCaDonHangSelect.map((single) => {
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
              <h4 className="title">Cài đặt khác</h4>
              <div className="singleSetting__content">
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
                    defaultChecked={undefined}
                    // onChange={onChange}
                    className="ant-switch-primary"
                  />
                  Cho phép bán khi tồn kho
                </div>
              </div>
            </div>
            <div className="singleSetting">
              <h4 className="title">
                Cấu hình cho phép in nhiều liên đơn hàng
              </h4>
              <div className="singleSetting__content">
                <Select
                  defaultValue="b2"
                  onChange={onChangeSelectChonChoTatCaDonHang}
                >
                  {cauHinhInLienDonHangSelect &&
                    cauHinhInLienDonHangSelect.length > 0 &&
                    cauHinhInLienDonHangSelect.map((single) => {
                      return (
                        <Select.Option value={single.value} key={single.value}>
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
      <button onClick={() => setGreenOrRed(!greenOrRed)}>
        Toggle green and red
      </button>
    </StyledComponent>
  );
}

export default CardGeneralSettings;
