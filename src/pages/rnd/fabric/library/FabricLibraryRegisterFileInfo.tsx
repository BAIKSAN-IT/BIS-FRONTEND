import React, {memo, useCallback, useMemo, useRef, useState} from "react";
import {Card, Row} from "react-bootstrap";
import "react-datepicker/dist/react-datepicker.css";

import {useDispatch} from "react-redux";
import {AppDispatch} from "@redux/store";
import {downloadRndFile, previewRndFile, SaveRndArticleFileReq, SaveRndArticleReq,} from "@redux/rnd/RndSlice";
import FilePreviewUploader, {ServerFile} from "@components/FilePreviewUploader";

interface Props {
  articleList: SaveRndArticleReq[];
  fileList: SaveRndArticleFileReq[];
  setFileList: React.Dispatch<React.SetStateAction<SaveRndArticleFileReq[]>>;

  // 상위에서 그대로 유지하고 싶다면 남겨둠(선택)
  onFileUpload?: (files: File[]) => void;
  onFileRemove?: (fileName: string) => void;
  onFileDownload?: (fileName: string) => void;
}

const FabricLibraryRegisterFileInfo = memo(
  ({articleList, fileList, setFileList, onFileUpload, onFileRemove, onFileDownload}: Props) => {
    const dispatch = useDispatch<AppDispatch>();

    // 카메라용
    const [cameraFiles, setCameraFiles] = useState<File[]>([]);

    // 표기용 파일명(스키마 혼재 대응)
    const displayName = (f: SaveRndArticleFileReq) =>
      (f as any).imgFileNameOrg || (f as any).imgFileName || (f as any).nmFile || (f as any).fileName || "";

    // 로컬 업로드 파일을 fileList 스키마로 변환
    const mapToUiFileEntries = (files: File[]): SaveRndArticleFileReq[] => {
      const baseSeq = Math.max(0, ...fileList.map((f) => Number((f as any).seq || 0)));
      const seqArticle = articleList?.[0]?.seqArticle || "";
      const cdCompany = articleList?.[0]?.cdCompany || "";

      return files.map(
        (f, idx) =>
          ({
            cdCompany,
            seqArticle,
            seq: baseSeq + idx + 1,
            imgFileNameOrg: f.name,
            imgFileName: "", // 서버 저장 전
            ynFlag: "N",
          } as unknown as SaveRndArticleFileReq)
      );
    };

    // 자식에서 필요로 하는 서버 파일 포맷으로 변환
    const serverFiles: ServerFile[] = useMemo(
      () =>
        fileList.map((f) => ({
          name: displayName(f),
          ynFlag: (f as any).ynFlag || "N",
        })),
      [fileList]
    );

    const seqArticle = articleList?.[0]?.seqArticle || "";

    // 프리뷰 요청(Blob) — useCallback 으로 안정화
    const requestPreview = useCallback(
      async ({seqArticle, fileName, bust}: { seqArticle: string; fileName: string; bust?: boolean }) => {
        try {
          const res: any = await dispatch(previewRndFile({seqArticle, fileName, bust} as any)).unwrap();
          if (!res || res.status === 304) return null;
          return res.data as Blob;
        } catch {
          return null;
        }
      },
      [dispatch]
    );
    const handleFileDownload = (fileUrl: string) => {
      const seqArticle = articleList[0]?.seqArticle || "";
      const fileName = fileUrl.split("/").pop()!; // “yyyyMM/noDocu/파일명”에서 추출

      dispatch(downloadRndFile({seqArticle, fileName}))
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
        .catch(() => alert("파일 다운로드에 실패했습니다. 관리자에게 문의 바랍니다."));
    };

    // 다운로드 요청(Blob, PATCH) — useCallback 으로 안정화
    const requestDownload = useCallback(
      async ({seqArticle, fileName}: { seqArticle: string; fileName: string }) => {
        try {
          const res: any = await dispatch(downloadRndFile({seqArticle, fileName})).unwrap();
          return res.data as Blob;
        } catch {
          return null;
        }
      },
      [dispatch]
    );

    // 서버 파일은 배열 삭제X → ynFlag="D"만 마킹
    const markDelete = useCallback(
      (name: string) => {
        setFileList((prev) =>
          prev.map((f) => {
            const nm = displayName(f);
            if (nm === name) {
              const next = {...(f as any), ynFlag: "D"} as SaveRndArticleFileReq;
              onFileRemove?.(name); // 상위 콜백 유지(선택)
              return next;
            }
            return f;
          })
        );
      },
      [setFileList, onFileRemove]
    );

    // 로컬(서버 미업로드) 항목 제거
    const removeLocal = useCallback(
      (name: string) => {
        setFileList((prev) =>
          prev.filter((f) => {
            const nm = displayName(f);
            const isLocal = !(f as any).imgFileName; // 업로드 전은 imgFileName이 없음
            return !(isLocal && nm === name);
          })
        );
        onFileRemove?.(name);
      },
      [setFileList, onFileRemove]
    );
    const cameraInputRef = useRef<HTMLInputElement | null>(null);

    const handleCameraCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      // 부모에도 저장
      onFileUpload?.([file]);

      // FilePreviewUploader가 미리보기 생성하도록 externalFiles 로 전달
      setCameraFiles([file]);

      // fileList(서버저장용)에도 추가
      const newEntry: SaveRndArticleFileReq = {
        cdCompany: articleList?.[0]?.cdCompany || "",
        seqArticle: articleList?.[0]?.seqArticle || "",
        seq: fileList.length + 1,
        imgFileNameOrg: file.name,
        imgFileName: "",
        ynFlag: "N",
      };

      setFileList(prev => [...prev, newEntry]);
    };

    return (
      <>
        <Card
          style={{
            border: "1px solid #ddd",
            transform: "translateY(-20px)",
            height: "140px",
            transition: "height 0.3s ease-in-out",
          }}
        >
          <Card.Body>
            <div
              style={{
                position: "absolute",
                top: "0px",
                left: "10px",
                fontWeight: "bold",
                fontSize: "14px",
              }}
            >
              FILE
              <button
                type="button"
                onClick={() => cameraInputRef.current?.click()}
                style={{
                  border: "none",
                  background: "transparent",
                  cursor: "pointer",
                }}
                title="사진 촬영"
              >
                <i className="mdi mdi-camera" style={{fontSize: "16px", color: "#0d6efd"}}/>
              </button>

              {/* Hidden camera input */}
              <input
                type="file"
                accept="image/*"
                capture="environment"
                ref={cameraInputRef}
                style={{display: "none"}}
                onChange={handleCameraCapture}
              />
            </div>
            <Row>
              <FilePreviewUploader
                seqArticle={seqArticle}
                serverFiles={serverFiles}
                requestPreview={requestPreview}
                requestDownload={requestDownload}
                onMarkDelete={markDelete}
                onLocalRemove={removeLocal}
                onFileUpload={(files) => {
                  const appended = mapToUiFileEntries(files);
                  setFileList((prev) => {
                    const names = new Set(prev.map((x) => displayName(x)));
                    const unique = appended.filter((x) => !names.has(displayName(x))); // 중복 방지
                    return [...prev, ...unique];
                  });
                  onFileUpload?.(files);
                }}
                onFileDownload={handleFileDownload}
                showPreview
                cardRepeat={"3"}
                externalFiles={cameraFiles}
              />
            </Row>
          </Card.Body>
        </Card>
      </>
    );
  }
);

export default FabricLibraryRegisterFileInfo;
