import { get, InferSchemaType } from "mongoose";
import { BlockUserByUidRequestDto, BlockUserByUidResponseDto } from "../controller/BlockControllerDto.js";
import { checkUserExistsByUuidService, checkUserTokenByUuidService, getUserUuid } from "./UserService.js";
import { QueryType, SelectType, UpdateType } from "../dbPool/DbClusterPoolTypes.js";
import { createAndStartSession } from "../common/MongoDBSessionTool.js";
import { findOneAndUpdateData4MongoDB, selectDataFromMongoDB } from "../dbPool/DbClusterPool.js";
import { BlockingUserSchema } from "../dbPool/schema/BlockSchema.js";


/**
 * 封禁用户
 * @param blockUserByUidRequest 封禁用户的请求载荷
 * @param uuid 用户的 UUID
 * @param token 用户的 token
 * @returns 封禁用户的请求响应
 */
export const BlockUserByUidService = async (blockUserByUidRequest: BlockUserByUidRequestDto, uuid: string, token: string): Promise<BlockUserByUidResponseDto> => {
	try {
		if (!checkBlockUserByUidRequest) {
			console.error('ERROR', '封禁用户请求载荷不合法')
			return { success: false, message: '封禁用户请求载荷不合法' }
		}

		const { blockUid } = blockUserByUidRequest
		const blockedUuid = await getUserUuid(blockUid) as string

		const now = new Date().getTime()
		if (!(await checkUserTokenByUuidService(uuid, token)).success) {
			console.error('ERROR', '封禁用户失败，非法用户')
			return { success: false, message: '封禁用户失败，非法用户' }
		}

		const checkBlockUuidResult = await checkUserExistsByUuidService({ uuid: blockedUuid })
		if (!checkBlockUuidResult.success || (checkBlockUuidResult.success && !checkBlockUuidResult.exists)) {
			console.error('ERROR', '封禁用户失败，被封禁用户不存在')
			return { success: false, message: '封禁用户失败，被封禁用户不存在' }
		}

		if (blockedUuid === uuid) {
			console.error('ERROR', '封禁用户失败，不能封禁自己')
			return { success: false, message: '封禁用户失败，不能封禁自己' }
		}

		const { collectionName: blockingUserCollectionName, schemaInstance: blockingUserSchemaInstance } = BlockingUserSchema
		type BlockingUser = InferSchemaType<typeof blockingUserSchemaInstance>

		const blockingUserWhere: QueryType<BlockingUser> = {
			uuid,
		}
		const blockingUserSelect: SelectType<BlockingUser> = {
			UUID: 1,
			blockUuid: 1
		}

		const blockingUserResult = await selectDataFromMongoDB<BlockingUser>(blockingUserWhere, blockingUserSelect, blockingUserSchemaInstance, blockingUserCollectionName)
		const blockingUserData = blockingUserResult.result?.[0]

		if (!blockingUserResult.success) {
			console.error('ERROR', '封禁用户失败，查询数据库失败')
			return { success: false, message: '封禁用户失败，查询数据库失败' }
		}

		if (!blockingUserData.blockUuid.includes(blockedUuid)) {
			console.error('ERROR', '封禁用户失败，已经封禁过了')
			return { success: false, message: '封禁用户失败，已经封禁过了' }
		}

		const blockUuid = [...new Set([...blockingUserData.blockUuid, blockedUuid])]

		const blockingUserUpdateData: UpdateType<BlockingUser> = {
			UUID: uuid,
			blockUuid,
			editDateTime: now,
		}

		const session = await createAndStartSession()
		const blockingUserUpdateResult = await findOneAndUpdateData4MongoDB(blockingUserWhere, blockingUserUpdateData, blockingUserSchemaInstance, blockingUserCollectionName, {session})
		const blockingUserUpdateResultData = blockingUserUpdateResult.result?.[0]

		if (!blockingUserUpdateResult.success) {
			console.error('ERROR', '封禁用户失败，更新数据库失败')
			return { success: false, message: '封禁用户失败，更新数据库失败' }
		}

		if (blockingUserUpdateResultData) {
			await session.commitTransaction()
			session.endSession()
			return { success: true, message: '封禁用户成功', result: blockingUserUpdateResultData.blockUuid }
		} else {
			await session.abortTransaction()
			session.endSession()
			console.error('ERROR', '封禁用户失败，更新数据库失败')
			return { success: false, message: '封禁用户失败，更新数据库失败' }
		}



	} catch (error) {
		console.error('ERROR', '封禁用户错误，未知错误', error)
		return { success: false, message: '封禁用户失败，未知错误' }
	}
}


/**
 * 检测封禁用户的请求载荷
 * @param blockUserByUidRequest 封禁用户的请求载荷
 * @returns 合法返回 true, 不合法返回 false
 */
export const checkBlockUserByUidRequest = (blockUserByUidRequest: BlockUserByUidRequestDto): boolean => {
	if (!blockUserByUidRequest.blockUid) {
		console.error('ERROR', '封禁用户请求载荷不合法')
		return false
	}
	return true
}
