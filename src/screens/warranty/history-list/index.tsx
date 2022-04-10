import { Button } from 'antd'
import UrlConfig from 'config/url.config'
import React from 'react'
import { useHistory } from 'react-router-dom'

type Props = {}

function WarrantyHistotyList(props: Props) {
  const history = useHistory()
  return (
    <div>
      <Button type='primary' onClick={() => history.push(UrlConfig.WARRANTY + "/create")}>
        Thêm mới bảo hành
      </Button>
    </div>
  )
}

export default WarrantyHistotyList