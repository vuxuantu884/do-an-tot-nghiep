import styled from "styled-components";

export const StyledComponent = styled.div`
    .selected-searched-variant{
        display: flex;
        place-content: center space-between;
        .variant-img{
            align-items: center;
            justify-content: flex-start;
            display: flex;
            padding: 4px 0px 4px 10px;
            max-width: 80px;
            img{
                max-height: 60px;
                /* width: 50%; */
                border-radius: 5px;
            }
        }
        .variant-info{
            padding: 5px 0;
            &-color-sku{
                color: #95A1AC;
            }
        }
    }
`;