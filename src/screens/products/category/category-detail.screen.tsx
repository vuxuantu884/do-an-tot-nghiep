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
import { convertCategory } from "utils/AppUtils";
import { callApiNative } from "utils/ApiUtils";
import { categoryDetailApi, getCategoryApi } from "service/product/category.service";
import { CategoryResponse } from "model/product/category.model";
import RowDetail from "../product/component/RowDetail";
import { ConvertUtcToLocalDate, DATE_FORMAT } from "utils/DateUtils";

interface CategoryParam {
  id: string;
}

const CategoryDetailScreen: React.FC = () => {
  const history = useHistory();
  const { id } = useParams<CategoryParam>();
  const idNumber = parseInt(id);
  const dispatch = useDispatch();
  const [error, setError] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [data, setData] = useState<CategoryResponse | null>(null);
  const [categories, setCategories] = useState<Array<CategoryResponse>>([]);

  const convertDepTree = useCallback((item: CategoryResponse): Array<DataNode> => {
    let arr = [] as Array<DataNode>;
    let node;
    node = {
      title: item.name,
      key: item.id,
    };

    if (item.children.length > 0) {
      let childs = [] as Array<DataNode>;
      item.children.forEach((i) => {
        const c = convertDepTree(i);
        childs = [...childs, ...c];
      });
      node = { ...node, children: childs };
    }
    arr.push(node);
    return arr;
  }, []);

  const dataChildren = useMemo(() => {
    let dataNode: Array<DataNode> = [];
    if (data !== null) {
      data.children &&
        data.children.length > 0 &&
        data.children.forEach((item) => {
          const temp = convertDepTree(item);
          dataNode = [...dataNode, ...temp];
        });
    }
    return dataNode;
  }, [data, convertDepTree]);

  //phân quyền
  const [allowUpdateCat] = useAuthorization({
    acceptPermissions: [ProductPermission.categories_update],
    not: false,
  });

  const convertToCategoryName = (parentId: number) => {
    if (categories.length === 0) return "";

    const category = categories.find((i) => i.id === parentId);

    return category ? category.name : "";
  };

  const getCategoryById = useCallback(
    async (id: number) => {
      setLoading(true);
      const res = await callApiNative({ isShowLoading: false }, dispatch, categoryDetailApi, id);
      setLoading(false);
      if (res) {
        setData(res);
      } else {
        setError(true);
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
      title={data?.name ?? ""}
      isError={error}
      isLoading={loading}
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
          name: data !== null ? data.name : "",
        },
      ]}
    >
      {data !== null && (
        <React.Fragment>
          <Row gutter={24}>
            <Col md={16} span={16}>
              <Card title="Thông tin danh mục">
                <Row gutter={50}>
                  <Col span={24}>
                    <RowDetail title="Mã danh mục" value={data.code} />
                  </Col>
                  <Col span={24}>
                    <RowDetail title="Tên danh mục" value={data.name} />
                  </Col>
                  <Col span={24}>
                    <RowDetail title="Danh mục cha" value={convertToCategoryName(data.parent_id)} />
                  </Col>
                  <Col span={24}>
                    <RowDetail title="Cấp danh mục" value={data.level} />
                  </Col>
                  <Col span={24}>
                    <RowDetail
                      title="Người tạo"
                      value={
                        <Link target="_blank" to={`${UrlConfig.ACCOUNTS}/${data.created_by}`}>
                          {data.updated_by} - {data.created_name}
                        </Link>
                      }
                    />
                  </Col>
                  <Col span={24}>
                    <RowDetail
                      title="Ngày tạo"
                      value={ConvertUtcToLocalDate(data.created_date, DATE_FORMAT.DDMMYYY)}
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
                  treeData={dataChildren}
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
            {allowUpdateCat ? (
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
