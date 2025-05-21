import { useEffect, useRef, useState } from "react";

import { FormInstance } from "antd/es/form";
import { debounce } from "lodash";
import { message } from "antd";

// 定义 options 类型
interface UseFormDraftOptions {
  debounce?: number;
}

// 泛型 T 表示表单数据类型
export function useFormDraft<T extends object = any>(
  form: FormInstance<T>,
  key: string = "default",
  options: UseFormDraftOptions = {}
): {
  clearDraft: () => void;
  saveDraft: (values: T) => void;
} {
  const storageKey = `form_draft_${key}`;
  const [saved, setSaved] = useState<T | null>(() => {
    try {
      const item = localStorage.getItem(storageKey);
      return item ? (JSON.parse(item) as T) : null;
    } catch (error) {
      console.error("Error reading from localStorage:", error);
      return null;
    }
  });

  const initialized = useRef(false);

  // 类型化 values
  const saveDraft = debounce((values: T) => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(values));
      setSaved(values);
    } catch (error) {
      message.error("保存草稿失败，请检查浏览器存储权限");
      console.error("Error saving to localStorage:", error);
    }
  }, options.debounce || 1000);

  useEffect(() => {
    if (saved && !initialized.current) {
      form.setFieldsValue(saved);
      initialized.current = true;
    }
  }, [form, saved]);

  const clearDraft = () => {
    try {
      localStorage.removeItem(storageKey);
      setSaved(null);
      form.resetFields();
    } catch (error) {
      message.error("清除草稿失败，请检查浏览器存储权限");
      console.error("Error clearing localStorage:", error);
    }
  };

  return { clearDraft, saveDraft };
}
