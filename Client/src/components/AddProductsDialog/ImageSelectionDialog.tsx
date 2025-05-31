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
    // Close the camera dialog but keep this dialog open for scanning
    setShowCamera(false);
    // Process the file - the scanning dialog will show
    await processFile(file);
  };

  const handleCameraClose = () => {
    setShowCamera(false);
    onClose();
  };

  const processFile = async (file: File) => {
    try {
      // Don't call onFinish here - wait until after scanning is complete
      const result = await scanReceiptMutation.mutateAsync(file);

      // Now call onFinish and navigate
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

      // Call onFinish even on error
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

  // Show scanning dialog when scanning - make sure it's always visible during scanning
  if (isScanning) {
    return (
      <Dialog
        isOpen={true} // Force dialog to be open during scanning
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
                borderColor: "primary.main",
                color: "primary.main",
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                "&:hover": {
                  bgcolor: "primary.light",
                  color: "white",
                  borderColor: "primary.main",
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
