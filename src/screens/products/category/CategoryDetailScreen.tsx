import { DownOutlined } from "@ant-design/icons";
import { Button, Card, Col, Row, Tree } from "antd";
import { DataNode } from "antd/lib/tree";
import BottomBarContainer from "component/container/bottom-bar.container";
import ContentContainer from "component/container/content.container";
import { ProductPermission } from "config/permissions/product.permission";
import UrlConfig from "config/url.config";
import useAuthorization from "hook/useAuthorization";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { Link, useHistory, useParams } from "react-router-dom";
import { convertCategory } from "screens/products/helper";
import { callApiNative } from "utils/ApiUtils";
import { categoryDetailApi, getCategoryApi } from "service/product/category.service";
import { CategoryResponse } from "model/product/category.model";
import RowDetail from "screens/products/product/component/RowDetail";
import { ConvertUtcToLocalDate, DATE_FORMAT } from "utils/DateUtils";

type CategoryParam = {
  id: string;
}

const CategoryDetailScreen: React.FC = () => {
  const history = useHistory();
  const { id } = useParams<CategoryParam>();
  const idNumber = parseInt(id);
  const dispatch = useDispatch();
  const [isError, setIsError] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [currentCategory, setCurrentCategory] = useState<CategoryResponse | null>(null);
  const [categories, setCategories] = useState<Array<CategoryResponse>>([]);

  const convertCategoryToTreeList = useCallback((category: CategoryResponse): Array<DataNode> => {
    const categoryNodeList = [] as Array<DataNode>;
    let node;
    node = {
      title: category.name,
      key: category.id,
    };

    if (category.children.length > 0) {
      let children = [] as Array<DataNode>;
      category.children.forEach((i) => {
        const c = convertCategoryToTreeList(i);
        children = [...children, ...c];
      });
      node = { ...node, children };
    }
    categoryNodeList.push(node);
    return categoryNodeList;
  }, []);

  const currentCategoryTree = useMemo(() => {
    let dataNode: Array<DataNode> = [];
    if (currentCategory !== null) {
      currentCategory.children &&
      currentCategory.children.length > 0 &&
      currentCategory.children.forEach((item) => {
          const temp = convertCategoryToTreeList(item);
          dataNode = [...dataNode, ...temp];
        });
    }
    return dataNode;
  }, [currentCategory, convertCategoryToTreeList]);

  //phân quyền
  const [canUpdateCategory] = useAuthorization({
    acceptPermissions: [ProductPermission.categories_update],
    not: false,
  });

  const convertToCategoryName = (parentId: number) => {
    if (categories.length === 0) return "";

    const category = categories.find((i) => i.id === parentId);

    return category && category.name ? category.name : "";
  };

  const getCategoryById = useCallback(
    async (id: number) => {
      setIsLoading(true);
      const res = await callApiNative({ isShowLoading: false }, dispatch, categoryDetailApi, id);
      setIsLoading(false);
      if (res) {
        setCurrentCategory(res);
      } else {
        setIsError(true);
      }
    },
    [dispatch],
  );

  const getCategories = useCallback(async () => {
    const res = await callApiNative({ isShowLoading: false }, dispatch, getCategoryApi, {});
    if (res) {
      const converted: any = convertCategory(res);
      setCategories(converted);
    }
  }, [dispatch]);

  useEffect(() => {
    getCategoryById(idNumber);
    getCategories();
  }, [getCategories, getCategoryById, idNumber]);

  return (
    <ContentContainer
      title={currentCategory?.name ?? ""}
      isError={isError}
      isLoading={isLoading}
      breadcrumb={[
        {
          name: "Sản phẩm",
          path: UrlConfig.PRODUCT,
        },
        {
          name: "Phân loại",
          path: UrlConfig.CATEGORIES,
        },
        {
          name: "Danh mục",
          path: UrlConfig.CATEGORIES,
        },
        {
          name: currentCategory !== null ? currentCategory.name : "",
        },
      ]}
    >
      {currentCategory !== null && (
        <React.Fragment>
          <Row gutter={24}>
            <Col md={16} span={16}>
              <Card title="Thông tin danh mục">
                <Row gutter={50}>
                  <Col span={24}>
                    <RowDetail title="Mã danh mục" value={currentCategory.code} />
                  </Col>
                  <Col span={24}>
                    <RowDetail title="Tên danh mục" value={currentCategory.name} />
                  </Col>
                  <Col span={24}>
                    <RowDetail title="Danh mục cha" value={convertToCategoryName(currentCategory.parent_id)} />
                  </Col>
                  <Col span={24}>
                    <RowDetail title="Cấp danh mục" value={currentCategory.level} />
                  </Col>
                  <Col span={24}>
                    <RowDetail
                      title="Người tạo"
                      value={
                        <Link target="_blank" to={`${UrlConfig.ACCOUNTS}/${currentCategory.created_by}`}>
                          {currentCategory.updated_by} - {currentCategory.created_name}
                        </Link>
                      }
                    />
                  </Col>
                  <Col span={24}>
                    <RowDetail
                      title="Ngày tạo"
                      value={ConvertUtcToLocalDate(currentCategory.created_date, DATE_FORMAT.DDMMYYY)}
                    />
                  </Col>
                </Row>
              </Card>
            </Col>
            <Col md={8} span={8}>
              <Card title="Sơ đồ danh mục">
                <Tree
                  showLine={{ showLeafIcon: false }}
                  defaultExpandAll
                  defaultSelectedKeys={["0-0-0"]}
                  switcherIcon={<DownOutlined />}
                  treeData={currentCategoryTree}
                />
              </Card>
            </Col>
          </Row>
        </React.Fragment>
      )}
      <BottomBarContainer
        back="Quay lại danh sách"
        rightComponent={
          <React.Fragment>
            {canUpdateCategory ? (
              <Button
                onClick={() => {
                  history.push(`${UrlConfig.CATEGORIES}/${idNumber}/update`);
                }}
                type="primary"
              >
                Sửa danh mục
              </Button>
            ) : (
              <></>
            )}
          </React.Fragment>
        }
      />
    </ContentContainer>
  );
};

export default CategoryDetailScreen;
