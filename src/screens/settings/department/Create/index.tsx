import { Button, Card, Col, Form, Input, Row, Select, Space, TreeSelect } from "antd";
import BottomBarContainer from "component/container/bottom-bar.container";
import ContentContainer from "component/container/content.container";
import UrlConfig from "config/url.config";
import { AccountSearchAction } from "domain/actions/account/account.action";
import {
  departmentCreateAction,
  searchDepartmentAction,
} from "domain/actions/account/department.action";
import { AccountResponse, AccountSearchQuery } from "model/account/account.model";
import { DepartmentRequest, DepartmentResponse } from "model/account/department.model";
import { PageResponse } from "model/base/base-metadata.response";
import React, { useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useHistory } from "react-router";
import { DepartmentsPermissions } from "config/permissions/account.permisssion";
import useAuthorization from "hook/useAuthorization";
import TreeDepartment from "../component/TreeDepartment";
import AccountSearchSelect from "component/custom/select-search/account-select";
import { RegUtil } from "utils/RegUtils";
import ModalConfirm, { ModalConfirmProps } from "component/modal/ModalConfirm";

const DepartmentCreateScreen: React.FC = () => {
  const history = useHistory();
  const dispatch = useDispatch();
  const [departments, setDepartment] = useState<Array<DepartmentResponse>>([]);
  const [, setAccounts] = useState<PageResponse<AccountResponse>>({
    metadata: {
      limit: 20,
      page: 1,
      total: 0,
    },
    items: [],
  });
  const [loading, setLoading] = useState<boolean>(false);
  //phân quyền
  const [allowCreateDep] = useAuthorization({
    acceptPermissions: [DepartmentsPermissions.CREATE],
  });

  const levels = [1, 2, 3, 4, 5, 6, 7];

  const [modalConfirm, setModalConfirm] = useState<ModalConfirmProps>({
    visible: false,
  });
  const [isShowModalConfirm, setIsShowModalConfirm] = useState(false);

  const searchAccount = useCallback(
    (query: AccountSearchQuery, paging: boolean) => {
      dispatch(
        AccountSearchAction({ ...query, limit: 20 }, (result) => {
          if (result) {
            setAccounts(result);
          }
        }),
      );
    },
    [dispatch],
  );

  const onFinish = useCallback(
    (value: DepartmentRequest) => {
      setLoading(true);
      value.status = "active";
      value.name = value.name?.trim();
      dispatch(
        departmentCreateAction(value, (result) => {
          setLoading(false);
          if (result) {
            history.push(`${UrlConfig.DEPARTMENT}/${result.id}`);
          }
        }),
      );
    },
    [dispatch, history],
  );

  const backAction = () => {
    setModalConfirm({
      visible: true,
      onCancel: () => {
        setModalConfirm({ visible: false });
      },
      onOk: () => {
        history.push(UrlConfig.DEPARTMENT);
      },
      title: "Bạn có muốn quay lại?",
      subTitle: "Sau khi quay lại thay đổi sẽ không được lưu.",
    });
  };

  useEffect(() => {
    searchAccount({}, false);
    dispatch(
      searchDepartmentAction((result) => {
        if (result) {
          setDepartment(result);
        }
      }),
    );
  }, [dispatch, searchAccount]);
  return (
    <ContentContainer
      title="Quản lý phòng ban"
      breadcrumb={[
        {
          name: "Tổng quan",
          path: UrlConfig.HOME,
        },
        {
          name: "Quản lý phòng ban",
          path: UrlConfig.DEPARTMENT,
        },
        {
          name: "Thêm mới",
        },
      ]}
    >
      <Form onFinish={onFinish} layout="vertical">
        <Card title="Thông tin phòng ban">
          <Form.Item name="status" hidden>
            <Input />
          </Form.Item>
          <Row gutter={50}>
            <Col span={8}>
              <Form.Item
                rules={[
                  {
                    required: true,
                    message: "Vui lòng nhập tên phòng ban",
                  },
                ]}
                label="Tên phòng ban"
                name="name"
              >
                <Input maxLength={255} placeholder="Tên phòng ban" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="level" label="Cấp độ">
                <Select placeholder="Chọn cấp độ">
                  {levels.map((item) => {
                    return <Select.Option value={item}>{item}</Select.Option>;
                  })}
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={50}>
            <Col span={8}>
              <AccountSearchSelect name="manager_code" label="Quản lý" />
            </Col>
            <Col span={8}>
              <Form.Item name="parent_id" label="Thuộc về phòng ban">
                <TreeSelect
                  placeholder="Chọn phòng ban"
                  treeDefaultExpandAll
                  className="selector"
                  allowClear
                  showSearch
                  treeNodeFilterProp="title"
                >
                  {departments.map((item, index) => (
                    <React.Fragment key={index}>{TreeDepartment(item)}</React.Fragment>
                  ))}
                </TreeSelect>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={50}>
            <Col span={8}>
              <Form.Item
                name="phone"
                label="Số điện thoại"
                rules={[
                  {
                    pattern: RegUtil.PHONE,
                    message: "Số điện thoại không đúng định dạng",
                  },
                ]}
              >
                <Input placeholder="Nhập số điện thoại" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="address" label="Địa chỉ liên hệ">
                <Input maxLength={255} placeholder="Địa chỉ liên hệ" />
              </Form.Item>
            </Col>
          </Row>
        </Card>
        <BottomBarContainer
          back="Quay lại trang danh sách"
          backAction={backAction}
          rightComponent={
            <Space>
              {allowCreateDep && (
                <Button loading={loading} htmlType="submit" type="primary">
                  Tạo phòng ban
                </Button>
              )}
            </Space>
          }
        />
      </Form>
      <ModalConfirm
        onCancel={() => {
          setIsShowModalConfirm(false);
        }}
        onOk={() => {
          history.push(UrlConfig.DEPARTMENT);
        }}
        visible={isShowModalConfirm}
      />
      <ModalConfirm {...modalConfirm} />
    </ContentContainer>
  );
};

export default DepartmentCreateScreen;
