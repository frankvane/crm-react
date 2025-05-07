import { InputNumber } from "antd";
import React from "react";

interface UploadConfigPanelProps {
  chunkSize: number;
  setChunkSize: (v: number) => void;
  concurrent: number;
  setConcurrent: (v: number) => void;
  disabled?: boolean;
}

const UploadConfigPanel: React.FC<UploadConfigPanelProps> = ({
  chunkSize,
  setChunkSize,
  concurrent,
  setConcurrent,
  disabled,
}) => {
  return (
    <div style={{ margin: "12px 0" }}>
      <span>切片大小(MB): </span>
      <InputNumber
        min={1}
        max={100}
        step={1}
        value={chunkSize / 1024 / 1024}
        onChange={(v) => setChunkSize(Number(v) * 1024 * 1024)}
        disabled={disabled}
      />
      <span style={{ marginLeft: 16 }}>并发数: </span>
      <InputNumber
        min={1}
        max={10}
        value={concurrent}
        onChange={(v) => setConcurrent(Number(v))}
        disabled={disabled}
      />
    </div>
  );
};

export default UploadConfigPanel;
