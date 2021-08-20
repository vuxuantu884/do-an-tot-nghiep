import { Card, Row, Col, AutoComplete, Button } from "antd";
import ContentContainer from "component/container/content.container";
import React from "react";
import Popup from "./popup";
import CustomerAdd from "./add";
import ButtonCreate from "component/header/ButtonCreate";
import arrowDownloadRight from "../../assets/icon/arrow-download-right.svg";
import arrowDownloadDown from "../../assets/icon/arrow-download-down.svg";

import UrlConfig from "config/UrlConfig";
import { useDispatch } from "react-redux";
import { CustomerGroups, CustomerList, CustomerGroupList } from "domain/actions/customer/customer.action";
import { CustomerSearchQuery } from "model/query/customer.query";
import CustomTable, {
  ICustomTableColumType,
} from "component/table/CustomTable";
import { Link, useHistory } from "react-router-dom";
import { ConvertUtcToLocalDate } from "utils/DateUtils";
import { PageResponse } from "model/base/base-metadata.response";
import ModalSettingColumn from "component/table/ModalSettingColumn";
import { setgroups } from "process";
import { group } from "console";

interface SearchResult {
  items: Array<any>;
  metadata?: any;
}

const Customer = () => {
  const dispatch = useDispatch();
  const history = useHistory();
  const [query, setQuery] = React.useState<CustomerSearchQuery>({
    page: 1,
    limit: 10,
    request: "",
  });
  const [popup, setPopup] = React.useState({
    visible: false,
    x: 0,
    y: 0,
  });
  const [visible, setVisible] = React.useState<boolean>(false);
  const [columns, setColumn] = React.useState<
    Array<ICustomTableColumType<any>>
  >([
    {
      title: "Mã ",
      dataIndex: "code",
      render: (value: string, i: any) => (
        <Link to={`/customer_groups/${i.id}`}>{value}</Link>
      ),
      visible: true,
    },
    {
      title: "Tên nhóm khách hàng",
      dataIndex: "name",
      visible: true,
    },
    {
      title: "Người tạo",
      dataIndex: "created_by",
      visible: true,
    },
    {
      title: "Ngày tạo",
      dataIndex: "created_date",
      visible: true,

      render: (value: string) => <div>{ConvertUtcToLocalDate(value)}</div>,
    },
  ]);

  const [data, setData] = React.useState<Array<any>>([]);
  console.log(data);
  const [tableLoading, setTableLoading] = React.useState<boolean>(true);

  const [options, setOptions] = React.useState<SearchResult>({ items: [] });

  const onPageChange = React.useCallback(
    (page, limit) => {
      setQuery({ ...query, page, limit });
    },
    [query]
  );

  const columnFinal = React.useMemo(
    () => columns.filter((item) => item.visible === true),
    [columns]
  );

  const setResult = React.useCallback((result: Array<any> | false) => {
    setTableLoading(false);
    if (!!result) {
      setData(result);
    }
  }, []);
  const [showSettingColumn, setShowSettingColumn] =
    React.useState<boolean>(false);

  React.useEffect(() => {
    dispatch(CustomerGroups(setResult));
  }, [dispatch, setResult]);

  // const onRow = (record: any) => ({
  //   onContextMenu: (event: any) => {
  //     event.preventDefault();
  //     if (!popup.visible) {
  //       document.addEventListener(`click`, function onClickOutside() {
  //         setPopup({ ...popup, visible: false });
  //         document.removeEventListener(`click`, onClickOutside);
  //       });
  //     }

  //     setPopup({ visible: true, x: event.clientX, y: event.clientY });
  //   },
  // });

  const onSearch = (request: string) => {
    const querySearch: CustomerSearchQuery = { page: 1, limit: 15, request };
    dispatch(CustomerGroupList(querySearch, setOptions));
  };

  const onSelect = (value: any, option: any) => {
    history.push(`/customer/${option.key}`);
  };

  return (
    <ContentContainer
      title="Quản lý nhóm khách hàng"
      breadcrumb={[
        {
          name: "Tổng quan",
          path: UrlConfig.HOME,
        },
        {
          name: "Nhóm khách hàng",
          path: `/customers/customers-group`,
        },
      ]}
      extra={
        <>
          {/* <Button
            style={{
              padding: "0 25px",
              fontWeight: 400,
              marginRight: 14,
              height: 40,
              color: "#222222", 
            }}
            className="ant-btn-outline fixed-button cancle-button"
            onClick={() => window.location.reload()}
            icon={<img style={{ marginRight: 10}} src={arrowDownloadRight} />}
          >
            Nhập file
          </Button>
          <Button
            style={{
              padding: "0 25px",
              fontWeight: 400,
              height: 40,
              color: "#222222",
            }}
            className="ant-btn-outline fixed-button cancle-button"
            onClick={() => window.location.reload()}
            icon={<img style={{ marginRight: 10 }} src={arrowDownloadDown} />}
          >
            Xuất file
          </Button> */}
          <ButtonCreate path={`/customer_groups/create`} />
        </>
      }
    >
      <Row gutter={[12, 12]} style={{ padding: "5px 0" }}>
        <Col span={24}>
          <Card>
            <Row gutter={[10, 10]} style={{ padding: "5px 7px" }}>
              <Col span={5}>
                <AutoComplete
                  onSearch={onSearch}
                  onSelect={(value, option) => onSelect(value, option)}
                  allowClear={true}
                  notFoundContent="Không tìm thấy"
                  style={{ width: "100%" }}
                  placeholder="Mã tên nhóm khách hàng, Mã nhóm khách hàng"
                >
                  {/* <Input
                    prefix={<SearchOutlined style={{ color: "#d4d3cf" }} />}
                    placeholder="Tên khách hàng, số điện thoại,..."
                  /> */}
                  {options.items.map((item) => (
                    <AutoComplete.Option key={item.id} value={item.full_name}>
                      {item.full_name + ` - ${item.code}`}
                    </AutoComplete.Option>
                  ))}
                </AutoComplete>
                {/* <Input
                  prefix={<SearchOutlined style={{ color: "#d4d3cf" }} />}
                  placeholder="Tên khách hàng, số điện thoại,..."
                ></Input> */}
              </Col>
            </Row>
          </Card>
        </Col>

        <Col span={24}>
          <Card style={{ position: "relative" }}>
            <CustomTable
              isLoading={tableLoading}
              showColumnSetting={true}
              scroll={{ x: 1080 }}
              // pagination={{
              //   pageSize: data.metadata.limit,
              //   total: data.metadata.total,
              //   current: data.metadata.page,
              //   showSizeChanger: true,
              //   onChange: onPageChange,
              //   onShowSizeChange: onPageChange,
              // }}
              onShowColumnSetting={() => setShowSettingColumn(true)}
              dataSource={data}
              columns={columnFinal}
              rowKey={(item: any) => item.id}
            />
            <Popup {...popup} />
          </Card>
        </Col>
        {visible && <CustomerAdd visible={visible} setVisible={setVisible} />}
      </Row>
      <ModalSettingColumn
        visible={showSettingColumn}
        onCancel={() => setShowSettingColumn(false)}
        onOk={(data) => {
          setShowSettingColumn(false);
          setColumn(data);
        }}
        data={columns}
      />
    </ContentContainer>
  );
};

export default Customer;
