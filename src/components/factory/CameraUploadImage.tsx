import React, { memo, useState } from "react";
import styled from "styled-components";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../redux/store";
import { uploadQrImage, deleteQrImage, SewingQrSystemRes } from "../../redux/factory/factoryQrSystemSlice";
import noImage from "../../assets/images/noImage.png";
import { useTranslation } from "react-i18next";

/* lb */
import Swal from "sweetalert2";

const ImageContainer = styled.div`
  position: relative;
  width: 100%;
  height: 200px;
  border: 1px solid #dee2e6;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
`;

const DeleteIcon = styled.button`
  position: absolute;
  top: 5px;
  right: 5px;
  background: rgba(255, 255, 255, 0.7);
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  font-size: 16px;
  line-height: 20px;
  text-align: center;
  cursor: pointer;
  z-index: 10;

  &:hover {
    background: rgba(255, 0, 0, 0.8);
    color: white;
  }
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  z-index: 1000;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const ModalImage = styled.img`
  max-width: 90%;
  max-height: 90%;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
  border-radius: 8px;
  background: #fff;
  padding: 10px;
`;

const UploadWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 40%;
`;

const ImagePreview = styled.img`
  max-width: 100%;
  max-height: 100%;
`;

const HiddenInput = styled.input`
  display: none;
`;

const UploadButton = styled.label`
  margin-top: 5px;
  cursor: pointer;
  background: #007bff;
  color: #fff;
  padding: 5px 12px;
  border-radius: 4px;
  font-size: 14px;
  gap: 5px;
`;

const ButtonRow = styled.div`
  display: flex;
  gap: 5px;
`;

interface Props {
  imageSrc: string;
  onImageChange: (imgPath: string, imgFname: string, previewUrl: string) => void;
  onImageDelete: () => void;
  sewingQrSystemInfo?: SewingQrSystemRes | null;
}

const CameraUploadImage = memo(({ imageSrc, onImageChange, onImageDelete, sewingQrSystemInfo }: Props) => {
  /* SweetAlert - 단순 메시지 알림 */
  const showAlert = (message: string) => {
    Swal.fire({
      text: message,
      confirmButtonText: "OK",
      customClass: {
        popup: "small-swal-popup",
        confirmButton: "small-swal-button",
      },
    });
  };

  /* SweetAlert - 확인 취소 모달 */
  const confirmAction = (message: string, callback: () => void) => {
    Swal.fire({
      title: "Confirm",
      text: message,
      showCloseButton: true,
      showCancelButton: true,
      confirmButtonText: "OK",
      cancelButtonText: "Cancel",
      customClass: {
        popup: "tight-swal-popup",
        title: "tight-swal-title",
        closeButton: "tight-swal-close",
        confirmButton: "small-swal-button",
        cancelButton: "small-swal-button",
      },
    }).then((result) => {
      if (result.isConfirmed) {
        callback();
      }
    });
  };

  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const [showModal, setShowModal] = useState(false);

  const handleCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !sewingQrSystemInfo) {
      showAlert(t("common.alert.qrInfoCheck"));
      return;
    }
    const { cdCompany, cdBizarea, astCode } = sewingQrSystemInfo;

    const reader = new FileReader();
    reader.onloadend = async () => {
      const previewUrl = reader.result?.toString() || "";

      // 1. 서버 업로드
      const result = await dispatch(
        uploadQrImage({
          file,
          cdCompany,
          cdBizarea,
          cdQr: astCode,
        })
      );

      // 2. 성공 시 경로 전달
      if (uploadQrImage.fulfilled.match(result)) {
        const { imgPath, imgFname } = result.payload;

        // base64 미리보기를 우선 보여주고 → 서버 경로도 함께 전달
        onImageChange(imgPath, imgFname, previewUrl);
      } else {
        showAlert(t("common.alert.ImgUploadFail"));
      }
    };

    reader.readAsDataURL(file); // → base64 변환
  };

  //파일 삭제
  const handleDelete = async () => {
    if (!sewingQrSystemInfo) return;

    confirmAction(t("common.confirm.deleteImg"), async () => {
      const { cdCompany, cdBizarea, astCode } = sewingQrSystemInfo;

      const result = await dispatch(
        deleteQrImage({
          cdCompany,
          cdBizarea,
          imgPath: sewingQrSystemInfo?.imgPath,
          imgFname: sewingQrSystemInfo?.imgFname,
          cdQr: astCode,
        })
      );
      if (deleteQrImage.fulfilled.match(result)) {
        onImageDelete();
      } else {
        showAlert(t("common.confirm.deleteUserError"));
      }
    });
  };

  return (
    <UploadWrapper>
      <ImageContainer onClick={() => setShowModal(true)} style={{ cursor: "pointer" }}>
        {imageSrc && (
          <DeleteIcon
            type="button"
            onClick={(e: any) => {
              e.stopPropagation(); // 확대 방지
              handleDelete();
            }}
          >
            ×
          </DeleteIcon>
        )}
        <ImagePreview
          src={imageSrc || noImage}
          onError={(e: any) => {
            (e.target as HTMLImageElement).src = noImage;
          }}
          alt="미리보기"
        />
      </ImageContainer>

      <HiddenInput type="file" id="cameraInput" accept="image/*" capture="environment" onChange={handleCapture} />
      <HiddenInput type="file" id="galleryInput" accept="image/*" onChange={handleCapture} />

      <ButtonRow>
        {/* 카메라 버튼 */}
        <label htmlFor="cameraInput" className="btn btn-sm waves-light btn-blue btn btn-primary me-0 mt-1">
          <i className="fa fa-camera font-12" />
        </label>

        {/* 갤러리 업로드 버튼 */}
        <label htmlFor="galleryInput" className="btn btn-sm waves-light btn-blue btn btn-primary me-0 mt-1">
          <i className="fa fa-upload font-12" />
        </label>
      </ButtonRow>

      {showModal && (
        <ModalOverlay onClick={() => setShowModal(false)}>
          <ModalImage src={imageSrc} alt="Zoomed" />
        </ModalOverlay>
      )}
    </UploadWrapper>
  );
});

export default CameraUploadImage;
