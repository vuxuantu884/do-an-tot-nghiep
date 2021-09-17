import { Checkbox, Form, Input } from "antd";
import ModalDeleteConfirm from "component/modal/ModalDeleteConfirm";
import UrlConfig from "config/url.config";
import {
  DeliveryServicesGetList,
  getDeliveryTransportTypesAction,
  updateDeliveryConfigurationAction,
} from "domain/actions/order/order.action";
import {
  DeliveryServiceResponse,
  DeliveryServiceTransportType,
} from "model/response/order/order.response";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useHistory } from "react-router";
import { DELIVER_SERVICE_STATUS } from "utils/Order.constants";
import SingleThirdPartyLogisticLayout from "../component/SingleThirdPartyLogisticLayout";
import { StyledComponent } from "./styles";

type PropType = {};

function SingleThirdPartyLogistic(props: PropType) {
  const external_service_code = "ghtk";
  const urlGuide = "https://yody.vn/";
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const history = useHistory();

  const [thirdPartyLogistics, setThirdPartyLogistics] =
    useState<DeliveryServiceResponse | null>(null);
  const [listServices, setListServices] = useState<
    DeliveryServiceTransportType[]
  >([]);
  const [isShowConfirmDisconnect, setIsShowConfirmDisconnect] = useState(false);
  const [confirmSubTitle, setConfirmSubTitle] = useState<React.ReactNode>("");

  const initialFormValue = {
    username: "",
    password: "",
    transport_types: [],
  };

  const handleSubmit = () => {
    const formComponentValue = form.getFieldsValue();
    let transport_types = listServices.map((single) => {
      return {
        ...single,
        active: formComponentValue.transport_types.includes(single.code)
          ? DELIVER_SERVICE_STATUS.active
          : DELIVER_SERVICE_STATUS.inactive,
      };
    });
    const formValueFormatted = {
      external_service_id: thirdPartyLogistics?.id,
      username: formComponentValue.username,
      password: formComponentValue.password,
      transport_types,
    };
    console.log("formValueFormatted", formValueFormatted);
    dispatch(
      updateDeliveryConfigurationAction(formValueFormatted, () => {
        history.push(`${UrlConfig.THIRD_PARTY_LOGISTICS_INTEGRATION}`);
      })
    );
  };

  const handleCancelConnect3PL = () => {
    setConfirmSubTitle(
      <React.Fragment>
        Bạn có chắc chắn muốn hủy kết nối hãng vận chuyển "
        <strong>{thirdPartyLogistics?.name}</strong>" ?
      </React.Fragment>
    );
    setIsShowConfirmDisconnect(true);
  };

  const cancelConnect3PL = (thirdPartyLogisticId: number | undefined) => {
    if (!thirdPartyLogisticId) {
      return;
    }
    const params = {
      external_service_id: thirdPartyLogisticId,
      status: DELIVER_SERVICE_STATUS.inactive,
    };
    dispatch(
      updateDeliveryConfigurationAction(params, () => {
        history.push(`${UrlConfig.THIRD_PARTY_LOGISTICS_INTEGRATION}`);
      })
    );
  };

  useEffect(() => {
    dispatch(
      DeliveryServicesGetList((response: Array<DeliveryServiceResponse>) => {
        if (response) {
          let result = response.find((single) => {
            return single.external_service_code === external_service_code;
          });
          if (result) {
            setThirdPartyLogistics(result);
            dispatch(
              getDeliveryTransportTypesAction(result.id, (response) => {
                if (response) {
                  setListServices(response);
                }
              })
            );
          }
        }
      })
    );
  }, [dispatch]);

  return (
    <StyledComponent>
      <SingleThirdPartyLogisticLayout
        logoSingleThirdPartyLogistic={thirdPartyLogistics?.logo}
        nameSingleThirdPartyLogistic={thirdPartyLogistics?.name}
        onSubmit={handleSubmit}
        onCancelConnect={() => handleCancelConnect3PL()}
        urlGuide={urlGuide}
      >
        <Form
          form={form}
          name="form-single-third-party-logistic"
          layout="vertical"
          initialValues={initialFormValue}
          style={{ width: "377px", maxWidth: "100%" }}
        >
          <Form.Item
            name="username"
            label="Tài khoản: "
            rules={[
              {
                required: true,
                message: "Vui lòng nhập tài khoản!",
              },
            ]}
          >
            <Input
              type="text"
              placeholder="Nhập tài khoản"
              style={{ width: "100%" }}
            />
          </Form.Item>
          <Form.Item
            name="password"
            label="Mật khẩu: "
            rules={[
              {
                required: true,
                message: "Vui lòng nhập mật khẩu!",
              },
            ]}
          >
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
              {listServices &&
                listServices.length > 0 &&
                listServices.map((singleService) => {
                  return (
                    <div key={singleService.code}>
                      <Checkbox value={singleService.code}>
                        {singleService.name}
                      </Checkbox>
                    </div>
                  );
                })}
            </Checkbox.Group>
          </Form.Item>
        </Form>
      </SingleThirdPartyLogisticLayout>
      <ModalDeleteConfirm
        visible={isShowConfirmDisconnect}
        onOk={() => cancelConnect3PL(thirdPartyLogistics?.id)}
        onCancel={() => setIsShowConfirmDisconnect(false)}
        title="Xác nhận"
        subTitle={confirmSubTitle}
      />
    </StyledComponent>
  );
}

export default SingleThirdPartyLogistic;
