import {
  Card,
  Row,
  Col,
  AutoComplete,
  Button,
  Form,
  Tooltip,
  Input,
  Select,
} from "antd";
import CustomFilter from "component/table/custom.filter";

import BaseFilter from "../../component/filter/base.filter";
import { RootReducerType } from "model/reducers/RootReducerType";
import { SearchOutlined } from "@ant-design/icons";
import { StarOutlined } from "@ant-design/icons";

import ContentContainer from "component/container/content.container";
import CustomDatepicker from "component/custom/date-picker.custom";
import React from "react";
import Popup from "./popup";
import { useSelector } from "react-redux";
import CustomerAdd from "./add";
import ButtonCreate from "component/header/ButtonCreate";
import arrowDownloadRight from "../../assets/icon/arrow-download-right.svg";
import arrowDownloadDown from "../../assets/icon/arrow-download-down.svg";
import { FilterOutlined } from "@ant-design/icons";
import { RefSelectProps } from "antd/lib/select";

import UrlConfig from "config/UrlConfig";
import { useDispatch } from "react-redux";
import { CustomerList } from "domain/actions/customer/customer.action";
import { CustomerSearchQuery } from "model/query/customer.query";
import CustomTable, {
  ICustomTableColumType,
} from "component/table/CustomTable";
import { Link, useHistory } from "react-router-dom";
import { ConvertUtcToLocalDate } from "utils/DateUtils";
import { PageResponse } from "model/base/base-metadata.response";
import ModalSettingColumn from "component/table/ModalSettingColumn";
import FormItem from "antd/lib/form/FormItem";
import { AccountSearchAction } from "domain/actions/account/account.action";
import { AccountResponse, AccountSearchQuery } from "model/account/account.model";
import { MenuAction } from "component/table/ActionButton";

import {
  CustomerGroups,
  CustomerLevels,
  CustomerTypes,
} from "domain/actions/customer/customer.action";
import { CustomerResponse } from "model/response/customer/customer.response";

const { Option } = Select;

interface SearchResult {
  items: Array<any>;
  metadata?: any;
}

const Customer = () => {
  const dispatch = useDispatch();
  const history = useHistory();

  const bootstrapReducer = useSelector(
    (state: RootReducerType) => state.bootstrapReducer
  );
  const LIST_GENDER = bootstrapReducer.data?.gender;
  const params: CustomerSearchQuery = {
    request: "",
    page: 1,
    limit: 10,
    gender: null,
    from_birthday: null,
    to_birthday: null,
    company: null,
    from_wedding_date: null,
    to_wedding_date: null,
    customer_type_id: null,
    customer_group_id: null,
    customer_level_id: null,
    responsible_staff_code: null,
  };
  const [query, setQuery] = React.useState<CustomerSearchQuery>({
    page: 1,
    limit: 10,
    request: null,
    gender: null,
    from_birthday: null,
    to_birthday: null,
    company: null,
    from_wedding_date: null,
    to_wedding_date: null,
    customer_type_id: null,
    customer_group_id: null,
    customer_level_id: null,
    responsible_staff_code: "",
  });
  const [popup, setPopup] = React.useState({
    visible: false,
    x: 0,
    y: 0,
  });
  const [visible, setVisible] = React.useState<boolean>(false);
  const [visibleFilter, setVisibleFilter] = React.useState<boolean>(false);
  const [selected, setSelected] = React.useState<Array<CustomerResponse>>([]);

  const [columns, setColumn] = React.useState<
    Array<ICustomTableColumType<any>>
  >([
    
    {
      title: "STT",
      key: "index",
      render: (value:any, item:any, index:number) =>  <div>{index+1}</div>,
      visible: true,
      width: "5%"
    },
    {
      title: "Mã khách hàng",
      dataIndex: "code",
      visible: true,
      render: (value: string, i: any) => (
        <Link to={`/customers/${i.id}`}>{value}</Link>
      ),
      width: "10%"
    },
    {
      title: "Tên khách hàng",
      dataIndex: "full_name",
      visible: true,
      width: "20%"
    },
    {
      title: "Số điện thoại",
      dataIndex: "phone",
      visible: true,
      width: "15%"
    },
    {
      title: "Giới tính",
      dataIndex: "gender",
      render: (value:any, item:any) =>  <div>{LIST_GENDER?.filter(g => g.value == value)[0].name}</div>,
      visible: true,
      width: "5%"
    },
    {
      title: "Nhóm khách hàng",
      dataIndex: "customer_group",
      visible: true,
      width: "15%"
    },
    {
      title: "Thư điện tử",
      dataIndex: "email",
      visible: false,
      width: "15%"
    },

    {
      title: "Loại khách hàng",
      dataIndex: "customer_type",
      visible: false,
      width: "15%"
    },
    {
      title: "Nhân viên phụ trách",
      dataIndex: "responsible_staff_name",
      visible: true,
      width: "15%"
    },
    {
      title: "Hạng thẻ hiện tại",
      dataIndex: "customer_level",
      visible: true,
      width: "15%"
    },
    
    {
      title: "Người tạo",
      dataIndex: "created_by",
      visible: false,
      width: "15%"
    },
    {
      title: "Ngày tạo",
      dataIndex: "created_date",
      visible: false,
      width: "15%",
      render: (value: string) => <div>{ConvertUtcToLocalDate(value)}</div>,
    },
    {
      title: "Ngày sinh",
      dataIndex: "birthday",
      visible: false,
      width: "15%",
      render: (value: string) => <div>{ConvertUtcToLocalDate(value)}</div>,
    },
    {
      title: "Ngày cưới",
      dataIndex: "wedding_date",
      visible: false,
      width: "15%",
      render: (value: string) => <div>{ConvertUtcToLocalDate(value)}</div>,
    },
    {
      title: "website/facebook",
      dataIndex: "website",
      visible: false,
      width: "15%",
    },
    {
      title: "Ngày kích hoạt thẻ",
      dataIndex: "",
      visible: false,
      width: "15%",
    },
    {
      title: "Ngày hết hạn thẻ",
      dataIndex: "",
      visible: false,
      width: "15%",
    },
    {
      title: "Cửa hàng kích hoạt",
      dataIndex: "",
      visible: false,
      width: "15%",
    },
    {
      title: "Mã số thẻ",
      dataIndex: "",
      visible: false,
      width: "15%",
    },
    {
      title: "Đơn vị",
      dataIndex: "company",
      visible: false,
      width: "15%",
    },
    {
      title: "Điểm hiện tại",
      dataIndex: "",
      visible: false,
      width: "15%",
    },
  ]);

  const [data, setData] = React.useState<PageResponse<any>>({
    metadata: {
      limit: 30,
      page: 1,
      total: 0,
    },
    items: [],
  });
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

  const setResult = React.useCallback((result: PageResponse<any> | false) => {
    setTableLoading(false);
    if (!!result) {
      setData(result);
    }
  }, []);

  const [showSettingColumn, setShowSettingColumn] =
    React.useState<boolean>(false);

  React.useEffect(() => {
    dispatch(CustomerList(query, setResult));
  }, [dispatch, query, setResult]);

  const [accounts, setAccounts] = React.useState<Array<AccountResponse>>([]);

  const setDataAccounts = React.useCallback(
    (data: PageResponse<AccountResponse> | false) => {
      if (!data) {
        return;
      }
      setAccounts(data.items);
    },
    []
  );
  React.useEffect(() => {
    dispatch(AccountSearchAction({}, setDataAccounts));
  }, [dispatch, setDataAccounts]);

  const [groups, setGroups] = React.useState<Array<any>>([]);
  const [types, setTypes] = React.useState<Array<any>>([]);
  const [levels, setLevels] = React.useState<Array<any>>([]);
  React.useEffect(() => {
    dispatch(CustomerGroups(setGroups));
    dispatch(CustomerTypes(setTypes));
    dispatch(CustomerLevels(setLevels));
  }, [dispatch]);

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
  const [formAdvance] = Form.useForm();

  const onFilterClick = React.useCallback(() => {
    setVisibleFilter(false);
    formAdvance.submit();
  }, [formAdvance]);
  const onClearFilterAdvanceClick = React.useCallback(() => {
    formAdvance.setFieldsValue(params);
    setVisibleFilter(false);
    formAdvance.submit();
  }, [formAdvance, params]);
  const openFilter = React.useCallback(() => {
    setVisibleFilter(true);
  }, []);
  const onCancelFilter = React.useCallback(() => {
    setVisibleFilter(false);
  }, []);

  let value = formAdvance.getFieldValue("filter");

  const onSearch = (value: CustomerSearchQuery) => {
    const querySearch: CustomerSearchQuery = value;
    dispatch(CustomerList(querySearch, setData));
  };

  const initQueryAccount: AccountSearchQuery = {
    info: ""
  };

  // const AccountRenderSearchResult = (item: AccountResponse) => {
  //   return (
  //     // <div className="rs-info w-100">
  //     <Row gutter={50}>
  //           <Col span={24}>
  //             <span style={{ color: "#737373" }}>{item.code + " - " + item.full_name}</span>
  //           </Col>
  //           </Row>
  //     // </div>
  //   );
  // };
  const [keySearchAccount, setKeySearchAccount] = React.useState("");

  const [resultSearch, setResultSearch] = React.useState<PageResponse<AccountResponse> | false>(false);

  const autoCompleteRef = React.createRef<RefSelectProps>();

  const AccountConvertResultSearch = React.useMemo(() => {
    let options: any[] = [];
    if(resultSearch)
    resultSearch.items.forEach((item: AccountResponse, index: number) => {
      options.push({
        label: item.code + " - " + item.full_name,
        value: item.code + " - " + item.full_name,
      });
    });
    return options;
  }, [dispatch, resultSearch]);


const AccountChangeSearch = React.useCallback(
    (value) => {
      setKeySearchAccount(value);
      initQueryAccount.info = value;
      dispatch(AccountSearchAction(initQueryAccount, setResultSearch));
    },
    [dispatch, initQueryAccount]
  );

  const SearchAccountSelect = React.useCallback(
    (value, o) => {
      let index: number = -1;
      if(resultSearch){
        console.log(resultSearch)
      index = resultSearch.items.findIndex(
        (accountResponse: AccountResponse) =>
        accountResponse.id && accountResponse.id.toString() === value
      );
      if (index !== -1) {
        console.log(index)

        setKeySearchAccount(resultSearch.items[index].code + "-" + resultSearch.items[index].full_name);
        autoCompleteRef.current?.blur();

      }
    }
    },
   [autoCompleteRef, dispatch, resultSearch]
  
  );


  const onFinish = (value: CustomerSearchQuery) => {
    value.responsible_staff_code = value.responsible_staff_code? value.responsible_staff_code.split(" - ")[0] : null
    onSearch(value);
  };

  const onSelect = (value: any, option: any) => {
    history.push(`/customers/${option.key}`);
  };

  const onSelectTable = React.useCallback((selectedRow: Array<CustomerResponse>) => {
    setSelected(selectedRow);
  }, []);

  const actions: Array<MenuAction> = [
    {
      id: 1,
      name: "Nhập file",
    },
    {
      id: 2,
      name: "Xuất file",
    },
  ];

  return (
    <ContentContainer
      title="Quản lý khách hàng"
      breadcrumb={[
        {
          name: "Tổng quan",
          path: UrlConfig.HOME,
        },
        {
          name: "Khách hàng",
          path: `/customer`,
        },
      ]}
      extra={
        <>            
          <ButtonCreate path={`/customers/create`} />
        </>
      }
    >
      <Card>
        <div className="padding-20">
        <CustomFilter menu={actions}>
            <Form onFinish={onFinish} initialValues={params} layout="inline">
                  <Form.Item name="request" >
                    <Input
                      
                      style={{width: "500px"}}
                      prefix={<SearchOutlined style={{ color: "#d4d3cf" }} />}
                      placeholder="Tên khách hàng, mã khách hàng , số điện thoại, email"
                    />
                  </Form.Item>
                 {/* style={{ display: "flex", justifyContent: "flex-end" }}> */}
                  <Form.Item>
                    <Button
                      type="primary"
                      htmlType="submit"
                    >
                      Lọc
                    </Button>
                  </Form.Item>

                  <Form.Item>
                    <Button onClick={openFilter}>Thêm bộ lọc</Button>
                  </Form.Item>

              
            </Form>
            
          </CustomFilter>
        
          {/* <Card style={{ position: "relative" }}> */}
            <CustomTable
              isRowSelection
              isLoading={tableLoading}
              onSelectedChange={onSelectTable}
              showColumnSetting={true}
              scroll={{ x: 1080 }}
              pagination={{
                pageSize: data.metadata.limit,
                total: data.metadata.total,
                current: data.metadata.page,
                showSizeChanger: true,
                onChange: onPageChange,
                onShowSizeChange: onPageChange,
              }}
              onShowColumnSetting={() => setShowSettingColumn(true)}
              dataSource={data.items}
              columns={columnFinal}
              rowKey={(item: any) => item.id}
            />
            <Popup {...popup} />
          </div>
          </Card>

        {visible && <CustomerAdd visible={visible} setVisible={setVisible} />}

      <BaseFilter
        onClearFilter={onClearFilterAdvanceClick}
        onFilter={onFilterClick}
        onCancel={onCancelFilter}
        visible={visibleFilter}
      >
        <Form
          form={formAdvance}
          onFinish={onFinish}
          //ref={formRef}
          initialValues={params}
          layout="vertical"
        >
          <Row gutter={50}>
            <Col span={24}>
              <Form.Item name="gender" label={<b>Giới tính:</b>}>
                <Select
                  showSearch
                  placeholder="Chọn giới tính"
                  allowClear
                  optionFilterProp="children"
                >
                  {LIST_GENDER &&
                    LIST_GENDER.map((c: any) => (
                      <Option key={c.value} value={c.value}>
                        {c.name}
                      </Option>
                    ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={50}>
            <Col span={24}>
              <Form.Item
                name="responsible_staff_code"
                label={<b>Nhân viên phụ trách:</b>}
              >
  
                <AutoComplete
              notFoundContent={
                keySearchAccount.length >= 3
                  ? "Không có bản ghi nào"
                  : undefined
              }
              id="search_account"
              value={keySearchAccount}
              ref={autoCompleteRef}
              onSelect={SearchAccountSelect}
              onSearch={AccountChangeSearch}
              options={AccountConvertResultSearch}
            >
              <Input
                placeholder="Chọn nhân viên phụ trách"
                // prefix={<SearchOutlined style={{ color: "#ABB4BD" }} />}
              />
            </AutoComplete>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={50}>
            <Col span={24}>
              <Form.Item
                name="customer_group_id"
                label={<b>Nhóm khách hàng:</b>}
              >
                <Select
                  showSearch
                  placeholder="Chọn nhóm khách hàng"
                  allowClear
                  optionFilterProp="children"
                >
                  {groups.map((group) => (
                    <Option key={group.id} value={group.id}>
                      {group.name + ` - ${group.code}`}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={50}>
            <Col span={12}>
              <Form.Item name="from_birthday" label="Ngày sinh từ">
                <CustomDatepicker placeholder="Ngày sinh từ" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Đến" name="to_birthday">
                <CustomDatepicker placeholder="Ngày sinh đến" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={50}>
            <Col span={12}>
              <Form.Item name="from_wedding_date" label="Ngày cưới từ">
                <CustomDatepicker placeholder="Ngày cưới từ" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Đến" name="to_wedding_date">
                <CustomDatepicker placeholder="Ngày cưới đến" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={50}>
            <Col span={24}>
              <Form.Item
                name="customer_level_id"
                label={<b>Hạng khách hàng:</b>}
              >
                <Select
                  showSearch
                  placeholder="Hạng khách hàng"
                  allowClear
                  optionFilterProp="children"
                >
                  {levels.map((level) => (
                    <Option key={level.id} value={level.id}>
                      {level.name + ` - ${level.code}`}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={50}>
            <Col span={24}>
              <Form.Item
                name="customer_type_id"
                label={<b>Loại khách hàng:</b>}
              >
                <Select
                  showSearch
                  placeholder="Loại khách hàng"
                  allowClear
                  optionFilterProp="children"
                >
                  {types.map((type) => (
                    <Option key={type.id} value={type.id}>
                      {type.name + ` - ${type.code}`}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </BaseFilter>
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