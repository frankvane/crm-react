import React from "react";
import { Tooltip } from "antd";
import { usePermission } from "@/hooks/usePermission";

interface PermissionProps {
  // 权限标识
  permission: string;
  // 是否禁用
  disabled?: boolean;
  // 禁用时的提示
  disabledTip?: string;
  // 子组件
  children: React.ReactNode;
}

const Permission: React.FC<PermissionProps> = ({
  permission,
  disabled = false,
  disabledTip = "无权限",
  children,
}) => {
  const hasPermission = usePermission(permission);

  // 如果没有权限，返回禁用状态的按钮
  if (!hasPermission) {
    return (
      <Tooltip title={disabledTip}>
        <span style={{ opacity: 0.5, cursor: "not-allowed" }}>
          {React.cloneElement(children as React.ReactElement, {
            disabled: true,
          })}
        </span>
      </Tooltip>
    );
  }

  // 如果有权限，返回正常状态的按钮
  return React.cloneElement(children as React.ReactElement, {
    disabled,
  });
};

export default Permission;
