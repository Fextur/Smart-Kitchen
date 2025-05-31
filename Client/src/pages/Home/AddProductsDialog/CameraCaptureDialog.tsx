import { FC, useEffect, useState, useRef } from "react";
import { Box, Button, Typography, IconButton } from "@mui/material";
import { Camera, X, RotateCcw } from "lucide-react";
import { Dialog } from "@/components/Dialog";
import { useCameraCapture } from "@/hooks/useCameraCapture";

interface CameraCaptureDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (file: File) => void;
}

export const CameraCaptureDialog: FC<CameraCaptureDialogProps> = ({
  isOpen,
  onClose,
  onCapture,
}) => {
  const [videoReady, setVideoReady] = useState(false);
  const [error, setError] = useState<string>("");
  const hasStartedRef = useRef(false);
  const timeoutRef = useRef<NodeJS.Timeout>(null);

  const {
    videoReady: hookVideoReady,
    startCamera,
    capturePhoto,
    stopCamera,
    videoRef,
    canvasRef,
  } = useCameraCapture();

  useEffect(() => {
    if (isOpen && !hasStartedRef.current) {
      hasStartedRef.current = true;
      setVideoReady(false);
      setError("");

      startCamera()
        .then(() => {
          timeoutRef.current = setTimeout(() => {
            if (!videoReady) {
              setError("שגיאה בהצגת הוידאו - נסה לרענן");
            }
          }, 8000);
        })
        .catch((error) => {
          if (error.name === "NotAllowedError") {
            setError("נדרשת הרשאה לשימוש במצלמה");
          } else if (error.name === "NotFoundError") {
            setError("לא נמצאה מצלמה במכשיר");
          } else {
            setError("שגיאה בהפעלת המצלמה");
          }
          hasStartedRef.current = false;
        });
    }

    if (!isOpen && hasStartedRef.current) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      stopCamera();
      setVideoReady(false);
      setError("");
      hasStartedRef.current = false;
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isOpen, startCamera, stopCamera]);

  useEffect(() => {
    if (hookVideoReady && !videoReady) {
      setVideoReady(true);
      setError("");
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    }
  }, [hookVideoReady, videoReady]);

  const handleCapture = async () => {
    try {
      const file = await capturePhoto();
      onCapture(file);
      handleClose();
    } catch (error) {
      setError("שגיאה בצילום התמונה");
    }
  };

  const handleClose = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    stopCamera();
    setVideoReady(false);
    setError("");
    hasStartedRef.current = false;
    onClose();
  };

  const handleRetry = () => {
    setError("");
    setVideoReady(false);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    stopCamera();
    hasStartedRef.current = false;

    setTimeout(() => {
      hasStartedRef.current = true;
      startCamera().catch((_error) => {
        setError("שגיאה בהפעלת המצלמה");
        hasStartedRef.current = false;
      });
    }, 1000);
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={handleClose}
      icon={<Camera size={24} />}
      color="#f97316"
      title="צלם קבלה"
    >
      <Box
        sx={{
          direction: "rtl",
          maxHeight: "80vh",
          overflowY: "auto",
        }}
      >
        <Box
          sx={{
            position: "relative",
            mb: 3,
            borderRadius: 2,
            overflow: "hidden",
            bgcolor: "#000",
            width: "100%",
            height: 280,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {(!videoReady || error) && (
            <Box
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: "rgba(0, 0, 0, 0.8)",
                zIndex: 2,
                p: 2,
              }}
            >
              <Typography
                variant="body1"
                sx={{
                  color: error ? "#ff6b6b" : "#fff",
                  textAlign: "center",
                  mb: error ? 2 : 0,
                }}
              >
                {error || "טוען מצלמה..."}
              </Typography>

              {error && (
                <Button
                  onClick={handleRetry}
                  variant="contained"
                  size="small"
                  sx={{
                    bgcolor: "#f97316",
                    "&:hover": { bgcolor: "#ea580c" },
                  }}
                >
                  נסה שוב
                </Button>
              )}
            </Box>
          )}

          <video
            ref={videoRef}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: videoReady ? "block" : "none",
            }}
            playsInline
            muted
            autoPlay
          />

          <IconButton
            onClick={handleClose}
            sx={{
              position: "absolute",
              top: 8,
              right: 8,
              bgcolor: "rgba(0, 0, 0, 0.6)",
              color: "white",
              zIndex: 3,
              "&:hover": {
                bgcolor: "rgba(0, 0, 0, 0.8)",
              },
            }}
          >
            <X size={20} />
          </IconButton>
        </Box>

        <Typography
          variant="body2"
          sx={{ mb: 3, textAlign: "center", color: "text.secondary" }}
        ></Typography>

        <Box sx={{ display: "flex", gap: 1.5 }}>
          <Button
            onClick={handleCapture}
            variant="contained"
            color="primary"
            disabled={!videoReady || !!error}
            sx={{
              flex: 1,
              py: 1.5,
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            <Camera size={20} />
            צלם
          </Button>

          <Button
            onClick={handleRetry}
            variant="outlined"
            sx={{
              minWidth: 60,
              py: 1.5,
            }}
          >
            <RotateCcw size={20} />
          </Button>
        </Box>

        <canvas ref={canvasRef} style={{ display: "none" }} />
      </Box>
    </Dialog>
  );
};
