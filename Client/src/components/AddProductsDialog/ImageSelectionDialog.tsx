import { FC, useRef, useState } from "react";
import { Box, Button, Typography, CircularProgress } from "@mui/material";
import { Camera, Image, ScanLine } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { Dialog } from "@/components/Dialog";
import { useCameraCapture } from "@/hooks/useCameraCapture";
import { useReceiptScanner } from "@/hooks/useReceiptScanner";
import { CameraCaptureDialog } from "@/components/AddProductsDialog/CameraCaptureDialog";

interface ImageSelectionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onFinish?: () => void;
}

export const ImageSelectionDialog: FC<ImageSelectionDialogProps> = ({
  isOpen,
  onClose,
  onFinish,
}) => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showCamera, setShowCamera] = useState(false);
  const { isCameraSupported } = useCameraCapture();
  const { scanReceiptMutation, isScanning } = useReceiptScanner();

  const handleTakePhoto = () => {
    if (isCameraSupported) {
      setShowCamera(true);
    } else {
      if (fileInputRef.current) {
        fileInputRef.current.setAttribute("capture", "environment");
        fileInputRef.current.click();
      }
    }
  };

  const handleSelectFile = () => {
    if (fileInputRef.current) {
      fileInputRef.current.removeAttribute("capture");
      fileInputRef.current.click();
    }
  };

  const handleFileSelected = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    await processFile(file);

    if (event.target) {
      event.target.value = "";
    }
  };

  const handleCameraCapture = async (file: File) => {
    setShowCamera(false);
    await processFile(file);
  };

  const handleCameraClose = () => {
    setShowCamera(false);
    onClose();
  };

  const processFile = async (file: File) => {
    try {
      const result = await scanReceiptMutation.mutateAsync(file);

      if (onFinish) {
        onFinish();
      }

      (navigate as any)({
        to: "/add-products",
        state: {
          items: result.items,
          isFromScan: true,
        },
      });

      onClose();
    } catch (error) {
      console.error("Scanning failed:", error);

      if (onFinish) {
        onFinish();
      }

      (navigate as any)({
        to: "/add-products",
        state: {
          items: [],
          isFromScan: false,
        },
      });
      onClose();
    }
  };

  if (isScanning) {
    return (
      <Dialog
        isOpen={true}
        onClose={() => {}}
        icon={<ScanLine size={24} />}
        color="#E49A61"
        title="סורק קבלה..."
      >
        <Box sx={{ textAlign: "center", direction: "rtl" }}>
          <CircularProgress size={60} sx={{ mb: 2, color: "primary.main" }} />
          <Typography variant="body1" sx={{ mb: 1 }}>
            מזהה מוצרים בקבלה
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            אנא המתן...
          </Typography>
        </Box>
      </Dialog>
    );
  }

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelected}
        style={{ display: "none" }}
      />

      <Dialog
        isOpen={isOpen && !showCamera}
        onClose={onClose}
        icon={<ScanLine size={24} />}
        color="#E49A61"
        title="סרוק קבלה"
      >
        <Box sx={{ direction: "rtl" }}>
          <Typography variant="body1" sx={{ mb: 3, textAlign: "center" }}>
            איך תרצה לספק את התמונה?
          </Typography>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Button
              onClick={handleTakePhoto}
              variant="outlined"
              fullWidth
              sx={{
                py: 2,
                borderColor: "#E49A61",
                color: "#E49A61",
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                "&:hover": {
                  bgcolor: "rgba(228, 154, 97, 0.1)",
                  borderColor: "#E49A61",
                  boxShadow: "0 2px 8px rgba(228, 154, 97, 0.2)",
                  transform: "translateY(-1px)",
                  transition: "all 0.2s ease",
                },
              }}
            >
              <Camera size={20} />
              <Typography variant="body1">
                {isCameraSupported ? "פתח מצלמה" : "צלם עכשיו"}
              </Typography>
            </Button>

            <Button
              onClick={handleSelectFile}
              variant="contained"
              color="primary"
              fullWidth
              sx={{
                py: 2,
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                "&:hover": {
                  boxShadow: "0 4px 12px rgba(228, 154, 97, 0.3)",
                  transform: "translateY(-1px)",
                  transition: "all 0.2s ease",
                },
              }}
            >
              <Image size={20} />
              <Typography variant="body1">בחר מהמכשיר</Typography>
            </Button>
          </Box>
        </Box>
      </Dialog>

      <CameraCaptureDialog
        isOpen={showCamera}
        onClose={handleCameraClose}
        onCapture={handleCameraCapture}
      />
    </>
  );
};
