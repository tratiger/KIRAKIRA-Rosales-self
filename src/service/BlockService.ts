import { InferSchemaType, PipelineStage } from "mongoose";
import { AddRegexRequestDto, AddRegexResponseDto, BlockKeywordRequestDto, BlockKeywordResponseDto, BlockTagRequestDto, BlockTagResponseDto, BlockUserByUidRequestDto, BlockUserByUidResponseDto, CheckContentIsBlockedRequestDto, CheckIsBlockedByOtherUserRequestDto, CheckIsBlockedByOtherUserResponseDto, CheckIsBlockedResponseDto, CheckTagIsBlockedRequestDto, CheckUserIsBlockedRequestDto, CheckUserIsBlockedResponseDto, GetBlockListRequestDto, GetBlockListResponseDto, MuteUserByUidRequestDto, MuteUserByUidResponseDto, RemoveRegexRequestDto, RemoveRegexResponseDto, ShowUserByUidRequestDto, ShowUserByUidResponseDto, UnblockKeywordRequestDto, UnblockKeywordResponseDto, UnblockTagRequestDto, UnblockTagResponseDto, UnblockUserByUidRequestDto, UnblockUserByUidResponseDto } from "../controller/BlockControllerDto.js";
import { checkUserExistsByUIDService, checkUserExistsByUuidService, checkUserTokenByUuidService, getUserUid, getUserUuid } from "./UserService.js";
import { QueryType, SelectType, UpdateType } from "../dbPool/DbClusterPoolTypes.js";
import { abortAndEndSession, commitAndEndSession, createAndStartSession } from "../common/MongoDBSessionTool.js";
import { updateData4MongoDB, selectDataFromMongoDB, insertData2MongoDB, findOneAndUpdateData4MongoDB, deleteDataFromMongoDB, selectDataByAggregateFromMongoDB } from "../dbPool/DbClusterPool.js";
import { BlockListSchema, UnblockListSchema } from "../dbPool/schema/BlockSchema.js";
import { Session } from "inspector";
import { get } from "http";

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
		if (!checkUserExistsByUIDService({ uid: blockUid })) {
			console.error('ERROR', '屏蔽用户失败，用户不存在')
			return { success: false, message: '屏蔽用户失败，用户不存在' }
		}

		const userUuid = await getUserUuid(blockUid)
		const operatorUid = await getUserUid(uuid)

		if (!userUuid || !operatorUid) {
			console.error('ERROR', '屏蔽用户失败，用户不存在')
			return { success: false, message: '屏蔽用户失败，用户不存在' }
		}

		if (userUuid === uuid) {
			console.error('ERROR', '屏蔽用户失败，不能屏蔽自己')
			return { success: false, message: '屏蔽用户失败，不能屏蔽自己' }
		}

		if (!checkUserTokenByUuidService(uuid, token)) {
			console.error('ERROR', '屏蔽用户失败，用户 Token 不合法')
			return { success: false, message: '屏蔽用户失败，用户 Token 不合法' }
		}

		const now = new Date().getTime()
		const { collectionName: blockUserCollectionName, schemaInstance: blockUserSchemaInstance } = BlockListSchema
		type BlockListSchemaType = InferSchemaType<typeof blockUserSchemaInstance>
		const blockListWhere: QueryType<BlockListSchemaType> = {
			type: 'block',
			value: userUuid,
			operatorUUID: uuid,
		}
		const blockListSelect: SelectType<BlockListSchemaType> = {
			Uid: 1,
		}
		const blockListResult = await selectDataFromMongoDB<BlockListSchemaType>(blockListWhere, blockListSelect, blockUserSchemaInstance, blockUserCollectionName)
		if (blockListResult.success && blockListResult.result && blockListResult.result.length > 0) {
			return { success: false, message: '屏蔽用户失败，用户已被屏蔽' }
		}

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
			console.error('ERROR', '屏蔽用户失败，查询数据失败')
			return { success: false, message: '屏蔽用户失败，查询数据失败' }
		}
		return { success: true, message: '屏蔽用户成功' }
	}
	catch (error) {
		console.error('ERROR', '屏蔽用户失败，未知错误', error)
		return { success: false, message: '屏蔽用户失败' }
	}
}

/**
 * 隐藏用户
 */
export const muteUserByUidService = async (uuid: string, token: string, blockUserByUidRequest: MuteUserByUidRequestDto): Promise<MuteUserByUidResponseDto> => {
	try {
		if (!checkMuteUserByUidRequest(blockUserByUidRequest)) {
			return { success: false, message: '隐藏用户失败，隐藏用户请求载荷不合法' }
		}

		const { muteUid } = blockUserByUidRequest
		if (!checkUserExistsByUIDService({ uid: muteUid })) {
			console.error('ERROR', '隐藏用户失败，用户不存在')
			return { success: false, message: '隐藏用户失败，用户不存在' }
		}

		const userUuid = await getUserUuid(muteUid)
		const operatorUid = await getUserUid(uuid)

		if (!userUuid || !operatorUid) {
			console.error('ERROR', '隐藏用户失败，用户不存在')
			return { success: false, message: '隐藏用户失败，用户不存在' }
		}
		if (userUuid === uuid) {
			console.error('ERROR', '隐藏用户失败，不能隐藏自己')
			return { success: false, message: '隐藏用户失败，不能隐藏自己' }
		}
		if (!checkUserTokenByUuidService(uuid, token)) {
			console.error('ERROR', '隐藏用户失败，用户 Token 不合法')
			return { success: false, message: '隐藏用户失败，用户 Token 不合法' }
		}

		const now = new Date().getTime()
		const { collectionName: blockUserCollectionName, schemaInstance: blockUserSchemaInstance } = BlockListSchema
		type BlockListSchemaType = InferSchemaType<typeof blockUserSchemaInstance>
		const blockListWhere: QueryType<BlockListSchemaType> = {
			type: 'mute',
			value: userUuid,
			operatorUUID: uuid,
		}
		const blockListSelect: SelectType<BlockListSchemaType> = {
			Uid: 1,
		}
		const blockListResult = await selectDataFromMongoDB<BlockListSchemaType>(blockListWhere, blockListSelect, blockUserSchemaInstance, blockUserCollectionName)
		if (blockListResult.success && blockListResult.result && blockListResult.result.length > 0) {
			return { success: false, message: '隐藏用户失败，用户已被隐藏' }
		}

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
			console.error('ERROR', '隐藏用户失败，查询数据失败')
			return { success: false, message: '隐藏用户失败，查询数据失败' }
		}
		return { success: true, message: '隐藏用户成功' }
	}
	catch (error) {
		console.error('ERROR', '隐藏用户失败，未知错误', error)
		return { success: false, message: '隐藏用户失败，未知错误' }
	}
}

/**
 * 屏蔽关键词
 */
export const blockKeywordService = async (uuid: string, token: string, blockKeywordRequest: BlockKeywordRequestDto): Promise<BlockKeywordResponseDto> => {
	try {
		if (!checkBlockKeywordRequest(blockKeywordRequest)) {
			return { success: false, message: '屏蔽关键词失败，屏蔽关键词请求载荷不合法' }
		}

		const { blockKeyword } = blockKeywordRequest
		const operatorUid = await getUserUid(uuid)

		if (!operatorUid) {
			console.error('ERROR', '屏蔽关键词失败，用户不存在')
			return { success: false, message: '屏蔽关键词失败，用户不存在' }
		}

		if (!checkUserTokenByUuidService(uuid, token)) {
			console.error('ERROR', '屏蔽关键词失败，用户 Token 不合法')
			return { success: false, message: '屏蔽关键词失败，用户 Token 不合法' }
		}

		const now = new Date().getTime()
		const { collectionName: blockUserCollectionName, schemaInstance: blockUserSchemaInstance } = BlockListSchema
		type BlockListSchemaType = InferSchemaType<typeof blockUserSchemaInstance>
		const blockListWhere: QueryType<BlockListSchemaType> = {
			type: 'keyword',
			value: blockKeyword,
			operatorUUID: uuid,
		}
		const blockListSelect: SelectType<BlockListSchemaType> = {
			Uid: 1,
		}

		const blockListResult = await selectDataFromMongoDB<BlockListSchemaType>(blockListWhere, blockListSelect, blockUserSchemaInstance, blockUserCollectionName)
		if (blockListResult.success && blockListResult.result && blockListResult.result.length > 0) {
			console.error('ERROR', '屏蔽关键词失败，关键词已被屏蔽')
			return { success: false, message: '屏蔽关键词失败，关键词已被屏蔽' }
		}

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
			console.error('ERROR', '屏蔽标签失败，用户不存在')
			return { success: false, message: '屏蔽标签失败，用户不存在' }
		}

		if (!checkUserTokenByUuidService(uuid, token)) {
			console.error('ERROR', '屏蔽标签失败，用户 Token 不合法')
			return { success: false, message: '屏蔽标签失败，用户 Token 不合法' }
		}

		const now = new Date().getTime()
		const { collectionName: blockUserCollectionName, schemaInstance: blockUserSchemaInstance } = BlockListSchema
		type BlockListSchemaType = InferSchemaType<typeof blockUserSchemaInstance>
		const blockListWhere: QueryType<BlockListSchemaType> = {
			type: 'tag',
			value: tagId,
			operatorUUID: uuid,
		}
		const blockListSelect: SelectType<BlockListSchemaType> = {
			operatorUid: 1,
		}

		const blockListResult = await selectDataFromMongoDB<BlockListSchemaType>(blockListWhere, blockListSelect, blockUserSchemaInstance, blockUserCollectionName)
		if (blockListResult.success && blockListResult.result && blockListResult.result.length > 0) {
			console.error('ERROR', '屏蔽标签失败，标签已被屏蔽')
			return { success: false, message: '屏蔽标签失败，标签已被屏蔽' }
		}

		const blockListData: BlockListSchemaType = {
			type: 'tag',
			value: tagId,
			operatorUid: operatorUid,
			operatorUUID: uuid,
			createDateTime: now,
		}

		const insertResult = await insertData2MongoDB<BlockListSchemaType>(blockListData, blockUserSchemaInstance, blockUserCollectionName)
		if (!insertResult) {
			console.error('ERROR', '屏蔽标签失败，查询数据失败')
			return { success: false, message: '屏蔽标签失败，查询数据失败' }
		}
		return { success: true, message: '屏蔽标签成功' }
	}
	catch (error) {
		console.error('ERROR', '屏蔽标签失败，未知错误', error)
		return { success: false, message: '屏蔽标签失败，未知错误' }
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
			console.error('ERROR', '添加正则表达式失败，用户不存在')
			return { success: false, message: '添加正则表达式失败，用户不存在' }
		}

		if (!checkUserTokenByUuidService(uuid, token)) {
			console.error('ERROR', '添加正则表达式失败，用户 Token 不合法')
			return { success: false, message: '添加正则表达式失败，用户 Token 不合法' }
		}

		const now = new Date().getTime()
		const { collectionName: blockUserCollectionName, schemaInstance: blockUserSchemaInstance } = BlockListSchema
		type BlockListSchemaType = InferSchemaType<typeof blockUserSchemaInstance>
		const blockListWhere: QueryType<BlockListSchemaType> = {
			type: 'regex',
			value: blockRegex,
			operatorUUID: uuid,
		}
		const blockListSelect: SelectType<BlockListSchemaType> = {
			operatorUid: 1,
		}

		const blockListResult = await selectDataFromMongoDB<BlockListSchemaType>(blockListWhere, blockListSelect, blockUserSchemaInstance, blockUserCollectionName)
		if (blockListResult.success && blockListResult.result && blockListResult.result.length > 0) {
			return { success: false, message: '添加正则表达式失败，正则表达式已存在' }
		}

		const blockListData: BlockListSchemaType = {
			type: 'regex',
			value: blockRegex,
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
 * 取消屏蔽用户
 * @param uuid 用户 UUID
 * @param token 用户 Token
 * @param UnblockUserByUidRequestDto 取消屏蔽用户的请求载荷
 * @returns 取消屏蔽用户的请求响应
 */
export const unBlockUserService = async (uuid: string, token: string, UnblockUserByUidRequest: UnblockUserByUidRequestDto): Promise<UnblockUserByUidResponseDto> => {
	try {
		if (!checkBlockUserByUidRequest(UnblockUserByUidRequest)) {
			return { success: false, message: '取消屏蔽用户失败，取消屏蔽用户请求载荷不合法' }
		}

		const { blockUid } = UnblockUserByUidRequest
		if (!checkUserExistsByUIDService({ uid: blockUid })) {
			console.error('ERROR', '取消屏蔽用户失败，用户不存在')
			return { success: false, message: '取消屏蔽用户失败，用户不存在' }
		}
		const userUuid = await getUserUuid(blockUid)
		const operatorUid = await getUserUid(uuid)

		if (!userUuid || !operatorUid) {
			console.error('ERROR', '取消屏蔽用户失败，用户不存在')
			return { success: false, message: '取消屏蔽用户失败，用户不存在' }
		}
		if (userUuid === uuid) {
			console.error('ERROR', '取消屏蔽用户失败，不能取消自己的屏蔽')
			return { success: false, message: '取消屏蔽用户失败，不能取消自己的屏蔽' }
		}

		if (!checkUserTokenByUuidService(uuid, token)) {
			console.error('ERROR', '取消屏蔽用户失败，用户 Token 不合法')
			return { success: false, message: '取消屏蔽用户失败，用户 Token 不合法' }
		}

		const { collectionName: blockUserCollectionName, schemaInstance: blockUserSchemaInstance } = BlockListSchema
		type BlockListSchemaType = InferSchemaType<typeof blockUserSchemaInstance>
		const blockListWhere: QueryType<BlockListSchemaType> = {
			type: 'block',
			value: userUuid,
			operatorUUID: uuid,
		}

		const blockListSelect: SelectType<BlockListSchemaType> = {
			type: 1,
			value: 1,
			Uid: 1,
			operatorUid: 1,
			operatorUUID: 1,
		}

		// 启动事务
		const session = await createAndStartSession()

		const selectResult = await selectDataFromMongoDB<BlockListSchemaType>(blockListWhere, blockListSelect, blockUserSchemaInstance, blockUserCollectionName, {session})
		if (!selectResult.success) {
			await abortAndEndSession(session)
			console.error('ERROR', '取消屏蔽用户失败，查询数据失败')
			return { success: false, message: '取消屏蔽用户失败，查询数据失败' }
		}
		if (selectResult.result.length === 0) {
			await abortAndEndSession(session)
			console.error('ERROR', '取消屏蔽用户失败，用户未被屏蔽')
			return { success: false, message: '取消屏蔽用户失败，用户未被屏蔽' }
		}

		const { collectionName: unblockUserCollectionName, schemaInstance: unblockUserSchemaInstance } = UnblockListSchema
		type UnblockListSchemaType = InferSchemaType<typeof unblockUserSchemaInstance>
		const unblockListData: UnblockListSchemaType = {
			...selectResult.result[0],
			_operatorUid_: operatorUid,
			_operatorUUID_: uuid,
		}
		const insertResult = await insertData2MongoDB<UnblockListSchemaType>(unblockListData, unblockUserSchemaInstance, unblockUserCollectionName, {session})
		if (!insertResult) {
			await abortAndEndSession(session)
			console.error('ERROR', '取消屏蔽用户失败，查询数据失败')
			return { success: false, message: '取消屏蔽用户失败，查询数据失败' }
		}

		const deleteResult = await deleteDataFromMongoDB<BlockListSchemaType>(blockListWhere, blockUserSchemaInstance, blockUserCollectionName, {session})
		if (!deleteResult) {
			await abortAndEndSession(session)
			console.error('ERROR', '取消屏蔽用户失败，查询数据失败')
			return { success: false, message: '取消屏蔽用户失败，查询数据失败' }
		}
		await commitAndEndSession(session)
		return { success: true, message: '取消屏蔽用户成功' }
	}
	catch (error) {
		console.error('ERROR', '取消屏蔽用户失败，未知错误', error)
		return { success: false, message: '取消屏蔽用户失败，未知错误' }
	}
}

/**
 * 显示用户
 * @param uuid 用户 UUID
 * @param token 用户 Token
 * @param ShowUserByUidRequestDto 显示用户的请求载荷
 * @returns 显示用户的请求响应
 */
export const showUserService = async (uuid: string, token: string, ShowUserByUidRequest: ShowUserByUidRequestDto): Promise<ShowUserByUidResponseDto> => {
	try {
		if (!checkMuteUserByUidRequest(ShowUserByUidRequest)) {
			return { success: false, message: '显示用户失败，显示用户请求载荷不合法' }
		}

		const { muteUid } = ShowUserByUidRequest
		if (!checkUserExistsByUIDService({ uid: muteUid })) {
			console.error('ERROR', '显示用户失败，用户不存在')
			return { success: false, message: '显示用户失败，用户不存在' }
		}
		const userUuid = await getUserUuid(muteUid)
		const operatorUid = await getUserUid(uuid)

		if (!userUuid || !operatorUid) {
			console.error('ERROR', '显示用户失败，用户不存在')
			return { success: false, message: '显示用户失败，用户不存在' }
		}
		if (userUuid === uuid) {
			console.error('ERROR', '显示用户失败，不能显示自己')
			return { success: false, message: '显示用户失败，不能显示自己' }
		}

		if (!checkUserTokenByUuidService(uuid, token)) {
			console.error('ERROR', '显示用户失败，用户 Token 不合法')
			return { success: false, message: '显示用户失败，用户 Token 不合法' }
		}

		const { collectionName: unblockUserCollectionName, schemaInstance: unblockUserSchemaInstance } = UnblockListSchema
		type UnblockListSchemaType = InferSchemaType<typeof unblockUserSchemaInstance>
		const unblockListWhere: QueryType<UnblockListSchemaType> = {
			type: 'unblock',
			value: userUuid,
			operatorUUID: uuid,
		}

		const unblockListSelect: SelectType<UnblockListSchemaType> = {
			type: 1,
			value: 1,
			Uid: 1,
			operatorUid: 1,
			operatorUUID: 1,
		}

		// 启动事务
		const session = await createAndStartSession()

		const selectResult = await selectDataFromMongoDB<UnblockListSchemaType>(unblockListWhere, unblockListSelect, unblockUserSchemaInstance, unblockUserCollectionName, {session})
		if (!selectResult.success) {
			await abortAndEndSession(session)
			console.error('ERROR', '显示用户失败，查询数据失败')
			return { success: false, message: '显示用户失败，查询数据失败' }
		}
		if (selectResult.result.length === 0) {
			await abortAndEndSession(session)
			console.error('ERROR', '显示用户失败，用户未被隐藏')
			return { success: false, message: '显示用户失败，用户未被隐藏' }
		}

		const { collectionName: blockUserCollectionName, schemaInstance: blockUserSchemaInstance } = UnblockListSchema
		type BlockListSchemaType = InferSchemaType<typeof blockUserSchemaInstance>
		const blockListData: BlockListSchemaType = {
			...selectResult.result[0],
			_operatorUid_: operatorUid,
			_operatorUUID_: uuid,
		}
		const insertResult = await insertData2MongoDB<BlockListSchemaType>(blockListData, blockUserSchemaInstance, blockUserCollectionName, {session})
		if (!insertResult) {
			await abortAndEndSession(session)
			console.error('ERROR', '显示用户失败，查询数据失败')
			return { success: false, message: '显示用户失败，查询数据失败' }
		}

		const deleteResult = await deleteDataFromMongoDB<UnblockListSchemaType>(unblockListWhere, unblockUserSchemaInstance, unblockUserCollectionName, {session})
		if (!deleteResult) {
			await abortAndEndSession(session)
			console.error('ERROR', '显示用户失败，查询数据失败')
			return { success: false, message: '显示用户失败，查询数据失败' }
		}
		await commitAndEndSession(session)
		return { success: true, message: '显示用户成功' }
	}
	catch (error) {
		console.error('ERROR', '显示用户失败，未知错误', error)
		return { success: false, message: '显示用户失败，未知错误' }
	}
}

/**
 * 取消屏蔽标签
 * @param uuid 用户 UUID
 * @param token 用户 Token
 * @param UnblockTagRequestDto 取消屏蔽标签的请求载荷
 * @returns 取消屏蔽标签的请求响应
 */
export const unBlockTagService = async (uuid: string, token: string, UnblockTagRequest: UnblockTagRequestDto): Promise<UnblockTagResponseDto> => {
	try {
		if (!checkBlockTagRequest(UnblockTagRequest)) {
			return { success: false, message: '取消屏蔽标签失败，取消屏蔽标签请求载荷不合法' }
		}

		const tagId = UnblockTagRequest.tagId.toString()
		const operatorUid = await getUserUid(uuid)

		if (!operatorUid) {
			console.error('ERROR', '取消屏蔽标签失败，用户不存在')
			return { success: false, message: '取消屏蔽标签失败，用户不存在' }
		}

		if (!checkUserTokenByUuidService(uuid, token)) {
			console.error('ERROR', '取消屏蔽标签失败，用户 Token 不合法')
			return { success: false, message: '取消屏蔽标签失败，用户 Token 不合法' }
		}

		const { collectionName: blockUserCollectionName, schemaInstance: blockUserSchemaInstance } = BlockListSchema
		type BlockListSchemaType = InferSchemaType<typeof blockUserSchemaInstance>
		const blockListWhere: QueryType<BlockListSchemaType> = {
			type: 'tag',
			value: tagId,
			operatorUUID: uuid,
		}

		const blockListSelect: SelectType<BlockListSchemaType> = {
			type: 1,
			value: 1,
			operatorUid: 1,
			operatorUUID: 1,
		}

		// 启动事务
		const session = await createAndStartSession()

		const selectResult = await selectDataFromMongoDB<BlockListSchemaType>(blockListWhere, blockListSelect, blockUserSchemaInstance, blockUserCollectionName, {session})
		if (!selectResult.success) {
			await abortAndEndSession(session)
			console.error('ERROR', '取消屏蔽标签失败，查询数据失败')
			return { success: false, message: '取消屏蔽标签失败，查询数据失败' }
		}
		if (selectResult.result.length === 0) {
			await abortAndEndSession(session)
			console.error('ERROR', '取消屏蔽标签失败，标签未被屏蔽')
			return { success: false, message: '取消屏蔽标签失败，标签未被屏蔽' }
		}

		const { collectionName: unblockUserCollectionName, schemaInstance: unblockUserSchemaInstance } = UnblockListSchema
		type UnblockListSchemaType = InferSchemaType<typeof unblockUserSchemaInstance>
		const unblockListData: UnblockListSchemaType = {
			...selectResult.result[0],
			_operatorUid_: operatorUid,
			_operatorUUID_: uuid,
		}
		const insertResult = await insertData2MongoDB<UnblockListSchemaType>(unblockListData, unblockUserSchemaInstance, unblockUserCollectionName, {session})
		if (!insertResult) {
			await abortAndEndSession(session)
			console.error('ERROR', '取消屏蔽标签失败，查询数据失败')
			return { success: false, message: '取消屏蔽标签失败，查询数据失败' }
		}

		const deleteResult = await deleteDataFromMongoDB<BlockListSchemaType>(blockListWhere, blockUserSchemaInstance, blockUserCollectionName, {session})
		if (!deleteResult) {
			await abortAndEndSession(session)
			console.error('ERROR', '取消屏蔽标签失败，查询数据失败')
			return { success: false, message: '取消屏蔽标签失败，查询数据失败' }
		}
		await commitAndEndSession(session)
		return { success: true, message: '取消屏蔽标签成功' }
	}
	catch (error) {
		console.error('ERROR', '取消屏蔽标签失败，未知错误', error)
		return { success: false, message: '取消屏蔽标签失败，未知错误' }
	}
}

/**
 * 取消屏蔽关键词
 * @param uuid 用户 UUID
 * @param token 用户 Token
 * @param UnblockKeywordRequestDto 取消屏蔽关键词的请求载荷
 * @returns 取消屏蔽关键词的请求响应
 */
export const unBlockKeywordService = async (uuid: string, token: string, UnblockKeywordRequest: UnblockKeywordRequestDto): Promise<UnblockKeywordResponseDto> => {
	try {
		if (!checkBlockKeywordRequest(UnblockKeywordRequest)) {
			return { success: false, message: '取消屏蔽关键词失败，取消屏蔽关键词请求载荷不合法' }
		}

		const keyword = UnblockKeywordRequest.blockKeyword
		const operatorUid = await getUserUid(uuid)

		if (!operatorUid) {
			console.error('ERROR', '取消屏蔽关键词失败，用户不存在')
			return { success: false, message: '取消屏蔽关键词失败，用户不存在' }
		}

		if (!checkUserTokenByUuidService(uuid, token)) {
			console.error('ERROR', '取消屏蔽关键词失败，用户 Token 不合法')
			return { success: false, message: '取消屏蔽关键词失败，用户 Token 不合法' }
		}

		const { collectionName: blockUserCollectionName, schemaInstance: blockUserSchemaInstance } = BlockListSchema
		type BlockListSchemaType = InferSchemaType<typeof blockUserSchemaInstance>
		const blockListWhere: QueryType<BlockListSchemaType> = {
			type: 'keyword',
			value: keyword,
			operatorUUID: uuid,
		}

		const blockListSelect: SelectType<BlockListSchemaType> = {
			type: 1,
			value: 1,
			operatorUid: 1,
			operatorUUID: 1,
		}

		// 启动事务
		const session = await createAndStartSession()

		const selectResult = await selectDataFromMongoDB<BlockListSchemaType>(blockListWhere, blockListSelect, blockUserSchemaInstance, blockUserCollectionName, {session})
		if (!selectResult.success) {
			await abortAndEndSession(session)
			console.error('ERROR', '取消屏蔽关键词失败，查询数据失败')
			return { success: false, message: '取消屏蔽关键词失败，查询数据失败' }
		}
		if (selectResult.result.length === 0) {
			await abortAndEndSession(session)
			console.error('ERROR', '取消屏蔽关键词失败，关键词未被屏蔽')
			return { success: false, message: '取消屏蔽关键词失败，关键词未被屏蔽' }
		}

		const { collectionName: unblockUserCollectionName, schemaInstance: unblockUserSchemaInstance } = UnblockListSchema
		type UnblockListSchemaType = InferSchemaType<typeof unblockUserSchemaInstance>
		const unblockListData: UnblockListSchemaType = {
			...selectResult.result[0],
			_operatorUid_: operatorUid,
			_operatorUUID_: uuid,
		}
		const insertResult = await insertData2MongoDB<UnblockListSchemaType>(unblockListData, unblockUserSchemaInstance, unblockUserCollectionName, {session})
		if (!insertResult) {
			await abortAndEndSession(session)
			console.error('ERROR', '取消屏蔽关键词失败，查询数据失败')
			return { success: false, message: '取消屏蔽关键词失败，查询数据失败' }
		}

		const deleteResult = await deleteDataFromMongoDB<BlockListSchemaType>(blockListWhere, blockUserSchemaInstance, blockUserCollectionName, {session})
		if (!deleteResult) {
			await abortAndEndSession(session)
			console.error('ERROR', '取消屏蔽关键词失败，查询数据失败')
			return { success: false, message: '取消屏蔽关键词失败，查询数据失败' }
		}
		await commitAndEndSession(session)
		return { success: true, message: '取消屏蔽关键词成功' }
	}
	catch (error) {
		console.error('ERROR', '取消屏蔽关键词失败，未知错误', error)
		return { success: false, message: '取消屏蔽关键词失败，未知错误' }
	}
}

/**
 * 删除正则表达式
 * @param uuid 用户 UUID
 * @param token 用户 Token
 * @param RemoveRegexResponseDto 删除正则表达式的请求载荷
 * @returns 删除正则表达式的请求响应
 */
export const removeRegexService = async (uuid: string, token: string, RemoveRegexRequest: RemoveRegexRequestDto): Promise<RemoveRegexResponseDto> => {
	try {
		if (!checkAddRegexRequest(RemoveRegexRequest)) {
			return { success: false, message: '删除正则表达式失败，删除正则表达式请求载荷不合法' }
		}

		const regex = RemoveRegexRequest.blockRegex
		const operatorUid = await getUserUid(uuid)

		if (!operatorUid) {
			console.error('ERROR', '删除正则表达式失败，用户不存在')
			return { success: false, message: '删除正则表达式失败，用户不存在' }
		}

		if (!checkUserTokenByUuidService(uuid, token)) {
			console.error('ERROR', '删除正则表达式失败，用户 Token 不合法')
			return { success: false, message: '删除正则表达式失败，用户 Token 不合法' }
		}

		const { collectionName: blockUserCollectionName, schemaInstance: blockUserSchemaInstance } = BlockListSchema
		type BlockListSchemaType = InferSchemaType<typeof blockUserSchemaInstance>
		const blockListWhere: QueryType<BlockListSchemaType> = {
			type: 'regex',
			value: regex,
			operatorUUID: uuid,
		}

		const blockListSelect: SelectType<BlockListSchemaType> = {
			type: 1,
			value: 1,
			operatorUid: 1,
			operatorUUID: 1,
		}

		// 启动事务
		const session = await createAndStartSession()

		const selectResult = await selectDataFromMongoDB<BlockListSchemaType>(blockListWhere, blockListSelect, blockUserSchemaInstance, blockUserCollectionName, {session})
		if (!selectResult.success) {
			await abortAndEndSession(session)
			console.error('ERROR', '删除正则表达式失败，查询数据失败')
			return { success: false, message: '删除正则表达式失败，查询数据失败' }
		}
		if (selectResult.result.length === 0) {
			await abortAndEndSession(session)
			console.error('ERROR', '删除正则表达式失败，正则表达式未被屏蔽')
			return { success: false, message: '删除正则表达式失败，正则表达式未被屏蔽' }
		}

		const { collectionName: unblockUserCollectionName, schemaInstance: unblockUserSchemaInstance } = UnblockListSchema
		type UnblockListSchemaType = InferSchemaType<typeof unblockUserSchemaInstance>
		const unblockListData: UnblockListSchemaType = {
			...selectResult.result[0],
			_operatorUid_: operatorUid,
			_operatorUUID_: uuid,
		}
		const insertResult = await insertData2MongoDB<UnblockListSchemaType>(unblockListData, unblockUserSchemaInstance, unblockUserCollectionName, {session})
		if (!insertResult) {
			await abortAndEndSession(session)
			console.error('ERROR', '删除正则表达式失败，查询数据失败')
			return { success: false, message: '删除正则表达式失败，查询数据失败' }
		}

		const deleteResult = await deleteDataFromMongoDB<BlockListSchemaType>(blockListWhere, blockUserSchemaInstance, blockUserCollectionName, {session})
		if (!deleteResult) {
			await abortAndEndSession(session)
			console.error('ERROR', '删除正则表达式失败，查询数据失败')
			return { success: false, message: '删除正则表达式失败，查询数据失败' }
		}
		await commitAndEndSession(session)
		return { success: true, message: '删除正则表达式成功' }
	}
	catch (error) {
		console.error('ERROR', '删除正则表达式失败，未知错误', error)
		return { success: false, message: '删除正则表达式失败，未知错误' }
	}
}

/**
 * 获取用户的黑名单
 * @param uuid 用户 UUID
 * @param token 用户 Token
 * @returns 用户的黑名单
 */
export const getBlockListService = async (GetBlockListRequest: GetBlockListRequestDto, uuid: string, token: string): Promise<GetBlockListResponseDto> => {
	try {
		if (!checkGetBlockListRequest(GetBlockListRequest)) {
			return { success: false, message: '获取黑名单失败，获取黑名单请求载荷不合法' }
		}
		if (uuid !== undefined && uuid !== null && token) {
			if (!checkUserTokenByUuidService(uuid, token)) {
				console.error('ERROR', '获取黑名单失败，用户 Token 不合法')
				return { success: false, message: '获取黑名单失败，用户 Token 不合法' }
			}
		}

		const { type } = GetBlockListRequest
		let pageSize = undefined
		let skip = 0
		if (GetBlockListRequest.pagination && GetBlockListRequest.pagination.page > 0 && GetBlockListRequest.pagination.pageSize > 0) {
			skip = (GetBlockListRequest.pagination.page - 1) * GetBlockListRequest.pagination.pageSize
			pageSize = GetBlockListRequest.pagination.pageSize
		}

		const countBlocklistPipeline: PipelineStage[] = [
			{
				$match: {
					type,
				},
			},
			{
				$count: 'totalCount',
			},
		]

		// 判断是否需要关联用户信息
		const shouldJoinUserInfo = ['mute', 'block'].includes(type)

		const getBlocklistPipeline: PipelineStage[] = [
			{
				$match: {
					operatorUUID: uuid,
					type,
				},
			},
			{ $sort: { 'createDateTime': -1 } },
			{ $skip: skip },
			...(pageSize ? [{ $limit: pageSize }] : []),
			...(shouldJoinUserInfo ? [
				{
					$lookup: {
						from: 'user-infos',
						localField: 'UUID',
						foreignField: 'UUID',
						as: 'user_info_data',
					}
				},
				{
					$unwind: {
						path: '$user_info_data',
						preserveNullAndEmptyArrays: true,
					}
				},
				{
					$project: {
						uid: 1,
						type: 1,
						value: 1,
						createDateTime: 1,
						userNickname: '$user_info_data.userNickname',
						avatar: '$user_info_data.avatar',
					}
				}
			] : [
				{
					$project: {
						type: 1,
						value: 1,
						createDateTime: 1,
					}
				}
			])
		]
		const { collectionName: blockUserCollectionName, schemaInstance: blockUserSchemaInstance } = BlockListSchema
		const BlocklistCountResult = await selectDataByAggregateFromMongoDB(blockUserSchemaInstance, blockUserCollectionName, countBlocklistPipeline)
		const BlocklistResult = await selectDataByAggregateFromMongoDB(blockUserSchemaInstance, blockUserCollectionName, getBlocklistPipeline)

		if (!BlocklistResult.success || !BlocklistCountResult.success) {
			console.error('ERROR', '获取黑名单失败，查询数据失败')
			return { success: false, message: '获取黑名单失败，查询数据失败' }
		}

		return {
			success: true,
			message: BlocklistCountResult.result?.[0]?.totalCount > 0 ? '获取黑名单成功' : '获取黑名单成功，长度为零',
			blocklistCount: BlocklistCountResult.result?.[0]?.totalCount,
			result: BlocklistResult.result,
		}

	} catch (error) {
		console.error('ERROR', '获取黑名单失败，未知错误', error)
		return { success: false, message: '获取黑名单失败，未知错误' }
	}
}

/**
 * 检查内容是否被屏蔽
 * @param uuid 用户 uuid
 * @param token 用户 Token
 * @param content 内容
 * @returns 内容是否被屏蔽的请求响应
 */
export const checkBlockContentService = async (CheckIsBlockedRequest: CheckContentIsBlockedRequestDto, uuid: string, token: string): Promise<CheckIsBlockedResponseDto> => {
	try {
		if (!checkCheckContentIsBlockedRequest(CheckIsBlockedRequest)) {
			console.error('ERROR', '检查内容是否被屏蔽失败，请求载荷不合法')
			return { success: true, message: '检查内容是否被屏蔽失败，请求载荷不合法', isBlocked: false }
		}
		const { content } = CheckIsBlockedRequest

		if (!checkUserTokenByUuidService(uuid, token)) {
			console.error('ERROR', '检查内容是否被屏蔽失败，用户 Token 不合法')
			return { success: false, message: '检查内容是否被屏蔽失败，用户 Token 不合法', isBlocked: false }
		}


		const { collectionName: blockUserCollectionName, schemaInstance: blockUserSchemaInstance } = BlockListSchema
		type BlockListSchemaType = InferSchemaType<typeof blockUserSchemaInstance>
		const keywordWhere: QueryType<BlockListSchemaType> = {
			type: 'keyword',
			operatorUUID: uuid,
		}
		const keywordSelect: SelectType<BlockListSchemaType> = {
			value: 1,
		}

		const regexWhere: QueryType<BlockListSchemaType> = {
			type: 'regex',
			operatorUUID: uuid,
		}
		const regexSelect: SelectType<BlockListSchemaType> = {
			value: 1,
		}

		const keywordResult = await selectDataFromMongoDB(keywordWhere, keywordSelect, blockUserSchemaInstance, blockUserCollectionName)
		if (!keywordResult.success) {
			console.error('ERROR', '检查内容是否被屏蔽失败，查询数据失败')
			return { success: false, message: '检查内容是否被屏蔽失败，查询数据失败', isBlocked: false }
		}

		const regexResult = await selectDataFromMongoDB(regexWhere, regexSelect, blockUserSchemaInstance, blockUserCollectionName)
		if (!regexResult.success) {
			console.error('ERROR', '检查内容是否被屏蔽失败，查询数据失败')
			return { success: false, message: '检查内容是否被屏蔽失败，查询数据失败', isBlocked: false }
		}
		const keywordData = keywordResult.result.map((item) => item.value)
		const regexData = regexResult.result.map((item) => item.value)

		if (keywordData.length > 0 || regexData.length > 0) {
			const regexList = regexData.map((regex) => new RegExp(regex, 'i'))
			const isBlocked = keywordData.some((keyword) => content.includes(keyword)) || regexList.some((regex) => regex.test(content))
			return { success: true, message: '检查内容是否被屏蔽成功，被屏蔽', isBlocked }
		} else {
			return { success: true, message: '检查内容是否被屏蔽成功，未被屏蔽', isBlocked: false }
		}

	} catch (error) {
		console.error('ERROR', '检查内容是否被屏蔽失败，未知错误', error)
		return { success: false, message: '检查内容是否被屏蔽失败，未知错误', isBlocked: false }
	}
}

/**
 * 检查标签是否被屏蔽
 * @param uuid 用户 uuid
 * @param token 用户 Token
 * @param tagId 标签 ID
 * @returns 标签是否被屏蔽的请求响应
 */
export const checkBlockTagsService = async (CheckIsBlockedRequest: CheckTagIsBlockedRequestDto, uuid: string, token: string): Promise<CheckIsBlockedResponseDto> => {
	try {
		if (!checkCheckTagIsBlockedRequest(CheckIsBlockedRequest)) {
			console.error('ERROR', '检查标签是否被屏蔽失败，请求载荷不合法')
			return { success: true, message: '检查标签是否被屏蔽失败，请求载荷不合法', isBlocked: false }
		}
		const { tagId } = CheckIsBlockedRequest

		if (!checkUserTokenByUuidService(uuid, token)) {
			console.error('ERROR', '检查标签是否被屏蔽失败，用户 Token 不合法')
			return { success: false, message: '检查标签是否被屏蔽失败，用户 Token 不合法', isBlocked: false }
		}
		const { collectionName: blockUserCollectionName, schemaInstance: blockUserSchemaInstance } = BlockListSchema
		type BlockListSchemaType = InferSchemaType<typeof blockUserSchemaInstance>
		const tagWhere: QueryType<BlockListSchemaType> = {
			type: 'tag',
			operatorUUID: uuid,
		}
		const tagSelect: SelectType<BlockListSchemaType> = {
			value: 1,
		}
		const tagResult = await selectDataFromMongoDB(tagWhere, tagSelect, blockUserSchemaInstance, blockUserCollectionName)
		if (!tagResult.success) {
			console.error('ERROR', '检查标签是否被屏蔽失败，查询数据失败')
			return { success: false, message: '检查标签是否被屏蔽失败，查询数据失败', isBlocked: false }
		}

		if (tagResult.result.length > 0) {
			const tagData = tagResult.result.map((item) => item.value)
			const isBlocked = tagData.some((tag) => tag === tagId)
			return { success: true, message: '检查标签是否被屏蔽成功，被屏蔽', isBlocked }
		} else {
			return { success: true, message: '检查标签是否被屏蔽成功，未被屏蔽', isBlocked: false }
		}

	} catch (error) {
		console.error('ERROR', '检查标签是否被屏蔽失败，未知错误', error)
		return { success: false, message: '检查标签是否被屏蔽失败，未知错误', isBlocked: false }
	}
}

/**
 * 检查用户是否被屏蔽或隐藏
 * @param UUID 用户 uuid
 * @param token 用户 Token
 * @param targetUid 目标用户 UID
 * @returns 用户是否被屏蔽或隐藏的请求响应
 */
export const checkBlockUserService = async (CheckIsBlockedRequest: CheckUserIsBlockedRequestDto, uuid: string, token: string): Promise<CheckUserIsBlockedResponseDto> => {
	try {
		const isBlocked = false
		const isMuted = false

		if (!checkCheckUserIsBlockedRequest(CheckIsBlockedRequest)) {
			console.error('ERROR', '检查用户是否被屏蔽或隐藏失败，请求载荷不合法')
			return { success: true, message: '检查用户是否被屏蔽或隐藏失败，请求载荷不合法', isBlocked, isMuted }
		}
		const { uid } = CheckIsBlockedRequest

		if (!checkUserExistsByUIDService({ uid })) {
			console.error('ERROR', '检查用户是否被屏蔽或隐藏失败，用户不存在')
			return { success: false, message: '检查用户是否被屏蔽或隐藏失败，用户不存在', isBlocked, isMuted }
		}
		if (!checkUserTokenByUuidService(uuid, token)) {
			console.error('ERROR', '检查用户是否被屏蔽或隐藏失败，用户 Token 不合法')
			return { success: false, message: '检查用户是否被屏蔽或隐藏失败，用户 Token 不合法', isBlocked, isMuted }
		}

		const { collectionName: blockUserCollectionName, schemaInstance: blockUserSchemaInstance } = BlockListSchema
		type BlockListSchemaType = InferSchemaType<typeof blockUserSchemaInstance>
		const blockWhere: QueryType<BlockListSchemaType> = {
			type: 'block',
			operatorUUID: uuid,
		}
		const muteWhere: QueryType<BlockListSchemaType> = {
			type: 'mute',
			operatorUUID: uuid,
		}

		const userSelect: SelectType<BlockListSchemaType> = {
			Uid: 1,
		}

		const blockResult = await selectDataFromMongoDB(blockWhere, userSelect, blockUserSchemaInstance, blockUserCollectionName)
		if (!blockResult.success) {
			console.error('ERROR', '检查用户是否被屏蔽或隐藏失败，查询数据失败')
			return { success: false, message: '检查用户是否被屏蔽或隐藏失败，查询数据失败', isBlocked, isMuted }
		}

		const muteResult = await selectDataFromMongoDB(muteWhere, userSelect, blockUserSchemaInstance, blockUserCollectionName)
		if (!muteResult.success) {
			console.error('ERROR', '检查用户是否被屏蔽或隐藏失败，查询数据失败')
			return { success: false, message: '检查用户是否被屏蔽或隐藏失败，查询数据失败', isBlocked, isMuted }
		}

		const blockData = blockResult.result.map((item) => item.Uid)
		const muteData = muteResult.result.map((item) => item.Uid)

		if (blockData.includes(uid)) {
			const isBlocked = true
		}
		if (muteData.includes(uid)) {
			const isMuted = true
		}

		return { success: true, message: '检查用户是否被屏蔽或隐藏成功，未被屏蔽或隐藏', isBlocked, isMuted }

	} catch (error) {
		console.error('ERROR', '检查用户是否被屏蔽或隐藏失败，未知错误', error)
		return { success: false, message: '检查用户是否被屏蔽或隐藏失败，未知错误', isBlocked: false, isMuted: false }
	}
}

/**
 * 检测是否被其他用户屏蔽
 * @param UUID 用户 uuid
 * @param token 用户 Token
 * @param targetUid 目标用户 UID
 * @returns 是否被其他用户屏蔽的请求响应
 */
export const checkIsBlockedByOtherUserService = async (CheckIsBlockedRequest: CheckIsBlockedByOtherUserRequestDto, uuid: string, token: string): Promise<CheckIsBlockedByOtherUserResponseDto> => {
	try {
		if (!checkCheckIsBlockedByOtherUserRequest(CheckIsBlockedRequest)) {
			console.error('ERROR', '检查是否被其他用户屏蔽失败，请求载荷不合法')
			return { success: true, message: '检查是否被其他用户屏蔽失败，请求载荷不合法', isBlocked: false }
		}
		const { targetUid } = CheckIsBlockedRequest

		if (!checkUserExistsByUIDService({uid: targetUid})) {
			return { success: false, message: '检查是否被其他用户屏蔽失败，用户不存在', isBlocked: false }
		}

		if (!checkUserTokenByUuidService(uuid, token)) {
			console.error('ERROR', '检查是否被其他用户屏蔽失败，用户 Token 不合法')
			return { success: false, message: '检查是否被其他用户屏蔽失败，用户 Token 不合法', isBlocked: false }
		}
		const { collectionName: blockUserCollectionName, schemaInstance: blockUserSchemaInstance } = BlockListSchema
		type BlockListSchemaType = InferSchemaType<typeof blockUserSchemaInstance>
		const blockWhere: QueryType<BlockListSchemaType> = {
			type: 'block',
			operatorUid: targetUid,
		}
		const blockSelect: SelectType<BlockListSchemaType> = {
			Uid: 1,
		}
		const blockResult = await selectDataFromMongoDB(blockWhere, blockSelect, blockUserSchemaInstance, blockUserCollectionName)
		if (!blockResult.success) {
			console.error('ERROR', '检查是否被其他用户屏蔽失败，查询数据失败')
			return { success: false, message: '检查是否被其他用户屏蔽失败，查询数据失败', isBlocked: false }
		}

		const blockData = blockResult.result.map((item) => item.Uid)

		if (blockData.includes(uuid)) {
			return { success: true, message: '检查是否被其他用户屏蔽成功，被其他用户屏蔽', isBlocked: true }
		} else {
			return { success: true, message: '检查是否被其他用户屏蔽成功，未被其他用户屏蔽', isBlocked: false }
		}

	} catch (error) {
		console.error('ERROR', '检查是否被其他用户屏蔽失败，未知错误', error)
		return { success: false, message: '检查是否被其他用户屏蔽失败，未知错误', isBlocked: false }
	}
}


/**
 * 检测屏蔽用户的请求载荷
 * @param blockUserByUidRequest 屏蔽用户的请求载荷
 * @returns 合法返回 true, 不合法返回 false
 */
const checkBlockUserByUidRequest = (blockUserByUidRequest: BlockUserByUidRequestDto): boolean => {
	if (!blockUserByUidRequest.blockUid) {
		console.error('ERROR', '屏蔽用户请求载荷不合法')
		return false
	}
	return true
}

/**
 * 检测隐藏用户的请求载荷
 * @param MuteUserByUidRequest 隐藏用户的请求载荷
 * @returns 合法返回 true, 不合法返回 false
 */
const checkMuteUserByUidRequest = (muteUserByUidRequest: MuteUserByUidRequestDto): boolean => {
	if (!muteUserByUidRequest.muteUid) {
		console.error('ERROR', '隐藏用户请求载荷不合法')
		return false
	}
	return true
}

/**
 * 检测屏蔽关键词的请求载荷
 * @param blockKeywordRequest 屏蔽关键词的请求载荷
 * @returns 合法返回 true, 不合法返回 false
 */
const checkBlockKeywordRequest = (blockKeywordRequest: BlockKeywordRequestDto): boolean => {
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
 * @param blockTagRequest 屏蔽标签的请求载荷
 * @returns 合法返回 true, 不合法返回 false
 */
const checkBlockTagRequest = (blockTagRequest: BlockTagRequestDto): boolean => {
	if (!blockTagRequest.tagId) {
		console.error('ERROR', '屏蔽标签请求载荷不合法')
		return false
	}
	return true
}

/**
 * 检测添加正则表达式的请求载荷
 * @param addRegexRequest 添加正则表达式的请求载荷
 * @returns 合法返回 true, 不合法返回 false
 */
const checkAddRegexRequest = (addRegexRequest: AddRegexRequestDto): boolean => {
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

/**
 * 检测获取黑名单的请求载荷
 * @param getBlockListRequest 获取黑名单的请求载荷
 * @returns 合法返回 true, 不合法返回 false
 */
const checkGetBlockListRequest = (getBlockListRequest: GetBlockListRequestDto): boolean => {
	return (
		getBlockListRequest.type !== undefined && getBlockListRequest.type !== null
	)
}

/**
 * 检查内容是否被屏蔽的请求载荷
 * @param CheckIsBlockedRequestDto 内容是否被屏蔽的请求载荷
 * @returns 合法返回 true, 不合法返回 false
 */
const checkCheckContentIsBlockedRequest = (checkIsBlockedRequest: CheckContentIsBlockedRequestDto): boolean => {
	if (!checkIsBlockedRequest?.content) {
			console.error('ERROR', '检查内容是否被屏蔽请求载荷不合法')
			return false
	}
	const content = checkIsBlockedRequest.content
	if (
			content.trim().length === 0 || // 空字符串或纯空格
			content.length > 500 // 长度超限
	) {
			return false
	}
	return true
}

/**
 * 检查标签是否被屏蔽的请求载荷
 * @param CheckIsBlockedRequest 内容是否被屏蔽的请求载荷
 * @returns 合法返回 true, 不合法返回 false
 */
const checkCheckTagIsBlockedRequest = (checkIsBlockedRequest: CheckTagIsBlockedRequestDto): boolean => {
	return (
		checkIsBlockedRequest.tagId !== undefined && checkIsBlockedRequest.tagId !== null
	)
}

/**
 * 检查用户是否被屏蔽的请求载荷
 * @param CheckIsBlockedRequest 内容是否被屏蔽的请求载荷
 * @returns 合法返回 true, 不合法返回 false
 */
const checkCheckUserIsBlockedRequest = (checkIsBlockedRequest: CheckUserIsBlockedRequestDto): boolean => {
	return (
		checkIsBlockedRequest.uid !== undefined && checkIsBlockedRequest.uid !== null
	)
}

/**
 * 检测是否被其他用户屏蔽的请求载荷
 * @param CheckIsBlockedByOtherUserRequestDto 是否被其他用户屏蔽的请求载荷
 * @returns 合法返回 true, 不合法返回 false
 */
const checkCheckIsBlockedByOtherUserRequest = (checkIsBlockedRequest: CheckIsBlockedByOtherUserRequestDto): boolean => {
	return (
		checkIsBlockedRequest.targetUid !== undefined && checkIsBlockedRequest.targetUid !== null
	)
}
