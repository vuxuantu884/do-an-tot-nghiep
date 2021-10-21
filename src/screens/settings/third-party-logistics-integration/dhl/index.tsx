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
import { showSuccess } from "utils/ToastUtils";
import SingleThirdPartyLogisticLayout from "../component/SingleThirdPartyLogisticLayout";
import { StyledComponent } from "./styles";

type PropType = {};

function SingleThirdPartyLogisticDHL(props: PropType) {
  const external_service_code = "dhl";
  const urlGuide = "https://yody.vn/";
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const history = useHistory();

  const [thirdPartyLogistics, setThirdPartyLogistics] =
    useState<DeliveryServiceResponse | null>(null);
  const [listServices, setListServices] = useState<
    DeliveryServiceTransportType[]
  >([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isShowConfirmDisconnect, setIsShowConfirmDisconnect] = useState(false);
  const [confirmSubTitle, setConfirmSubTitle] = useState<React.ReactNode>("");

  const initialFormValue = {
    username: "",
    password: "",
    transport_types: [],
  };
  const handleSubmit = () => {
    form.validateFields(["username", "password"]).then(() => {
      const formComponentValue = form.getFieldsValue();
      let transport_types = listServices.map((single) => {
        return {
          ...single,
          status: formComponentValue.transport_types.includes(single.code)
            ? DELIVER_SERVICE_STATUS.active
            : DELIVER_SERVICE_STATUS.inactive,
        };
      });
      const formValueFormatted = {
        external_service_id: thirdPartyLogistics?.id,
        status: isConnected
          ? DELIVER_SERVICE_STATUS.active
          : DELIVER_SERVICE_STATUS.inactive,
        username: formComponentValue.username,
        password: formComponentValue.password,
        transport_types,
      };
      dispatch(
        updateDeliveryConfigurationAction(formValueFormatted, () => {
          history.push(`${UrlConfig.THIRD_PARTY_LOGISTICS_INTEGRATION}`);
        })
      );
    });
  };

  const handleConnect3PL = () => {
    form.validateFields(["username", "password"]).then(() => {
      if (!thirdPartyLogistics?.id) {
        return;
      }
      const params = {
        external_service_id: thirdPartyLogistics?.id,
        username: form.getFieldValue("username"),
        password: form.getFieldValue("password"),
        status: DELIVER_SERVICE_STATUS.active,
      };
      dispatch(
        updateDeliveryConfigurationAction(params, (response) => {
          showSuccess("Kết nối thành công!");
          setIsConnected(true);
        })
      );
    });
  };

  const handleCancelConnect3PL = () => {
    form.validateFields(["username", "password"]).then(() => {
      setConfirmSubTitle(
        <React.Fragment>
          Bạn có chắc chắn muốn hủy kết nối hãng vận chuyển "
          <strong>{thirdPartyLogistics?.name}</strong>" ?
        </React.Fragment>
      );
      setIsShowConfirmDisconnect(true);
    });
  };

  const cancelConnect3PL = (thirdPartyLogisticId: number | undefined) => {
    if (!thirdPartyLogisticId) {
      return;
    }
    const params = {
      username: form.getFieldValue("username"),
      password: form.getFieldValue("password"),
      external_service_id: thirdPartyLogisticId,
      status: DELIVER_SERVICE_STATUS.inactive,
    };
    dispatch(
      updateDeliveryConfigurationAction(params, () => {
        setIsConnected(false);
        showSuccess("Hủy kết nối thành công!");
      })
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
            setIsConnected(result.status === DELIVER_SERVICE_STATUS.active);

            dispatch(
              getDeliveryTransportTypesAction(result.id, (response) => {
                if (response) {
                  setListServices(response);
                  const listActiveServices = response.map((single) => {
                    if (single.active) {
                      return single.code;
                    }
                    return null;
                  });
                  form.setFieldsValue({
                    ...initialFormValue,
                    transport_types: listActiveServices || [],
                  });
                }
              })
            );
          }
        }
      })
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, form]);

  return (
    <StyledComponent>
      <SingleThirdPartyLogisticLayout
        logoSingleThirdPartyLogistic={thirdPartyLogistics?.logo}
        nameSingleThirdPartyLogistic={thirdPartyLogistics?.name}
        onSubmit={handleSubmit}
        onConnect={() => handleConnect3PL()}
        onCancelConnect={() => handleCancelConnect3PL()}
        urlGuide={urlGuide}
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
            name="username"
            label="Client Id: "
            rules={[
              {
                required: true,
                message: "Vui lòng nhập Client Id!",
              },
            ]}
          >
            <Input
              type="text"
              placeholder="Nhập Client Id"
              style={{ width: "100%" }}
            />
          </Form.Item>
          <Form.Item
            name="password"
            label="Password: "
            rules={[
              {
                required: true,
                message: "Vui lòng nhập Password!",
              },
            ]}
          >
            <Input
              type="password"
              placeholder="Nhập Password"
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

export default SingleThirdPartyLogisticDHL;
