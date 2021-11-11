import { PlusSquareOutlined, SaveOutlined } from "@ant-design/icons";
import { Button, Card, Col, FormInstance, Row, Select, Form } from "antd";
import React, {
  createRef,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
// import { useDispatch } from "react-redux";
import ReportHandOverModal from "../modal/report-hand-over.modal";
import { OrderPackContext } from "contexts/order-pack/order-pack-context";
import {
  createGoodsReceipts,
  getGoodsReceiptsSerch,
  updateGoodsReceipts,
} from "domain/actions/goods-receipts/goods-receipts.action";
import { useDispatch } from "react-redux";
import { removePackInfo } from "utils/LocalStorageUtils";
import { GoodsReceiptsResponse } from "model/response/pack/pack.response";
import { GoodsReceiptsSearchQuery } from "model/query/goods-receipts.query";
import moment from "moment";
import { showWarning } from "utils/ToastUtils";

const initQueryGoodsReceipts: GoodsReceiptsSearchQuery = {
  limit: 5,
  page: 1,
  sort_column: "",
  sort_type: "",
  store_id: null,
  delivery_service_id: null,
  ecommerce_id: null,
  good_receipt_type_id: null,
  from_date: "",
  to_date: "",
};

const ReportHandOver: React.FC = () => {
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
  const data = orderPackContextData.data;
  const listStores = orderPackContextData.listStores;
  const listChannels = orderPackContextData.listChannels;
  const listThirdPartyLogistics = orderPackContextData.listThirdPartyLogistics;
  const listGoodsReceiptsType = orderPackContextData.listGoodsReceiptsType;
  const setData = orderPackContextData.setData;

  const handleOk = () => {
    goodsReceiptsForm.submit();
  };

  const handleCancel = () => {
    console.log("Clicked cancel button");
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
      };

      dispatch(
        createGoodsReceipts(param, (value: GoodsReceiptsResponse) => {
          console.log("createGoodsReceipts", value);
          setGoodsReceipts(value);
        })
      );
    },
    [
      dispatch,
      listGoodsReceiptsType,
      listStores,
      listThirdPartyLogistics,
      listChannels,
    ]
  );

  const handOrderAddGoodsReceipts = useCallback(() => {
    let codes: any[] = [];

    data.items.forEach(function (i: any) {
      codes.push(i.code);
    });

    if(!goodsReceipts)
    {
      showWarning("Chưa chọn biên bản bàn giao");
      return;
    }

    if(data.items.length<=0)
    {
      showWarning("Chưa có đơn hàng đóng gói");
      return;
    }

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
            removePackInfo();
            setData({
              metadata: {
                limit: 1,
                page: 1,
                total: 0,
              },
              items: [],
            });
          }
        }
      )
    );
  }, [dispatch, setData, data, goodsReceipts]);

  useEffect(() => {
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
      getGoodsReceiptsSerch(initQueryGoodsReceipts, setListGoodsReceipts)
    );
  }, [dispatch]);

  const selectGoodsReceipts = useCallback(
    (value: number) => {
      let indexGoods = listGoodsReceipts.findIndex(
        (data: GoodsReceiptsResponse) => data.id === value
      );
      if (indexGoods !== -1) setGoodsReceipts(listGoodsReceipts[indexGoods]);
    },
    [listGoodsReceipts]
  );
  return (
    <Card
      title="Cho vào biên bản bàn giao"
      bordered={false}
      style={{ paddingLeft: "18px", paddingRight: "18px" }}
    >
      <div>
        <Row gutter={24}>
          <Col md={8} sm={24}>
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
              ref={goodsReceiptsRef}
            >
              {listGoodsReceipts.map((item, index) => (
                <Select.Option key={index.toString()} value={item.id}>
                  {item.id}- {item.delivery_service_name}-{" "}
                  {item.receipt_type_name}- {item.ecommerce_name}
                </Select.Option>
              ))}
            </Select>
          </Col>
          <Col md={3}>
            <Button
              icon={<PlusSquareOutlined />}
              size="large"
              block
              onClick={showModal}
            >
              Thêm mới
            </Button>
          </Col>
          <Col md={2}>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              size="large"
              block
              onClick={handOrderAddGoodsReceipts}
            >
              Lưu
            </Button>
          </Col>
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

export default ReportHandOver;
