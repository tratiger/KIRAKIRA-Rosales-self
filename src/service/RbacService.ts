import { InferSchemaType, PipelineStage } from "mongoose";
import { CheckUserRbacParams, CheckUserRbacResult, CreateRbacApiPathRequestDto, CreateRbacApiPathResponseDto } from "../controller/RbacControllerDto.js";
import { getUserUuid } from "./UserService.js";
import { selectDataByAggregateFromMongoDB } from "../dbPool/DbClusterPool.js";
import { UserAuthSchema } from "../dbPool/schema/UserSchema.js";

/**
 * 通过 RBAC 检查用户的权限
 * @param params 通过 RBAC 检查用户的权限的参数
 * @returns 通过 RBAC 检查用户的权限的结果
 */
export const checkUserByRbac = async (params: CheckUserRbacParams): Promise<CheckUserRbacResult> => {
	try {
		const { uid, apiPath } = params
		let   { uuid } = params

		if (
			(!uuid && (uid === undefined || uid === null || typeof uid !== 'number' || uid <= 0))
			|| !apiPath
		) {
			console.error('ERROR', `用户 ${uuid ? `UUID: ${uuid}` : `UID: ${uid}`} 在访问 ${apiPath} 并执行 RBAC 鉴权失败，参数不合法`)
			return { status: 403, message: `用户 ${uuid ? `UUID: ${uuid}` : `UID: ${uid}`} 在访问 ${apiPath} 并执行 RBAC 鉴权失败，参数不合法` }
		}

		if (!uuid) {
			uuid = await getUserUuid(uid) || ''

			if (!uuid) {
				console.error('ERROR', `某用户在访问 ${apiPath} 并执行 RBAC 鉴权时没有提供 UUID 或 UID 转换为 UUID 失败`)
				return { status: 403, message: `某用户在访问 ${apiPath} 并执行 RBAC 鉴权时没有提供 UUID 或 UID 转换为 UUID 失败` }
			}
		}

		const checkUserRbacPipeline: PipelineStage[] = [
			// 匹配用户
			{
				$match: { UUID: uuid }
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
		try {
			const { uuid, uid, apiPath } = params
			console.error('ERROR', `用户 ${uuid ? `UUID: ${uuid}` : `UID: ${uid}`} 在访问 ${apiPath} 时，执行 RBAC 鉴权时出现错误：`, error)
			return { status: 500, message: `用户 ${uuid ? `UUID: ${uuid}` : `UID: ${uid}`} 在访问 ${apiPath} 时，执行 RBAC 鉴权时出现错误` }
		} catch {
			console.error('ERROR', '用户执行 RBAC 鉴权时出现错误，出错后的错误处理中再次抛出了错误，可能是因为错误的对象解构')
			return { status: 500, message: '用户执行 RBAC 鉴权时出现错误，出错后的错误处理中再次抛出了错误，可能是因为错误的对象解构' }
		}
	}
}

/**
 * 创建 RBAC API 路径
 * @param createRbacApiPathRequest 创建 RBAC API 路径的请求载荷
 * @param uuid 用户 UUID
 * @returns 创建 RBAC API 路径的请求响应
 */
export const createRbacApiPathService = async (createRbacApiPathRequest: CreateRbacApiPathRequestDto, uuid: string): Promise<CreateRbacApiPathResponseDto> => {
	try {

	} catch (error) {
		console.error('ERROR', '创建 RBAC API 路径时出错，未知错误：', error)
		return { success: false, message: '创建 RBAC API 路径时出错，未知错误' }
	}
}
