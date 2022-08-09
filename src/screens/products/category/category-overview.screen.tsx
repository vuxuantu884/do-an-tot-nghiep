import { Card } from "antd";
import BottomBarContainer from "component/container/bottom-bar.container";
import ContentContainer from "component/container/content.container";
import UrlConfig from "config/url.config";
import React, { useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import ArrowRight from "assets/icon/arrow-left.svg";
import ArrowRightGray from "assets/icon/arrow-right-gray.svg";
import { convertCategory } from "utils/AppUtils";
import { useHistory } from "react-router-dom";
import "./index.scss";
import { callApiNative } from "utils/ApiUtils";
import { getCategoryApi } from "service/product/category.service";

const CategoryOverviewScreen: React.FC = () => {
  const dispatch = useDispatch();
  const history = useHistory();
  const [categories, setCategories] = useState<any>([]);
  const [selectedKeys, setSelectedKeys] = useState<any>([]);

  const backAction = () => {
    history.push(`${UrlConfig.CATEGORIES}`);
  };

  const getData = useCallback(async () => {
    const res = await callApiNative({ isShowLoading: false }, dispatch, getCategoryApi, {});
    if (res) {
      const newResult = convertCategory(res);

      const resultMap = new Map();
      newResult.forEach((i) => {
        if (resultMap.get(i.level)) {
          resultMap.get(i.level).push(i);
        } else {
          resultMap.set(i.level, [i]);
        }
      });

      setCategories(Object.fromEntries(resultMap));
    }
  }, [dispatch]);

  useEffect(() => {
    getData();
  }, [dispatch, getData]);

  const isExistEl = (id: number) => {
    if (selectedKeys.length === 0) return false;

    const selectedKeyFiltered = selectedKeys.filter((i: any) => i.id === id);

    return selectedKeyFiltered.length > 0;
  };

  const changeSelectedKeys = (key: number, parentId: number, level: number) => {
    let newSelectedKeys = [...selectedKeys];

    if (isExistEl(key)) {
      if (newSelectedKeys.length === 0) return;
      newSelectedKeys = newSelectedKeys.filter((i: any) => i.level < level);
    } else {
      newSelectedKeys = newSelectedKeys.filter((i) => i.level < level);
      newSelectedKeys = [
        ...newSelectedKeys,
        {
          id: key,
          parentId,
          level,
        },
      ];
    }

    setSelectedKeys(newSelectedKeys);
  };

  const goToCategoryDetail = (id: number) => {
    history.push(`${UrlConfig.CATEGORIES}/${id}`);
  };

  return (
    <ContentContainer
      title="Sơ đồ danh mục"
      breadcrumb={[
        {
          name: "Sản phẩm",
        },
        {
          name: "Danh mục",
          path: UrlConfig.CATEGORIES,
        },
        {
          name: "Sơ đồ danh mục",
        },
      ]}
    >
      <Card title="Danh mục sản phẩm tại YODY">
        <div className="category-tree">
          {Object.keys(categories).map((i: any) => {
            return (
              <div className="other-level">
                <div className="center level-text fixed-header">Cấp {Number(i) + 1}</div>
                {categories[i].map((d: any) => {
                  return (
                    <div
                      className={`cursor-p category-tree-level ${
                        isExistEl(d.id) || isExistEl(d.parent?.id)
                          ? `${isExistEl(d.id) ? "active" : ""}`
                          : d.level !== 0
                          ? "d-none"
                          : ""
                      }`}
                      onClick={() => goToCategoryDetail(d.id)}
                    >
                      <div className="text-left">{d.name}</div>
                      {d.isHaveChild && (
                        <img
                          onClick={(e) => {
                            e.stopPropagation();
                            d.isHaveChild && changeSelectedKeys(d.id, d.parent?.id, d.level);
                          }}
                          className="icon-right"
                          src={isExistEl(d.id) ? ArrowRight : ArrowRightGray}
                          alt=""
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </Card>
      <BottomBarContainer back="Quay lại trang danh sách" backAction={backAction} />
    </ContentContainer>
  );
};

export default CategoryOverviewScreen;
