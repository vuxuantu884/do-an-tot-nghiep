import { PlusOutlined, SaveOutlined } from "@ant-design/icons";
import { Button, Card, FormInstance, Row, Select, Form } from "antd";
import React, {
  createRef,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
// import { useDispatch } from "react-redux";
import ReportHandOverModal from "../../modal/report-hand-over.modal";
import { OrderPackContext } from "contexts/order-pack/order-pack-context";
import {
  createGoodsReceipts,
  getGoodsReceiptsSerch,
  updateGoodsReceipts,
} from "domain/actions/goods-receipts/goods-receipts.action";
import { useDispatch } from "react-redux";
import { setPackInfo } from "utils/LocalStorageUtils";
import { GoodsReceiptsResponse } from "model/response/pack/pack.response";
import { GoodsReceiptsSearchQuery } from "model/query/goods-receipts.query";
import moment from "moment";
import { showSuccess, showWarning } from "utils/ToastUtils";
import { PageResponse } from "model/base/base-metadata.response";
import { PackModel, PackModelDefaltValue } from "model/pack/pack.model";
import { PackFulFillmentResponse } from "model/response/order/order.response";
import { ShipmentMethod } from "utils/Constants";

const initQueryGoodsReceipts: GoodsReceiptsSearchQuery = {
  limit: 5,
  page: 1,
  sort_column: "",
  sort_type: "",
  store_ids: null,
  delivery_service_ids: null,
  ecommerce_ids: null,
  good_receipt_type_ids: null,
  ids: null,
  order_codes: null,
  from_date: "",
  to_date: "",
};

const AddReportHandOver: React.FC = () => {
  const dispatch = useDispatch();

  //useState
  const [visibleModal, setVisibleModal] = useState(false);
  const formRef = createRef<FormInstance>();
  const [goodsReceiptsForm] = Form.useForm();
  const [listGoodsReceipts, setListGoodsReceipts] = useState<
    GoodsReceiptsResponse[]
  >([]);
  const [goodsReceipts, setGoodsReceipts] = useState<GoodsReceiptsResponse>();

  //Ref
  const goodsReceiptsRef = React.useRef<any>(null);

  //Context
  const orderPackContextData = useContext(OrderPackContext);
  const setPackModel = orderPackContextData?.setPackModel;
  const packModel = orderPackContextData?.packModel;
  const listStores = orderPackContextData.listStores;
  const listChannels = orderPackContextData.listChannels;
  const listThirdPartyLogistics = orderPackContextData.listThirdPartyLogistics;
  const listGoodsReceiptsType = orderPackContextData.listGoodsReceiptsType;
  const isFulFillmentPack = orderPackContextData?.isFulFillmentPack;
  const setIsFulFillmentPack = orderPackContextData?.setIsFulFillmentPack;

  const orderPackSuccess: PackFulFillmentResponse[] = useMemo(() => {
    return !packModel ? [] : !packModel?.order ? [] : packModel.order;
  }, [packModel])

  const handleOk = () => {
    goodsReceiptsForm.submit();
  };

  const handleCancel = () => {
    setVisibleModal(false);
  };

  const showModal = () => {
    setVisibleModal(true);
  };

  const handSubmit = useCallback(
    (value: any) => {
      let store_name = listStores.find(
        (data) => data.id === value.store_id
      )?.name;

      let ecommerce_name = "Biên bản đơn tự tạo";
      if (value !== -1) {
        let changeName = listChannels.find(
          (data) => data.id === value.ecommerce_id
        )?.name;
        ecommerce_name = changeName ? changeName : "Biên bản đơn tự tạo";
      }

      let delivery_service_name = listThirdPartyLogistics.find(
        (data) => data.id === value.delivery_service_id
      )?.name;
      let receipt_type_name = listGoodsReceiptsType.find(
        (data) => data.id === value.receipt_type_id
      )?.name;

      let param: any = {
        ...value,
        store_name: store_name,
        ecommerce_name: ecommerce_name,
        delivery_service_name: delivery_service_name,
        receipt_type_name: receipt_type_name,
        delivery_service_type: value.delivery_service_id === -1 ? ShipmentMethod.EMPLOYEE : ShipmentMethod.EXTERNAL_SHIPPER,
      };

      dispatch(
        createGoodsReceipts(param, (value: GoodsReceiptsResponse) => {
          if (value) {
            showSuccess("Thêm biên bản bàn giao thành công");
            setVisibleModal(false);
            goodsReceiptsForm.resetFields()

            setGoodsReceipts(value);

            const toDate = new Date();
            // Trừ đi 1 ngày
            const fromDate = new Date().setDate(toDate.getDate() - 1);

            initQueryGoodsReceipts.limit = 1000;
            initQueryGoodsReceipts.page = 1;
            initQueryGoodsReceipts.sort_type = "desc";
            initQueryGoodsReceipts.sort_column = "updated_date";
            initQueryGoodsReceipts.from_date = moment(fromDate).format("DD-MM-YYYY");
            initQueryGoodsReceipts.to_date = moment(toDate).format("DD-MM-YYYY");

            dispatch(
              getGoodsReceiptsSerch(initQueryGoodsReceipts, (data: PageResponse<GoodsReceiptsResponse>) => {
                setListGoodsReceipts(data.items);
              })
            );
          }
        })
      );
    },
    [
      dispatch,
      listGoodsReceiptsType,
      listStores,
      listThirdPartyLogistics,
      listChannels,
      goodsReceiptsForm
    ]
  );

  const handOrderAddGoodsReceipts = useCallback(() => {
    if (!goodsReceipts) {
      showWarning("Chưa chọn biên bản bàn giao");
      return;
    }

    if (orderPackSuccess.length <= 0) {
      showWarning("Chưa có đơn hàng đóng gói");
      return;
    }

    let selectOrderPackSuccess = orderPackSuccess?.filter((p) => isFulFillmentPack.some((single) => single === p.order_code));
    let notSelectOrderPackSuccess = orderPackSuccess?.filter((p) => !isFulFillmentPack.some((single) => single === p.order_code));
    // console.log("selectOrderPackSuccess", selectOrderPackSuccess);
    // console.log("notSelectOrderPackSuccess", notSelectOrderPackSuccess);
    if (!selectOrderPackSuccess || (selectOrderPackSuccess && selectOrderPackSuccess.length <= 0)) {
      showWarning("chưa chọn đơn hàng cần thêm vào biên bản");
      return;
    }

    let codes: any[] = [];

    goodsReceipts?.orders?.forEach((i) => {
      codes.push(i.code);
    });
    selectOrderPackSuccess?.forEach((i: any) => {
      codes.push(i.order_code);
    });

    let param: any = {
      ...goodsReceipts,
      codes: codes,
    };

    dispatch(
      updateGoodsReceipts(
        goodsReceipts.id,
        param,
        (value: GoodsReceiptsResponse) => {
          if (value) {
            setGoodsReceipts(value);
            //removePackInfo();

            let packData: PackModel = {
              ...new PackModelDefaltValue(),
              ...packModel,
              order: [...notSelectOrderPackSuccess]
            }
            console.log("packData", packData);

            setPackModel(packData);
            setPackInfo(packData);
            setIsFulFillmentPack([]);
            showSuccess("Thêm đơn hàng vào biên bản bàn giao thành công");
          }
        }
      )
    );
  }, [goodsReceipts, orderPackSuccess, dispatch, isFulFillmentPack, packModel, setPackModel, setIsFulFillmentPack]);

  useEffect(() => {
    const toDate = moment(new Date()).format("yyyy-MM-dd");
    // Trừ đi 1 ngày
    const fromDate =  moment(new Date().setDate(-1)).format("yyyy-MM-dd");

    initQueryGoodsReceipts.limit = 1000;
    initQueryGoodsReceipts.page = 1;
    //initQueryGoodsReceipts.sort_type = "desc";
    //initQueryGoodsReceipts.sort_column = "updated_date";
    initQueryGoodsReceipts.from_date = moment(fromDate,"yyyy-MM-dd'T'HH:mm:ss'Z'");
    initQueryGoodsReceipts.to_date = moment(toDate,"yyyy-MM-dd'T'HH:mm:ss'Z'");

    dispatch(
      getGoodsReceiptsSerch(initQueryGoodsReceipts, (data: PageResponse<GoodsReceiptsResponse>) => {
        setListGoodsReceipts(data.items);
      })
    );
  }, [dispatch]);

  const selectGoodsReceipts = useCallback(
    (value: number) => {
      let indexGoods = listGoodsReceipts.findIndex(
        (data: GoodsReceiptsResponse) => data.id === value
      );
      if (indexGoods !== -1) setGoodsReceipts(listGoodsReceipts[indexGoods]);
      else
        setGoodsReceipts(undefined);
    },
    [listGoodsReceipts]
  );
  return (
    <Card
      title="Cho vào biên bản bàn giao"
      bordered={false}
      className="pack-give-card"
    >
      <div className="yody-pack-row">
        <Row className="pack-give-card-row">
          <div className="pack-give-card-row-item" style={{ width: "35%" }}>
            <Select
              className="select-with-search"
              showSearch
              allowClear
              style={{ width: "100%" }}
              placeholder="Chọn biên bản"
              notFoundContent="Không tìm thấy kết quả"
              onChange={(value: number) => {
                selectGoodsReceipts(value);
              }}
              filterOption={(input, option) => {
                if (option) {
                  return (
                    option.children
                      .toLowerCase()
                      .indexOf(input.toLowerCase()) >= 0
                  );
                }
                return false;
              }}
              value={goodsReceipts?.id}
              ref={goodsReceiptsRef}
            >
              {listGoodsReceipts.map((item, index) => (
                <Select.Option key={index.toString()} value={item.id}>
                  {+item.delivery_service_id === -1 ? `${item.id} - ${item.store_name} - Tự giao hàng` : `${item.id} - ${item.store_name} - ${item.delivery_service_name}`} - {" "}
                  {``}
                  {item.receipt_type_name}- {item.ecommerce_name}
                </Select.Option>
              ))}
            </Select>
          </div>
          <Button
            icon={<PlusOutlined />}
            ghost
            type="primary"
            size="small"
            block
            onClick={showModal}
            className="pack-give-card-row-item"
            style={{ width: "145px" }}
          >
            Thêm mới
          </Button>
          <Button
            type="primary"
            icon={<SaveOutlined />}
            size="small"
            block
            onClick={handOrderAddGoodsReceipts}
            className="pack-give-card-row-item"
            style={{ width: "75px" }}
          >
            Lưu
          </Button>
        </Row>
      </div>
      <ReportHandOverModal
        visible={visibleModal}
        formRef={formRef}
        goodsReceiptsForm={goodsReceiptsForm}
        handSubmit={handSubmit}
        handleOk={handleOk}
        handleCancel={handleCancel}
      />
    </Card>
  );
};

export default AddReportHandOver;
