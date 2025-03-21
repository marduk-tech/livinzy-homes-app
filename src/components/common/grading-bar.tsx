import React from "react";
import { COLORS } from "../../theme/style-constants";

type GradientBarProps = {
  value: number;
};

const GradientBar: React.FC<GradientBarProps> = ({ value }) => {
  const interpolate = (start: number, end: number, factor: number): number => {
    return Math.round(start + (end - start) * factor);
  };

  const getGradientColor = (value: number): string => {
    const clampedValue = Math.max(0, Math.min(100, value)); // Ensure the value is between 0-100

    // Define color stops
    const colors = [
      { stop: 0, color: [255, 105, 97] }, // Red-Orange
      { stop: 25, color: [255, 181, 76] }, // Orange-Yellow
      { stop: 50, color: [248, 214, 109] }, // Light Yellow
      { stop: 75, color: [122, 189, 126] }, // Greenish
      { stop: 100, color: [140, 212, 126] }, // Light Green
    ];

    // Find two nearest stops
    for (let i = 0; i < colors.length - 1; i++) {
      const start = colors[i];
      const end = colors[i + 1];

      if (clampedValue >= start.stop && clampedValue <= end.stop) {
        const factor = (clampedValue - start.stop) / (end.stop - start.stop);

        const r = interpolate(start.color[0], end.color[0], factor);
        const g = interpolate(start.color[1], end.color[1], factor);
        const b = interpolate(start.color[2], end.color[2], factor);

        return `rgb(${r}, ${g}, ${b})`;
      }
    }

    // Default fallback (should never hit)
    return "rgb(255, 105, 97)";
  };

  return (
    <div
      style={{
        width: "100%",
        maxWidth: 200,
        marginLeft: "auto",
        borderRadius: 24,
        border: "1px solid",
        borderColor: COLORS.borderColor,
      }}
    >
      {/* Gradient Background */}
      <div
        className="absolute inset-0"
        style={{
          backgroundColor: COLORS.bgColorMedium,
          width: "100%",
          height: "100%",
          borderRadius: 24,
          border: "1px solid",
          borderColor: COLORS.borderColor,
        }}
      >
        <div
          style={{
            width: `${value}%`,
            backgroundColor: getGradientColor(value),
            height: "100%",
            border: "1px solid",
            borderRadius: 24,
            borderColor: COLORS.borderColor,
          }}
        >
          {" "}
        </div>
      </div>
    </div>
  );
};

export default GradientBar;
