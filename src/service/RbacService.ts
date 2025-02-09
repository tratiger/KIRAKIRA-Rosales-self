import { InferSchemaType, PipelineStage, Query } from "mongoose";
import { CheckUserRbacParams, CheckUserRbacResult, CreateRbacApiPathRequestDto, CreateRbacApiPathResponseDto, CreateRbacRoleRequestDto, CreateRbacRoleResponseDto, UpdateApiPathPermissionsForRoleRequestDto, UpdateApiPathPermissionsForRoleResponseDto } from "../controller/RbacControllerDto.js";
import { checkUserTokenByUuidService, getUserUuid } from "./UserService.js";
import { findOneAndUpdateData4MongoDB, insertData2MongoDB, selectDataByAggregateFromMongoDB, selectDataFromMongoDB } from "../dbPool/DbClusterPool.js";
import { UserAuthSchema } from "../dbPool/schema/UserSchema.js";
import { RbacApiSchema, RbacRoleSchema } from "../dbPool/schema/RbacSchema.js";
import { v4 as uuidV4 } from 'uuid'
import { QueryType, SelectType, UpdateType } from "../dbPool/DbClusterPoolTypes.js";
import { abortAndEndSession, createAndStartSession } from "../common/MongoDBSessionTool.js";
import { koaCtx } from "../type/koaTypes.js";

/**
 * 通过 RBAC 检查用户的权限
 * @param params 通过 RBAC 检查用户的权限的参数
 * @returns 通过 RBAC 检查用户的权限的结果
 */
export const checkUserByRbac = async (params: CheckUserRbacParams): Promise<CheckUserRbacResult> => {
	try {
		const apiPath = params.apiPath
		let uuid: string | undefined = undefined
		let uid: number | undefined = undefined
		if ('uuid' in params) uuid = params.uuid
		if ('uid' in params) uid = params.uid

		if (!uuid && uid === undefined) {
			console.error('ERROR', '用户执行 RBAC 鉴权时失败，未提供 UUID 或 UID')
			return { status: 500, message: `用户执行 RBAC 鉴权时失败，未提供 UUID 或 UID` }
		}

		const match = { UUID: uuid, uid }
		Object.keys(match).forEach(key => {
			if (match[key] === undefined) {
				delete match[key];
			}
		});

		const checkUserRbacPipeline: PipelineStage[] = [
			// 匹配用户
			{
				$match: match,
			},
			// 关联 roles 集合
			{
				$lookup: {
					from: "rbac-roles",
					localField: "roles",
					foreignField: "roleName",
					as: "rolesData"
				}
			},
			// 展开 rolesData 数组（多个角色）
			{ $unwind: "$rolesData" },
			// 展开 apiPathNamePermissions 数组（多个权限）
			{ $unwind: "$rolesData.apiPathPermissions" },
			// 过滤出匹配的 API 路径
			{
				$match: {
					"rolesData.apiPathPermissions": apiPath
				}
			},
			// 只返回有权限的数据
			{ $project: { UUID: 1 } }
		]

		const { collectionName: userAuthCollectionName, schemaInstance: userAuthSchemaInstance } = UserAuthSchema
		type UserAuth = InferSchemaType<typeof userAuthSchemaInstance>
		const checkUserRbacResult = await selectDataByAggregateFromMongoDB<UserAuth>(userAuthSchemaInstance, userAuthCollectionName, checkUserRbacPipeline)

		if (checkUserRbacResult && checkUserRbacResult.success && checkUserRbacResult.result && Array.isArray(checkUserRbacResult.result) && checkUserRbacResult.result.length > 0) {
			return { status: 200, message: `用户 ${uuid ? `UUID: ${uuid}` : `UID: ${uid}`} 有权限访问 ${apiPath}` }
		} else {
			return { status: 403, message: `用户 ${uuid ? `UUID: ${uuid}` : `UID: ${uid}`} 在访问 ${apiPath} 的权限不足，或者用户不存在` }
		}
	} catch (error) {
		console.error('ERROR', '用户执行 RBAC 鉴权时出现错误，未知错误：', error)
		return { status: 500, message: '用户执行 RBAC 鉴权时出现错误，未知错误' }
	}
}

/**
 * 在 Controller 层通过 RBAC 检查用户的权限
 * 该函数是 checkUserByRbac 的二次封装，包含校验失败时 ctx 中状态码和错误信息的补全功能，并返回简单的 boolean 类型结果，该结果用于在 Controller 中判断后续代码是否需要继续执行
 * @param params 通过 RBAC 检查用户的权限的参数
 * @param ctx koa context
 * @returns boolean 类型的权限检查结果，通过返回 true，不通过返回 false
 */
export const isPassRbacCheck = async (params: CheckUserRbacParams, ctx: koaCtx): Promise<boolean> => {
	try {
		const rbacCheckResult = await checkUserByRbac(params)
		const { status: rbacStatus, message: rbacMessage } = rbacCheckResult
		if (rbacStatus !== 200) {
			ctx.status = rbacStatus
			ctx.body = rbacMessage
			console.warn('WARN', 'WARNING', 'RBAC', `${rbacStatus} - ${rbacMessage}`)
			return false
		}

		return true
	} catch (error) {
		console.error('ERROR', '在 Controller 层执行 RBAC 鉴权时出现错误，未知错误：', error)
		ctx.status = 500
		ctx.body = '在 Controller 层执行 RBAC 鉴权时出现错误，未知错误'
		return false
	}
}

/**
 * 创建 RBAC API 路径
 * @param createRbacApiPathRequest 创建 RBAC API 路径的请求载荷
 * @param uuid 用户 UUID
 * @param token 用户 Token
 * @returns 创建 RBAC API 路径的请求响应
 */
export const createRbacApiPathService = async (createRbacApiPathRequest: CreateRbacApiPathRequestDto, uuid: string, token: string): Promise<CreateRbacApiPathResponseDto> => {
	try {
		if (!checkCreateRbacApiPathRequest(createRbacApiPathRequest)) {
			console.error('ERROR', '创建 RBAC API 路径失败，参数不合法')
			return { success: false, message: '创建 RBAC API 路径失败，参数不合法' }
		}

		if (!(await checkUserTokenByUuidService(uuid, token)).success) {
			console.error('ERROR', '创建 RBAC API 路径失败，用户 Token 校验未通过')
			return { success: false, message: '创建 RBAC API 路径失败，用户 Token 校验未通过' }
		}

		const { apiPath, apiPathType, apiPathColor, apiPathDescription } = createRbacApiPathRequest
		const apiPathUuid = uuidV4()
		const now = new Date().getTime()

		const { collectionName: rbacApiCollectionName, schemaInstance: rbacApiSchemaInstance } = RbacApiSchema
		type RbacApiList = InferSchemaType<typeof rbacApiSchemaInstance>

		const rbacApiData: RbacApiList = {
			apiPathUuid,
			apiPath,
			apiPathType,
			apiPathColor,
			apiPathDescription,
			creatorUuid: uuid,
			lastEditorUuid: uuid,
			createDateTime: now,
			editDateTime: now
		}

		const insertResult = await insertData2MongoDB<RbacApiList>(rbacApiData, rbacApiSchemaInstance, rbacApiCollectionName)
		const insertResultData = insertResult?.result?.[0]

		if (!insertResult.success || !insertResultData) {
			console.error('ERROR', '创建 RBAC API 路径失败，数据插入失败')
			return { success: false, message: '创建 RBAC API 路径失败，数据插入失败' }
		}

		return {
			success: true,
			message: '创建 RBAC API 路径成功',
			result: {
				apiPathUuid: insertResultData.apiPathUuid,
				apiPath: insertResultData.apiPath,
				apiPathType: insertResultData.apiPathType,
				apiPathColor: insertResultData.apiPathColor,
				apiPathDescription: insertResultData.apiPathDescription,
				creatorUuid: insertResultData.creatorUuid,
				lastEditorUuid: insertResultData.lastEditorUuid,
				createDateTime: insertResultData.createDateTime,
				editDateTime: insertResultData.editDateTime,
				isAssignedOnce: false
			}
		}
	} catch (error) {
		console.error('ERROR', '创建 RBAC API 路径时出错，未知错误：', error)
		return { success: false, message: '创建 RBAC API 路径时出错，未知错误' }
	}
}

/**
 * 创建 RBAC 角色
 * @param createRbacRoleRequest 创建 RBAC 角色的请求载荷
 * @param uuid 用户 UUID
 * @param token 用户 Token
 * @returns 创建 RBAC 角色的请求响应
 */
export const createRbacRoleService = async (createRbacRoleRequest: CreateRbacRoleRequestDto, uuid: string, token: string): Promise<CreateRbacRoleResponseDto> => {
	try {
		if (!checkCreateRbacRoleRequest(createRbacRoleRequest)) {
			console.error('ERROR', '创建 RBAC 角色失败，参数不合法')
			return { success: false, message: '创建 RBAC 角色失败，参数不合法' }
		}

		if (!(await checkUserTokenByUuidService(uuid, token)).success) {
			console.error('ERROR', '创建 RBAC 角色失败，用户 Token 校验未通过')
			return { success: false, message: '创建 RBAC 角色失败，用户 Token 校验未通过' }
		}

		const { roleName, roleType, roleColor, roleDescription } = createRbacRoleRequest
		const roleUuid = uuidV4()
		const now = new Date().getTime()

		const { collectionName: rbacRoleCollectionName, schemaInstance: rbacRoleSchemaInstance } = RbacRoleSchema
		type RbacRole = InferSchemaType<typeof rbacRoleSchemaInstance>

		const rbacRoleData: RbacRole = {
			roleUuid,
			roleName,
			apiPathPermissions: [],
			roleType,
			roleColor,
			roleDescription,
			creatorUuid: uuid,
			lastEditorUuid: uuid,
			createDateTime: now,
			editDateTime: now
		}

		const insertResult = await insertData2MongoDB<RbacRole>(rbacRoleData, rbacRoleSchemaInstance, rbacRoleCollectionName)
		const insertResultData = insertResult?.result?.[0]

		if (!insertResult.success || !insertResultData) {
			console.error('ERROR', '创建 RBAC 角色失败，数据插入失败')
			return { success: false, message: '创建 RBAC 角色失败，数据插入失败' }
		}

		return { success: true, message: '创建 RBAC 角色成功', result: insertResultData }
	} catch (error) {
		console.error('ERROR', '创建 RBAC 角色时出错，未知错误：', error)
		return { success: false, message: '创建 RBAC 角色时出错，未知错误' }
	}
}

/**
 * 为角色更新 API 路径权限
 * @param updateApiPathPermissionsForRoleRequest 为角色更新 API 路径权限的请求载荷
 * @param uuid 用户 UUID
 * @param token 用户 Token
 * @returns 为角色更新 API 路径权限的请求响应
 */
export const updateApiPathPermissionsForRoleService = async (updateApiPathPermissionsForRoleRequest: UpdateApiPathPermissionsForRoleRequestDto, uuid: string, token: string): Promise<UpdateApiPathPermissionsForRoleResponseDto> => {
	try {
		if (!checkUpdateApiPathPermissionsForRoleRequest(updateApiPathPermissionsForRoleRequest)) {
			console.error('ERROR', '为角色更新 API 路径权限失败，参数不合法')
			return { success: false, message: '为角色更新 API 路径权限失败，参数不合法' }
		}

		if (!(await checkUserTokenByUuidService(uuid, token)).success) {
			console.error('ERROR', '为角色更新 API 路径权限失败，用户 Token 校验未通过')
			return { success: false, message: '为角色更新 API 路径权限失败，用户 Token 校验未通过' }
		}

		const { roleName, apiPathPermissions } = updateApiPathPermissionsForRoleRequest
		const uniqueApiPathPermissions = [...new Set(apiPathPermissions)]

		const { collectionName: rbacApiCollectionName, schemaInstance: rbacApiSchemaInstance } = RbacApiSchema
		type RbacApiList = InferSchemaType<typeof rbacApiSchemaInstance>

		const checkApiPathPermissionsCountWhere: QueryType<RbacApiList> = {
			apiPath: { $in: uniqueApiPathPermissions },
		}
		
		const checkApiPathPermissionsCountSelect: SelectType<RbacApiList> = {
			apiPath: 1,
		}

		const session = await createAndStartSession()

		const checkApiPathPermissionsCountResult = await selectDataFromMongoDB<RbacApiList>(checkApiPathPermissionsCountWhere, checkApiPathPermissionsCountSelect, rbacApiSchemaInstance, rbacApiCollectionName, { session })

		if (!checkApiPathPermissionsCountResult.success) {
			await abortAndEndSession(session)
			console.error('ERROR', '为角色更新 API 路径权限失败，检查 API 路径失败')
			return { success: false, message: '为角色更新 API 路径权限失败，检查 API 路径失败' }
		}

		if (checkApiPathPermissionsCountResult.result.length !== uniqueApiPathPermissions.length) {
			await abortAndEndSession(session)
			console.error('ERROR', '为角色更新 API 路径权限失败，检查 API 路径未通过，可能是因为将一个不存在的路径添加到角色中')
			return { success: false, message: '为角色更新 API 路径权限失败，检查 API 路径未通过，可能是因为将一个不存在的路径添加到角色中' }
		}

		const { collectionName: rbacRoleCollectionName, schemaInstance: rbacRoleSchemaInstance } = RbacRoleSchema
		type RbacRole = InferSchemaType<typeof rbacRoleSchemaInstance>

		const updateApiPathPermissions4RoleWhere: QueryType<RbacRole> = {
			roleName,
		}
		
		const now = new Date().getTime()
		const updateApiPathPermissions4RoleData: UpdateType<RbacRole> = {
			lastEditorUuid: uuid,
			apiPathPermissions: uniqueApiPathPermissions as RbacRole['apiPathPermissions'], // TODO: Mongoose issue: #12420
			editDateTime: now,
		}

		const updateApiPathPermissions4Role = await findOneAndUpdateData4MongoDB<RbacRole>(updateApiPathPermissions4RoleWhere, updateApiPathPermissions4RoleData, rbacRoleSchemaInstance, rbacRoleCollectionName)

		if (!updateApiPathPermissions4Role.success) {
			await abortAndEndSession(session)
			console.error('ERROR', '为角色更新 API 路径权限失败，更新失败')
			return { success: false, message: '为角色更新 API 路径权限失败，更新失败' }
		}

		return { success: false, message: '为角色更新 API 路径权限成功', result: updateApiPathPermissions4Role.result }
	} catch (error) {
		console.error('ERROR', '为角色更新 API 路径权限时出错，未知错误：', error)
		return { success: false, message: '为角色更新 API 路径权限时出错，未知错误' }
	}
}

/**
 * 校验创建 RBAC API 路径的请求载荷
 * @param createRbacApiPathRequest 创建 RBAC API 路径的请求载荷
 * @returns 合法返回 true, 不合法返回 false
 */
const checkCreateRbacApiPathRequest = (createRbacApiPathRequest: CreateRbacApiPathRequestDto): boolean => {
	return (
		!!createRbacApiPathRequest.apiPath
		&& createRbacApiPathRequest.apiPathColor ? /^#([0-9A-Fa-f]{8})$/.test(createRbacApiPathRequest.apiPathColor) : true // 如果 apiPathColor 不为空，则测试是否符合八位 HAX 颜色代码格式（例如：#66CCFFFF），如果 apiPathColor 为空，则直接为 true
	)
}

/**
 * 校验创建 RBAC 角色的请求载荷
 * @param createRbacApiPathRequest 创建 RBAC 角色的请求载荷
 * @returns 合法返回 true, 不合法返回 false
 */
const checkCreateRbacRoleRequest = (createRbacRoleRequest: CreateRbacRoleRequestDto): boolean => {
	return (
		!!createRbacRoleRequest.roleName
		&& createRbacRoleRequest.roleColor ? /^#([0-9A-Fa-f]{8})$/.test(createRbacRoleRequest.roleColor) : true // 如果 roleColor 不为空，则测试是否符合八位 HAX 颜色代码格式（例如：#66CCFFFF），如果 roleColor 为空，则直接为 true
	)
}

/**
 * 校验为角色更新 API 路径权限的请求载荷
 * @param updateApiPathPermissionsForRoleRequest 为角色更新 API 路径权限的请求载荷
 * @returns 合法返回 true, 不合法返回 false
 */
const checkUpdateApiPathPermissionsForRoleRequest = (updateApiPathPermissionsForRoleRequest: UpdateApiPathPermissionsForRoleRequestDto): boolean => {
	return (
		!!updateApiPathPermissionsForRoleRequest.roleName
		&& !!updateApiPathPermissionsForRoleRequest.apiPathPermissions && Array.isArray(updateApiPathPermissionsForRoleRequest.apiPathPermissions)
		&& updateApiPathPermissionsForRoleRequest.apiPathPermissions.every(apiPath => !!apiPath)
	)
}
