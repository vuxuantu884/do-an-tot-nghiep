import { Card, List } from "antd"
import { AnalyticTemplateData } from "model/report/analytics.model";
import { Link } from "react-router-dom"

type Props = {
    matchPath: string;
    data: AnalyticTemplateData[];
    title: string;
}

function ListAnalyticsBlock({ matchPath, data, title }: Props) {
    return <Card title={title} className='template-report'>
        <List grid={{ gutter: 16, xs: 1, sm: 2, md: 3, lg: 3, xl: 4, xxl: 5 }}

            dataSource={data || []}

            renderItem={(item, index) => {
                return (
                    <Link to={`${matchPath}/${item.id}`} key={index}>
                        <List.Item className="pointer">
                            <div className={`template-report__card `}>
                                <div className='template-report__icon '>
                                    <img src={require(`assets/icon/analytic/${item.iconImg}`).default} alt={item.name} /></div>
                                <div className='template-report__type'> {item.type} </div>
                                <div className='template-report__name'> {item.name.toUpperCase()} </div>
                            </div>
                        </List.Item>
                    </Link>
                )
            }}
        />
    </Card>
}

export default ListAnalyticsBlock