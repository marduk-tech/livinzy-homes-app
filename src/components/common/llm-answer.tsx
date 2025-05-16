import { Flex } from "antd";
import React, { useState } from "react";
import { FONT_SIZE } from "../../theme/style-constants";

type LLMTextProps = {
  html: string; // HTML content as string
  maxLines?: number;
  disableClip: boolean;
};

const LLMText: React.FC<LLMTextProps> = ({
  html,
  maxLines = 3,
  disableClip,
}) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <Flex vertical>
      <div
        style={{
          display: "-webkit-box",
          WebkitLineClamp: expanded || disableClip ? "unset" : maxLines,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}
        className="reasoning"
        dangerouslySetInnerHTML={{ __html: html }}
      />
      {disableClip ? null : (
        <button
          onClick={() => setExpanded(!expanded)}
          style={{
            marginTop: "4px",
            background: "none",
            border: "none",
            color: "#0084d1",
            cursor: "pointer",
            padding: 0,
            fontSize: FONT_SIZE.PARA,
            textAlign: "left",
          }}
        >
          {expanded ? "Show Less" : "..Show More"}
        </button>
      )}
    </Flex>
  );
};

export default LLMText;
