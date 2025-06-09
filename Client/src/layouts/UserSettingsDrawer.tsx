import { FC } from "react";
import { Drawer } from "@/components/Drawer";
import UserSettings from "@/components/UserSettings";

interface Props {
  open: boolean;
  onClose: () => void;
}

export const UserSettingsDrawer: FC<Props> = ({ open, onClose }) => {
  return (
    <Drawer open={open} onClose={onClose}>
      <UserSettings />
    </Drawer>
  );
};
