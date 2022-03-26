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
                filters.map((filter) => {
                    const field = filter[0];
                    const { value, title } = filter[1];
                    const { YEAR, MONTH, DAY, HOUR } = TIME;
                    return value.map((valueItem: string) => {
                        return <Tag
                            onClose={() => {
                                action({ field, title, value: valueItem })
                            }}
                            key={`${field}${valueItem}`}
                            className="fade margin-bottom-20"
                            closable
                            closeIcon={[YEAR, MONTH, DAY, HOUR].includes(field) ? <BackwardOutlined /> : <CloseOutlined />}
                        >{title}: {valueItem}</Tag>
                    })
                })
            }
        </div>

    );
}

export default ActiveFilters;