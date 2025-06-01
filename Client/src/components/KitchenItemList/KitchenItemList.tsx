import { useState, useRef, FC, useCallback, ReactNode } from "react";
import { Box, Typography, IconButton } from "@mui/material";
import { useVirtualizer } from "@tanstack/react-virtual";
import { ChevronDown, ChevronUp, Edit3, Plus } from "lucide-react";
import { KitchenItem, ShoppingListItem } from "@/types";
import { AddNewItemDialog } from "@/components/KitchenItemList/AddNewItemDialog";

interface KitchenItemListProps {
  itemsCount: number;
  onAddNewItem?: (
    item:
      | Omit<KitchenItem, "id" | "latestUpdateDate">
      | Omit<ShoppingListItem, "id" | "latestUpdateDate">
  ) => void;
  title?: string;
  isEditToggable?: boolean;
  isEditing?: boolean;
  initialCollapsed?: boolean;
  renderRow: (itemIndex: number, isEditing?: boolean) => ReactNode;
  maxHeight?: string;
  showExperationDateOnNewItem?: boolean;
}

export const KitchenItemList: FC<KitchenItemListProps> = ({
  itemsCount,
  onAddNewItem,
  title,
  isEditToggable = false,
  isEditing = false,
  initialCollapsed = false,
  renderRow,
  maxHeight = "400px",
  showExperationDateOnNewItem = true,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(initialCollapsed);
  const [showEditMode, setShowEditMode] = useState(isEditing);
  const [showAddNewDialog, setShowAddNewDialog] = useState(false);
  const parentRef = useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: isCollapsed ? 0 : itemsCount + (onAddNewItem ? 1 : 0),
    getScrollElement: () => parentRef.current,
    estimateSize: () => 70,
    overscan: 5,
  });

  const toggleCollapsed = useCallback(() => {
    setIsCollapsed((prev) => !prev);
  }, []);

  const toggleEditMode = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setShowEditMode((prev) => !prev);
  }, []);

  const handleAddNewClick = useCallback(() => {
    setShowAddNewDialog(true);
  }, []);

  const handleAddNewSave = useCallback(
    (
      newItem:
        | Omit<KitchenItem, "id" | "latestUpdateDate">
        | Omit<ShoppingListItem, "id" | "latestUpdateDate">
    ) => {
      if (onAddNewItem) {
        onAddNewItem(newItem);
      }
      setShowAddNewDialog(false);
    },
    [onAddNewItem]
  );

  const handleCloseAddNewDialog = useCallback(() => {
    setShowAddNewDialog(false);
  }, []);

  return (
    <Box
      sx={{
        borderRadius: 2,
        overflow: "hidden",
        direction: "rtl",
        minHeight: 120,
      }}
    >
      {title && (
        <Box
          onClick={toggleCollapsed}
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            p: 2,
            cursor: "pointer",
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
            {!isEditing && isEditToggable && !isCollapsed && (
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
              {isCollapsed ? (
                <ChevronDown size={16} />
              ) : (
                <ChevronUp size={16} />
              )}
            </IconButton>
          </Box>
        </Box>
      )}

      {!isCollapsed && (
        <Box
          ref={parentRef}
          sx={{
            overflow: "auto",
            maxHeight: maxHeight,
            minHeight: 100,
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
              pb: 1,
            }}
          >
            {rowVirtualizer.getVirtualItems().map((virtualItem) => {
              if (virtualItem.index === itemsCount) {
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
                    <Box
                      onClick={handleAddNewClick}
                      sx={{
                        bgcolor: "background.paper",
                        my: 1.5,
                        px: 2,
                        border: "2px dashed",
                        borderColor: "primary.main",
                        direction: "rtl",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        minHeight: 60,
                        borderRadius: "50px",
                        cursor: "pointer",
                        transition: "all 0.2s",
                        "&:hover": {
                          bgcolor: "primary.light",
                          color: "white",
                        },
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          color: "primary.main",
                          "&:hover": {
                            color: "white",
                          },
                        }}
                      >
                        <Plus size={20} />
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          הוסף פריט חדש
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                );
              }

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
                  {renderRow(virtualItem.index, isEditing || showEditMode)}
                </Box>
              );
            })}
          </Box>
        </Box>
      )}

      {isCollapsed && title && (
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
            {itemsCount} פריטים
          </Typography>
        </Box>
      )}

      <AddNewItemDialog
        isOpen={showAddNewDialog}
        onClose={handleCloseAddNewDialog}
        onSave={handleAddNewSave}
        showExperationDate={showExperationDateOnNewItem}
      />
    </Box>
  );
};
