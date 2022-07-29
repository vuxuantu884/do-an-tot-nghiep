import { Checkbox, Form, Input } from "antd";
import ModalDeleteConfirm from "component/modal/ModalDeleteConfirm";
import {
  DeliveryServicesGetList,
  getDeliveryTransportTypesAction,
  updateDeliveryConfigurationAction,
} from "domain/actions/order/order.action";
import { updateConfigReQuestModel } from "model/request/settings/third-party-logistics-settings.resquest";
import {
  DeliveryServiceResponse,
  DeliveryServiceTransportType,
} from "model/response/order/order.response";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { DELIVER_SERVICE_STATUS, THIRD_PARTY_LOGISTICS_INTEGRATION } from "utils/Order.constants";
import { showSuccess } from "utils/ToastUtils";
import SingleThirdPartyLogisticLayout from "../component/SingleThirdPartyLogisticLayout";
import { StyledComponent } from "./styles";

type PropTypes = {};

function SingleThirdPartyLogisticGHN(props: PropTypes) {
  const external_service_code = THIRD_PARTY_LOGISTICS_INTEGRATION.ghtk.code;
  const guideUrl = THIRD_PARTY_LOGISTICS_INTEGRATION.ghtk.guideUrl;
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const [thirdPartyLogistics, setThirdPartyLogistics] = useState<DeliveryServiceResponse | null>(
    null,
  );
  const [deliveryServices, setDeliveryServices] = useState<DeliveryServiceTransportType[]>([]);
  const [isShowConfirmDisconnect, setIsShowConfirmDisconnect] = useState(false);
  const [confirmSubTitle, setConfirmSubTitle] = useState<React.ReactNode>("");
  const [isConnected, setIsConnected] = useState(false);

  const initialFormValue = {
    token: "",
    transport_types: [],
  };

  const handleSubmit = () => {
    form.validateFields(["token"]).then(() => {
      const formComponentValue = form.getFieldsValue();
      let transport_types = deliveryServices.map((single) => {
        return {
          code: single.code,
          status: formComponentValue.transport_types.includes(single.code)
            ? DELIVER_SERVICE_STATUS.active
            : DELIVER_SERVICE_STATUS.inactive,
          name: single.name,
          description: single.description,
        };
      });
      const formValueFormatted = {
        external_service_code,
        status: isConnected ? DELIVER_SERVICE_STATUS.active : DELIVER_SERVICE_STATUS.inactive,
        token: form.getFieldValue("token"),
        username: "",
        password: "",
        transport_types,
      };
      dispatch(updateDeliveryConfigurationAction(formValueFormatted, () => {}));
    });
  };

  const handleConnect3PL = () => {
    form.validateFields(["token"]).then(() => {
      const params: updateConfigReQuestModel = {
        external_service_code,
        token: form.getFieldValue("token"),
        status: DELIVER_SERVICE_STATUS.active,
      };
      dispatch(
        updateDeliveryConfigurationAction(params, () => {
          setIsConnected(true);
          showSuccess("Kết nối thành công!");
        }),
      );
    });
  };

  const handleCancelConnect3PL = () => {
    form.validateFields(["token"]).then(() => {
      setConfirmSubTitle(
        <React.Fragment>
          Bạn có chắc chắn muốn hủy kết nối hãng vận chuyển "
          <strong>{thirdPartyLogistics?.name}</strong>" ?
        </React.Fragment>,
      );
      setIsShowConfirmDisconnect(true);
    });
  };

  const cancelConnect3PL = (thirdPartyLogisticCode: string | undefined) => {
    if (!thirdPartyLogisticCode) {
      return;
    }
    const params = {
      external_service_code,
      token: form.getFieldValue("token"),
      status: DELIVER_SERVICE_STATUS.inactive,
    };
    dispatch(
      updateDeliveryConfigurationAction(params, () => {
        setIsConnected(false);
        showSuccess("Hủy kết nối thành công!");
      }),
    );
    setIsShowConfirmDisconnect(false);
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
            setIsConnected(result.active);
            dispatch(
              getDeliveryTransportTypesAction(result.code, (response) => {
                if (response) {
                  setDeliveryServices(response);
                  const activeDeliveryServices = response.map((single) => {
                    if (single.active) {
                      return single.code;
                    }
                    return null;
                  });
                  form.setFieldsValue({
                    ...initialFormValue,
                    transport_types: activeDeliveryServices || [],
                  });
                }
              }),
            );
          }
        }
      }),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch]);

  return (
    <StyledComponent>
      <SingleThirdPartyLogisticLayout
        logoSingleThirdPartyLogistic={thirdPartyLogistics?.logo}
        nameSingleThirdPartyLogistic={thirdPartyLogistics?.name}
        onSubmit={handleSubmit}
        onConnect={() => handleConnect3PL()}
        onCancelConnect={() => handleCancelConnect3PL()}
        guideUrl={guideUrl}
        isConnected={isConnected}
      >
        <Form
          form={form}
          name="form-single-third-party-logistic"
          layout="vertical"
          initialValues={initialFormValue}
          style={{ width: "377px", maxWidth: "100%" }}
        >
          <Form.Item
            name="token"
            label="Token: "
            rules={[
              {
                required: true,
                message: "Vui lòng nhập token!",
              },
            ]}
          >
            <Input type="text" placeholder="Nhập token" style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item
            name="transport_types"
            label="Chọn dịch vụ đã kí hợp đồng với hãng vận chuyển:"
          >
            <Checkbox.Group>
              {deliveryServices &&
                deliveryServices.length > 0 &&
                deliveryServices.map((singleService) => {
                  return (
                    <div key={singleService.code}>
                      <Checkbox value={singleService.code}>{singleService.name}</Checkbox>
                    </div>
                  );
                })}
            </Checkbox.Group>
          </Form.Item>
        </Form>
      </SingleThirdPartyLogisticLayout>
      <ModalDeleteConfirm
        visible={isShowConfirmDisconnect}
        onOk={() => cancelConnect3PL(external_service_code)}
        onCancel={() => setIsShowConfirmDisconnect(false)}
        title="Xác nhận"
        subTitle={confirmSubTitle}
      />
    </StyledComponent>
  );
}

export default SingleThirdPartyLogisticGHN;
