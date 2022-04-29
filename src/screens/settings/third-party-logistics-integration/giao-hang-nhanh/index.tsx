import { Button, Card, Checkbox, Col, Form, Input, Row, Select } from "antd";
import CustomSelect from "component/custom/select.custom";
import ModalDeleteConfirm from "component/modal/ModalDeleteConfirm";
import { StoreGetListAction } from "domain/actions/core/store.action";
import {
  createDeliveryMappedStoreAction,
  deleteDeliveryMappedStoreAction,
  DeliveryServicesGetList,
  getDeliveryMappedStoresAction,
  getDeliveryTransportTypesAction,
  updateDeliveryConfigurationAction,
} from "domain/actions/order/order.action";
import { StoreResponse } from "model/core/store.model";
import {
  createDeliveryMappedStoreReQuestModel,
  deleteDeliveryMappedStoreReQuestModel,
  updateConfigReQuestModel,
} from "model/request/settings/third-party-logistics-settings.resquest";
import {
  DeliveryMappedStoreType,
  DeliveryServiceResponse,
  DeliveryServiceTransportType,
} from "model/response/order/order.response";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { DELIVER_SERVICE_STATUS } from "utils/Order.constants";
import { fullTextSearch, strForSearch } from "utils/StringUtils";
import { showError, showSuccess } from "utils/ToastUtils";
import SingleThirdPartyLogisticLayout from "../component/SingleThirdPartyLogisticLayout";
import IconClose from "../images/iconClose.svg";
import { StyledComponent } from "./styles";

type PropType = {};

function SingleThirdPartyLogisticGHN(props: PropType) {
  const external_service_code = "ghn";
  const urlGuide = "https://yody.vn/";
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const [listShops, setListShops] = useState<StoreResponse[]>([]);
  const [thirdPartyLogistics, setThirdPartyLogistics] =
    useState<DeliveryServiceResponse | null>(null);
  const [listServices, setListServices] = useState<DeliveryServiceTransportType[]>([]);
  const [isShowConfirmDeleteStoreId, setIsShowConfirmDeleteStoreId] = useState(false);
  const [isShowConfirmDisconnect, setIsShowConfirmDisconnect] = useState(false);
  const [confirmSubTitle, setConfirmSubTitle] = useState<React.ReactNode>("");
  const [inputStoreIdValue, setInputStoreIdValue] = useState<string | undefined>(
    undefined
  );
  const [inputShopIdValue, setInputShopIdValue] = useState<string | undefined>(undefined);
  const [isConnected, setIsConnected] = useState(false);

  const [deleteStore, setDeleteStore] = useState<DeliveryMappedStoreType | null>(null);

  const [listShopIsSelected, setListShopIsSelected] = useState<DeliveryMappedStoreType[]>(
    []
  );

  const [listShopIsSelectedShow, setListShopIsSelectedShow] =
    useState(listShopIsSelected);

  const initialFormValue = {
    token: "",
    transport_types: [],
  };

  const searchShopIsSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    let cloneListShopIsSelected = [...listShopIsSelected];
    let result = cloneListShopIsSelected.filter((singleShop) => {
      return (
        fullTextSearch(value, singleShop.name) || 
        fullTextSearch(value, singleShop.partner_shop_id.toString()) || 
        fullTextSearch(value, singleShop.store_id.toString())
      );
    });
    setListShopIsSelectedShow(result);
  }

  const handleSubmit = () => {
    form.validateFields(["token"]).then(() => {
      const formComponentValue = form.getFieldsValue();
      let transport_types = listServices.map((single) => {
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
        status: isConnected
          ? DELIVER_SERVICE_STATUS.active
          : DELIVER_SERVICE_STATUS.inactive,
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
        })
      );
    });
  };

  const handleCancelConnect3PL = () => {
    form.validateFields(["token"]).then(() => {
      setConfirmSubTitle(
        <React.Fragment>
          Bạn có chắc chắn muốn hủy kết nối hãng vận chuyển "
          <strong>{thirdPartyLogistics?.name}</strong>" ?
        </React.Fragment>
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
      })
    );
    setIsShowConfirmDisconnect(false);
  };

  const handleRemoveStoreId = (store: DeliveryMappedStoreType | null) => {
    if (!store?.partner_shop_id) {
      return;
    }
    const params: deleteDeliveryMappedStoreReQuestModel = {
      partner_shop_id: store?.partner_shop_id,
      store_id: store.store_id,
      token: form.getFieldValue("token"),
      username: "",
      password: "",
    };
    if (thirdPartyLogistics?.code && store) {
      dispatch(
        deleteDeliveryMappedStoreAction(thirdPartyLogistics.code, params, () => {
          setIsShowConfirmDeleteStoreId(false);
          dispatch(
            getDeliveryMappedStoresAction(thirdPartyLogistics.code, (response) => {
              setListShopIsSelected(response);
              setListShopIsSelectedShow(response);
            })
          );
        })
      );
    }
  };

  const createMappedStore = (
    shopId: string | undefined,
    partnerShopId: string | undefined
  ) => {
    if (!shopId) {
      showError("Vui lòng chọn cửa hàng");
      return;
    }
    if (!partnerShopId) {
      showError("Vui lòng điền Shop ID");
      const inputElement = document.getElementsByClassName(
        "inputStoreId"
      )[0] as HTMLInputElement;
      if (inputElement) {
        inputElement.focus();
      }
      return;
    }
    form.validateFields(["token"]).then(() => {
      if (shopId && partnerShopId) {
        const shopSelected = listShops.find((single) => {
          return single.id === +shopId;
        });
        if (!shopSelected) {
          return;
        }
        const shopName = shopSelected.name;
        const params: createDeliveryMappedStoreReQuestModel = {
          token: form.getFieldValue("token"),
          username: "",
          password: "",
          store_id: +shopId,
          store_name: shopName,
          partner_shop_id: +partnerShopId,
        };
        dispatch(
          createDeliveryMappedStoreAction(external_service_code, params, () => {
            dispatch(
              getDeliveryMappedStoresAction(external_service_code, (response) => {
                setListShopIsSelected(response);
                setListShopIsSelectedShow(response);
              })
            );
          })
        );
      }
    });
  };

  useEffect(() => {
    dispatch(
      StoreGetListAction((response) => {
        setListShops(response);
      })
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch]);

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
            dispatch(
              getDeliveryMappedStoresAction(result.code, (response) => {
                setListShopIsSelected(response);
                setListShopIsSelectedShow(response);
              })
            );
          }
        }
      })
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
        urlGuide={urlGuide}
        isConnected={isConnected}
      >
        <Form form={form} layout="vertical" initialValues={initialFormValue}>
          <Row gutter={20}>
            <Col span={12}>
              <Form.Item
                name="token"
                label="Token API: "
                rules={[
                  {
                    required: true,
                    message: "Vui lòng nhập token!",
                  },
                ]}
              >
                <Input
                  type="text"
                  placeholder="Nhập token API"
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
            </Col>
            <Col span={12}>
              <div className="ant-col ant-form-item-label">
                <label htmlFor="">Shop ID</label>
              </div>
              <div className="sectionSelectShop">
                <CustomSelect
                  placeholder="Chọn hoặc tìm kiếm cửa hàng"
                  allowClear
                  showSearch
                  optionFilterProp="children"
                  value={inputShopIdValue}
                  onChange={(value) => {
                    setInputShopIdValue(value);
                  }}
                  className="selectShopId"
                >
                  {listShops &&
                    listShops.map((singleShop) => {
                      return (
                        <Select.Option value={singleShop.id} key={singleShop.id}>
                          {`${singleShop.name} (ID - ${singleShop.id})`}
                        </Select.Option>
                      );
                    })}
                </CustomSelect>
                <div>
                  <Input
                    placeholder="Nhập Shop ID"
                    className="inputStoreId"
                    value={inputStoreIdValue}
                    onChange={(e) => {
                      setInputStoreIdValue(e.target.value);
                    }}
                  />
                  <Button
                    onClick={() => {
                      createMappedStore(inputShopIdValue, inputStoreIdValue);
                    }}
                  >
                    Thêm
                  </Button>
                </div>
              </div>
              <Card title="Cửa hàng áp dụng" className="cardShopIsSelected">
                <div className="search">
                  <Input
                    type="text"
                    placeholder="Nhập mã hoặc tên cửa hàng"
                    style={{ width: "100%" }}
                    allowClear
                    onChange={(e) => searchShopIsSelected(e)}
                  />
                </div>
                <div className="listShop">
                  {listShopIsSelectedShow &&
                    listShopIsSelectedShow.length > 0 &&
                    listShopIsSelectedShow.map((single, index) => {
                      return (
                        <div className="singleShop" key={index}>
                          <div className="singleShop__title">
                          <span className="singleShop__name">{single.name} (ID - {single.store_id})</span>:{" "}
                            <span className="singleShop__code">
                              {single.partner_shop_id}
                            </span>
                          </div>
                          <div className="singleShop__action">
                            <div
                              className="single"
                              onClick={() => {
                                form
                                  .validateFields(["token"])
                                  .then(() => {
                                    setConfirmSubTitle(
                                      <React.Fragment>
                                        Bạn có chắc chắn muốn xóa mapping cửa hàng "
                                        <strong>{single.name}</strong>" ?
                                      </React.Fragment>
                                    );
                                    setDeleteStore(single);
                                    setIsShowConfirmDeleteStoreId(true);
                                  })
                                  .catch((error) => {
                                    const element: any = document.getElementById(
                                      error.errorFields[0].name.join("")
                                    );
                                    element?.focus();
                                    const offsetY =
                                      element?.getBoundingClientRect()?.top +
                                      window.pageYOffset +
                                      -200;
                                    window.scrollTo({ top: offsetY, behavior: "smooth" });
                                  });
                              }}
                            >
                              <img src={IconClose} alt="" />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </Card>
            </Col>
          </Row>
        </Form>
      </SingleThirdPartyLogisticLayout>
      <ModalDeleteConfirm
        visible={isShowConfirmDeleteStoreId}
        onOk={() => handleRemoveStoreId(deleteStore)}
        onCancel={() => setIsShowConfirmDeleteStoreId(false)}
        title="Xác nhận"
        subTitle={confirmSubTitle}
      />
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
