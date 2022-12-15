import { Button, Card, Col, Form, Input, Row, Select, Space, TreeSelect } from "antd";
import BottomBarContainer from "component/container/bottom-bar.container";
import ContentContainer from "component/container/content.container";
import AccountSearchSelect from "component/custom/select-search/account-select";
import ModalConfirm, { ModalConfirmProps } from "component/modal/ModalConfirm";
import { DepartmentsPermissions } from "config/permissions/account.permisssion";
import UrlConfig from "config/url.config";
import {
  departmentDetailAction,
  departmentUpdateAction,
  searchDepartmentAction,
} from "domain/actions/account/department.action";
import useAuthorization from "hook/useAuthorization";
import { DepartmentRequest, DepartmentResponse } from "model/account/department.model";
import React, { useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useHistory } from "react-router";
import { useParams } from "react-router-dom";
import { RegUtil } from "utils/RegUtils";

interface DepartmentParam {
  id: string;
}
const DepartmentUpdateScreen: React.FC = () => {
  const { id } = useParams<DepartmentParam>();
  const idNumber = parseInt(id);
  const history = useHistory();
  const dispatch = useDispatch();
  const [error, setError] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [departments, setDepartment] = useState<Array<DepartmentResponse>>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [data, setData] = useState<DepartmentResponse | null>(null);
  const [modalConfirm, setModalConfirm] = useState<ModalConfirmProps>({
    visible: false,
  });
  const [form] = Form.useForm();
  const [dataOrigin, setDataOrigin] = useState<DepartmentRequest | null>(null);

  //phân quyền
  const [allowUpdateDep] = useAuthorization({
    acceptPermissions: [DepartmentsPermissions.UPDATE],
    not: false,
  });

  const levels = [1, 2, 3, 4, 5, 6, 7];

  const onFinish = useCallback(
    (value: DepartmentRequest) => {
      setLoading(true);
      value.status = "active";
      dispatch(
        departmentUpdateAction(idNumber, value, (result) => {
          setLoading(false);
          if (result) {
            history.push(`${UrlConfig.DEPARTMENT}/${idNumber}`);
          }
        }),
      );
    },
    [dispatch, history, idNumber],
  );

  const backAction = () => {
    if (JSON.stringify(form.getFieldsValue()) !== JSON.stringify(dataOrigin)) {
      setModalConfirm({
        visible: true,
        onCancel: () => {
          setModalConfirm({ visible: false });
        },
        onOk: () => {
          setModalConfirm({ visible: false });
          history.goBack();
        },
        title: "Bạn có muốn quay lại?",
        subTitle: "Sau khi quay lại thay đổi sẽ không được lưu.",
      });
    } else {
      history.goBack();
    }
  };

  useEffect(() => {
    dispatch(
      searchDepartmentAction((result) => {
        if (result) {
          setDepartment(result);
          form.setFieldsValue(result);
          setDataOrigin(form.getFieldsValue());
        }
      }),
    );
  }, [form, dispatch]);

  useEffect(() => {
    setIsLoading(true);
    dispatch(
      departmentDetailAction(idNumber, (result) => {
        setIsLoading(false);
        if (result) {
          setData(result);
        } else {
          setError(true);
        }
      }),
    );
  }, [dispatch, idNumber]);
  return (
    <ContentContainer
      isError={error}
      isLoading={isLoading}
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
          name: data ? data.name : "",
          path: `${UrlConfig.DEPARTMENT}/${idNumber}`,
        },
        {
          name: "Cập nhật",
        },
      ]}
    >
      {data !== null && (
        <Form
          initialValues={{
            ...data,
            parent_id: data.parent_id === -1 ? null : data.parent_id,
          }}
          onFinish={onFinish}
          form={form}
          layout="vertical"
        >
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
                      message: "Vui lòng nhập mã phòng ban",
                    },
                  ]}
                  label="Mã phòng ban"
                  name="code"
                >
                  <Input disabled maxLength={13} placeholder="Nhập mã phòng ban" />
                </Form.Item>
              </Col>
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
            </Row>
            <Row gutter={50}>
              <Col span={8}>
                <AccountSearchSelect name="manager_code" label="Quản lý" form={form} />
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
            <Row gutter={50}>
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
          </Card>
          <BottomBarContainer
            back="Quay lại"
            backAction={backAction}
            rightComponent={
              <Space>
                {allowUpdateDep && (
                  <Button loading={loading} htmlType="submit" type="primary">
                    Lưu lại
                  </Button>
                )}
              </Space>
            }
          />
        </Form>
      )}
      <ModalConfirm {...modalConfirm} />
    </ContentContainer>
  );
};

const TreeDepartment = (item: DepartmentResponse) => {
  return (
    <TreeSelect.TreeNode value={item.id} title={item.name}>
      {item.children.length > 0 && (
        <React.Fragment>
          {item.children.map((item, index) => (
            <React.Fragment key={index}>{TreeDepartment(item)}</React.Fragment>
          ))}
        </React.Fragment>
      )}
    </TreeSelect.TreeNode>
  );
};

export default DepartmentUpdateScreen;
