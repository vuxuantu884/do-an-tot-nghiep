import { ContainerOutlined, DeleteOutlined, FilterOutlined } from "@ant-design/icons";
import { Button, Col, DatePicker, Form, Input, Row, Select } from "antd";
import search from "assets/img/search.svg";
import { FilterWrapper } from "component/container/filter.container";
import ActionButton from "component/table/ActionButton";
import ButtonSetting from "component/table/ButtonSetting";
import TreeDepartment from "component/tree-node/tree-department";
import TreeStore from "component/TreeStore";
import { AccountPermissions } from "config/permissions/account.permisssion";
import { RoleSearchAction } from "domain/actions/auth/role.action";
import { StoreGetListAction } from "domain/actions/core/store.action";
import useAuthorization from "hook/useAuthorization";
import { AccountResponse, AccountSearchQuery } from "model/account/account.model";
import { DepartmentResponse } from "model/account/department.model";
import { PositionResponse } from "model/account/position.model";
import { RoleResponse, RoleSearchQuery } from "model/auth/roles.model";
import { PageResponse } from "model/base/base-metadata.response";
import { StoreByDepartment, StoreResponse } from "model/core/store.model";
import { RootReducerType } from "model/reducers/RootReducerType";
import moment from "moment";
import { useCallback, useEffect, useLayoutEffect, useMemo, useState } from "react";
import { CgArrowRight } from "react-icons/cg";
import { useDispatch, useSelector } from "react-redux";
import { FilterAccountAdvancedStyles } from "screens/settings/account/account.search.style";
import { ACTIONS_KEY_SELECT_ACCOUNT } from "screens/settings/account/AccountList/helper";
import { fullTextSearch } from "utils/StringUtils";
import BaseFilter from "./base.filter";

type AccountFilterProps = {
  params: AccountSearchQuery;
  listDepartment?: DepartmentResponse[] | undefined;
  listPosition?: Array<PositionResponse>;
  onMenuClick: (index: number) => void;
  onFilter?: (values: AccountSearchQuery) => void;
  onClearFilter?: () => void;
  onClickOpen?: () => void;
  selectedAccount: AccountResponse[];
};
const defaultRoleListParams: RoleSearchQuery = {
  page: 1,
  limit: 1000,
};
const AccountFilter: React.FC<AccountFilterProps> = (props: AccountFilterProps) => {
  const {
    params,
    listDepartment,
    listPosition,
    onClearFilter,
    onFilter,
    onClickOpen,
    selectedAccount,
    onMenuClick,
  } = props;

  const listStatus = useSelector((state: RootReducerType) => {
    return state.bootstrapReducer.data?.account_status;
  });

  const [visible, setVisible] = useState(false);
  const [listStore, setListStore] = useState<Array<StoreResponse>>();
  const [roleList, setRoleList] = useState<PageResponse<RoleResponse>>({
    metadata: {
      limit: 30,
      page: 1,
      total: 0,
    },
    items: [],
  });
  const dispatch = useDispatch();

  const [formRef] = Form.useForm();
  const onFinish = useCallback(
    (values: AccountSearchQuery) => {
      onFilter && onFilter(values);
    },
    [onFilter],
  );
  const onFilterClick = useCallback(() => {
    setVisible(false);
    formRef?.submit();
  }, [formRef]);

  const handleClearFilter = () => {
    formRef?.setFieldsValue({
      from_date: undefined,
      to_date: undefined,
      position_ids: undefined,
      mobile: undefined,
      role_ids: undefined,
      store_ids: undefined,
    });
    onClearFilter?.();
  };

  const openFilter = useCallback(() => {
    setVisible(true);
  }, []);
  const onCancelFilter = useCallback(() => {
    setVisible(false);
  }, []);

  const parseStringToDate = (date: string | undefined) => {
    return date ? moment(date) : undefined;
  };

  const onLoadRolesSuccess = useCallback((data: PageResponse<RoleResponse>) => {
    setRoleList(data);
  }, []);

  useLayoutEffect(() => {
    if (visible) {
      formRef?.resetFields();
    }
  }, [formRef, visible]);

  useEffect(() => {
    dispatch(
      StoreGetListAction((stores) => {
        setListStore(stores);
      }),
    );
    dispatch(RoleSearchAction(defaultRoleListParams, onLoadRolesSuccess));
  }, [dispatch, onLoadRolesSuccess]);

  //phân quyền
  const [allowDeleteAcc] = useAuthorization({
    acceptPermissions: [AccountPermissions.DELETE],
  });

  const actions = useMemo(() => {
    return [
      {
        id: ACTIONS_KEY_SELECT_ACCOUNT.RESET_PASSWORD,
        name: "Đặt lại mật khẩu",
        icon: <ContainerOutlined />,
        disabled: selectedAccount.length <= 0,
      },
      {
        id: ACTIONS_KEY_SELECT_ACCOUNT.DELETE,
        name: "Xóa",
        icon: <DeleteOutlined />,
        disabled: selectedAccount.length !== 1 && allowDeleteAcc,
      },
    ];
  }, [allowDeleteAcc, selectedAccount]);

  return (
    <div>
      <Form
        form={formRef}
        onFinish={onFinish}
        initialValues={{
          ...params,
          from_date: parseStringToDate(params?.from_date?.toString()),
          to_date: parseStringToDate(params?.to_date?.toString()),
        }}
        layout="inline"
      >
        <FilterWrapper>
          <ActionButton type="default" menu={actions} onMenuClick={onMenuClick} />
          <Form.Item name="info" className="search" style={{ minWidth: 200 }}>
            <Input prefix={<img src={search} alt="" />} placeholder="Tên/Mã nhân viên" />
          </Form.Item>

          <Form.Item name="department_ids">
            <TreeDepartment showArrow listDepartment={listDepartment} style={{ width: 250 }} />
          </Form.Item>
          <Form.Item name="status" style={{ minWidth: 220 }}>
            <Select showArrow placeholder="Trạng thái" allowClear>
              {listStatus?.map((item) => (
                <Select.Option key={item.value} value={item.value}>
                  {item.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Lọc
            </Button>
          </Form.Item>
          <Form.Item>
            <Button onClick={openFilter} icon={<FilterOutlined />}>
              Thêm bộ lọc
            </Button>
          </Form.Item>
          <Form.Item>
            <ButtonSetting onClick={onClickOpen} />
          </Form.Item>
        </FilterWrapper>
        {/* </Form> */}
        <BaseFilter
          onClearFilter={handleClearFilter}
          onFilter={onFilterClick}
          onCancel={onCancelFilter}
          visible={visible}
          width={396}
        >
          <FilterAccountAdvancedStyles>
            <div className="ant-form ant-form-vertical">
              <Row gutter={50}>
                <Col span={24}>
                  <Row className="filter-date">
                    <Form.Item
                      name="from_date"
                      label="Thời gian tạo từ"
                      className="filter-date__from"
                    >
                      <DatePicker placeholder="20/01/2021" format="DD/MM/YYYY" />
                    </Form.Item>
                    <CgArrowRight />
                    <Form.Item name="to_date" label="Đến" className="filter-date__from">
                      <DatePicker placeholder="25/01/2021" format="DD/MM/YYYY" />
                    </Form.Item>
                  </Row>
                </Col>
              </Row>
              <Row>
                <Col span={24}>
                  <Form.Item name="position_ids" label="Vị trí">
                    <Select
                      showArrow
                      placeholder="Vị trí"
                      allowClear
                      showSearch
                      filterOption={(input, option) => fullTextSearch(input, option?.children)}
                      maxTagCount="responsive"
                      mode="multiple"
                    >
                      {listPosition?.map((item) => (
                        <Select.Option key={item.id} value={item.id.toString()}>
                          {item.name}
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
              <Row>
                <Col span={24}>
                  <Form.Item name="mobile" label="Số điện thoại">
                    <Input placeholder="Số điện thoại" allowClear />
                  </Form.Item>
                </Col>
              </Row>
              <Row>
                <Col span={24}>
                  <Form.Item name="store_ids" label="Cửa hàng">
                    <TreeStore
                      storeByDepartmentList={listStore as unknown as StoreByDepartment[]}
                    />
                  </Form.Item>
                </Col>
              </Row>
              <Row>
                <Col span={24}>
                  <Form.Item name="role_ids" label="Nhóm quyền">
                    <Select
                      filterOption={(input, option) => fullTextSearch(input, option?.children)}
                      mode="multiple"
                      placeholder="Chọn nhóm quyền"
                      allowClear
                      showSearch
                      showArrow
                      maxTagCount={"responsive"}
                    >
                      {roleList.items.map((item) => (
                        <Select.Option key={item.id} value={item.id.toString()}>
                          {item.name}
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
            </div>
          </FilterAccountAdvancedStyles>
        </BaseFilter>
      </Form>
    </div>
  );
};

export default AccountFilter;
