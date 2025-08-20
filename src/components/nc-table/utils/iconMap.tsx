import React from "react";
import {
  Eye,
  FileText,
  Edit,
  Trash,
  User,
  Settings,
  Download,
  Upload,
  Plus,
  Search,
  MoreHorizontal,
  LucideIcon,
} from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  eye: Eye,
  "file-text": FileText,
  edit: Edit,
  trash: Trash,
  user: User,
  settings: Settings,
  download: Download,
  upload: Upload,
  plus: Plus,
  search: Search,
  "more-horizontal": MoreHorizontal,
};

interface IconProps {
  name: string;
  className?: string;
}

export const Icon: React.FC<IconProps> = ({ name, className = "h-4 w-4" }) => {
  const IconComponent = iconMap[name.toLowerCase()];

  if (!IconComponent) {
    return null;
  }

  return <IconComponent className={className} />;
};

export default Icon;
