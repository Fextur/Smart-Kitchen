import { useState, useRef, useCallback, useEffect } from "react";

export const useCameraCapture = () => {
  const [isCapturing, setIsCapturing] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [videoReady, setVideoReady] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const monitorIntervalRef = useRef<NodeJS.Timeout | undefined>(undefined);

  useEffect(() => {
    return () => {
      if (monitorIntervalRef.current) {
        clearInterval(monitorIntervalRef.current);
        monitorIntervalRef.current = undefined;
      }
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [stream]);

  const isCameraSupported = useCallback(() => {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  }, []);

  const startCamera = useCallback(async () => {
    if (!isCameraSupported()) {
      throw new Error("Camera not supported on this device");
    }

    try {
      setIsCapturing(true);

      const isMobile =
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          navigator.userAgent
        );

      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: isMobile ? "environment" : "user",
          width: {
            ideal: isMobile ? 1280 : 1920,
            min: 640,
          },
          height: {
            ideal: isMobile ? 720 : 1080,
            min: 480,
          },
          frameRate: { ideal: 30, max: 60 },
        },
        audio: false,
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(
        constraints
      );
      setStream(mediaStream);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;

        await new Promise<void>((resolve, reject) => {
          const video = videoRef.current!;

          const handleLoadedMetadata = () => {
            video.removeEventListener("loadedmetadata", handleLoadedMetadata);
            video.removeEventListener("error", handleError);

            if (video.videoWidth > 0 && video.videoHeight > 0) {
              setVideoReady(true);
            }

            resolve();
          };

          const handleError = (_e: Event) => {
            video.removeEventListener("loadedmetadata", handleLoadedMetadata);
            video.removeEventListener("error", handleError);
            setVideoReady(false);
            reject(new Error("Failed to load video metadata"));
          };

          if (video.videoWidth > 0 && video.videoHeight > 0) {
            setVideoReady(true);
            resolve();
            return;
          }

          video.addEventListener("loadedmetadata", handleLoadedMetadata);
          video.addEventListener("error", handleError);

          setTimeout(() => {
            if (video.videoWidth > 0 && video.videoHeight > 0) {
              setVideoReady(true);
            }
          }, 2000);
        });

        try {
          await videoRef.current.play();
        } catch (playError) {}

        monitorIntervalRef.current = setInterval(() => {
          const video = videoRef.current;
          if (video && video.videoWidth > 0 && video.videoHeight > 0) {
            if (!videoReady) {
              setVideoReady(true);
            }
          } else if (videoReady && video) {
            setVideoReady(false);
          }
        }, 500);
      }
    } catch (error) {
      setIsCapturing(false);
      setVideoReady(false);
      if (monitorIntervalRef.current) {
        clearInterval(monitorIntervalRef.current);
        monitorIntervalRef.current = undefined;
      }

      if (error instanceof Error) {
        if (error.name === "NotAllowedError") {
          throw new Error("Camera access denied");
        } else if (error.name === "NotFoundError") {
          throw new Error("No camera found");
        } else if (error.name === "OverconstrainedError") {
          throw new Error("Camera doesn't support the requested settings");
        }
      }

      throw error;
    }
  }, [isCameraSupported, videoReady]);

  const capturePhoto = useCallback(async (): Promise<File> => {
    return new Promise((resolve, reject) => {
      if (!videoRef.current || !canvasRef.current || !stream) {
        reject(new Error("Camera not initialized"));
        return;
      }

      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");

      if (!context) {
        reject(new Error("Canvas not supported"));
        return;
      }

      if (video.videoWidth === 0 || video.videoHeight === 0) {
        reject(new Error("Video not ready"));
        return;
      }

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      context.clearRect(0, 0, canvas.width, canvas.height);

      const isMobile =
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          navigator.userAgent
        );

      if (isMobile) {
        context.scale(-1, 1);
        context.translate(-canvas.width, 0);
      }

      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      context.setTransform(1, 0, 0, 1, 0, 0);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            const file = new File([blob], `receipt-${Date.now()}.jpg`, {
              type: "image/jpeg",
              lastModified: Date.now(),
            });
            resolve(file);
          } else {
            reject(new Error("Failed to capture photo"));
          }
        },
        "image/jpeg",
        0.92
      );
    });
  }, [stream]);

  const stopCamera = useCallback(() => {
    if (monitorIntervalRef.current) {
      clearInterval(monitorIntervalRef.current);
      monitorIntervalRef.current = undefined;
    }

    if (stream) {
      stream.getTracks().forEach((track) => {
        track.stop();
      });
      setStream(null);
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
      videoRef.current.pause();
    }

    setIsCapturing(false);
    setVideoReady(false);
  }, [stream]);

  return {
    isCapturing,
    videoReady,
    isCameraSupported: isCameraSupported(),
    startCamera,
    capturePhoto,
    stopCamera,
    videoRef,
    canvasRef,
    stream,
  };
};
