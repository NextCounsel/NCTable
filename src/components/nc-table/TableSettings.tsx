import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { TableSettings as TableSettingsType } from "./types";

interface TableSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  settings: TableSettingsType;
  columns: { key: string; header: string }[];
  onSettingsChange: (settings: TableSettingsType) => void;
}

export function TableSettings({
  isOpen,
  onClose,
  settings,
  columns,
  onSettingsChange,
}: TableSettingsProps) {
  const handleColumnVisibilityChange = (key: string, visible: boolean) => {
    onSettingsChange({
      ...settings,
      columns: {
        ...settings.columns,
        [key]: visible,
      },
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Table Settings</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Visible Columns</h4>
            <div className="grid gap-2">
              {columns.map((column) => (
                <div key={column.key} className="flex items-center space-x-2">
                  <Checkbox
                    id={column.key}
                    checked={settings.columns[column.key] !== false}
                    onCheckedChange={(checked) =>
                      handleColumnVisibilityChange(
                        column.key,
                        checked as boolean
                      )
                    }
                  />
                  <Label htmlFor={column.key}>{column.header}</Label>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
