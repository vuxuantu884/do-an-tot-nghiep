import { Checkbox, Form, Input } from "antd";
import { DeliveryServicesGetList } from "domain/actions/order/order.action";
import { UpdateConfig3rdPartyLogisticsReQuestModel } from "model/request/settings/third-party-logistics-settings.resquest";
import { DeliveryServiceResponse } from "model/response/order/order.response";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { DELIVER_SERVICE_STATUS } from "utils/Order.constants";
import SingleThirdPartyLogisticLayout from "../component/SingleThirdPartyLogisticLayout";
import IconGiaoHangTietKiem from "./images/iconGiaoHangTietKiem.svg";
import { StyledComponent } from "./styles";

type PropType = {};

function SingleThirdPartyLogistic(props: PropType) {
  const CODE = "ghtk";
  const [form] = Form.useForm();

  const [listThirdPartyLogistics, setListThirdPartyLogistics] = useState<
    DeliveryServiceResponse[]
  >([]);
  const [currentThirdPartyLogistic, setCurrentThirdPartyLogistic] =
    useState<DeliveryServiceResponse | null>(null);
  const dispatch = useDispatch();

  const listServices = [
    {
      key: "1",
      value: "Đồng giá 20k",
    },
    {
      key: "2",
      value: "Đồng giá 24k",
    },
    {
      key: "3",
      value: "TMĐT phát hôm sau",
    },
    {
      key: "4",
      value: "TMĐT bộ",
    },
    {
      key: "5",
      value: "TMĐT bay",
    },
  ];

  const initialFormValue = {
    token_api: "",
    shop_id: "",
    service: "",
    cuaHangApDung: [],
    transport_types: [],
  };

  const handleSubmit = () => {
    if (!currentThirdPartyLogistic?.config) {
      return;
    }
    const formComponentValue = form.getFieldsValue();
    console.log("formComponentValue", formComponentValue);
    let transport_types_value = currentThirdPartyLogistic.transport_types.map(
      (single) => {
        if (formComponentValue.transport_types.includes(single.id)) {
          return {
            id: single.id,
            status: DELIVER_SERVICE_STATUS.active,
          };
        } else {
          return {
            id: single.id,
            status: DELIVER_SERVICE_STATUS.inactive,
          };
        }
      }
    );

    const formattedFormValue: UpdateConfig3rdPartyLogisticsReQuestModel = {
      external_service_id:
        currentThirdPartyLogistic?.config.external_service_id,
      external_service_code:
        currentThirdPartyLogistic?.config.external_service_code,
      base_url: currentThirdPartyLogistic?.config.base_url,
      status: currentThirdPartyLogistic?.config.status,
      transport_types: transport_types_value,
    };
    console.log("formattedFormValue", formattedFormValue);
  };

  const handleCancelConnect = () => {
    console.log("cancelConnect");
  };

  useEffect(() => {
    dispatch(
      DeliveryServicesGetList((response: Array<DeliveryServiceResponse>) => {
        setListThirdPartyLogistics(response);
        let current = response.find((single) => {
          return (single.code = CODE);
        });
        if (current) {
          setCurrentThirdPartyLogistic(current);
        }
      })
    );
  }, [dispatch]);

  return (
    <StyledComponent>
      <SingleThirdPartyLogisticLayout
        logoSingleThirdPartyLogistic={IconGiaoHangTietKiem}
        nameSingleThirdPartyLogistic="Giao hàng tiết kiệm"
        onSubmit={handleSubmit}
        onCancelConnect={handleCancelConnect}
      >
        <Form
          form={form}
          name="form-single-third-party-logistic"
          layout="vertical"
          initialValues={initialFormValue}
          style={{ width: "377px", maxWidth: "100%" }}
        >
          <Form.Item name="account" label="Tài khoản: ">
            <Input
              type="text"
              placeholder="Nhập tài khoản"
              style={{ width: "100%" }}
            />
          </Form.Item>
          <Form.Item name="password" label="Mật khẩu: ">
            <Input
              type="password"
              placeholder="Nhập mật khẩu"
              style={{ width: "100%" }}
            />
          </Form.Item>
          <Form.Item
            name="transport_types"
            label="Chọn dịch vụ đã kí hợp đồng với hãng vận chuyển:"
          >
            <Checkbox.Group>
              {currentThirdPartyLogistic?.transport_types &&
                currentThirdPartyLogistic?.transport_types.length > 0 &&
                currentThirdPartyLogistic?.transport_types.map(
                  (singleService) => {
                    return (
                      <div key={singleService.id}>
                        <Checkbox value={singleService.id}>
                          {singleService.name}
                        </Checkbox>
                      </div>
                    );
                  }
                )}
            </Checkbox.Group>
          </Form.Item>
        </Form>
      </SingleThirdPartyLogisticLayout>
    </StyledComponent>
  );
}

export default SingleThirdPartyLogistic;
