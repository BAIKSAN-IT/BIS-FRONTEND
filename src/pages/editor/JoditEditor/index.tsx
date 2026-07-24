import React, { memo, useEffect, useRef, useState } from "react";
import JoditEditor from "jodit-react";
import Jodit from "jodit";
import { Col, Row } from "react-bootstrap";
import FileUploader from "../../../components/FileUploader";
import { downloadSalesActivityFile, SalesActivitySaveReq } from "../../../redux/sales/SalesActivitySlice";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../redux/store";

interface Props {
  setSelectedItems?: React.Dispatch<
    React.SetStateAction<{
      attendee: boolean;
      purpose: boolean;
      mainIssue: boolean;
      futurePlans: boolean;
      followUp: boolean;
      order: boolean;
      expense: boolean;
      isAllCheck: boolean;
    }>
  >;
  isDisabled?: boolean;
  salesActivitySaveReq?: SalesActivitySaveReq | null;
  setSalesActivitySaveReq?: React.Dispatch<React.SetStateAction<SalesActivitySaveReq>>;
  setPendingFiles?: React.Dispatch<React.SetStateAction<File[]>>;
  setPendingDeleteFiles?: React.Dispatch<React.SetStateAction<string[]>>;
}

const JoditEditorOriginal = memo(
  ({
    setSelectedItems,
    isDisabled = false,
    salesActivitySaveReq,
    setSalesActivitySaveReq,
    setPendingFiles,
    setPendingDeleteFiles,
  }: Props) => {
    // 로컬 state로 에디터 내용을 관리
    const dispatch = useDispatch<AppDispatch>();
    const editor = useRef<any>(null);

    const initialContent =
      salesActivitySaveReq?.saveActivityList[0]?.contents ||
      salesActivitySaveReq?.saveActivityContentsList?.[0]?.contents ||
      "";

    const [content, setContent] = useState(initialContent);
    const { user } = useSelector((state: RootState) => ({
      user: state.Auth.user,
    }));
    const options = [
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
    const config = {
      readonly: isDisabled, // isDisabled가 true이면 에디터 비활성화
      uploader: {
        insertImageAsBase64URI: true,
      },
      buttons: options,
      buttonsMD: options,
      buttonsSM: options,
      buttonsXS: options,
      sizeLG: 900,
      sizeMD: 700,
      sizeSM: 400,
      height: 600,
      enter: "br" as "br",
      style: { position: "absolute", minHeight: "600px", lineHeight: "0.5" },
      controls: {
        lineHeight: {
          list: [0.5],
        },
      },
      events: {
        keydown: function (event: any) {
          if (event.key === "Tab") {
            event.preventDefault();
          }
        },
      },
      useTabForNext: false,
    };
    useEffect(() => {
      const instance = editor.current;

      if (!instance) return;

      const timer = setTimeout(() => {
        instance.events?.on("keydown", (e: KeyboardEvent) => {
          if (e.key !== "Tab") return;

          e.preventDefault();

          const selection = instance.selection;
          if (!selection) return;

          const range = selection.range.cloneRange();
          let container = range.startContainer;
          let offset = range.startOffset;

          // 비텍스트 노드 처리
          if (container.nodeType !== Node.TEXT_NODE) {
            let childNode = container.childNodes[offset > 0 ? offset - 1 : 0] ?? null;
            while (childNode && childNode.nodeType !== Node.TEXT_NODE && childNode.hasChildNodes()) {
              childNode = childNode.lastChild;
            }

            if (!childNode || childNode.nodeType !== Node.TEXT_NODE) {
              const tabText = document.createTextNode("\u00a0\u00a0\u00a0\u00a0");
              range.insertNode(tabText);
              range.setStartAfter(tabText);
              range.setEndAfter(tabText);
              selection.selectRange(range);
              return;
            }

            container = childNode;
            offset = container.textContent?.length ?? 0;
          }

          const textNode = container as Text;
          const text = textNode.nodeValue ?? "";

          if (e.shiftKey) {
            if (offset >= 4 && text.substring(offset - 4, offset) === "\u00a0\u00a0\u00a0\u00a0") {
              textNode.deleteData(offset - 4, 4);
              const newOffset = offset - 4;
              range.setStart(textNode, newOffset);
              range.setEnd(textNode, newOffset);
              selection.selectRange(range);
            }
            return;
          }

          const tabText = document.createTextNode("\u00a0\u00a0\u00a0\u00a0");
          range.deleteContents();
          range.insertNode(tabText);
          range.setStartAfter(tabText);
          range.setEndAfter(tabText);
          selection.selectRange(range);
        });
      }, 300); // ← instance 완성될 때까지 약간 딜레이

      return () => {
        clearTimeout(timer);
        instance.events?.off?.("keydown");
      };
    }, []);

    const handleFileUpload = async (files: File[]) => {
      const existingNames = new Set(salesActivitySaveReq?.saveActivityFileList?.map((f) => f.nmFile) || []);
      const newFiles = files.filter((file) => !existingNames.has(file.name));

      // 상태에만 저장
      if (setPendingFiles) {
        setPendingFiles((prev) => [...prev, ...newFiles]);
      }

      // UI에 반영 (fileName만 추가)
      if (setSalesActivitySaveReq) {
        setSalesActivitySaveReq((prev) => {
          const newList = newFiles.map((f) => ({
            cdCompany: user?.companyId || "1000",
            noDocu: "",
            seqDocu: "",
            seqFile: 0,
            ynDel: "N",
            ynFlag: "",
            nmFile: f.name,
          }));
          return {
            ...prev,
            saveActivityFileList: [...prev.saveActivityFileList, ...newList],
          };
        });
      }
    };

    // SalesActivityRegister (또는 JoditEditorOriginal) 안에서
    const handleFileRemove = (fileName: string) => {
      if (setSalesActivitySaveReq) {
        setSalesActivitySaveReq((prev) => {
          const newList = prev.saveActivityFileList.flatMap((f) => {
            if (f.nmFile !== fileName) {
              // 지우려는 파일이 아니면 그대로
              return [f];
            }
            // 여기에 온 것은 지우려는 파일
            if (f.noDocu) {
              // 1) 서버에 이미 있던 파일 → ynFlag만 D로 표시
              return [{ ...f, ynFlag: "D" }];
            }
            // 2) 방금 업로드한 파일 → 아예 배열에서 제거
            return [];
          });

          return {
            ...prev,
            saveActivityFileList: newList,
          };
        });
      }

      // pendingDeleteFiles 는 서버 파일만 기록
      const isExisting = salesActivitySaveReq?.saveActivityFileList.some((f) => f.nmFile === fileName && f.noDocu);
      if (isExisting) {
        if (setPendingDeleteFiles) {
          setPendingDeleteFiles((prev) => [...prev, fileName]);
        }
      } else {
        // 업로드한 파일을 pendingFiles에서 제거
        setPendingFiles?.((prev) => prev.filter((f) => f.name !== fileName));
      }
    };

    const handleFileDownload = (fileUrl: string) => {
      const noDocu = salesActivitySaveReq?.saveActivityList[0]?.noDocu || "";
      const fileName = fileUrl.split("/").pop()!; // “yyyyMM/noDocu/파일명”에서 추출

      dispatch(downloadSalesActivityFile({ noDocu, fileName }))
        .unwrap()
        .then((res) => {
          const blob = new Blob([res.data]);
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = fileName;
          a.click();
          window.URL.revokeObjectURL(url);
        })
        .catch(() => alert("파일 다운로드에 실패했습니다."));
    };
    useEffect(() => {
      if (!setSalesActivitySaveReq) return;
      setSalesActivitySaveReq((prev) => ({
        ...prev,
        saveActivityList: prev.saveActivityList.map((it, i) => (i === 0 ? { ...it, contents: content } : it)),
        saveActivityContentsList: [
          {
            ...prev.saveActivityContentsList[0],
            contents: content,
          },
        ],
      }));
    }, [content, setSalesActivitySaveReq]);
    useEffect(() => {
      setContent(
        salesActivitySaveReq?.saveActivityList[0]?.contents ||
          salesActivitySaveReq?.saveActivityContentsList?.[0]?.contents ||
          ""
      );
    }, [salesActivitySaveReq]);
    useEffect(() => {
      const instance = editor.current?.editor;

      if (instance) {
        // 1. 완전 mount 후 호출
        setTimeout(() => {
          // 2. 진짜 커서 이동
          instance.selection?.focus(true); // ← 여기서 true 주면 정확하게 커서 지정됨
        }, 300); // 300ms 정도 기다려야 완전 mount됨
      }
    }, []);
    return (
      <>
        <Row>
          <Col>
            <div className="d-flex flex-column">
              <label
                className="sales-custom-label-class"
                onDoubleClick={() =>
                  setSelectedItems
                    ? setSelectedItems((prev) => {
                        const newAll = !prev.isAllCheck;
                        // isAllCheck가 false가 될 땐 나머지도 false, true가 될 땐 나머지도 true
                        return {
                          attendee: newAll,
                          purpose: newAll,
                          mainIssue: newAll,
                          futurePlans: newAll,
                          followUp: newAll,
                          order: newAll,
                          expense: newAll,
                          isAllCheck: newAll,
                        };
                      })
                    : {}
                }
              >
                {"CONTENTS"}
              </label>
              <JoditEditor
                ref={editor}
                value={content}
                config={config}
                onBlur={(newContent) => setContent(newContent)}
              />
            </div>
          </Col>
        </Row>
        <FileUploader
          onFileUpload={handleFileUpload}
          onFileRemove={handleFileRemove}
          onFileDownload={handleFileDownload}
          isDisabled={isDisabled}
          initialFiles={
            salesActivitySaveReq?.saveActivityFileList
              .filter((f) => f.ynFlag !== "D")
              .map((f) => ({ name: f.nmFile })) || []
          }
        />
      </>
    );
  }
);

export default JoditEditorOriginal;
