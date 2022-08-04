import { Modal, Form, Select, FormInstance, Row, Col } from "antd";
import { OrderPackContext } from "contexts/order-pack/order-pack-context";
import { Input } from "antd";
import { useCallback, useContext, useMemo } from "react";
import { DeliveryServiceResponse } from "model/response/order/order.response";
import { fullTextSearch } from "utils/StringUtils";
import { useDispatch } from "react-redux";
import { createHandoverService, searchHandoverService } from "service/handover/handover.service";
import { HandoverRequest } from "model/handover/handover.request";
import { handleFetchApiError, isFetchApiSuccessful } from "utils/AppUtils";
import BaseResponse from "base/base.response";
import { HandoverResponse } from "model/handover/handover.response";
import { showError, showSuccess } from "utils/ToastUtils";
import { hideLoading, showLoading } from "domain/actions/loading.action";
import { HandoverSearchRequest } from "model/handover/handover.search";
import moment from "moment";
import { DATE_FORMAT } from "utils/DateUtils";
import { HandoverTransfer, HandoverType } from "screens/order-online/handover/handover.config";
const { TextArea } = Input;

type ReportHandOverModalProps = {
  handleCancel: () => void;
  setVisible: (v: boolean) => void;
  visible: boolean;
  formRef: React.RefObject<FormInstance<any>>;
  goodsReceiptsForm: any;
  handleReloadHandOver: (v: number) => void;
};
const ReportHandOverModal: React.FC<ReportHandOverModalProps> = (
  props: ReportHandOverModalProps,
) => {
  const { handleCancel, visible, formRef, goodsReceiptsForm, setVisible, handleReloadHandOver } =
    props;

  const dispatch = useDispatch();

  const orderPackContextData = useContext(OrderPackContext);

  const listStoresDataCanAccess = orderPackContextData?.listStoresDataCanAccess;
  const listThirdPartyLogistics = orderPackContextData.listThirdPartyLogistics;
  const listChannels = orderPackContextData.listChannels;
  //const data=orderPackContextData.data;

  // const deliveryServiceProvider = useMemo(() => {
  //   let dataAccess: DeliveryServiceResponse[] = [];
  //   listThirdPartyLogistics.forEach((item, index) => {
  //     if (
  //       dataAccess.findIndex(
  //         (p) =>
  //           p.name.toLocaleLowerCase().trim().indexOf(item.name.toLocaleLowerCase().trim()) !== -1,
  //       ) === -1
  //     )
  //       dataAccess.push({ ...item });
  //   });
  //   return dataAccess;
  // }, [listThirdPartyLogistics]);

  const handleCreateHandOver = useCallback(
    (param) => {
      dispatch(showLoading());
      createHandoverService(param)
        .then((response: BaseResponse<HandoverResponse>) => {
          if (isFetchApiSuccessful(response)) {
            showSuccess("Thêm biên bản bàn giao thành công");

            goodsReceiptsForm.resetFields();

            setTimeout(() => {
              handleReloadHandOver(response.data.id);
            }, 500);
          } else {
            handleFetchApiError(response, "Tạo biên bản bàn giao", dispatch);
          }
        })
        .catch((e) => {
          showError("Có lỗi api tạo biên bản bàn giao");
        })
        .finally(() => {
          dispatch(hideLoading());
          setVisible(false);
        });
    },
    [dispatch, goodsReceiptsForm, handleReloadHandOver, setVisible],
  );

  const onFinish = useCallback(
    (value: any) => {
      let store_id = listStoresDataCanAccess?.find((data) => data.id === value.store_id)?.id || 0;

      let param: HandoverRequest = {
        type: value.type,
        delivery_service_provider_id: value.delivery_service_id,
        channel_id: value.channel_id,
        note: value.note,
        store_id: store_id,
        orders: [],
      };
      handleCreateHandOver(param);
    },
    [listStoresDataCanAccess, handleCreateHandOver],
  );

  const handleOk = () => {
    goodsReceiptsForm.submit();
  };

  return (
    <>
      <Modal
        title="Tạo biên bản bàn giao"
        visible={visible}
        onOk={handleOk}
        onCancel={handleCancel}
      >
        <Form
          layout="vertical"
          form={goodsReceiptsForm}
          ref={formRef}
          onFinish={onFinish}
          initialValues={{
            orders: [],
            type: HandoverTransfer,
            delivery_service_provider_id: null,
            channel_id: -1,
            note: "",
            store_id: null,
            order_display: [],
          }}
        >
          <Row gutter={24}>
            <Col md={24}>
              <Form.Item
                label="Cửa hàng"
                name="store_id"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng chọn cửa hàng",
                  },
                ]}
              >
                <Select
                  className="select-with-search"
                  showSearch
                  allowClear
                  style={{ width: "100%" }}
                  placeholder="Chọn cửa hàng"
                  notFoundContent="Không tìm thấy kết quả"
                  onChange={(value?: number) => {}}
                  filterOption={(input, option) => fullTextSearch(input, option?.children)}
                >
                  {listStoresDataCanAccess?.map((item, index) => (
                    <Select.Option key={index.toString()} value={item.id}>
                      {item.name}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={24}>
            <Col md={24}>
              <Form.Item
                label="Hãng vận chuyển"
                name="delivery_service_id"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng chọn hãng vận chuyển",
                  },
                ]}
              >
                <Select
                  className="select-with-search"
                  showSearch
                  allowClear
                  style={{ width: "100%" }}
                  placeholder="Chọn hãng vận chuyển"
                  notFoundContent="Không tìm thấy kết quả"
                  onChange={(value?: number) => {}}
                  filterOption={(input, option) => fullTextSearch(input, option?.children)}
                >
                  <Select.Option key={-1} value={-1}>
                    Tự giao hàng
                  </Select.Option>
                  {listThirdPartyLogistics.map((item, index) => (
                    <Select.Option key={index.toString()} value={item.id}>
                      {item.name}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={24}>
            <Col md={24}>
              <Form.Item
                label="Loại biên bản"
                name="type"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng chọn loại biên bản",
                  },
                ]}
              >
                <Select
                  className="select-with-search"
                  showSearch
                  allowClear
                  style={{ width: "100%" }}
                  placeholder="Chọn loại biên bản"
                  notFoundContent="Không tìm thấy kết quả"
                  onChange={(value?: number) => {}}
                  filterOption={(input, option) => {
                    if (option) {
                      return option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0;
                    }
                    return false;
                  }}
                >
                  {HandoverType.map((item, index) => (
                    <Select.Option key={index.toString()} value={item.value}>
                      {item.display}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={24}>
            <Col md={24}>
              <Form.Item
                label="Biên bản sàn"
                name="channel_id"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng chọn kiểu biên bản",
                  },
                ]}
              >
                <Select
                  className="select-with-search"
                  showSearch
                  allowClear
                  style={{ width: "100%" }}
                  placeholder="Chọn kiểu biên bản"
                  notFoundContent="Không tìm thấy kết quả"
                  onChange={(value?: number) => {}}
                  filterOption={(input, option) => {
                    if (option) {
                      return option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0;
                    }
                    return false;
                  }}
                >
                  <Select.Option key={-1} value={-1}>
                    Biên bản tự tạo
                  </Select.Option>
                  {listChannels.map((item, index) => (
                    <Select.Option key={index.toString()} value={item.id}>
                      {item.name}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={24}>
            <Col md={24}>
              <Form.Item label="Mô tả:" name="note">
                <TextArea
                  rows={4}
                  className="select-with-search"
                  style={{ width: "100%" }}
                  placeholder="Nhập mô tả"
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </>
  );
};

export default ReportHandOverModal;
