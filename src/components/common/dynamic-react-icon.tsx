import React from "react";
import * as FaIcons from "react-icons/fa";
import * as MdIcons from "react-icons/md";
import * as GiIcons from "react-icons/gi";
import * as AiIcons from "react-icons/ai";
import * as IoIcons from "react-icons/io";
import * as TbIcons from "react-icons/tb";
import * as SiIcons from "react-icons/si";
import * as RiIcons from "react-icons/ri";
import * as FiIcons from "react-icons/fi";

type IconSetKey = "fa" | "md" | "gi" | "ai" | "io" | "tb" | "si" | "ri" | "fi";

interface IconProps {
  iconSet: IconSetKey;
  iconName: string;
  size?: number;
  color?: string;
}

// Mapping for icon sets
const iconSets = {
  fa: FaIcons,
  md: MdIcons,
  gi: GiIcons,
  ai: AiIcons,
  io: IoIcons,
  tb: TbIcons,
  si: SiIcons,
  ri: RiIcons,
  fi: FiIcons,
};

const DynamicReactIcon: React.FC<IconProps> = ({
  iconSet,
  iconName,
  size = 24,
  color = "black",
}) => {
  if (!iconSet || !iconSets[iconSet]) {
    return;
  }
  // Retrieve the correct icon component and cast it to a valid React component type
  const IconComponent = iconSets[iconSet][
    iconName as keyof (typeof iconSets)[IconSetKey]
  ] as React.ComponentType<{ size?: number; color?: string }>;

  // Check if the icon exists
  if (!IconComponent) {
    console.warn(`Icon ${iconName} from set ${iconSet} not found.`);
    return null;
  }

  return <IconComponent size={size} color={color} />;
};

export default DynamicReactIcon;
