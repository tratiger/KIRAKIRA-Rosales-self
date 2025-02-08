/**
 * 通过 RBAC 检查用户的权限的参数
 */
export type CheckUserRbacParams = ({ uuid: string, uid: never } | { uid: number, uuid: never }) & { apiPath: string }

/**
 * 通过 RBAC 检查用户的权限的结果
 */
export type CheckUserRbacResult = {
	status: 200 | 403 | 500,
	message: string
}

/**
 * RBAC API 路径
 */
type RbacApiPath = {
	/** API 路径的 UUID - 非空 - 唯一 */
	apiPathUuid: string,
	/** API 路径 - 非空 - 唯一 */
	apiPath: string,
	/** API 路径的类型 */
	apiPathType?: string,
	/** API 路径的颜色 */
	apiPathColor?: string,
	/** API 路径的描述 */
	apiPathDescription?: string,
	/** API 路径创建者 - 非空 */
	creatorUuid: string,
	/** API 路径最后更新者 - 非空 */
	lastEditorUuid: string,
	/** 系统专用字段-创建时间 - 非空 */
	createDateTime: number,
	/** 系统专用字段-最后编辑时间 - 非空 */
	editDateTime: number,
}

/**
 * 创建 RBAC API 路径的请求载荷
 */
export type CreateRbacApiPathRequestDto = {
	/** API 路径*/
	apiPath: string,
	/** API 路径的类型 */
	apiPathType?: string,
	/** API 路径的颜色 */
	apiPathColor?: string,
	/** API 路径的描述 */
	apiPathDescription?: string,
}

/**
 * 创建 RBAC API 路径的请求载荷
 */
export type CreateRbacApiPathResponseDto = {
	/** 是否请求成功 */
	success: boolean;
	/** 附加的文本消息 */
	message?: string;
	/** 如果成功，返回创建的这个收藏夹数据 */
	result?: RbacApiPath & {
		/** 该路径是否已经被分配了至少一次 */
		isAssignedOnce: boolean
	};
}
