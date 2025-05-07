import { Button, Progress } from "antd";
import {
  CaretRightOutlined,
  PauseOutlined,
  StopOutlined,
} from "@ant-design/icons";

import React from "react";

interface FileUploadCardProps {
  file: File;
  state: any;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
}

const FileUploadCard: React.FC<FileUploadCardProps> = ({
  file,
  state = {},
  onStart,
  onPause,
  onResume,
  onStop,
}) => {
  return (
    <div
      style={{
        marginTop: 16,
        border: "1px solid #eee",
        padding: 8,
        borderRadius: 4,
      }}
    >
      <div>{file.name}</div>
      <div>文件大小：{(file.size / 1024 / 1024).toFixed(2)} MB</div>
      <Progress percent={state.progress || 0} />
      <div style={{ marginTop: 8 }}>
        {!state.uploading && !state.paused && (
          <Button
            type="primary"
            onClick={onStart}
            icon={<CaretRightOutlined />}
            disabled={state.uploading}
          >
            开始上传
          </Button>
        )}
        {state.uploading && !state.paused && (
          <Button onClick={onPause} icon={<PauseOutlined />}>
            暂停
          </Button>
        )}
        {state.paused && (
          <Button
            type="primary"
            onClick={onResume}
            icon={<CaretRightOutlined />}
          >
            恢复
          </Button>
        )}
        {(state.uploading || state.paused) && (
          <Button danger onClick={onStop} icon={<StopOutlined />}>
            中断上传
          </Button>
        )}
      </div>
      <div style={{ marginTop: 8 }}>
        <span>
          {state.uploadingChunks || 0}/{state.totalChunks || 0} 分片已上传
        </span>
        {state.md5 && <span style={{ marginLeft: 16 }}>MD5: {state.md5}</span>}
      </div>
    </div>
  );
};

export default FileUploadCard;
