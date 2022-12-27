import { Space, Button, Card, Col, Form, FormInstance, Input, Row, Select, TreeSelect } from "antd";
import { getCategoryRequestAction } from "domain/actions/product/category.action";
import { RootReducerType } from "model/reducers/RootReducerType";
import React, { createRef, useCallback, useLayoutEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { CategoryCreateRequest, CategoryResponse } from "model/product/category.model";
import ContentContainer from "component/container/content.container";
import UrlConfig, { BASE_NAME_ROUTER } from "config/url.config";
import { RegUtil } from "utils/RegUtils";
import BottomBarContainer from "component/container/bottom-bar.container";
import { callApiNative } from "utils/ApiUtils";
import { createCategoryApi } from "service/product/category.service";
import { capitalEachWords } from "utils/AppUtils";

const initialRequest: CategoryCreateRequest = {
  code: "",
  parent_id: -1,
  goods: "fashion",
  name: "",
};

const { TreeNode } = TreeSelect;

const AddCategory: React.FC = () => {
  const dispatch = useDispatch();
  const formRef = createRef<FormInstance>();
  const [categories, setCategories] = useState<Array<CategoryResponse>>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const goods = useSelector((state: RootReducerType) => state.bootstrapReducer.data?.goods);

  const createCategory = useCallback(
    async (values: CategoryCreateRequest) => {
      setIsLoading(true);
      const res = await callApiNative(
        { isShowLoading: false },
        dispatch,
        createCategoryApi,
        values,
      );
      setIsLoading(false);
      if (res) {
        window.location.href = `${BASE_NAME_ROUTER}${UrlConfig.CATEGORIES}`;
      }
    },
    [dispatch],
  );

  const changeCategoryName = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const name = capitalEachWords(e.target.value);
      formRef.current?.setFieldsValue({
        name: name,
      });
    },
    [formRef],
  );

  useLayoutEffect(() => {
    dispatch(getCategoryRequestAction({}, setCategories));
  }, [dispatch]);

  return (
    <ContentContainer
      title="Thêm mới danh mục"
      breadcrumb={[
        {
          name: "Sản phẩm",
          path: `${UrlConfig.PRODUCT}`,
        },
        {
          name: "Phân loại",
          path: UrlConfig.CATEGORIES,
        },
        {
          name: "Danh mục",
          path: `${UrlConfig.CATEGORIES}`,
        },
        {
          name: "Thêm danh mục",
        },
      ]}
    >
      <Form ref={formRef} onFinish={createCategory} initialValues={initialRequest} layout="vertical">
        <Card title="Thông tin cơ bản">
          <Row gutter={50}>
            <Col span={24} lg={8} md={12} sm={24}>
              <Form.Item
                rules={[
                  { required: true, message: "Vui lòng nhập tên danh mục" },
                  { max: 255, message: "Tên danh mục không quá 255 kí tự" },
                  {
                    pattern: RegUtil.STRINGUTF8,
                    message: "Tên danh mục không gồm kí tự đặc biệt",
                  },
                ]}
                label="Tên danh mục"
                name="name"
              >
                <Input placeholder="VD: Áo phông nữ" onChange={changeCategoryName} maxLength={255} />
              </Form.Item>
            </Col>
            <Col span={24} lg={8} md={12} sm={24}>
              <Form.Item
                rules={[
                  {
                    required: true,
                    message: "Vui lòng nhập chọn ngành hàng",
                  },
                ]}
                name="goods"
                label="Ngành hàng"
              >
                <Select autoClearSearchValue={false} placeholder="Ngành hàng" showSearch allowClear>
                  {goods?.map((item, index) => (
                    <Select.Option key={index} value={item.value}>
                      {item.name}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={50}>
            <Col span={24} lg={8} md={12} sm={24}>
              <Form.Item
                rules={[
                  { len: 3, message: "Mã danh mục gồm 3 kí tự" },
                  {
                    pattern: RegUtil.NO_SPECICAL_CHARACTER,
                    message: "Mã danh mục không chứa ký tự đặc biệt",
                  },
                ]}
                name="code"
                label="Mã danh mục"
                normalize={(value) => (value || "").toUpperCase()}
              >
                <Input maxLength={3} placeholder="VD: APN" />
              </Form.Item>
            </Col>
            <Col span={24} lg={8} md={12} sm={24}>
              <Form.Item name="parent_id" label="Danh mục cha">
                <TreeSelect
                  treeDefaultExpandAll
                  className="selector"
                  treeNodeFilterProp="title"
                  showSearch
                  allowClear
                  placeholder="Chọn danh mục cha"
                >
                  <TreeNode value={-1} title="Danh mục cha" />
                  {categories.map((item, index) => (
                    <React.Fragment key={index}>{TreeCategory(item)}</React.Fragment>
                  ))}
                </TreeSelect>
              </Form.Item>
            </Col>
          </Row>
        </Card>
        <BottomBarContainer
          back={"Quay lại danh sách"}
          rightComponent={
            <Space>
              <Button loading={isLoading} htmlType="submit" type="primary">
                Tạo danh mục
              </Button>
            </Space>
          }
        />
      </Form>
    </ContentContainer>
  );
};

const TreeCategory = (item: CategoryResponse) => {
  return (
    <TreeNode value={item.id} title={item.code ? `${item.code} - ${item.name}` : item.name}>
      {item.children.length > 0 && (
        <React.Fragment>
          {item.children.map((item, index) => (
            <React.Fragment key={index}>{TreeCategory(item)}</React.Fragment>
          ))}
        </React.Fragment>
      )}
    </TreeNode>
  );
};

export default AddCategory;
