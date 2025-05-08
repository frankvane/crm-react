import { Button, Upload, message } from "antd";
import React, { useState } from "react";

import FileUploadCard from "./FileUploadCard";
import UploadConfigPanel from "./UploadConfigPanel";
import { UploadOutlined } from "@ant-design/icons";
import { checkFileBeforeUpload } from "./utils";
import useDynamicUploadConfig from "./hooks/useDynamicUploadConfig";
import useFileUploadQueue from "./hooks/useFileUploadQueue";

interface FileUploaderProps {
  accept?: string;
  maxSizeMB?: number;
  multiple?: boolean;
}

const FileUploader: React.FC<FileUploaderProps> = ({
  accept = ".png,.jpg,.jpeg,.gif,.bmp,.webp,image/*",
  maxSizeMB = 10,
  multiple = false,
}) => {
  const [files, setFiles] = useState<File[]>([]);
  const [chunkSize, setChunkSize, concurrent, setConcurrent] =
    useDynamicUploadConfig();
  const [uploadingAll, setUploadingAll] = useState(false);

  // 用 useFileUploadQueue 管理上传主流程和 fileStates
  const {
    fileStates,
    setFileStates,
    handleStart,
    handlePause,
    handleStop,
    handleStartAll,
    handleResume,
  } = useFileUploadQueue({
    chunkSize,
    concurrent,
    setFiles,
  });

  // 新 beforeUpload，支持类型和大小校验
  const handleBeforeUpload = (file: File) => {
    const ok = checkFileBeforeUpload({
      file,
      accept,
      maxSizeMB,
      onError: (msg) => message.error(msg),
    });
    if (!ok) return Upload.LIST_IGNORE;
    setFiles((prev) => {
      if (prev.find((f) => f.name === file.name && f.size === file.size))
        return prev;
      return [...prev, file];
    });
    setFileStates((prev) => ({
      ...prev,
      [file.name + file.size]: { progress: 0, uploading: false, paused: false },
    }));
    return false;
  };

  return (
    <div>
      <Upload
        beforeUpload={handleBeforeUpload}
        showUploadList={false}
        disabled={uploadingAll}
        accept={accept}
        multiple={multiple}
      >
        <Button icon={<UploadOutlined />}>选择文件</Button>
      </Upload>
      <Button
        type="primary"
        style={{ marginLeft: 8 }}
        onClick={async () => {
          setUploadingAll(true);
          await handleStartAll(files);
          setUploadingAll(false);
        }}
        disabled={uploadingAll || files.length === 0}
      >
        上传全部
      </Button>
      <div style={{ margin: "12px 0" }}>
        <UploadConfigPanel
          chunkSize={chunkSize}
          setChunkSize={setChunkSize}
          concurrent={concurrent}
          setConcurrent={setConcurrent}
          disabled={
            uploadingAll ||
            files.some((f) => {
              const state = fileStates[f.name + f.size] || {};
              return state.uploading || state.paused;
            })
          }
        />
      </div>
      {files.map((file) => {
        const state = fileStates[file.name + file.size] || {};
        return (
          <FileUploadCard
            key={file.name + file.size}
            file={file}
            state={state}
            onStart={() => handleStart(file)}
            onPause={() => handlePause(file)}
            onResume={() => handleResume(file)}
            onStop={() => handleStop(file)}
          />
        );
      })}
    </div>
  );
};

export default FileUploader;
