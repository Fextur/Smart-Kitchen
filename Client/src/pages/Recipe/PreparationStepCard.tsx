import { FC } from "react";
import { Box, Typography } from "@mui/material";
import { Timer } from "lucide-react";

interface PreparationStepCardProps {
  step: {
    stepNumber: number;
    instruction: string;
    isTimerStep?: boolean;
    timerMinutes?: number;
  };
}

export const PreparationStepCard: FC<PreparationStepCardProps> = ({ step }) => {
  return (
    <Box
      sx={{
        bgcolor: "background.paper",
        my: 1.5,
        px: 2,
        borderBottom: "1px solid",
        borderColor: "grey.100",
        direction: "rtl",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        minHeight: 45,
        borderRadius: "50px",
      }}
    >
      <Box
        sx={{
          width: 24,
          height: 24,
          bgcolor: "primary.main",
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <Typography
          variant="caption"
          sx={{
            color: "white",
            fontWeight: 600,
            fontSize: "12px",
          }}
        >
          {step.stepNumber}
        </Typography>
      </Box>

      <Box sx={{ flex: 1, display: "flex", alignItems: "center", gap: 1 }}>
        <Typography
          variant="body2"
          sx={{
            color: "text.primary",
            lineHeight: 1.4,
            flex: 1,
          }}
        >
          {step.instruction}
        </Typography>

        {step.isTimerStep && <Timer size={16} color="#E49A61" />}
      </Box>
    </Box>
  );
};
