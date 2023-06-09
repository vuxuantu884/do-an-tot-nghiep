import { Button, Card, Col, Form, FormInstance, Input, Row, Select } from "antd";
import UrlConfig from "config/url.config";
import { getCategoryRequestAction } from "domain/actions/product/category.action";
import { sizeDetailAction, sizeUpdateAction } from "domain/actions/product/size.action";
import { SizeUpdateRequest } from "model/product/size.model";
import { CategoryResponse, CategoryView } from "model/product/category.model";
import { SizeDetail, SizeResponse } from "model/product/size.model";
import React, { createRef, useCallback, useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { useHistory, useParams } from "react-router-dom";
import { convertSizeResponeToDetail } from "utils/AppUtils";
import { backAction, convertCategory } from "screens/products/helper";
import ContentContainer from "component/container/content.container";
import { RegUtil } from "utils/RegUtils";
import { showSuccess } from "utils/ToastUtils";
import AuthWrapper from "component/authorization/AuthWrapper";
import { ProductPermission } from "config/permissions/product.permission";
import BottomBarContainer from "component/container/bottom-bar.container";
import ModalConfirm, { ModalConfirmProps } from "component/modal/ModalConfirm";

const { Option } = Select;

type SizeParam = {
  id: string;
};

const SizeUpdateScreen: React.FC = () => {
  const { id } = useParams<SizeParam>();
  const idNumber = parseInt(id);

  const [categories, setCategories] = useState<Array<CategoryView>>([]);
  const [size, setSize] = useState<SizeDetail | null>(null);
  const history = useHistory();
  const dispatch = useDispatch();
  const formRef = createRef<FormInstance>();
  const [isError, setIsError] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isLoadingData, setIsLoadingData] = useState<boolean>(true);
  const isFirstLoad = useRef(true);
  const [modalConfirm, setModalConfirm] = useState<ModalConfirmProps>({
    visible: false,
  });

  //Function callback
  const onSuccess = useCallback(() => {
    setIsLoading(false);
    history.push(UrlConfig.SIZES);
    showSuccess("Sửa kích cỡ thành công");
  }, [history]);

  const updateProductSize = useCallback(
    (values: SizeUpdateRequest) => {
      setIsLoading(true);
      dispatch(sizeUpdateAction(idNumber, values, onSuccess));
    },
    [dispatch, idNumber, onSuccess],
  );

  const setCategory = useCallback((data: Array<CategoryResponse>) => {
    let newData = convertCategory(data);
    setCategories(newData);
  }, []);

  const setSizeDetail = useCallback((data: SizeResponse | false) => {
    setIsLoadingData(false);
    if (!data) {
      setIsError(true);
    } else {
      let newData = convertSizeResponeToDetail(data);
      setSize(newData);
    }
  }, []);

  useEffect(() => {
    if (isFirstLoad.current) {
      dispatch(getCategoryRequestAction({}, setCategory));
      if (!Number.isNaN(idNumber)) {
        dispatch(sizeDetailAction(idNumber, setSizeDetail));
      }
      return () => {};
    }
    isFirstLoad.current = false;
  }, [dispatch, idNumber, setCategory, setSizeDetail]);

  return (
    <ContentContainer
      isLoading={isLoadingData}
      isError={isError}
      title="Sửa kích cỡ"
      breadcrumb={[
        {
          name: "Tổng quan",
          path: UrlConfig.HOME,
        },
        {
          name: "Sản phẩm",
          path: `${UrlConfig.PRODUCT}`,
        },
        {
          name: "Kích cỡ",
          path: `${UrlConfig.SIZES}`,
        },
        {
          name: "Sửa kích cỡ",
        },
      ]}
    >
      {size !== null && (
        <Form ref={formRef} onFinish={updateProductSize} initialValues={size} layout="vertical">
          <Card title="Thông tin cơ bản">
            <Row gutter={50}>
              <Col span={24} lg={8} md={12} sm={24}>
                <Form.Item hidden noStyle label="Kích cỡ" name="version">
                  <Input />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={50}>
              <Col span={24} lg={8} md={12} sm={24}>
                <Form.Item
                  rules={[
                    { required: true, message: "Vui lòng nhập kích cỡ" },
                    {
                      pattern: RegUtil.NO_SPECICAL_CHARACTER,
                      message: "Kích cỡ không chứa ký tự đặc biệt",
                    },
                  ]}
                  label="Kích cỡ"
                  name="code"
                  normalize={(value) => (value || "").toUpperCase()}
                >
                  <Input maxLength={3} placeholder="Nhập kích cỡ" size="large" />
                </Form.Item>
              </Col>
              <Col span={24} lg={8} md={12} sm={24}>
                <Form.Item
                  rules={[
                    {
                      required: true,
                      message: "Vui lòng chọn ít nhất 1 danh mục",
                    },
                  ]}
                  name="category_ids"
                  label="Danh mục"
                >
                  <Select
                    mode="multiple"
                    placeholder="Chọn danh mục"
                    showArrow
                    maxTagCount="responsive"
                  >
                    {categories.map((item) => (
                      <Option key={item.id} value={item.id}>
                        {item.name}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>
          </Card>
          <BottomBarContainer
            back={"Quay lại danh sách"}
            backAction={() => backAction(formRef.current?.getFieldsValue(), size, setModalConfirm, history, UrlConfig.CATEGORIES)}
            rightComponent={
              <AuthWrapper acceptPermissions={[ProductPermission.sizes_update]}>
                <Button loading={isLoading} htmlType="submit" type="primary">
                  Lưu lại
                </Button>
              </AuthWrapper>
            }
          />
        </Form>
      )}
      <ModalConfirm {...modalConfirm} />
    </ContentContainer>
  );
};

export default SizeUpdateScreen;
