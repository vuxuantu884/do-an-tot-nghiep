import styled from 'styled-components'

const HandoverFilterComponent = styled.div`
  .handover-filter {
    .page-filter {
      .page-filter-heading {
        .page-filter-left {
          margin-right: 20px;
        }
        .page-filter-right {
          display: flex;
           width: 100%;
            justify-content: space-between;
          .ant-space {
            width: 100%;
            grid-gap: 0 !important;
            gap: 0 !important;
            .ant-space-item {
              width: 100%;
              grid-gap: 0 !important;
              gap: 0 !important;
            }
          }
          
        }
        
      }
    }
  }
  .result-tags {
    margin-bottom: 10px;
  }
`

export { HandoverFilterComponent };