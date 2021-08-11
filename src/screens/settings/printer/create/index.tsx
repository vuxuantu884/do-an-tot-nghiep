import { PlusOutlined } from "@ant-design/icons";
import { Button, Form, Input, Modal, Card, Row, Col, Select } from "antd";
import ContentContainer from "component/container/content.container";
import FormOrderProcessingStatus from "component/forms/FormOrderProcessingStatus";
import CustomModal from "component/modal/CustomModal";
import { ICustomTableColumType } from "component/table/CustomTable";
import CustomTable from "component/table/CustomTable";
import UrlConfig from "config/UrlConfig";
import {
  actionAddOrderProcessingStatus,
  actionDeleteOrderProcessingStatus,
  actionEditOrderProcessingStatus,
  actionFetchListOrderProcessingStatus,
} from "domain/actions/settings/order-processing-status.action";
import { modalActionType } from "model/modal/modal.model";
import { VariantResponse } from "model/product/product.model";
import { RootReducerType } from "model/reducers/RootReducerType";
import {
  OrderProcessingStatusModel,
  OrderProcessingStatusResponseModel,
} from "model/response/order-processing-status.response";
import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory, useLocation } from "react-router-dom";
import { generateQuery } from "utils/AppUtils";
import { StyledComponent } from "./styles";
import Checkbox from "antd/lib/checkbox/Checkbox";
import Editor from "./editor";

const SettingCreatePrinter: React.FC = () => {
  const [tableLoading, setTableLoading] = useState(false);
  const [isShowModal, setIsShowModal] = useState(false);
  const dispatch = useDispatch();
  const [listOrderProcessingStatus, setListOrderProcessingStatus] = useState<
    OrderProcessingStatusModel[]
  >([]);
  const useQuery = () => {
    return new URLSearchParams(useLocation().search);
  };
  const query = useQuery();
  const [total, setTotal] = useState(0);
  const [modalAction, setModalAction] = useState<modalActionType>("create");
  const [form] = Form.useForm();
  const [modalSingleServiceSubStatus, setModalSingleServiceSubStatus] =
    useState<OrderProcessingStatusModel | null>(null);

  const sprintConfigure = {
    danhSachMauIn: [
      {
        tenMauIn: "Đơn bán hàng 1",
      },
      {
        tenMauIn: "Đơn bán hàng 2",
      },
    ],
    danhSachChiNhanh: [
      {
        tenChiNhanh: "YODY Kho tổng 1",
      },
      {
        tenChiNhanh: "YODY Kho tổng 2",
      },
    ],
    danhSachkhoIn: [
      {
        tenKhoIn: "Khổ in K80 (80x45 mm) 1",
      },
      {
        tenKhoIn: "Khổ in K80 (80x45 mm) 2",
      },
    ],
  };
  const bootstrapReducer = useSelector(
    (state: RootReducerType) => state.bootstrapReducer
  );
  const LIST_STATUS = bootstrapReducer.data?.order_main_status;

  const history = useHistory();

  let [params, setParams] = useState({
    page: +(query.get("page") || 1),
    limit: +(query.get("limit") || 30),
    sort_type: "desc",
    sort_column: "id",
  });
  const onPageChange = useCallback(
    (page, size) => {
      params.page = page;
      params.limit = size;
      let queryParam = generateQuery(params);
      setParams({ ...params });
      history.replace(`${UrlConfig.ORDER_PROCESSING_STATUS}?${queryParam}`);
      window.scrollTo(0, 0);
    },
    [history, params]
  );

  const columns: Array<ICustomTableColumType<VariantResponse>> = [
    {
      title: "STT",
      visible: true,
      render: (value, row, index) => {
        return <span>{(params.page - 1) * params.limit + index + 1}</span>;
      },
    },
    {
      title: "Tên mẫu in",
      dataIndex: "sub_status",
      visible: true,
      className: "columnTitle",
      width: "25%",
      render: (value, row, index) => {
        if (value) {
          return (
            <span
              title={value}
              style={{ wordWrap: "break-word", wordBreak: "break-word" }}
              className="title text"
            >
              {value}
            </span>
          );
        }
      },
    },
    {
      title: "Chi nhánh áp dụng",
      dataIndex: "status",
      visible: true,
      width: "25%",
      render: (value, row, index) => {
        const result = LIST_STATUS?.find((singleStatus) => {
          return singleStatus.value === value;
        });
        if (result) {
          return result.name;
        }
        return "";
      },
    },
    {
      title: "Khổ in",
      dataIndex: "note",
      visible: true,
      width: "25%",
      render: (value, row, index) => {
        return (
          <span className="text" title={value} style={{ color: "#666666" }}>
            {value}
          </span>
        );
      },
    },
    {
      title: "Thao tác ",
      dataIndex: "active",
      visible: true,
      width: "25%",
      render: (value, row, index) => {
        if (value) {
          return <span style={{ color: "#27AE60" }}>Đang áp dụng</span>;
        }
        return <span style={{ color: "#E24343" }}>Ngưng áp dụng</span>;
      },
    },
  ];

  const initialFormValue = {};

  const columnFinal = () => columns.filter((item) => item.visible === true);

  const createPrinterHtml = () => {
    return (
      <Button
        type="primary"
        className="ant-btn-primary"
        size="large"
        onClick={() => {
          setModalAction("create");
          setIsShowModal(true);
        }}
        icon={<PlusOutlined />}
      >
        Thêm mẫu in
      </Button>
    );
  };

  const gotoFirstPage = () => {
    const newParams = {
      ...params,
      page: 1,
    };
    setParams({ ...newParams });
    let queryParam = generateQuery(newParams);
    history.replace(`${UrlConfig.ORDER_PROCESSING_STATUS}?${queryParam}`);
    window.scrollTo(0, 0);
  };

  const handleForm = {
    create: (formValue: OrderProcessingStatusModel) => {
      dispatch(
        actionAddOrderProcessingStatus(formValue, () => {
          setIsShowModal(false);
          gotoFirstPage();
        })
      );
    },
    edit: (formValue: OrderProcessingStatusModel) => {
      if (modalSingleServiceSubStatus) {
        dispatch(
          actionEditOrderProcessingStatus(
            modalSingleServiceSubStatus.id,
            formValue,
            () => {
              dispatch(
                actionFetchListOrderProcessingStatus(
                  params,
                  (data: OrderProcessingStatusResponseModel) => {
                    setListOrderProcessingStatus(data.items);
                  }
                )
              );
              setIsShowModal(false);
            }
          )
        );
      }
    },
    delete: () => {
      if (modalSingleServiceSubStatus) {
        dispatch(
          actionDeleteOrderProcessingStatus(
            modalSingleServiceSubStatus.id,
            () => {
              setIsShowModal(false);
              gotoFirstPage();
            }
          )
        );
      }
    },
  };

  useEffect(() => {
    /**
     * when dispatch action, call function (handleData) to handle data
     */
    dispatch(
      actionFetchListOrderProcessingStatus(
        params,
        (data: OrderProcessingStatusResponseModel) => {
          setListOrderProcessingStatus(data.items);
          setTotal(data.metadata.total);
        }
      )
    );
  }, [dispatch, params]);

  return (
    <StyledComponent>
      <ContentContainer
        title="Xử lý đơn hàng"
        breadcrumb={[
          {
            name: "Tổng quan",
            path: UrlConfig.HOME,
          },
          {
            name: "Cài đặt",
            path: UrlConfig.ACCOUNTS,
          },
          {
            name: "Danh sách mẫu in",
            path: UrlConfig.PRINTER,
          },
          {
            name: "Thêm mới mẫu in",
          },
        ]}
        extra={createPrinterHtml()}
      >
        printer
        <Form
          form={form}
          name="control-hooks"
          layout="vertical"
          initialValues={initialFormValue}
        >
          <Card style={{ padding: "35px 15px", marginBottom: 20 }}>
            <Row gutter={20}>
              <Col span={6}>
                <Form.Item name="name" label="Chọn mẫu in:">
                  <Select
                    placeholder="Chọn mẫu in"
                    // onChange={this.onGenderChange}
                    allowClear
                  >
                    {sprintConfigure.danhSachMauIn &&
                      sprintConfigure.danhSachMauIn.map((single, index) => {
                        return (
                          <Select.Option value={single.tenMauIn} key={index}>
                            {single.tenMauIn}
                          </Select.Option>
                        );
                      })}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item name="chiNhanh" label="Chọn chi nhánh áp dụng:">
                  <Select
                    placeholder="Chọn Chọn chi nhánh áp dụng:"
                    // onChange={this.onGenderChange}
                    allowClear
                  >
                    {sprintConfigure.danhSachChiNhanh &&
                      sprintConfigure.danhSachChiNhanh.map((single, index) => {
                        return (
                          <Select.Option value={single.tenChiNhanh} key={index}>
                            {single.tenChiNhanh}
                          </Select.Option>
                        );
                      })}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item name="khoIn" label="Chọn khổ in:">
                  <Select
                    placeholder="Chọn khổ in"
                    // onChange={this.onGenderChange}
                    allowClear
                  >
                    {sprintConfigure.danhSachkhoIn &&
                      sprintConfigure.danhSachkhoIn.map((single, index) => {
                        return (
                          <Select.Option value={single.tenKhoIn} key={index}>
                            {single.tenKhoIn}
                          </Select.Option>
                        );
                      })}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item name="active" valuePropName="checked">
                  <Checkbox>Đặt làm khổ in mặc định</Checkbox>
                </Form.Item>
              </Col>
            </Row>
          </Card>
        </Form>
        <Row gutter={20}>
          <Col span={12}>
            <Card style={{ padding: "35px 15px" }}>
              <Form.Item name="editor">
                <Editor />
              </Form.Item>
            </Card>
          </Col>

          <Col span={12}>
            <Card style={{ padding: "35px 15px" }}>Preview</Card>
          </Col>
        </Row>
      </ContentContainer>
    </StyledComponent>
  );
};

export default SettingCreatePrinter;
