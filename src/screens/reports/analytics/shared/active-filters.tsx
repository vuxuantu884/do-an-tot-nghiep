import { BackwardOutlined, CloseOutlined } from "@ant-design/icons";
import { Tag } from "antd";
import { TIME } from "model/report/analytics.model";

type Props = {
    filters: any[];
    action: (filter: any) => void;
}

function ActiveFilters({ filters, action }: Props) {
    return (
        <div>
            {
                filters.map((filter, index) => {
                    const { title, value, field } = filter;
                    const { YEAR, MONTH, DAY, HOUR } = TIME;
                    return <Tag
                        onClose={() => {
                            action(filter)
                        }}
                        key={field}
                        className="fade margin-bottom-20"
                        closable
                        closeIcon={[YEAR, MONTH, DAY, HOUR].includes(field) ? <BackwardOutlined /> : <CloseOutlined />}
                    >{title}: {value}</Tag>
                })
            }
        </div>

    );
}

export default ActiveFilters;