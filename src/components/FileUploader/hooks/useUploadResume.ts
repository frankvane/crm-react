import { useEffect, useRef, useState } from "react";

import { calcFileMD5WithWorker } from "../utils";
import { message } from "antd";

const LOCAL_KEY_PREFIX = "fileUploader_progress_";

export default function useUploadResume({
  handleStart,
}: {
  handleStart: (file: File) => void;
}) {
  const [resumeTaskList, setResumeTaskList] = useState<any[]>([]);
  const [resumeTask, setResumeTask] = useState<any>(null);
  const [showResume, setShowResume] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // 页面加载时收集所有断点任务
  useEffect(() => {
    const keys = Object.keys(localStorage).filter((k) =>
      k.startsWith(LOCAL_KEY_PREFIX)
    );
    const tasks = keys
      .map((k) => {
        try {
          return JSON.parse(localStorage.getItem(k)!);
        } catch {
          return null;
        }
      })
      .filter(Boolean);
    setResumeTaskList(tasks);
  }, []);

  // 恢复上传时文件选择
  const handleResumeFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    setFiles: React.Dispatch<React.SetStateAction<File[]>>,
    setFileStates: React.Dispatch<any>
  ) => {
    const files = e.target.files;
    if (!files || !resumeTask) return;
    const selectedFile = files[0];
    // 校验文件名、大小
    if (
      selectedFile.name !== resumeTask.name ||
      selectedFile.size !== resumeTask.size
    ) {
      message.error("所选文件与未完成任务不一致，请选择正确的原文件");
      return;
    }
    // 计算md5校验
    message.loading({ content: "正在校验文件MD5...", key: "md5-check" });
    const md5 = await calcFileMD5WithWorker(selectedFile);
    if (md5 !== resumeTask.md5) {
      message.error("文件MD5校验失败，请选择正确的原文件");
      return;
    }
    message.success({
      content: "校验通过，恢复上传",
      key: "md5-check",
      duration: 1,
    });
    setFiles((prev) => {
      if (
        prev.find(
          (f) => f.name === selectedFile.name && f.size === selectedFile.size
        )
      )
        return prev;
      return [...prev, selectedFile];
    });
    setFileStates((prev: any) => ({
      ...prev,
      [selectedFile.name + selectedFile.size]: {
        progress: 0,
        uploading: false,
        paused: false,
      },
    }));
    setShowResume(false);
    setTimeout(() => handleStart(selectedFile), 300);
  };

  return {
    resumeTaskList,
    resumeTask,
    setResumeTask,
    showResume,
    setShowResume,
    fileInputRef,
    handleResumeFileChange,
  };
}
