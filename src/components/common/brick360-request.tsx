import {
  AutoComplete,
  AutoCompleteProps,
  Button,
  Flex,
  Form,
  Input,
  Tag,
  Typography,
} from "antd";
import { useState } from "react";
import { FONT_SIZE } from "../../theme/style-constants";

const mockVal = (str: string, repeat = 1) => ({
  value: str.repeat(repeat),
});

export function Brick360RequestForm() {
  const [form] = Form.useForm();

  const [options, setOptions] = useState<AutoCompleteProps["options"]>([]);
  const getPanelValue = (searchText: string) =>
    !searchText
      ? []
      : [mockVal(searchText), mockVal(searchText, 2), mockVal(searchText, 3)];
  const [value, setValue] = useState("");

  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  const [nextClicked, setNextClicked] = useState(false);
  const [formSuccess, setFormSuccess] = useState(false);

  return (
    <Flex gap={8} vertical style={{ paddingTop: 24, paddingBottom: 16 }}>
      {formSuccess ? (
        <Flex vertical>
          <Typography.Text
            style={{
              fontSize: FONT_SIZE.HEADING_1,
              lineHeight: "120%",
              marginBottom: 16,
            }}
          >
            Wohoo! Your request is submitted.
          </Typography.Text>
          <Typography.Text style={{ fontSize: FONT_SIZE.HEADING_4 }}>
            Our team including our swarm of AI agents are already processesing
            your request. Please give us max 24 hours to get back to you with a
            detailed report.
          </Typography.Text>
          <Typography.Text
            style={{
              fontSize: FONT_SIZE.HEADING_4,
              fontWeight: "bold",
              marginTop: 16,
            }}
          >
            We will notify you via email and message once its ready.
          </Typography.Text>
        </Flex>
      ) : nextClicked ? (
        <Flex vertical>
          <Typography.Text style={{ fontSize: FONT_SIZE.HEADING_1 }}>
            Provide Your Details
          </Typography.Text>
          <Form
            form={form}
            layout="vertical"
            onFinish={() => {}}
            style={{
              marginTop: 16,
              maxWidth: "400px",
              display: "flex",
              flexDirection: "column",
              gap: 0,
            }}
          >
            <Form.Item
              label="Your Name"
              name="name"
              rules={[{ required: true }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              label="Your Mobile Number"
              name="mobile"
              rules={[{ required: true }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              label="Email"
              name="email"
              rules={[
                {
                  type: "email",
                  message: "Please enter a valid email!",
                },
                {
                  required: true,
                },
              ]}
              validateTrigger="onSubmit"
              style={{ marginBottom: 0 }}
            >
              <Input
                style={{
                  width: "100%",
                  fontSize: FONT_SIZE.HEADING_3,
                }}
                placeholder="jondoe@gmail.com"
              />
            </Form.Item>
          </Form>
        </Flex>
      ) : (
        <Flex vertical>
          <Typography.Text style={{ fontSize: FONT_SIZE.HEADING_1 }}>
            Search Project
          </Typography.Text>
          <AutoComplete
            value={value}
            options={options}
            onChange={setValue}
            style={{ width: "100%" }}
            onSelect={(value: string) => {
              setSelectedProjects([value, ...selectedProjects]);
              setValue("");
            }}
            onSearch={(text) => setOptions(getPanelValue(text))}
            placeholder="Enter name of the project"
          />
          <Flex vertical gap={16} style={{ marginTop: 24 }}>
            {selectedProjects.map((p) => (
              <Flex>
                <Tag style={{ fontSize: FONT_SIZE.HEADING_3, padding: "8px" }}>
                  {p}
                </Tag>
              </Flex>
            ))}
          </Flex>
        </Flex>
      )}

      {formSuccess ? null : (
        <Flex justify="flex-end" style={{ marginTop: 24 }} gap={16}>
          <Button
            disabled={!selectedProjects.length}
            onClick={() => {
              setNextClicked(!nextClicked);
            }}
          >
            {!nextClicked ? "Next" : "Previous"}
          </Button>
          {nextClicked ? (
            <Button
              disabled={!selectedProjects.length}
              onClick={() => {
                setNextClicked(true);
              }}
              type="primary"
            >
              {!nextClicked ? "Next" : "Submit"}
            </Button>
          ) : null}
        </Flex>
      )}
    </Flex>
  );
}
