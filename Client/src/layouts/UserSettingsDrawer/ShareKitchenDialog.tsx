import { FC, useState, useEffect } from "react";
import { Box, Typography, IconButton, Alert } from "@mui/material";
import { Share2, Copy, Check, MessageCircle, ExternalLink } from "lucide-react";
import { Dialog } from "@/components/Dialog";
import { KitchenUtils } from "@/utils/kitchenUtils";

interface ShareKitchenDialogProps {
  isOpen: boolean;
  onClose: () => void;
  kitchenHash: string;
  kitchenName: string;
  isLoading?: boolean;
}

export const ShareKitchenDialog: FC<ShareKitchenDialogProps> = ({
  isOpen,
  onClose,
  kitchenHash,
  kitchenName,
  isLoading = false,
}) => {
  const [copiedHash, setCopiedHash] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const shareableLink = `${window.location.origin}?join_kitchen=${kitchenHash}`;

  const whatsappMessage = encodeURIComponent(
    `היי! אני מזמין/ה אותך להצטרף למטבח המשותף שלנו "${kitchenName}" באפליקציית מטבחכם 🍽️\n\n` +
      `קוד המטבח: ${kitchenHash}\n\n` +
      `או לחלופין, לחץ על הקישור הזה:\n${shareableLink}\n\n` +
      `האפליקציה עוזרת לנו לנהל רשימת קניות, מלאי מטבח ומתכונים במשותף!`
  );

  const whatsappUrl = `https://wa.me/?text=${whatsappMessage}`;

  useEffect(() => {
    if (copiedHash) {
      const timer = setTimeout(() => setCopiedHash(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [copiedHash]);

  useEffect(() => {
    if (copiedLink) {
      const timer = setTimeout(() => setCopiedLink(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [copiedLink]);

  const handleCopyHash = async () => {
    const success = await KitchenUtils.copyToClipboard(kitchenHash);
    if (success) {
      setCopiedHash(true);
    }
  };

  const handleCopyLink = async () => {
    const success = await KitchenUtils.copyToClipboard(shareableLink);
    if (success) {
      setCopiedLink(true);
    }
  };

  const handleWhatsAppShare = () => {
    window.open(whatsappUrl, "_blank");
  };

  const handleWebShare = async () => {
    if (navigator.share && typeof navigator.share === "function") {
      try {
        await navigator.share({
          title: `הצטרף למטבח "${kitchenName}"`,
          text: `היי! אני מזמין/ה אותך להצטרף למטבח המשותף שלנו "${kitchenName}" באפליקציית מטבחכם`,
          url: shareableLink,
        });
      } catch (error) {
        handleCopyLink();
      }
    } else {
      handleCopyLink();
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      icon={<Share2 size={24} />}
      color="#E49A61"
      title="שתף מטבח"
    >
      <Box sx={{ direction: "rtl" }}>
        <Typography
          variant="body2"
          sx={{ mb: 1, color: "text.secondary", lineHeight: 1.6 }}
        >
          שתף את קוד המטבח או קישור ישיר להזמנת אנשים למטבח "{kitchenName}"
        </Typography>

        <Box sx={{ mb: 1 }}>
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
            קוד המטבח:
          </Typography>

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              p: 2,
              bgcolor: "primary.light",
              borderRadius: 2,
              border: "2px solid",
              borderColor: "primary.main",
            }}
          >
            <Typography
              variant="h3"
              sx={{
                fontFamily: "monospace",
                fontWeight: 700,
                color: "white",
                letterSpacing: "0.2em",
                flex: 1,
                textAlign: "center",
              }}
            >
              {KitchenUtils.formatHashForDisplay(kitchenHash)}
            </Typography>
            <IconButton
              onClick={handleCopyHash}
              disabled={isLoading}
              sx={{
                color: "white",
                bgcolor: "rgba(255, 255, 255, 0.2)",
                "&:hover": {
                  bgcolor: "rgba(255, 255, 255, 0.3)",
                },
              }}
            >
              {copiedHash ? <Check size={20} /> : <Copy size={20} />}
            </IconButton>
          </Box>
        </Box>

        <Box sx={{ mb: 1 }}>
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
            קישור ישיר:
          </Typography>

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              p: 1.5,
              bgcolor: "grey.50",
              borderRadius: 2,
              border: "1px solid",
              borderColor: "grey.200",
            }}
          >
            <Typography
              variant="body2"
              sx={{
                flex: 1,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                fontFamily: "monospace",
                fontSize: "12px",
              }}
            >
              {shareableLink}
            </Typography>

            <IconButton
              size="small"
              onClick={handleCopyLink}
              disabled={isLoading}
              sx={{
                color: copiedLink ? "success.main" : "text.secondary",
              }}
            >
              {copiedLink ? <Check size={16} /> : <Copy size={16} />}
            </IconButton>

            <IconButton
              size="small"
              onClick={handleWhatsAppShare}
              disabled={isLoading}
              sx={{
                color: "#25D366",
              }}
            >
              <MessageCircle size={16} />
            </IconButton>

            <IconButton
              size="small"
              onClick={handleWebShare}
              disabled={isLoading}
              sx={{
                color: "#E49A61",
              }}
            >
              <ExternalLink size={16} />
            </IconButton>
          </Box>
        </Box>

        <Alert
          severity="info"
          sx={{
            "& .MuiAlert-message": {
              direction: "rtl",
              textAlign: "right",
            },
          }}
        >
          <Typography variant="body2">
            חברי המטבח יוכלו לראות ולערוך את כל המוצרים והמתכונים המשותפים.
          </Typography>
        </Alert>
      </Box>
    </Dialog>
  );
};
