import { useState } from "react";
import { Input, Select, Table } from "antd";

const { Option } = Select;

// Conversion rates relative to 1 acre for simplicity
const conversionRates = {
  acre: 1,
  sq_ft: 43560,
  sq_yd: 4840,
  guntha: 40,
  bigha: 0.625,
  cent: 100,
  hectare: 0.4047,
  gaz: 4840, // equivalent to sq_yd
};

const units = [
  { label: "Acre", value: "acre" },
  { label: "Square Foot", value: "sq_ft" },
  { label: "Square Yard", value: "sq_yd" },
  { label: "Guntha", value: "guntha" },
  { label: "Bigha", value: "bigha" },
  { label: "Cent", value: "cent" },
  { label: "Hectare", value: "hectare" },
  { label: "Gaz", value: "gaz" },
];

const LandMeasurementConvertor = () => {
  const [inputValue, setInputValue] = useState(1);
  const [selectedUnit, setSelectedUnit] = useState("acre");

  // Calculate conversions based on input value and selected unit
  const convertValues = () => {
    const baseValueInAcres =
      inputValue / (conversionRates as any)[selectedUnit];
    return units.map((unit) => ({
      unit: unit.label,
      value: (baseValueInAcres * (conversionRates as any)[unit.value]).toFixed(
        4
      ),
    }));
  };

  const handleInputChange = (e: any) => {
    setInputValue(parseFloat(e.target.value) || 0);
  };

  const handleUnitChange = (value: string) => {
    setSelectedUnit(value);
  };

  const columns = [
    {
      title: "Unit",
      dataIndex: "unit",
      key: "unit",
    },
    {
      title: "Converted Value",
      dataIndex: "value",
      key: "value",
    },
  ];

  return (
    <div style={{ maxWidth: 400, margin: "0 auto", padding: "20px" }}>
      <Input
        type="number"
        value={inputValue}
        onChange={handleInputChange}
        style={{ width: "60%", marginRight: "8px" }}
      />
      <Select
        defaultValue="acre"
        onChange={handleUnitChange}
        style={{ width: "35%" }}
      >
        {units.map((unit) => (
          <Option key={unit.value} value={unit.value}>
            {unit.label}
          </Option>
        ))}
      </Select>
      <Table
        dataSource={convertValues()}
        columns={columns}
        pagination={false}
        rowKey="unit"
        style={{ marginTop: "20px" }}
      />
    </div>
  );
};

export default LandMeasurementConvertor;
