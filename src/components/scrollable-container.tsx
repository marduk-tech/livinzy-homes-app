import { Flex } from "antd";

export function ScrollableContainer({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        flex: 1,
        overflowY: "auto",
        paddingRight: 8,
        paddingTop: 8,
        scrollbarWidth: "none",
        height: "calc(100vh - 300px)",
      }}
    >
      <Flex vertical>{children}</Flex>
    </div>
  );
}
