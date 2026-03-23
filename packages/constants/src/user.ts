import { UserType, UserStatus } from '@gongchengcang/types'

export const USER_TYPE_OPTIONS = [
  { label: '平台运营', value: UserType.PLATFORM },
  { label: '租户超级管理员', value: UserType.TENANT_ADMIN },
  { label: '租户普通子账号', value: UserType.TENANT_USER },
  { label: '商户用户', value: UserType.MERCHANT },
]

export const USER_TYPE_MAP: Record<UserType, { label: string; color: string }> = {
  [UserType.PLATFORM]: { label: '平台运营', color: 'blue' },
  [UserType.TENANT_ADMIN]: { label: '租户超级管理员', color: 'purple' },
  [UserType.TENANT_USER]: { label: '租户普通子账号', color: 'cyan' },
  [UserType.MERCHANT]: { label: '商户用户', color: 'green' },
}

export const USER_STATUS_OPTIONS = [
  { label: '启用', value: UserStatus.ENABLED },
  { label: '停用', value: UserStatus.DISABLED },
]

export const USER_STATUS_MAP: Record<UserStatus, { label: string; color: string }> = {
  [UserStatus.ENABLED]: { label: '启用', color: 'green' },
  [UserStatus.DISABLED]: { label: '停用', color: 'gray' },
}
