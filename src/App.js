import React from "react";
import { PhotoEditorSDKUI, UIEvent } from "photoeditorsdk";
import initialState from "./initialState.json";

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.editor = null;
  }
  componentDidMount() {
    this.initEditor();
  }

  initEditor = async () => {
    this.editor = await PhotoEditorSDKUI.init({
      container: "#editor",
      license: "",
      image:
        "https://cdn.img.ly/packages/imgly/photoeditorsdk/latest/assets/example.jpg",
      assetBaseUrl:
        "https://cdn.img.ly/packages/imgly/photoeditorsdk/latest/assets",
      export: {
        image: {
          enableDownload: false,
        },
      },
    });

    this.editor.on(UIEvent.EDITOR_READY, () => {
      this.editor
        .deserialize(initialState)
        .then(() => console.log("State updated"));
    });
  };

  render() {
    return (
      <div>
        <div id="editor" />
      </div>
    );
  }
}
