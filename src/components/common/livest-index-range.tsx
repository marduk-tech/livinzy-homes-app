import React from "react";
import { Flex, Tooltip, Typography } from "antd";
import { COLORS, FONT_SIZE } from "../../theme/style-constants";

interface Grade {
  label: string;
  min: number;
  color: string;
}

interface LivestIndexRangeProps {
  value: number;
}

const LivestIndexRange: React.FC<LivestIndexRangeProps> = ({ value }) => {
  // Define the grade labels and corresponding color stops
  const grades: Grade[] = [
    { label: "A+", min: 0.55, color: "#00ff00" },
    { label: "A", min: 0.5, color: "#33ff00" },
    { label: "A-", min: 0.45, color: "#66ff00" },
    { label: "B+", min: 0.4, color: "#99ff00" },
    { label: "B", min: 0.35, color: "#ccff00" },
    { label: "B-", min: 0.3, color: "#E6FF1A" },
    { label: "C+", min: 0.25, color: "#FFFF33" },
    { label: "C", min: 0.2, color: "#FFFF99" },
    { label: "C-", min: 0.15, color: "#FFE57F" },
    { label: "D+", min: 0.1, color: "#FFCC66" },
    { label: "D", min: 0.05, color: "#FF9933" },
    { label: "D-", min: 0.01, color: "#ff6600" },
  ];

  // Calculate the marker position in percentage
  const positionPercentage: number = ((value - 0.1) * 100) / (0.7 - 0.1);

  // Define the explicit gradient background with each color stop percentage
  const gradient = `
    linear-gradient(to right, 
      #ff6600 0%, 
      #FF9933 10%, 
      #FFCC66 20%, 
      #FFE57F 30%, 
      #FFFF99 40%, 
      #FFFF33 50%, 
      #E6FF1A 60%, 
      #ccff00 70%, 
      #99ff00 80%, 
      #66ff00 85%, 
      #33ff00 90%, 
      #00ff00 100%
    )`;

  // Determine grade based on the value
  const grade: Grade =
    grades.find((g) => value >= g.min) || grades[grades.length - 1];

  return (
    <Flex style={{ width: "100%" }} gap={8} align="center">
      <Flex
        align="center"
        justify="center"
        style={{
          border: "2px solid",
          borderColor: COLORS.borderColorDark,
          borderRadius: 8,
          backgroundColor: "white",
          width: 50,
          height: 50,
        }}
      >
        <Tooltip title={`Score: ${value.toFixed(2)} - Grade: ${grade.label}`}>
          <Typography.Text
            style={{
              fontSize: FONT_SIZE.heading,
            }}
          >
            {grade.label}
          </Typography.Text>
        </Tooltip>
      </Flex>
      <div
        style={{
          width: "100%",
          height: "50px",
          background: gradient,
          position: "relative",
          borderRadius: "4px",
        }}
      >
        {" "}
        <div
          style={{
            position: "absolute",
            left: `${positionPercentage}%`,
            top: "-20px",
            transform: "translateX(-50%)",
            width: "2px",
            height: "70px",
            backgroundColor: "black",
            borderRadius: "2px",
          }}
        />
      </div>
    </Flex>
  );
};

export default LivestIndexRange;
