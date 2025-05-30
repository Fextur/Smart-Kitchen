import { useState, useRef, FC } from "react";
import { Box, Typography, IconButton } from "@mui/material";
import { useVirtualizer } from "@tanstack/react-virtual";
import { ChevronDown, ChevronUp, Edit3 } from "lucide-react";
import { KitchenItem } from "@/types";
import { KitchenItemCard } from "@/components/KitchenItemList/KitchenItemCard/KitchenItemCard";

interface KitchenItemListProps {
  items: KitchenItem[];
  onEditItem?: (updatedItem: KitchenItem) => void;
  title?: string;
  initialCollapsed?: boolean;
}

export const KitchenItemList: FC<KitchenItemListProps> = ({
  items,
  onEditItem,
  title,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const parentRef = useRef<HTMLDivElement>(null);
  const [isEditing, setIsEditing] = useState(false);

  const rowVirtualizer = useVirtualizer({
    count: isCollapsed ? 0 : items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 65,
    overscan: 5,
  });

  const toggleCollapsed = () => {
    setIsCollapsed(!isCollapsed);
  };

  const toggleEditMode = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(!isEditing);
  };

  return (
    <Box
      sx={{
        // bgcolor: "background.paper",
        borderRadius: 2,
        // boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        overflow: "hidden",
        direction: "rtl",
        minHeight: 120,
      }}
    >
      <Box
        onClick={toggleCollapsed}
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          p: 2,
          cursor: "pointer",
          borderBottom: "1px solid",
          borderColor: "grey.100",
          "&:hover": {
            bgcolor: "grey.50",
          },
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            {title}
          </Typography>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {onEditItem !== undefined && !isCollapsed && (
            <IconButton
              size="small"
              onClick={toggleEditMode}
              sx={{
                bgcolor: "transparent",
                borderRadius: 1,
                color: "primary.main",
              }}
            >
              <Edit3 size={16} />
            </IconButton>
          )}

          <IconButton size="small" sx={{ color: "text.secondary" }}>
            {isCollapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
          </IconButton>
        </Box>
      </Box>

      {!isCollapsed && (
        <Box
          ref={parentRef}
          sx={{
            overflow: "auto",
            maxHeight: 400,
            minHeight: 75,
            // Custom scrollbar styles
            "&::-webkit-scrollbar": {
              width: 8,
            },
            "&::-webkit-scrollbar-track": {
              bgcolor: "grey.50",
              borderRadius: 10,
            },
            "&::-webkit-scrollbar-thumb": {
              bgcolor: "grey.300",
              borderRadius: 10,
              "&:hover": {
                bgcolor: "grey.400",
              },
            },
            scrollbarWidth: "thin",
            scrollbarColor: "grey.300 grey.50",
          }}
        >
          <Box
            sx={{
              height: `${rowVirtualizer.getTotalSize()}px`,
              width: "100%",
              position: "relative",
            }}
          >
            {rowVirtualizer.getVirtualItems().map((virtualItem) => {
              const item = items[virtualItem.index];
              return (
                <Box
                  key={virtualItem.key}
                  sx={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: `${virtualItem.size}px`,
                    transform: `translateY(${virtualItem.start}px)`,
                  }}
                >
                  <KitchenItemCard
                    item={item}
                    onEdit={onEditItem}
                    isEditing={isEditing}
                  />
                </Box>
              );
            })}
          </Box>
        </Box>
      )}

      {isCollapsed && (
        <Box
          onClick={toggleCollapsed}
          sx={{
            p: 2,
            textAlign: "center",
            cursor: "pointer",
            "&:hover": {
              bgcolor: "grey.50",
            },
          }}
        >
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            {items.length} פריטים
          </Typography>
        </Box>
      )}
    </Box>
  );
};
