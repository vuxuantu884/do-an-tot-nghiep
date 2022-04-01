import styled from "styled-components";
export const CustomerVisitorsStyle = styled.div`
.w-100 {
    width: 100%;
}
.d-flex {
    display: flex;
    gap: 20px;
}
.justify-content {
    &-start {
        justify-content: start;
    }
    &-center {
        justify-content: center;
    }
    &-between {
        justify-content: space-between;
    }
    &-end {
        justify-content: end;
    }
}
.align-items {
    &-start {
        align-items: start;
    }
    &-end {
        align-items: end;
    }
}
.px {
    &-1 {
        padding-left: 0.5rem;
        padding-right: 0.5rem;
    }
    &-2 {
        padding-left: 1rem;
        padding-right: 1rem;
    }
}
.py {
    &-1 {
        padding-top: 0.5rem;
        padding-bottom: 0.5rem;
    }
    &-2 {
        padding-top: 1rem;
        padding-bottom: 1rem;
    }
}
.input-width {
    width: 200px;
}
.pt-3 {
    padding-top: 24px;
}
`;
