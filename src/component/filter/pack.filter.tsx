import {
  Button,
  Col,
  DatePicker,
  Form,
  FormInstance,
  Input,
  Row,
  Collapse,
  Tag,
  Space,
  Dropdown,
  Menu,
  Select
} from "antd";

import {
  createRef,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useState,
} from "react";
import BaseFilter from "./base.filter";
import search from "assets/img/search.svg";
import {
  SettingOutlined,
  FilterOutlined,
  PlusOutlined,
  DownOutlined,
} from "@ant-design/icons";
import "./order.filter.scss";
import { OrderSearchQuery } from "model/order/order.model";
import moment from "moment";
import { MenuAction } from "component/table/ActionButton";
import { OrderPackContext } from "contexts/order-pack/order-pack-context";

const { Option } = Select;
const { Panel } = Collapse;
type PackFilterProps = {
  params: OrderSearchQuery;
  onMenuClick?: (index: number) => void;
  onFilter?: (values: OrderSearchQuery | Object) => void;
  onShowColumnSetting?: () => void;
  onClearFilter?: () => void;
};

const { Item } = Form;

const PackFilter: React.FC<PackFilterProps> = (props: PackFilterProps) => {
  const { params, onClearFilter, onShowColumnSetting } =
    props;
  const [visible, setVisible] = useState(false);

  const formRef = createRef<FormInstance>();
  const formSearchRef = createRef<FormInstance>();

  const orderPackContextData = useContext(OrderPackContext);
  const listThirdPartyLogistics = orderPackContextData.listThirdPartyLogistics;

  const actions: Array<MenuAction> = [
    {
      id: 1,
      name: "In phiếu giao hàng",
    },
    {
      id: 2,
      name: "In phiếu xuất kho",
    },
  ];

  const onFilterClick = useCallback(() => {
    setVisible(false);
    formRef.current?.submit();
  }, [formRef]);
  const openFilter = useCallback(() => {
    setVisible(true);
  }, []);
  const onCancelFilter = useCallback(() => {
    setVisible(false);
  }, []);


  const onChangeRangeDate = useCallback((dates, dateString, type) => {
    console.log(dates, dateString, type);
    switch (type) {
      case "issued":
        setIssuedClick("");
        setIssuedOnMin(dateString[0]);
        setIssuedOnMax(dateString[1]);
        break;
      default:
        break;
    }
  }, []);

  const onCloseTag = useCallback(
    (e, tag) => {
      e.preventDefault();
      //console.log('key', tag.key)
      //console.log('params', params);
      // switch(tag.key) {
      //   case 'store':
      //     onFilter && onFilter({...params, store_ids: []});
      //     break;
    },
    []
  );
  const [issuedClick, setIssuedClick] = useState("");

  const clickOptionDate = useCallback(
    (type, value) => {
      let minValue = null;
      let maxValue = null;

      switch (value) {
        case "today":
          minValue = moment().startOf("day").format("DD-MM-YYYY");
          maxValue = moment().endOf("day").format("DD-MM-YYYY");
          break;
        case "yesterday":
          minValue = moment()
            .startOf("day")
            .subtract(1, "days")
            .format("DD-MM-YYYY");
          maxValue = moment()
            .endOf("day")
            .subtract(1, "days")
            .format("DD-MM-YYYY");
          break;
        case "thisweek":
          minValue = moment().startOf("week").format("DD-MM-YYYY");
          maxValue = moment().endOf("week").format("DD-MM-YYYY");
          break;
        case "lastweek":
          minValue = moment()
            .startOf("week")
            .subtract(1, "weeks")
            .format("DD-MM-YYYY");
          maxValue = moment()
            .endOf("week")
            .subtract(1, "weeks")
            .format("DD-MM-YYYY");
          break;
        case "thismonth":
          minValue = moment().startOf("month").format("DD-MM-YYYY");
          maxValue = moment().endOf("month").format("DD-MM-YYYY");
          break;
        case "lastmonth":
          minValue = moment()
            .startOf("month")
            .subtract(1, "months")
            .format("DD-MM-YYYY");
          maxValue = moment()
            .endOf("month")
            .subtract(1, "months")
            .format("DD-MM-YYYY");
          break;
        default:
          break;
      }

      switch (type) {
        case "issued":
          if (issuedClick === value) {
            setIssuedClick("");
            setIssuedOnMin(null);
            setIssuedOnMax(null);
          } else {
            setIssuedClick(value);
            setIssuedOnMin(moment(minValue, "DD-MM-YYYY"));
            setIssuedOnMax(moment(maxValue, "DD-MM-YYYY"));
          }
          break;
        default:
          break;
      }
    },
    [issuedClick]
  );

  const initialValues = useMemo(() => {
    return {
      ...params,
      // store_ids: Array.isArray(params.store_ids) ? params.store_ids : [params.store_ids],
      // source_ids: Array.isArray(params.source_ids) ? params.source_ids : [params.source_ids],
      // order_status: Array.isArray(params.order_status) ? params.order_status : [params.order_status],
      // sub_status_id: Array.isArray(params.sub_status_id) ? params.sub_status_id : [params.sub_status_id],
      // fulfillment_status: Array.isArray(params.fulfillment_status) ? params.fulfillment_status : [params.fulfillment_status],
      // payment_status: Array.isArray(params.payment_status) ? params.payment_status : [params.payment_status],
      // return_status: Array.isArray(params.return_status) ? params.return_status : [params.return_status],
      // payment_method_ids: Array.isArray(params.payment_method_ids) ? params.payment_method_ids : [params.payment_method_ids],
      // delivery_provider_ids: Array.isArray(params.delivery_provider_ids) ? params.delivery_provider_ids : [params.delivery_provider_ids],
      // shipper_ids: Array.isArray(params.shipper_ids) ? params.shipper_ids : [params.shipper_ids],
      // tags: Array.isArray(params.tags) ? params.tags : [params.tags],
      // assignee_codes: Array.isArray(params.assignee_codes) ? params.assignee_codes : [params.assignee_codes],
      // account_codes: Array.isArray(params.account_codes) ? params.account_codes : [params.account_codes],
    };
  }, [params]);

  const [issuedOnMin, setIssuedOnMin] = useState(
    initialValues.issued_on_min
      ? moment(initialValues.issued_on_min, "DD-MM-YYYY")
      : null
  );
  const [issuedOnMax, setIssuedOnMax] = useState(
    initialValues.issued_on_max
      ? moment(initialValues.issued_on_max, "DD-MM-YYYY")
      : null
  );
 
  const onFinish = useCallback(
    (values) => {
      
    },
    []
  );

  let filters = useMemo(() => {
    let list: any = [];
    return list;
  }, []);

  useLayoutEffect(() => {
    if (visible) {
      formRef.current?.resetFields();
    }
  }, [formRef, visible]);

  return (
    <div>
      <div className="order-filter">
        <div className="page-filter">
          <div className="page-filter-heading">
            <div className="page-filter-left" style={{ width: "35%" }}>
              <Space size={12}>
                <Dropdown
                  overlayStyle={{ minWidth: "10rem" }}
                  overlay={
                    <Menu>
                      {actions &&
                        actions.map((item) => (
                          <Menu.Item
                            key={item.id}
                            onClick={() =>
                              props.onMenuClick && props.onMenuClick(item.id)
                            }
                          >
                            {item.name}
                          </Menu.Item>
                        ))}
                    </Menu>
                  }
                  trigger={["click"]}
                >
                  <Button className="action-button">
                    <div style={{ marginRight: 10 }}>Thao tác </div>
                    <DownOutlined />
                  </Button>
                </Dropdown>
              </Space>
              <Space size={12} style={{marginLeft: "10px"}}>
                <Button type="primary" icon={<PlusOutlined />}>
                  Thêm mới
                </Button>
              </Space>
            </div>
            <div className="page-filter-right" style={{ width: "65%" }}>
              <Space size={12}>
                <Form
                  onFinish={onFinish}
                  ref={formSearchRef}
                  initialValues={initialValues}
                  layout="inline"
                >
                  <Item name="search_term" style={{ width: "30%" }}>
                    <Input
                      prefix={<img src={search} alt="" />}
                      placeholder="ID Biên bản bàn giao"
                      onBlur={(e) => {
                        formSearchRef?.current?.setFieldsValue({
                          search_term: e.target.value.trim(),
                        });
                      }}
                    />
                  </Item>

                  <Item name="search_term" style={{ width: "30%" }}>
                    <Input
                      prefix={<img src={search} alt="" />}
                      placeholder="ID Đơn hàng"
                      onBlur={(e) => {
                        formSearchRef?.current?.setFieldsValue({
                          search_term: e.target.value.trim(),
                        });
                      }}
                    />
                  </Item>

                  <Item>
                    <Button type="primary" htmlType="submit">
                      Lọc
                    </Button>
                  </Item>
                  <Item>
                    <Button icon={<FilterOutlined />} onClick={openFilter}>
                      Thêm bộ lọc
                    </Button>
                  </Item>
                  <Button
                    icon={<SettingOutlined />}
                    onClick={onShowColumnSetting}
                  ></Button>
                </Form>
              </Space>
            </div>
          </div>
        </div>

        <BaseFilter
          onClearFilter={onClearFilter}
          onFilter={onFilterClick}
          onCancel={onCancelFilter}
          visible={visible}
          className="order-filter-drawer"
          width={500}
        >
          <Form
            onFinish={onFinish}
            ref={formRef}
            initialValues={params}
            layout="vertical"
          >
             <Row gutter={12} style={{marginTop: '10px'}}>
                <Col span={24}>
                  <Collapse>
                    <Panel header="Hãng vận chuyển" key="1" className="header-filter">
                      {/* <Item name="order_status"> */}
                      <Item>
                        <Select
                          mode="multiple"
                          showSearch placeholder="Chọn hãng vận chuyển"
                          notFoundContent="Không tìm thấy kết quả" style={{width: '100%'}}
                          getPopupContainer={trigger => trigger.parentNode}
                        >
                          {listThirdPartyLogistics.map((item, index) => (
                            <Select.Option key={index.toString()} value={item.id}>
                              {item.name}
                            </Select.Option>
                          ))}
                        </Select>
                      </Item>
                    </Panel>
                  </Collapse>
                </Col>
              </Row>

              <Row gutter={12} style={{marginTop: '10px'}}>
                <Col span={24}>
                  <Collapse>
                    <Panel header="Loại" key="1" className="header-filter">
                      {/* <Item name="order_status"> */}
                      <Item>
                        <Select
                          mode="multiple"
                          showSearch placeholder="Chọn Loại"
                          notFoundContent="Không tìm thấy kết quả" style={{width: '100%'}}
                          getPopupContainer={trigger => trigger.parentNode}
                        >
                          <Option value="jack">Jack</Option>
                          <Option value="lucy">Lucy</Option>
                        </Select>
                      </Item>
                    </Panel>
                  </Collapse>
                </Col>
              </Row>

              <Row gutter={12} style={{marginTop: '10px'}}>
                <Col span={24}>
                  <Collapse>
                    <Panel header="Kiểu biên bản" key="1" className="header-filter">
                      {/* <Item name="order_status"> */}
                      <Item>
                        <Select
                          mode="multiple"
                          showSearch placeholder="Chọn Kiểu biên bản"
                          notFoundContent="Không tìm thấy kết quả" style={{width: '100%'}}
                          getPopupContainer={trigger => trigger.parentNode}
                        >
  
                          <Option value="jack">Jack</Option>
                          <Option value="lucy">Lucy</Option>
                        </Select>
                      </Item>
                    </Panel>
                  </Collapse>
                </Col>
              </Row>

            <Row gutter={12} style={{ marginTop: "10px" }}>
              <Col span={24}>
                <Collapse
                  defaultActiveKey={
                    initialValues.issued_on_min && initialValues.issued_on_max
                      ? ["1"]
                      : []
                  }
                >
                  <Panel
                    header="NGÀY TẠO ĐƠN"
                    key="1"
                    className="header-filter"
                  >
                    <div className="date-option">
                      <Button
                        onClick={() => clickOptionDate("issued", "yesterday")}
                        className={
                          issuedClick === "yesterday" ? "active" : "deactive"
                        }
                      >
                        Hôm qua
                      </Button>
                      <Button
                        onClick={() => clickOptionDate("issued", "today")}
                        className={
                          issuedClick === "today" ? "active" : "deactive"
                        }
                      >
                        Hôm nay
                      </Button>
                      <Button
                        onClick={() => clickOptionDate("issued", "thisweek")}
                        className={
                          issuedClick === "thisweek" ? "active" : "deactive"
                        }
                      >
                        Tuần này
                      </Button>
                    </div>
                    <div className="date-option">
                      <Button
                        onClick={() => clickOptionDate("issued", "lastweek")}
                        className={
                          issuedClick === "lastweek" ? "active" : "deactive"
                        }
                      >
                        Tuần trước
                      </Button>
                      <Button
                        onClick={() => clickOptionDate("issued", "thismonth")}
                        className={
                          issuedClick === "thismonth" ? "active" : "deactive"
                        }
                      >
                        Tháng này
                      </Button>
                      <Button
                        onClick={() => clickOptionDate("issued", "lastmonth")}
                        className={
                          issuedClick === "lastmonth" ? "active" : "deactive"
                        }
                      >
                        Tháng trước
                      </Button>
                    </div>
                    <p>
                      <SettingOutlined style={{ marginRight: "10px" }} />
                      Tuỳ chọn khoảng thời gian:
                    </p>
                    <DatePicker.RangePicker
                      format="DD-MM-YYYY"
                      style={{ width: "100%" }}
                      value={[
                        issuedOnMin ? moment(issuedOnMin, "DD-MM-YYYY") : null,
                        issuedOnMax ? moment(issuedOnMax, "DD-MM-YYYY") : null,
                      ]}
                      onChange={(date, dateString) =>
                        onChangeRangeDate(date, dateString, "issued")
                      }
                    />
                  </Panel>
                </Collapse>
              </Col>
            </Row>
          </Form>
        </BaseFilter>
      </div>
      <div className="order-filter-tags">
        {filters &&
          filters.map((filter: any, index: number) => {
            return (
              <Tag
                key={index}
                className="tag"
                closable
                onClose={(e) => onCloseTag(e, filter)}
              >
                {filter.name}: {filter.value}
              </Tag>
            );
          })}
      </div>
    </div>
  );
};

export default PackFilter;
