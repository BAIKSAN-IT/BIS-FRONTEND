import React, { useMemo, useRef } from "react";
import JoditEditor from "jodit-react";

type SrsRichTextEditorProps = {
  value: string;
  onChange: (value: string) => void;
  readOnly?: boolean;
  height?: number;
};

const toolbarButtons = [
  "bold",
  "italic",
  "underline",
  "|",
  "font",
  "fontsize",
  "brush",
  "|",
  "ul",
  "ol",
  "|",
  "image",
  "table",
  "hr",
  "|",
  "align",
  "undo",
  "redo",
  "|",
  "preview",
  "print",
];

const SrsRichTextEditor = ({ value, onChange, readOnly = false, height = 320 }: SrsRichTextEditorProps) => {
  const editorRef = useRef(null);

  const config = useMemo<any>(
    () => ({
      readonly: readOnly,
      uploader: {
        insertImageAsBase64URI: true,
      },
      buttons: toolbarButtons,
      buttonsMD: toolbarButtons,
      buttonsSM: toolbarButtons,
      buttonsXS: toolbarButtons,
      sizeLG: 900,
      sizeMD: 700,
      sizeSM: 400,
      height,
      enter: "br" as const,
      useSearch: false,
      askBeforePasteHTML: false,
      askBeforePasteFromWord: false,
      defaultActionOnPaste: "insert_clear_html",
      style: {
        minHeight: `${height}px`,
      },
      controls: {
        lineHeight: {
          list: [0.5, 1, 1.5, 2],
        },
      },
      events: {
        keydown: function (event: KeyboardEvent) {
          if (event.key === "Tab") {
            event.preventDefault();
          }
        },
      },
      useTabForNext: false,
    }),
    [height, readOnly]
  );

  return (
    <JoditEditor
      ref={editorRef}
      value={value}
      config={config}
      onBlur={(nextValue) => onChange(nextValue)}
      onChange={() => {}}
    />
  );
};

export default SrsRichTextEditor;
