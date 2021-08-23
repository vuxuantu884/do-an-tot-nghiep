import styled from "styled-components";

export const StyledComponent = styled.div`
  .editor {
    &__content {
      height: 200px;
      position: relative;
      border: 1px solid #ccc;
      border-top: none;
    }
  }
  .ql-container.ql-snow {
    height: auto;
  }
  .ql-container {
    border-bottom-left-radius: 0.5em;
    border-bottom-right-radius: 0.5em;
    background: #fefcfc;
  }

  .ql-toolbar {
    background: #eaecec;
    border-top-left-radius: 0.5em;
    border-top-right-radius: 0.5em;
    border-bottom: none;
  }

  .ql-editor {
    display: block;
  }
  .raw-editor {
    display: none;
    border: none;
    width: 100%;
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    z-index: 9;
    outline: none;
  }
  .showRaw .ql-editor {
    display: none;
  }
  .showRaw .raw-editor {
    display: block;
  }
`;
