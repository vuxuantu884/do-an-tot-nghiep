import { Card, List } from "antd";
import ContentContainer from "component/container/content.container";
import { Link, useRouteMatch } from "react-router-dom";
import { ListAnalyticsStyle } from "../analytics/index.style";
import { goodsReportsList } from "../common/constant/goods-reports/goods-reports-list";

function GoodsReports() {
  const templates = require.context("assets/icon/analytic", true, /\.(jpg|jpeg|png|svg)$/);
  const { path: matchPath } = useRouteMatch();

  return (
    <ContentContainer
      title={`Danh sách báo cáo hàng hoá`}
      breadcrumb={[{ name: "Báo cáo" }, { name: `Danh sách báo cáo hàng hoá` }]}
    >
      <ListAnalyticsStyle>
        <Card title={"BAOS Cáo hàng hoá"} className="template-report">
          <List
            grid={{ gutter: 16, xs: 1, sm: 2, md: 3, lg: 3, xl: 4, xxl: 5 }}
            dataSource={goodsReportsList || []}
            renderItem={(item, index) => {
              const { name, link, icon } = item;
              return (
                <Link to={`${matchPath}/${link}`} key={index}>
                  <List.Item className="pointer">
                    <div className={`template-report__card `}>
                      <div className="template-report__icon ">
                        <img src={templates(`./${icon}`)} alt={name} />
                      </div>
                      <div className="template-report__type">Báo cáo</div>
                      <div className="template-report__name"> {name.toUpperCase()} </div>
                    </div>
                  </List.Item>
                </Link>
              );
            }}
          />
        </Card>
      </ListAnalyticsStyle>
    </ContentContainer>
  );
}

export default GoodsReports;
