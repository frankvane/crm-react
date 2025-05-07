import { Button, Modal } from "antd";

import React from "react";

interface ResumeUploadModalProps {
  open: boolean;
  resumeTask: any;
  fileInputRef: React.RefObject<HTMLInputElement>;
  onCancel: () => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDelete: () => void;
}

const ResumeUploadModal: React.FC<ResumeUploadModalProps> = ({
  open,
  resumeTask,
  fileInputRef,
  onCancel,
  onFileChange,
  onDelete,
}) => {
  if (!resumeTask) return null;
  return (
    <Modal
      open={open}
      title="恢复未完成的上传任务"
      onCancel={onCancel}
      footer={null}
      maskClosable={false}
    >
      <div style={{ marginBottom: 16 }}>
        文件：{resumeTask.name}
        <br />
        大小：{(resumeTask.size / 1024 / 1024).toFixed(2)} MB
      </div>
      <div style={{ marginBottom: 16 }}>
        <Button type="primary" onClick={() => fileInputRef.current?.click()}>
          选择原文件恢复上传
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          style={{ display: "none" }}
          onChange={onFileChange}
        />
      </div>
      <Button danger onClick={onDelete}>
        删除任务
      </Button>
    </Modal>
  );
};

export default ResumeUploadModal;
