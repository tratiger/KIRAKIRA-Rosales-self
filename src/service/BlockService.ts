import { InferSchemaType } from "mongoose";
import { AddRegexRequestDto, AddRegexResponseDto, BlockKeywordRequestDto, BlockKeywordResponseDto, BlockTagRequestDto, BlockTagResponseDto, BlockUserByUidRequestDto, BlockUserByUidResponseDto, GetBlockListResponseDto, HideUserByUidRequestDto, HideUserByUidResponseDto, RemoveRegexRequestDto, RemoveRegexResponseDto, ShowUserByUidRequestDto, ShowUserByUidResponseDto, UnblockKeywordRequestDto, UnblockKeywordResponseDto, UnblockTagRequestDto, UnblockTagResponseDto, UnblockUserByUidRequestDto, UnblockUserByUidResponseDto } from "../controller/BlockControllerDto.js";
import { checkUserExistsByUuidService, checkUserTokenByUuidService, getUserUuid } from "./UserService.js";
import { QueryType, SelectType, UpdateType } from "../dbPool/DbClusterPoolTypes.js";
import { abortAndEndSession, commitAndEndSession, createAndStartSession } from "../common/MongoDBSessionTool.js";
import { updateData4MongoDB, selectDataFromMongoDB, insertData2MongoDB, findOneAndUpdateData4MongoDB } from "../dbPool/DbClusterPool.js";
import { BlockingSchema } from "../dbPool/schema/BlockSchema.js";

// DELETE ME： 一定要重写一下

/**
 * 封禁用户
 * @param blockUserByUidRequest 封禁用户的请求载荷
 * @param uuid 用户的 UUID
 * @param token 用户的 token
 * @returns 封禁用户的请求响应
 */
export const BlockUserByUidService = async (blockUserByUidRequest: BlockUserByUidRequestDto, uuid: string, token: string): Promise<BlockUserByUidResponseDto> => {
	try {
		if (!checkBlockUserByUidRequest(blockUserByUidRequest)) {
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

		const { collectionName: blockingUserCollectionName, schemaInstance: blockingUserSchemaInstance } = BlockingSchema
		type BlockingUser = InferSchemaType<typeof blockingUserSchemaInstance>

		const blockingUserWhere: QueryType<BlockingUser> = {
			UUID: uuid,
		}
		const blockingUserSelect: SelectType<BlockingUser> = {
			UUID: 1,
			blockUuid: 1
		}

		const blockingUserResult = await selectDataFromMongoDB<BlockingUser>(blockingUserWhere, blockingUserSelect, blockingUserSchemaInstance, blockingUserCollectionName)
		const blockingUserData = blockingUserResult.result?.[0] ?? {
			UUID: [],
			blockUuid: [],
			createDateTime: now,
		}

		if (!blockingUserResult.success) {
			console.error('ERROR', '封禁用户失败，查询数据库失败')
			return { success: false, message: '封禁用户失败，查询数据库失败' }
		}

		if (blockingUserData.blockUuid.includes(blockedUuid)) {
			console.error('ERROR', '封禁用户失败，已经封禁过了')
			return { success: false, message: '封禁用户失败，已经封禁过了' }
		}

		const blockUuid = [...new Set([...blockingUserData.blockUuid, blockedUuid])]

		const blockingUserUpdateData: UpdateType<BlockingUser> = {
			blockUuid,
			editDateTime: now,
		}

		const blockingUserUpdateResult = await findOneAndUpdateData4MongoDB(blockingUserWhere, blockingUserUpdateData, blockingUserSchemaInstance, blockingUserCollectionName)

		if (!blockingUserUpdateResult.success) {
			console.error('ERROR', '封禁用户失败，更新数据库失败')
			return { success: false, message: '封禁用户失败，更新数据库失败' }
		}
			return { success: true, message: '封禁用户成功', result: { blockUuid: blockUuid ?? [] } }

	} catch (error) {
		console.error('ERROR', '封禁用户错误，未知错误', error)
		return { success: false, message: '封禁用户失败，未知错误' }
	}
}

/**
 * 隐藏用户
 * @param hideUserByUidRequest 隐藏用户的请求载荷
 * @param uuid 用户的 UUID
 * @param token 用户的 token
 * @returns 隐藏用户的请求响应
 */
export const HideUserByUidService = async (hideUserByUidRequest: HideUserByUidRequestDto, uuid: string, token: string): Promise<HideUserByUidResponseDto> => {
	try {
		if (!checkHideUserByUidRequest(hideUserByUidRequest)) {
			console.error('ERROR', '隐藏用户请求载荷不合法')
			return { success: false, message: '隐藏用户请求载荷不合法' }
		}

		const { hideUid } = hideUserByUidRequest
		const hidedUuid = await getUserUuid(hideUid) as string
		const now = new Date().getTime()

		if (!(await checkUserTokenByUuidService(uuid, token)).success) {
			console.error('ERROR', '隐藏用户失败，非法用户')
			return { success: false, message: '隐藏用户失败，非法用户' }
		}
		const checkHideUuidResult = await checkUserExistsByUuidService({ uuid: hidedUuid })
		if (!checkHideUuidResult.success || (checkHideUuidResult.success && !checkHideUuidResult.exists)) {
			console.error('ERROR', '隐藏用户失败，被隐藏用户不存在')
			return { success: false, message: '隐藏用户失败，被隐藏用户不存在' }
		}

		if (hidedUuid === uuid) {
			console.error('ERROR', '隐藏用户失败，不能隐藏自己')
			return { success: false, message: '隐藏用户失败，不能隐藏自己' }
		}

		const { collectionName: hidingUserCollectionName, schemaInstance: hidingUserSchemaInstance } = BlockingSchema
		type HidingUser = InferSchemaType<typeof hidingUserSchemaInstance>
		const blockingUserWhere: QueryType<HidingUser> = {
			UUID: uuid,
		}
		const blockingUserSelect: SelectType<HidingUser> = {
			UUID: 1,
			hideUuid: 1
		}

		const blockingUserResult = await selectDataFromMongoDB<HidingUser>(blockingUserWhere, blockingUserSelect, hidingUserSchemaInstance, hidingUserCollectionName)
		const blockingUserData = blockingUserResult.result?.[0] ?? {
			UUID: [],
			hideUuid: [],
		}

		if (!blockingUserResult.success) {
			console.error('ERROR', '隐藏用户失败，查询数据库失败')
			return { success: false, message: '隐藏用户失败，查询数据库失败' }
		}
		if (blockingUserData.hideUuid.includes(hidedUuid)) {
			console.error('ERROR', '隐藏用户失败，已经隐藏过了')
			return { success: false, message: '隐藏用户失败，已经隐藏过了' }
		}

		const hideUuid = [...new Set([...blockingUserData.hideUuid, hidedUuid])]
		const hidingUserUpdateData: UpdateType<HidingUser> = {
			hideUuid,
			editDateTime: now,
		}

		const blockingUserUpdateResult = await findOneAndUpdateData4MongoDB(blockingUserWhere, hidingUserUpdateData, hidingUserSchemaInstance, hidingUserCollectionName)

		if (!blockingUserUpdateResult.success) {
			console.error('ERROR', '隐藏用户失败，更新数据库失败')
			return { success: false, message: '隐藏用户失败，更新数据库失败' }
		}
		return { success: true, message: '隐藏用户成功', result: { hideUuid: hideUuid ?? [] } }

	} catch (error) {
		console.error('ERROR', '隐藏用户错误，未知错误', error)
		return { success: false, message: '隐藏用户失败，未知错误' }
	}
}

/**
 * 封禁关键词
 */
export const BlockKeywordService = async (blockKeywordRequest: BlockKeywordRequestDto, uuid: string, token: string): Promise<BlockKeywordResponseDto> => {
	try {
		if (!checkBlockKeywordRequest(blockKeywordRequest)) {
			console.error('ERROR', '封禁关键词请求载荷不合法')
			return { success: false, message: '封禁关键词请求载荷不合法' }
		}

		const { blockKeyword } = blockKeywordRequest
		const now = new Date().getTime()

		if (!(await checkUserTokenByUuidService(uuid, token)).success) {
			console.error('ERROR', '封禁关键词失败，非法用户')
			return { success: false, message: '封禁关键词失败，非法用户' }
		}

		const { collectionName: blockingKeywordCollectionName, schemaInstance: blockingKeywordSchemaInstance } = BlockingSchema
		type BlockingKeyword = InferSchemaType<typeof blockingKeywordSchemaInstance>
		const blockingKeywordWhere: QueryType<BlockingKeyword> = {
			UUID: uuid,
		}
		const blockingKeywordSelect: SelectType<BlockingKeyword> = {
			UUID: 1,
			blockKeyword: 1
		}

		const blockingKeywordResult = await selectDataFromMongoDB<BlockingKeyword>(blockingKeywordWhere, blockingKeywordSelect, blockingKeywordSchemaInstance, blockingKeywordCollectionName)
		const blockingKeywordData = blockingKeywordResult.result?.[0]

		if (!blockingKeywordResult.success) {
			console.error('ERROR', '封禁关键词失败，查询数据库失败')
			return { success: false, message: '封禁关键词失败，查询数据库失败' }
		}

		if (blockingKeywordData.blockKeyword.includes(blockKeyword)) {
			console.error('ERROR', '封禁关键词失败，已经封禁过了')
			return { success: false, message: '封禁关键词失败，已经封禁过了' }
		}

		const keyword = [...new Set([...blockingKeywordData.blockKeyword, blockKeyword])]

		const blockingUserUpdateData: UpdateType<BlockingKeyword> = {
			blockKeyword: keyword,
			editDateTime: now,
		}

		const blockingUserUpdateResult = await findOneAndUpdateData4MongoDB(blockingKeywordWhere, blockingUserUpdateData, blockingKeywordSchemaInstance, blockingKeywordCollectionName)

		if (!blockingUserUpdateResult.success) {
			console.error('ERROR', '封禁关键词失败，更新数据库失败')
			return { success: false, message: '封禁关键词失败，更新数据库失败' }
		}
		return { success: true, message: '封禁关键词成功', result: { blockKeyword: keyword ?? [] } }

	} catch (error) {
		console.error('ERROR', '封禁关键词错误，未知错误', error)
		return { success: false, message: '封禁关键词失败，未知错误' }
	}
}

/**
 * 封禁标签
 * @param blockTagRequest 封禁标签的请求载荷
 * @param uuid 用户的 UUID
 * @param token 用户的 token
 * @returns 封禁标签的请求响应
 */
export const BlockTagService = async (blockTagRequest: BlockTagRequestDto, uuid: string, token: string): Promise<BlockTagResponseDto> => {
	try {
		if (!checkBlockTagRequest(blockTagRequest)) {
			console.error('ERROR', '封禁标签请求载荷不合法')
			return { success: false, message: '封禁标签请求载荷不合法' }
		}

		const { tagId } = blockTagRequest
		const now = new Date().getTime()

		if (!(await checkUserTokenByUuidService(uuid, token)).success) {
			console.error('ERROR', '封禁标签失败，非法用户')
			return { success: false, message: '封禁标签失败，非法用户' }
		}

		const { collectionName: blockingTagCollectionName, schemaInstance: blockingTagSchemaInstance } = BlockingSchema
		type BlockingTag = InferSchemaType<typeof blockingTagSchemaInstance>
		const blockingTagWhere: QueryType<BlockingTag> = {
			UUID: uuid,
		}
		const blockingTagSelect: SelectType<BlockingTag> = {
			UUID: 1,
			tagId: 1
		}

		const blockingTagResult = await selectDataFromMongoDB<BlockingTag>(blockingTagWhere, blockingTagSelect, blockingTagSchemaInstance, blockingTagCollectionName)
		const blockingTagData = blockingTagResult.result?.[0]

		if (!blockingTagResult.success) {
			console.error('ERROR', '封禁标签失败，查询数据库失败')
			return { success: false, message: '封禁标签失败，查询数据库失败' }
		}

		if (blockingTagData.tagId.includes(tagId)) {
			console.error('ERROR', '封禁标签失败，已经封禁过了')
			return { success: false, message: '封禁标签失败，已经封禁过了' }
		}

		const blockTag = [...new Set([...blockingTagData.tagId, tagId])]
		const blockingUserUpdateData: UpdateType<BlockingTag> = {
			UUID: uuid,
			tagId: blockTag,
			editDateTime: now,
		}

		const blockingUserUpdateResult = await findOneAndUpdateData4MongoDB(blockingTagWhere, blockingUserUpdateData, blockingTagSchemaInstance, blockingTagCollectionName)

		if (!blockingUserUpdateResult.success) {
			console.error('ERROR', '封禁标签失败，更新数据库失败')
			return { success: false, message: '封禁标签失败，更新数据库失败' }
		}
		return { success: true, message: '封禁标签成功', result: { tagId: blockTag ?? [] } }

	} catch (error) {
		console.error('ERROR', '封禁标签错误，未知错误', error)
		return { success: false, message: '封禁标签失败，未知错误' }
	}
}

/**
 * 添加正则表达式
 * @param addRegexRequest 封禁正则表达式的请求载荷
 * @param uuid 用户的 UUID
 * @param token 用户的 token
 * @returns 封禁正则表达式的请求响应
 */
export const AddRegexService = async (addRegexRequest: AddRegexRequestDto, uuid: string, token: string): Promise<AddRegexResponseDto> => {
	try {
		if (!checkAddRegexRequest(addRegexRequest)) {
			console.error('ERROR', '封禁正则表达式请求载荷不合法')
			return { success: false, message: '封禁正则表达式请求载荷不合法' }
		}

		const { blockRegex } = addRegexRequest
		const now = new Date().getTime()

		if (!(await checkUserTokenByUuidService(uuid, token)).success) {
			console.error('ERROR', '封禁正则表达式失败，非法用户')
			return { success: false, message: '封禁正则表达式失败，非法用户' }
		}

		const { collectionName: blockingRegexCollectionName, schemaInstance: blockingRegexSchemaInstance } = BlockingSchema
		type BlockingRegex = InferSchemaType<typeof blockingRegexSchemaInstance>
		const blockingRegexWhere: QueryType<BlockingRegex> = {
			UUID: uuid,
		}
		const blockingRegexSelect: SelectType<BlockingRegex> = {
			UUID: 1,
			blockRegex: 1
		}

		const blockingRegexResult = await selectDataFromMongoDB<BlockingRegex>(blockingRegexWhere, blockingRegexSelect, blockingRegexSchemaInstance, blockingRegexCollectionName)
		const blockingRegexData = blockingRegexResult.result?.[0]

		if (!blockingRegexResult.success) {
			console.error('ERROR', '封禁正则表达式失败，查询数据库失败')
			return { success: false, message: '封禁正则表达式失败，查询数据库失败' }
		}

		if (blockingRegexData.blockRegex.includes(blockRegex)) {
			console.error('ERROR', '封禁正则表达式失败，已经封禁过了')
			return { success: false, message: '封禁正则表达式失败，已经封禁过了' }
		}

		const regex = [...new Set([...blockingRegexData.blockRegex, blockRegex])]

		const blockingUserUpdateData: UpdateType<BlockingRegex> = {
			blockRegex: regex,
			editDateTime: now,
		}

		const blockingUserUpdateResult = await findOneAndUpdateData4MongoDB(blockingRegexWhere, blockingUserUpdateData, blockingRegexSchemaInstance, blockingRegexCollectionName)

		if (!blockingUserUpdateResult.success) {
			console.error('ERROR', '封禁正则表达式失败，更新数据库失败')
			return { success: false, message: '封禁正则表达式失败，更新数据库失败' }
		}
		return { success: true, message: '封禁正则表达式成功', result: { blockRegex: regex ?? [] } }

	} catch (error) {
		console.error('ERROR', '封禁正则表达式错误，未知错误', error)
		return { success: false, message: '封禁正则表达式失败，未知错误' }
	}
}

/**
 * 解封用户
 * @param unblockUserByUidRequest 解封用户的请求载荷
 * @param uuid 用户的 UUID
 * @param token 用户的 token
 * @returns 解封用户的请求响应
*/
export const UnBlockUserByUidService = async (unblockUserByUidRequest: UnblockUserByUidRequestDto, uuid: string, token: string): Promise<UnblockUserByUidResponseDto> => {
	try {
		if (!checkBlockUserByUidRequest) {
			console.error('ERROR', '解封用户请求载荷不合法')
			return { success: false, message: '解封用户请求载荷不合法' }
		}

		const { blockUid } = unblockUserByUidRequest
		const unBlockedUuid = await getUserUuid(blockUid) as string

		const now = new Date().getTime()
		if (!(await checkUserTokenByUuidService(uuid, token)).success) {
			console.error('ERROR', '解封用户失败，非法用户')
			return { success: false, message: '解封用户失败，非法用户' }
		}

		const checkUnBlockUuidResult = await checkUserExistsByUuidService({ uuid: unBlockedUuid })
		if (!checkUnBlockUuidResult.success || (checkUnBlockUuidResult.success && !checkUnBlockUuidResult.exists)) {
			console.error('ERROR', '解封用户失败，被解封用户不存在')
			return { success: false, message: '解封用户失败，被解封用户不存在' }
		}

		if (unBlockedUuid === uuid) {
			console.error('ERROR', '解封用户失败，不能解封自己')
			return { success: false, message: '解封用户失败，不能解封自己' }
		}

		const { collectionName: blockingUserCollectionName, schemaInstance: blockingUserSchemaInstance } = BlockingSchema
		type BlockingUser = InferSchemaType<typeof blockingUserSchemaInstance>

		const blockingUserWhere: QueryType<BlockingUser> = {
			UUID: uuid,
		}
		const blockingUserSelect: SelectType<BlockingUser> = {
			UUID: 1,
			blockUuid: 1
		}

		const blockingUserResult = await selectDataFromMongoDB<BlockingUser>(blockingUserWhere, blockingUserSelect, blockingUserSchemaInstance, blockingUserCollectionName)
		const blockingUserData = blockingUserResult.result?.[0]

		if (!blockingUserResult.success) {
			console.error('ERROR', '解封用户失败，查询数据库失败')
			return { success: false, message: '解封用户失败，查询数据库失败' }
		}
		if (!blockingUserData.blockUuid.includes(unBlockedUuid)) {
			console.error('ERROR', '解封用户失败，不在黑名单')
			return { success: false, message: '解封用户失败，不在黑名单' }
		}

		const blockUuid = blockingUserData.blockUuid.filter((uuid) => uuid !== unBlockedUuid)
		const blockingUserUpdateData: UpdateType<BlockingUser> = {
			blockUuid,
			editDateTime: now,
		}

		const blockingUserUpdateResult = await findOneAndUpdateData4MongoDB(blockingUserWhere, blockingUserUpdateData, blockingUserSchemaInstance, blockingUserCollectionName)

		if (!blockingUserUpdateResult.success) {
			console.error('ERROR', '解封用户失败，更新数据库失败')
			return { success: false, message: '解封用户失败，更新数据库失败' }
		}
		return { success: true, message: '解封用户成功', result: { blockUuid: blockUuid ?? [] } }

	} catch (error) {
		console.error('ERROR', '解封用户错误，未知错误', error)
		return { success: false, message: '解封用户失败，未知错误' }
	}
}

/**
 * 解封关键词
 * @param unblockKeywordRequest 解封关键词的请求载荷
 * @param uuid 用户的 UUID
 * @param token 用户的 token
 * @returns 解封关键词的请求响应
 */
export const UnBlockKeywordService = async (UnblockKeywordRequest: UnblockKeywordRequestDto, uuid: string, token: string): Promise<UnblockKeywordResponseDto> => {
	try {
		if (!UnblockKeywordRequest.blockKeyword) {
			console.error('ERROR', '解封关键词请求载荷不合法')
			return { success: false, message: '解封关键词请求载荷不合法' }
		}

		const { blockKeyword } = UnblockKeywordRequest
		const now = new Date().getTime()

		if (!(await checkUserTokenByUuidService(uuid, token)).success) {
			console.error('ERROR', '解封关键词失败，非法用户')
			return { success: false, message: '解封关键词失败，非法用户' }
		}

		const { collectionName: blockingKeywordCollectionName, schemaInstance: blockingKeywordSchemaInstance } = BlockingSchema
		type BlockingKeyword = InferSchemaType<typeof blockingKeywordSchemaInstance>
		const blockingKeywordWhere: QueryType<BlockingKeyword> = {
			UUID: uuid,
		}
		const blockingKeywordSelect: SelectType<BlockingKeyword> = {
			UUID: 1,
			blockKeyword: 1
		}

		const blockingKeywordResult = await selectDataFromMongoDB<BlockingKeyword>(blockingKeywordWhere, blockingKeywordSelect, blockingKeywordSchemaInstance, blockingKeywordCollectionName)
		const blockingKeywordData = blockingKeywordResult.result?.[0]

		if (!blockingKeywordResult.success) {
			console.error('ERROR', '解封关键词失败，查询数据库失败')
			return { success: false, message: '解封关键词失败，查询数据库失败' }
		}

		if (!blockingKeywordData.blockKeyword.includes(blockKeyword)) {
			console.error('ERROR', '解封关键词失败，不在黑名单')
			return { success: false, message: '解封关键词失败，不在黑名单' }
		}

		const keyword = blockingKeywordData.blockKeyword.filter((kw) => kw !== blockKeyword)
		const blockingUserUpdateData: UpdateType<BlockingKeyword> = {
			blockKeyword: keyword,
			editDateTime: now,
		}
		const blockingUserUpdateResult = await updateData4MongoDB(blockingKeywordWhere, blockingUserUpdateData, blockingKeywordSchemaInstance, blockingKeywordCollectionName)

		if (!blockingUserUpdateResult.success) {
			console.error('ERROR', '解封关键词失败，更新数据库失败')
			return { success: false, message: '解封关键词失败，更新数据库失败' }
		}

		return { success: true, message: '解封关键词成功', result: { blockKeyword: keyword ?? [] } }

	} catch (error) {
		console.error('ERROR', '解封关键词错误，未知错误', error)
		return { success: false, message: '解封关键词失败，未知错误' }
	}
}

/**
 * 显示用户
 * @param showUserByUidRequest 显示用户的请求载荷
 * @param uuid 用户的 UUID
 * @param token 用户的 token
 * @returns 显示用户的请求响应
 */
export const ShowUserByUidService = async (showUserByUidRequest: ShowUserByUidRequestDto, uuid: string, token: string): Promise<ShowUserByUidResponseDto> => {
	try {
		if (!showUserByUidRequest) {
			console.error('ERROR', '显示用户请求载荷不合法')
			return { success: false, message: '显示用户请求载荷不合法' }
		}

		const { hideUid } = showUserByUidRequest
		const showUuid = await getUserUuid(hideUid) as string
		const now = new Date().getTime()

		if (!(await checkUserTokenByUuidService(uuid, token)).success) {
			console.error('ERROR', '显示用户失败，非法用户')
			return { success: false, message: '显示用户失败，非法用户' }
		}

		const checkShowUuidResult = await checkUserExistsByUuidService({ uuid: showUuid })
		if (!checkShowUuidResult.success || (checkShowUuidResult.success && !checkShowUuidResult.exists)) {
			console.error('ERROR', '显示用户失败，被显示用户不存在')
			return { success: false, message: '显示用户失败，被显示用户不存在' }
		}

		if (showUuid === uuid) {
			console.error('ERROR', '显示用户失败，不能显示自己')
			return { success: false, message: '显示用户失败，不能显示自己' }
		}

		const { collectionName: hidingUserCollectionName, schemaInstance: hidingUserSchemaInstance } = BlockingSchema
		type HidingUser = InferSchemaType<typeof hidingUserSchemaInstance>

		const blockingUserWhere: QueryType<HidingUser> = {
			UUID: uuid,
		}
		const blockingUserSelect: SelectType<HidingUser> = {
			UUID: 1,
			hideUuid: 1
		}

		const blockingUserResult = await selectDataFromMongoDB<HidingUser>(blockingUserWhere, blockingUserSelect, hidingUserSchemaInstance, hidingUserCollectionName)
		const blockingUserData = blockingUserResult.result?.[0]

		if (!blockingUserResult.success) {
			console.error('ERROR', '显示用户失败，查询数据库失败')
			return { success: false, message: '显示用户失败，查询数据库失败' }
		}
		if (!blockingUserData.hideUuid.includes(showUuid)) {
			console.error('ERROR', '显示用户失败，已经显示过了')
			return { success: false, message: '显示用户失败，已经显示过了' }
		}

		const hideUuid = blockingUserData.hideUuid.filter((uuid) => uuid !== showUuid)
		const blockingUserUpdateData: UpdateType<HidingUser> = {
			hideUuid,
			editDateTime: now,
		}

		const blockingUserUpdateResult = await updateData4MongoDB(blockingUserWhere, blockingUserUpdateData, hidingUserSchemaInstance, hidingUserCollectionName)

		if (!blockingUserUpdateResult.success) {
			console.error('ERROR', '显示用户失败，更新数据库失败')
			return { success: false, message: '显示用户失败，更新数据库失败' }
		}
		return { success: true, message: '显示用户成功', result: { hideUuid: hideUuid ?? [] } }

	} catch (error) {
		console.error('ERROR', '显示用户错误，未知错误', error)
		return { success: false, message: '显示用户失败，未知错误' }
	}
}

/**
 * 解封标签
 * @param unblockTagRequest 解封标签的请求载荷
 * @param uuid 用户的 UUID
 * @param token 用户的 token
 * @returns 解封标签的请求响应
 */
export const UnBlockTagService = async (blockTagRequest: UnblockTagRequestDto, uuid: string, token: string): Promise<UnblockTagResponseDto> => {
	try {
		if (!blockTagRequest.tagId) {
			console.error('ERROR', '解封标签请求载荷不合法')
			return { success: false, message: '解封标签请求载荷不合法' }
		}

		const { tagId } = blockTagRequest
		const now = new Date().getTime()

		if (!(await checkUserTokenByUuidService(uuid, token)).success) {
			console.error('ERROR', '解封标签失败，非法用户')
			return { success: false, message: '解封标签失败，非法用户' }
		}

		const { collectionName: blockingTagCollectionName, schemaInstance: blockingTagSchemaInstance } = BlockingSchema
		type BlockingTag = InferSchemaType<typeof blockingTagSchemaInstance>
		const blockingTagWhere: QueryType<BlockingTag> = {
			UUID: uuid,
		}
		const blockingTagSelect: SelectType<BlockingTag> = {
			UUID: 1,
			tagId: 1
		}

		const blockingTagResult = await selectDataFromMongoDB<BlockingTag>(blockingTagWhere, blockingTagSelect, blockingTagSchemaInstance, blockingTagCollectionName)
		const blockingTagData = blockingTagResult.result?.[0]

		if (!blockingTagResult.success) {
			console.error('ERROR', '解封标签失败，查询数据库失败')
			return { success: false, message: '解封标签失败，查询数据库失败' }
		}

		if (!blockingTagData.tagId.includes(tagId)) {
			console.error('ERROR', '解封标签失败，不在黑名单')
			return { success: false, message: '解封标签失败，不在黑名单' }
		}

		const blockTag = blockingTagData.tagId.filter((tag) => tag !== tagId)
		const blockingUserUpdateData: UpdateType<BlockingTag> = {
			tagId: blockTag,
			editDateTime: now,
		}

		const blockingUserUpdateResult = await updateData4MongoDB(blockingTagWhere, blockingUserUpdateData, blockingTagSchemaInstance, blockingTagCollectionName)

		if (!blockingUserUpdateResult.success) {
			console.error('ERROR', '解封标签失败，更新数据库失败')
			return { success: false, message: '解封标签失败，更新数据库失败' }
		}

		return { success: true, message: '解封标签成功', result: { tagId: blockTag ?? [] } }

	} catch (error) {
		console.error('ERROR', '解封标签错误，未知错误', error)
		return { success: false, message: '解封标签失败，未知错误' }
	}
}

/**
 * 删除正则表达式
 * @param removeRegexRequest 删除正则表达式的请求载荷
 * @param uuid 用户的 UUID
 * @param token 用户的 token
 * @returns 删除正则表达式的请求响应
 */
export const RemoveRegexService = async (removeRegexRequest: RemoveRegexRequestDto, uuid: string, token: string): Promise<RemoveRegexResponseDto> => {
	try {
		if (!removeRegexRequest.blockRegex) {
			console.error('ERROR', '删除正则表达式请求载荷不合法')
			return { success: false, message: '删除正则表达式请求载荷不合法' }
		}

		const { blockRegex } = removeRegexRequest
		const now = new Date().getTime()

		if (!(await checkUserTokenByUuidService(uuid, token)).success) {
			console.error('ERROR', '删除正则表达式失败，非法用户')
			return { success: false, message: '删除正则表达式失败，非法用户' }
		}

		const { collectionName: blockingRegexCollectionName, schemaInstance: blockingRegexSchemaInstance } = BlockingSchema
		type BlockingRegex = InferSchemaType<typeof blockingRegexSchemaInstance>
		const blockingRegexWhere: QueryType<BlockingRegex> = {
			UUID: uuid,
		}
		const blockingRegexSelect: SelectType<BlockingRegex> = {
			UUID: 1,
			blockRegex: 1
		}

		const blockingRegexResult = await selectDataFromMongoDB<BlockingRegex>(blockingRegexWhere, blockingRegexSelect, blockingRegexSchemaInstance, blockingRegexCollectionName)
		const blockingRegexData = blockingRegexResult.result?.[0]

		if (!blockingRegexResult.success) {
			console.error('ERROR', '删除正则表达式失败，查询数据库失败')
			return { success: false, message: '删除正则表达式失败，查询数据库失败' }
		}

		if (!blockingRegexData.blockRegex.includes(blockRegex)) {
			console.error('ERROR', '删除正则表达式失败，不在黑名单')
			return { success: false, message: '删除正则表达式失败，不在黑名单' }
		}

		const regex = blockingRegexData.blockRegex.filter((reg) => reg !== blockRegex)
		const blockingUserUpdateData: UpdateType<BlockingRegex> = {
			blockRegex: regex,
			editDateTime: now,
		}

		const blockingUserUpdateResult = await updateData4MongoDB(blockingRegexWhere, blockingUserUpdateData, blockingRegexSchemaInstance, blockingRegexCollectionName)

		if (!blockingUserUpdateResult.success) {
			console.error('ERROR', '删除正则表达式失败，更新数据库失败')
			return { success: false, message: '删除正则表达式失败，更新数据库失败' }
		}

		return { success: true, message: '删除正则表达式成功', result: { blockRegex: regex ?? [] } }

	} catch (error) {
		console.error('ERROR', '删除正则表达式错误，未知错误', error)
		return { success: false, message: '删除正则表达式失败，未知错误' }
	}
}

/**
 * 获取用户的黑名单
 * @param uuid 用户的 UUID
 * @param token 用户的 token
 * @returns 用户的封禁列表
 */
export const GetBlockListService = async (uuid: string, token: string): Promise<GetBlockListResponseDto> => {
	try {
		if (!(await checkUserTokenByUuidService(uuid, token)).success) {
			console.error('ERROR', '获取封禁列表失败，非法用户')
			return { success: false, message: '获取封禁列表失败，非法用户' }
		}

		const { collectionName: blockingUserCollectionName, schemaInstance: blockingUserSchemaInstance } = BlockingSchema
		type BlockingUser = InferSchemaType<typeof blockingUserSchemaInstance>
		const blockingUserWhere: QueryType<BlockingUser> = {
			UUID: uuid,
		}
		const blockingUserSelect: SelectType<BlockingUser> = {
			blockUuid: 1,
			hideUuid: 1,
			tagId: 1,
			blockKeyword: 1,
			blockRegex: 1,
		}

		const blockingUserResult = await selectDataFromMongoDB<BlockingUser>(blockingUserWhere, blockingUserSelect, blockingUserSchemaInstance, blockingUserCollectionName)
		const blockingUserData = blockingUserResult.result?.[0] ?? {
			blockUuid: [],
			hideUuid: [],
			tagId: [],
			blockKeyword: [],
			blockRegex: [],
		}

		const result = {
			blockUuid: blockingUserData.blockUuid ?? [],
			hideUuid: blockingUserData.hideUuid ?? [],
			tagId: blockingUserData.tagId ?? [],
			blockKeyword: blockingUserData.blockKeyword ?? [],
			blockRegex: blockingUserData.blockRegex ?? [],
		};

		if (!blockingUserResult.success) {
			console.error('ERROR', '获取封禁列表失败，查询数据库失败')
			return { success: false, message: '获取封禁列表失败，查询数据库失败' }
		}

		return { success: true, message: '获取封禁列表成功', result }

	} catch (error) {
		console.error('ERROR', '获取封禁列表错误，未知错误', error)
		return { success: false, message: '获取封禁列表失败，未知错误' }
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

/**
 * 检测隐藏用户的请求载荷
 */
export const checkHideUserByUidRequest = (hideUserByUidRequest: HideUserByUidRequestDto): boolean => {
	if (!hideUserByUidRequest.hideUid) {
		console.error('ERROR', '隐藏用户请求载荷不合法')
		return false
	}
	return true
}

/**
 * 检测封禁关键词的请求载荷
 */
export const checkBlockKeywordRequest = (blockKeywordRequest: BlockKeywordRequestDto): boolean => {
	// 检查关键词是否存在
	if (!blockKeywordRequest?.blockKeyword) {
			console.error('ERROR', '封禁关键词请求载荷不合法')
			return false
	}

	const keyword = blockKeywordRequest.blockKeyword
	const validKeywordRegex = /^[a-zA-Z0-9\u4e00-\u9fa5\s.,!?@#$%&*()_+-=[\]{}|;:'"`~<>]+$/

	// 检查多个条件
	if (
			keyword.trim().length === 0 || // 空字符串或纯空格
			keyword.length > 100 || // 长度超限
			!validKeywordRegex.test(keyword) // 包含非法字符
	) {
			console.error('ERROR', '封禁关键词请求载荷不合法')
			return false
	}

	return true
}


/**
 * 检测封禁标签的请求载荷
 */
export const checkBlockTagRequest = (blockTagRequest: BlockTagRequestDto): boolean => {
	if (!blockTagRequest.tagId) {
		console.error('ERROR', '封禁标签请求载荷不合法')
		return false
	}
	return true
}

/**
 * 检测添加正则表达式的请求载荷
 */
export const checkAddRegexRequest = (addRegexRequest: AddRegexRequestDto): boolean => {
	// 检查正则表达式是否存在
	if (!addRegexRequest?.blockRegex) {
			console.error('ERROR', '添加正则表达式请求载荷不合法')
			return false
	}

	const regex = addRegexRequest.blockRegex

	// 检查多个条件
	if (
			regex.trim().length === 0 || // 空字符串或纯空格
			regex.length > 500 // 长度超限
	) {
			console.error('ERROR', '添加正则表达式请求载荷不合法')
			return false
	}

	// 验证是否为有效的正则表达式
	try {
			new RegExp(regex)
	} catch (e) {
			console.error('ERROR', '添加正则表达式请求载荷不合法')
			return false
	}

	return true
}
