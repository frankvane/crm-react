import { useEffect, useRef, useState } from "react";

import { debounce } from "lodash";

// 导出一个函数，用于保存表单草稿
export function useFormDraft(form, key = "default", options = {}) {
  // 定义存储键
  const storageKey = `form_draft_${key}`;
  // 使用 useState 管理本地状态
  const [saved, setSaved] = useState(() => {
    try {
      const item = localStorage.getItem(storageKey);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error("Error reading from localStorage:", error);
      return null;
    }
  });

  // 使用 useRef 钩子，记录表单是否已经初始化
  const initialized = useRef(false);

  // 定义保存草稿函数，使用防抖技术，每隔一定时间保存一次
  const saveDraft = debounce((values) => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(values));
      setSaved(values);
    } catch (error) {
      console.error("Error saving to localStorage:", error);
    }
  }, options.debounce || 1000);

  // 使用 useEffect 钩子，在表单初始化时，将保存的草稿赋值给表单
  useEffect(() => {
    if (saved && !initialized.current) {
      form.setFieldsValue(saved);
      initialized.current = true;
    }
  }, [form, saved]);

  // 定义清除草稿函数，将保存的草稿清空，并重置表单
  const clearDraft = () => {
    try {
      localStorage.removeItem(storageKey);
      setSaved(null);
      form.resetFields();
    } catch (error) {
      console.error("Error clearing localStorage:", error);
    }
  };

  // 返回清除草稿和保存草稿的函数
  return { clearDraft, saveDraft };
}
