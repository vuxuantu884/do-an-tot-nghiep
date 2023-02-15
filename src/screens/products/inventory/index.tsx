import { Button, Card, Row, Space, Tabs } from "antd";
import exportIcon from "assets/icon/export.svg";
import ContentContainer from "component/container/content.container";
import RenderTabBar from "component/table/StickyTabBar";
import UrlConfig, { InventoryTabUrl } from "config/url.config";
import { StoreResponse } from "model/core/store.model";
import { DefectFilterEnum } from "model/inventory-defects/filter";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useHistory, useRouteMatch } from "react-router";
import { getAllPublicSimpleStoreApi } from "service/core/store.service";
import { callApiNative } from "utils/ApiUtils";
import { generateQuery } from "utils/AppUtils";
import { getQueryParams, useQuery } from "utils/useQuery";
import AllTab from "./tab/all.tab";
import HistoryTab from "./tab/history.tab";

const { TabPane } = Tabs;

const InventoryScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>(InventoryTabUrl.ALL);
  const dispatch = useDispatch();
  const history = useHistory();
  const query = useQuery();
  const [loading, setLoading] = useState<boolean>(true);
  const [stores, setStores] = useState<Array<StoreResponse>>([]);
  const { path } = useRouteMatch();
  const [vExportProduct, setVExportProduct] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [vExportInventory, setVExportInventory] = useState(false);
  const [conditionFilter, setConditionFilter] = useState(null);
  const [storeIds, setStoreIds] = useState(null);

  useEffect(() => {
    let redirectUrl = path;
    if (redirectUrl) {
      const search = new URLSearchParams(history.location.search);
      let newPrams = { ...getQueryParams(search) };
      if (newPrams) redirectUrl += `?${generateQuery(newPrams)}`;

      switch (path) {
        case InventoryTabUrl.ALL:
          history.replace(redirectUrl);
          setActiveTab(InventoryTabUrl.ALL);
          break;
        case InventoryTabUrl.HISTORIES:
          if (conditionFilter) {
            newPrams = { ...newPrams, condition: conditionFilter };
          }
          if (storeIds) {
            newPrams = { ...newPrams, store_ids: storeIds };
          }
          redirectUrl = `?${generateQuery(newPrams)}`;
          history.replace(redirectUrl);
          setActiveTab(InventoryTabUrl.HISTORIES);
          break;
      }
    }
  }, [history, path, conditionFilter, storeIds]);

  const getAllStores = async () => {
    callApiNative({ isShowLoading: false }, dispatch, getAllPublicSimpleStoreApi).then((res) => {
      setStores(res);
    });
  };

  useEffect(() => {
    setLoading(false);
    getAllStores();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <ContentContainer
      isLoading={loading}
      title="Danh sách tồn kho"
      breadcrumb={[
        {
          name: "Kho hàng",
          path: `${UrlConfig.INVENTORY}`,
        },
        {
          name: "Danh sách tồn kho",
        },
      ]}
      extra={
        activeTab === InventoryTabUrl.HISTORIES ? (
          <Row>
            <Space>
              <Button
                className="light"
                size="large"
                icon={<img src={exportIcon} style={{ marginRight: 8 }} alt="" />}
                onClick={() => {
                  setVExportProduct(true);
                }}
              >
                Xuất file
              </Button>
            </Space>
          </Row>
        ) : (
          <Row>
            <Space>
              <Button
                title="Xuất tồn cửa hàng: hiển thị excel các cửa hàng được chọn theo dạng cột"
                className="light"
                size="large"
                icon={<img src={exportIcon} style={{ marginRight: 8 }} alt="" />}
                onClick={() => {
                  setShowExportModal(true);
                }}
              >
                Xuất tồn CH
              </Button>
              <Button
                title="Xuất tồn chi tiết: hiển thị excel như trên giao diện"
                className="light"
                size="large"
                icon={<img src={exportIcon} style={{ marginRight: 8 }} alt="" />}
                onClick={() => {
                  setVExportInventory(true);
                }}
              >
                Xuất tồn chi tiết
              </Button>
            </Space>
          </Row>
        )
      }
    >
      <Card style={{ padding: 0 }} className="card-tab">
        <Tabs style={{ overflow: "initial" }} activeKey={activeTab} renderTabBar={RenderTabBar}>
          <TabPane
            tab={
              <span
                onClick={() => {
                  const queryParams = generateQuery({
                    store_ids: query.get(DefectFilterEnum.store_ids),
                    info: query.get(DefectFilterEnum.condition),
                  });
                  history.push(InventoryTabUrl.ALL + "?" + queryParams);
                }}
              >
                Tồn kho
              </span>
            }
            key={InventoryTabUrl.ALL}
          >
            <AllTab
              showExportModal={showExportModal}
              setShowExportModal={setShowExportModal}
              vExportInventory={vExportInventory}
              setVExportInventory={setVExportInventory}
              stores={stores}
              current={activeTab}
              setConditionFilter={setConditionFilter}
              setStoreIds={setStoreIds}
            />
          </TabPane>

          <TabPane
            tab={
              <span
                onClick={() => {
                  const queryParams = generateQuery({
                    store_ids: query.get(DefectFilterEnum.store_ids),
                    condition: query.get(DefectFilterEnum.info),
                  });
                  history.push(InventoryTabUrl.HISTORIES + "?" + queryParams);
                }}
              >
                Lịch sử tồn kho
              </span>
            }
            key={InventoryTabUrl.HISTORIES}
          >
            <HistoryTab
              vExportProduct={vExportProduct}
              setVExportProduct={setVExportProduct}
              stores={stores}
              current={activeTab}
            />
          </TabPane>
        </Tabs>
      </Card>
    </ContentContainer>
  );
};

export default InventoryScreen;
