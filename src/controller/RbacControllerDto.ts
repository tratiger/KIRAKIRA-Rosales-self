/**
 * 通过 RBAC 检查用户的权限的参数
 */
export type CheckUserRbacParams = ({ uuid: string; uid: never } | { uid: number; uuid: never }) & { apiPath: string }

/**
 * 通过 RBAC 检查用户的权限的结果
 */
export type CheckUserRbacResult = {
	status: 200 | 403 | 500;
	message: string;
}

/**
 * RBAC API 路径
 */
type RbacApiPath = {
	/** API 路径的 UUID - 非空 - 唯一 */
	apiPathUuid: string;
	/** API 路径 - 非空 - 唯一 */
	apiPath: string;
	/** API 路径的类型 */
	apiPathType?: string;
	/** API 路径的颜色 */
	apiPathColor?: string;
	/** API 路径的描述 */
	apiPathDescription?: string;
	/** API 路径创建者 - 非空 */
	creatorUuid: string;
	/** API 路径最后更新者 - 非空 */
	lastEditorUuid: string;
	/** 系统专用字段-创建时间 - 非空 */
	createDateTime: number;
	/** 系统专用字段-最后编辑时间 - 非空 */
	editDateTime: number;
}

/**
 * RBAC API 路径的结果
 */
type RbacApiPathResult = RbacApiPath & {
	/** 该路径是否已经被分配了至少一次 */
	isAssignedOnce: boolean;
}

/**
 * 创建 RBAC API 路径的请求载荷
 */
export type CreateRbacApiPathRequestDto = {
	/** API 路径*/
	apiPath: string;
	/** API 路径的类型 */
	apiPathType?: string;
	/** API 路径的颜色 */
	apiPathColor?: string;
	/** API 路径的描述 */
	apiPathDescription?: string;
}

/**
 * 创建 RBAC API 路径的请求载荷
 */
export type CreateRbacApiPathResponseDto = {
	/** 是否请求成功 */
	success: boolean;
	/** 附加的文本消息 */
	message?: string;
	/** 如果成功，返回创建的数据 */
	result?: RbacApiPathResult;
}

/**
 * RBAC 角色
 */
type RbacRole = {
	/** 角色的 UUID */
	roleUuid: string;
	/** 角色的名字 */
	roleName: string;
	/** 角色的类型 */
	roleType?: string;
	/** 角色的颜色 */
	roleColor?: string;
	/** 角色的描述 */
	roleDescription?: string;
	/** 这个角色有哪些 API 路径的访问权 */
	apiPathPermissions: string[];
	/** API 路径创建者 - 非空 */
	creatorUuid: string;
	/** API 路径最后更新者 - 非空 */
	lastEditorUuid: string;
	/** 系统专用字段-创建时间 - 非空 */
	createDateTime: number;
	/** 系统专用字段-最后编辑时间 - 非空 */
	editDateTime: number;
}

/**
 * 创建 RBAC 角色的请求载荷
 */
export type CreateRbacRoleRequestDto = {
	/** 角色的名字 */
	roleName: string;
	/** 角色的类型 */
	roleType?: string;
	/** 角色的颜色 */
	roleColor?: string;
	/** 角色的描述 */
	roleDescription?: string;
}

/**
 * 创建 RBAC 角色的请求载荷
 */
export type CreateRbacRoleResponseDto = {
	/** 是否请求成功 */
	success: boolean;
	/** 附加的文本消息 */
	message?: string;
	/** 如果成功，返回创建的数据 */
	result?: RbacRole;
}
