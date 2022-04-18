import { Card } from 'antd'
import React from 'react'
import DepartmentSelect from './department-select'
import MyDataCheckbox from './my-data-checkbox'

function DashboardFilter() {

    return (
        <Card>
            <div className="dashboard-filter">
                <h1 className="title">BỘ LỌC</h1>
                {/* <DateFilterSelect className="select-filter" /> */}
                <DepartmentSelect className="select-filter" />
                <MyDataCheckbox />
            </div>
        </Card>

    )
}

export default DashboardFilter