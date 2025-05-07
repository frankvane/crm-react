import { Button, Upload, message } from "antd";
import React, { useState } from "react";

import FileUploadCard from "./FileUploadCard";
import ResumeUploadModal from "./ResumeUploadModal";
import UploadConfigPanel from "./UploadConfigPanel";
import { UploadOutlined } from "@ant-design/icons";
import { checkFileBeforeUpload } from "./utils";
import useDynamicUploadConfig from "./hooks/useDynamicUploadConfig";
import useFileUploadQueue from "./hooks/useFileUploadQueue";
import useUploadResume from "./hooks/useUploadResume";

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
    handleResume,
    handleStop,
    handleStartAll,
  } = useFileUploadQueue({
    chunkSize,
    concurrent,
    setFiles,
  });

  // 用 useUploadResume 管理断点续传相关状态和逻辑
  const {
    resumeTaskList,
    resumeTask,
    setResumeTask,
    showResume,
    setShowResume,
    fileInputRef,
    handleResumeFileChange,
  } = useUploadResume({
    handleStart: (file) => handleStart(file),
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
      <Button
        style={{ marginLeft: 8 }}
        onClick={() => {
          if (resumeTaskList.length === 0) {
            message.info("暂无可恢复的上传任务");
            return;
          }
          setResumeTask(resumeTaskList[0]);
          setShowResume(true);
        }}
        disabled={uploadingAll}
      >
        恢复上传
      </Button>
      <div style={{ margin: "12px 0" }}>
        <UploadConfigPanel
          chunkSize={chunkSize}
          setChunkSize={setChunkSize}
          concurrent={concurrent}
          setConcurrent={setConcurrent}
          disabled={uploadingAll}
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
      {showResume && (
        <ResumeUploadModal
          open={showResume}
          resumeTask={resumeTask}
          fileInputRef={fileInputRef}
          onCancel={() => setShowResume(false)}
          onFileChange={(e) =>
            handleResumeFileChange(e, setFiles, setFileStates)
          }
          onDelete={() => {
            setShowResume(false);
            localStorage.removeItem(resumeTask.fileId);
            window.location.reload();
          }}
        />
      )}
    </div>
  );
};

export default FileUploader;
