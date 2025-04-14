import { InferSchemaType } from "mongoose";
import { AddRegexRequestDto, AddRegexResponseDto, BlockKeywordRequestDto, BlockKeywordResponseDto, BlockTagRequestDto, BlockTagResponseDto, BlockUserByUidRequestDto, BlockUserByUidResponseDto, CheckIsBlockedRequestDto, CheckIsBlockedResponseDto, GetBlockListResponseDto, MuteUserByUidRequestDto, MuteUserByUidResponseDto, RemoveRegexRequestDto, RemoveRegexResponseDto, ShowUserByUidRequestDto, ShowUserByUidResponseDto, UnblockKeywordRequestDto, UnblockKeywordResponseDto, UnblockTagRequestDto, UnblockTagResponseDto, UnblockUserByUidRequestDto, UnblockUserByUidResponseDto } from "../controller/BlockControllerDto.js";
import { checkUserExistsByUuidService, checkUserTokenByUuidService, getUserUid, getUserUuid } from "./UserService.js";
import { QueryType, SelectType, UpdateType } from "../dbPool/DbClusterPoolTypes.js";
import { abortAndEndSession, commitAndEndSession, createAndStartSession } from "../common/MongoDBSessionTool.js";
import { updateData4MongoDB, selectDataFromMongoDB, insertData2MongoDB, findOneAndUpdateData4MongoDB } from "../dbPool/DbClusterPool.js";
import { BlockListSchema } from "../dbPool/schema/BlockSchema.js";

/**
 * 屏蔽用户
 * @param uuid 用户 UUID
 * @param token 用户 Token
 * @param blockUserByUidRequest 屏蔽用户的请求载荷
 */
export const blockUserByUidService = async (uuid: string, token: string, blockUserByUidRequest: BlockUserByUidRequestDto): Promise<BlockUserByUidResponseDto> => {
	try {
		if (!checkBlockUserByUidRequest(blockUserByUidRequest)) {
			return { success: false, message: '屏蔽用户请求载荷不合法' }
		}

		const { blockUid } = blockUserByUidRequest
		const userUuid = await getUserUuid(blockUid)
		const operatorUid = await getUserUid(uuid)

		if (!userUuid) {
			return { success: false, message: '用户不存在' }
		}
		if (!operatorUid) {
			return { success: false, message: '用户不存在' }
		}

		if (!checkUserTokenByUuidService(uuid, token)) {
			return { success: false, message: '用户 Token 不合法' }
		}

		const now = new Date().getTime()
		const { collectionName: blockUserCollectionName, schemaInstance: blockUserSchemaInstance } = BlockListSchema
		type BlockListSchemaType = InferSchemaType<typeof blockUserSchemaInstance>
		const blockListData: BlockListSchemaType = {
			type: 'block',
			value: userUuid,
			Uid: blockUid,
			operatorUid: operatorUid,
			operatorUUID: uuid,
			createDateTime: now,
		}

		const insertResult = await insertData2MongoDB<BlockListSchemaType>(blockListData, blockUserSchemaInstance, blockUserCollectionName)
		if (!insertResult) {
			return { success: false, message: '屏蔽用户失败' }
		}
		return { success: true, message: '屏蔽用户成功' }
	}
	catch (error) {
		console.error('ERROR', '屏蔽用户失败', error)
		return { success: false, message: '屏蔽用户失败' }
	}
}

/**
 * 隐藏用户
 */
export const muteUserByUidService = async (uuid: string, token: string, blockUserByUidRequest: MuteUserByUidRequestDto): Promise<MuteUserByUidResponseDto> => {
	try {
		if (!checkMuteUserByUidRequest(blockUserByUidRequest)) {
			return { success: false, message: '隐藏用户请求载荷不合法' }
		}

		const { muteUid } = blockUserByUidRequest
		const userUuid = await getUserUuid(muteUid)
		const operatorUid = await getUserUid(uuid)

		if (!userUuid) {
			return { success: false, message: '用户不存在' }
		}
		if (!operatorUid) {
			return { success: false, message: '用户不存在' }
		}

		if (!checkUserTokenByUuidService(uuid, token)) {
			return { success: false, message: '用户 Token 不合法' }
		}

		const now = new Date().getTime()
		const { collectionName: blockUserCollectionName, schemaInstance: blockUserSchemaInstance } = BlockListSchema
		type BlockListSchemaType = InferSchemaType<typeof blockUserSchemaInstance>
		const blockListData: BlockListSchemaType = {
			type: 'mute',
			value: userUuid,
			Uid: muteUid,
			operatorUid: operatorUid,
			operatorUUID: uuid,
			createDateTime: now,
		}

		const insertResult = await insertData2MongoDB<BlockListSchemaType>(blockListData, blockUserSchemaInstance, blockUserCollectionName)
		if (!insertResult) {
			return { success: false, message: '隐藏用户失败' }
		}
		return { success: true, message: '隐藏用户成功' }
	}
	catch (error) {
		console.error('ERROR', '隐藏用户失败', error)
		return { success: false, message: '隐藏用户失败' }
	}
}

/**
 * 屏蔽关键词
 */
export const blockKeywordService = async (uuid: string, token: string, blockKeywordRequest: BlockKeywordRequestDto): Promise<BlockKeywordResponseDto> => {
	try {
		if (!checkBlockKeywordRequest(blockKeywordRequest)) {
			return { success: false, message: '屏蔽关键词请求载荷不合法' }
		}

		const { blockKeyword } = blockKeywordRequest
		const operatorUid = await getUserUid(uuid)

		if (!operatorUid) {
			return { success: false, message: '用户不存在' }
		}

		if (!checkUserTokenByUuidService(uuid, token)) {
			return { success: false, message: '用户 Token 不合法' }
		}

		const now = new Date().getTime()
		const { collectionName: blockUserCollectionName, schemaInstance: blockUserSchemaInstance } = BlockListSchema
		type BlockListSchemaType = InferSchemaType<typeof blockUserSchemaInstance>
		const blockListData: BlockListSchemaType = {
			type: 'keyword',
			value: blockKeyword,
			operatorUid: operatorUid,
			operatorUUID: uuid,
			createDateTime: now,
		}

		const insertResult = await insertData2MongoDB<BlockListSchemaType>(blockListData, blockUserSchemaInstance, blockUserCollectionName)
		if (!insertResult) {
			return { success: false, message: '屏蔽关键词失败' }
		}
		return { success: true, message: '屏蔽关键词成功' }
	}
	catch (error) {
		console.error('ERROR', '屏蔽关键词失败', error)
		return { success: false, message: '屏蔽关键词失败' }
	}
}

/**
 * 屏蔽标签
 * @param uuid 用户 UUID
 * @param token 用户 Token
 * @param blockTagRequest 屏蔽标签的请求载荷
 * @returns 屏蔽标签的请求响应
 */
export const blockTagService = async (uuid: string, token: string, blockTagRequest: BlockTagRequestDto): Promise<BlockTagResponseDto> => {
	try {
		if (!checkBlockTagRequest(blockTagRequest)) {
			return { success: false, message: '屏蔽标签请求载荷不合法' }
		}

		const tagId = blockTagRequest.tagId.toString()
		const operatorUid = await getUserUid(uuid)

		if (!operatorUid) {
			return { success: false, message: '用户不存在' }
		}

		if (!checkUserTokenByUuidService(uuid, token)) {
			return { success: false, message: '用户 Token 不合法' }
		}

		const now = new Date().getTime()
		const { collectionName: blockUserCollectionName, schemaInstance: blockUserSchemaInstance } = BlockListSchema
		type BlockListSchemaType = InferSchemaType<typeof blockUserSchemaInstance>
		const blockListData: BlockListSchemaType = {
			type: 'tag',
			value: tagId,
			Uid: 0,
			operatorUid: operatorUid,
			operatorUUID: uuid,
			createDateTime: now,
		}

		const insertResult = await insertData2MongoDB<BlockListSchemaType>(blockListData, blockUserSchemaInstance, blockUserCollectionName)
		if (!insertResult) {
			return { success: false, message: '屏蔽标签失败' }
		}
		return { success: true, message: '屏蔽标签成功' }
	}
	catch (error) {
		console.error('ERROR', '屏蔽标签失败', error)
		return { success: false, message: '屏蔽标签失败' }
	}
}

/**
 * 添加正则表达式
 * @param uuid 用户 UUID
 * @param token 用户 Token
 * @param addRegexRequest 添加正则表达式的请求载荷
 * @returns 添加正则表达式的请求响应
 */
export const addRegexService = async (uuid: string, token: string, addRegexRequest: AddRegexRequestDto): Promise<AddRegexResponseDto> => {
	try {
		if (!checkAddRegexRequest(addRegexRequest)) {
			return { success: false, message: '添加正则表达式请求载荷不合法' }
		}

		const { blockRegex } = addRegexRequest
		const operatorUid = await getUserUid(uuid)

		if (!operatorUid) {
			return { success: false, message: '用户不存在' }
		}

		if (!checkUserTokenByUuidService(uuid, token)) {
			return { success: false, message: '用户 Token 不合法' }
		}

		const now = new Date().getTime()
		const { collectionName: blockUserCollectionName, schemaInstance: blockUserSchemaInstance } = BlockListSchema
		type BlockListSchemaType = InferSchemaType<typeof blockUserSchemaInstance>
		const blockListData: BlockListSchemaType = {
			type: 'regex',
			value: blockRegex,
			Uid: 0,
			operatorUid: operatorUid,
			operatorUUID: uuid,
			createDateTime: now,
		}

		const insertResult = await insertData2MongoDB<BlockListSchemaType>(blockListData, blockUserSchemaInstance, blockUserCollectionName)
		if (!insertResult) {
			return { success: false, message: '添加正则表达式失败' }
		}
		return { success: true, message: '添加正则表达式成功' }
	}
	catch (error) {
		console.error('ERROR', '添加正则表达式失败', error)
		return { success: false, message: '添加正则表达式失败' }
	}
}

/**
 * 检测屏蔽用户的请求载荷
 * @param blockUserByUidRequest 屏蔽用户的请求载荷
 * @returns 合法返回 true, 不合法返回 false
 */
export const checkBlockUserByUidRequest = (blockUserByUidRequest: BlockUserByUidRequestDto): boolean => {
	if (!blockUserByUidRequest.blockUid) {
		console.error('ERROR', '屏蔽用户请求载荷不合法')
		return false
	}
	return true
}

/**
 * 检测隐藏用户的请求载荷
 */
export const checkMuteUserByUidRequest = (muteUserByUidRequest: MuteUserByUidRequestDto): boolean => {
	if (!muteUserByUidRequest.muteUid) {
		console.error('ERROR', '隐藏用户请求载荷不合法')
		return false
	}
	return true
}

/**
 * 检测屏蔽关键词的请求载荷
 */
export const checkBlockKeywordRequest = (blockKeywordRequest: BlockKeywordRequestDto): boolean => {
	if (!blockKeywordRequest?.blockKeyword) {
			console.error('ERROR', '屏蔽关键词请求载荷不合法')
			return false
	}
	const keyword = blockKeywordRequest.blockKeyword
	const validKeywordRegex = /^[a-zA-Z0-9\u4e00-\u9fa5\s.,!?@#$%&*()_+-=[\]{}|;:'"`~<>]+$/
	if (
			keyword.trim().length === 0 || // 空字符串或纯空格
			keyword.length > 100 || // 长度超限
			!validKeywordRegex.test(keyword) // 包含非法字符
	) {
			console.error('ERROR', '屏蔽关键词请求载荷不合法')
			return false
	}

	return true
}


/**
 * 检测屏蔽标签的请求载荷
 */
export const checkBlockTagRequest = (blockTagRequest: BlockTagRequestDto): boolean => {
	if (!blockTagRequest.tagId) {
		console.error('ERROR', '屏蔽标签请求载荷不合法')
		return false
	}
	return true
}

/**
 * 检测添加正则表达式的请求载荷
 */
export const checkAddRegexRequest = (addRegexRequest: AddRegexRequestDto): boolean => {
	if (!addRegexRequest?.blockRegex) {
			console.error('ERROR', '添加正则表达式请求载荷不合法')
			return false
	}
	const regex = addRegexRequest.blockRegex
	if (
			regex.trim().length === 0 || // 空字符串或纯空格
			regex.length > 500 // 长度超限
	) {
			return false
	}
	try {
			new RegExp(regex)
	} catch (e) {
			return false
	}
	return true
}
