import { InferSchemaType } from "mongoose";
import { AddRegexRequestDto, AddRegexResponseDto, BlockKeywordRequestDto, BlockKeywordResponseDto, BlockTagRequestDto, BlockTagResponseDto, BlockUserByUidRequestDto, BlockUserByUidResponseDto, GetBlockListResponseDto, MuteUserByUidRequestDto, MuteUserByUidResponseDto, RemoveRegexRequestDto, RemoveRegexResponseDto, ShowUserByUidRequestDto, ShowUserByUidResponseDto, UnblockKeywordRequestDto, UnblockKeywordResponseDto, UnblockTagRequestDto, UnblockTagResponseDto, UnblockUserByUidRequestDto, UnblockUserByUidResponseDto } from "../controller/BlockControllerDto.js";
import { checkUserExistsByUuidService, checkUserTokenByUuidService, getUserUuid } from "./UserService.js";
import { QueryType, SelectType, UpdateType } from "../dbPool/DbClusterPoolTypes.js";
import { abortAndEndSession, commitAndEndSession, createAndStartSession } from "../common/MongoDBSessionTool.js";
import { updateData4MongoDB, selectDataFromMongoDB, insertData2MongoDB, findOneAndUpdateData4MongoDB } from "../dbPool/DbClusterPool.js";
import { BlockingSchema } from "../dbPool/schema/BlockSchema.js";

// DELETE ME： 一定要重写一下

/**
 * 屏蔽用户
 * @param blockUserByUidRequest 屏蔽用户的请求载荷
 * @param uuid 用户的 UUID
 * @param token 用户的 token
 * @returns 屏蔽用户的请求响应
 */
export const BlockUserByUidService = async (blockUserByUidRequest: BlockUserByUidRequestDto, uuid: string, token: string): Promise<BlockUserByUidResponseDto> => {
	try {
		if (!checkBlockUserByUidRequest(blockUserByUidRequest)) {
			console.error('ERROR', '屏蔽用户请求载荷不合法')
			return { success: false, message: '屏蔽用户请求载荷不合法' }
		}

		const { blockUid } = blockUserByUidRequest
		const blockedUuid = await getUserUuid(blockUid) as string

		const now = new Date().getTime()

		if (blockedUuid === uuid) {
			console.error('ERROR', '屏蔽用户失败，不能屏蔽自己')
			return { success: false, message: '屏蔽用户失败，不能屏蔽自己' }
		}

		if (!(await checkUserTokenByUuidService(uuid, token)).success) {
			console.error('ERROR', '屏蔽用户失败，非法用户')
			return { success: false, message: '屏蔽用户失败，非法用户' }
		}

		const checkBlockUuidResult = await checkUserExistsByUuidService({ uuid: blockedUuid })
		if (!checkBlockUuidResult.success || (checkBlockUuidResult.success && !checkBlockUuidResult.exists)) {
			console.error('ERROR', '屏蔽用户失败，被屏蔽用户不存在')
			return { success: false, message: '屏蔽用户失败，被屏蔽用户不存在' }
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
			console.error('ERROR', '屏蔽用户失败，查询数据库失败')
			return { success: false, message: '屏蔽用户失败，查询数据库失败' }
		}

		if (blockingUserData.blockUuid.includes(blockedUuid)) {
			console.error('ERROR', '屏蔽用户失败，已经屏蔽过了')
			return { success: false, message: '屏蔽用户失败，已经屏蔽过了' }
		}

		const blockUuid = [...new Set([...blockingUserData.blockUuid, blockedUuid])]

		const blockingUserUpdateData: UpdateType<BlockingUser> = {
			blockUuid,
			editDateTime: now,
		}

		const blockingUserUpdateResult = await findOneAndUpdateData4MongoDB(blockingUserWhere, blockingUserUpdateData, blockingUserSchemaInstance, blockingUserCollectionName)

		if (!blockingUserUpdateResult.success) {
			console.error('ERROR', '屏蔽用户失败，更新数据库失败')
			return { success: false, message: '屏蔽用户失败，更新数据库失败' }
		}
			return { success: true, message: '屏蔽用户成功', result: { blockUuid: blockUuid ?? [] } }

	} catch (error) {
		console.error('ERROR', '屏蔽用户错误，未知错误', error)
		return { success: false, message: '屏蔽用户失败，未知错误' }
	}
}

/**
 * 隐藏用户
 * @param muteUserByUidRequest 隐藏用户的请求载荷
 * @param uuid 用户的 UUID
 * @param token 用户的 token
 * @returns 隐藏用户的请求响应
 */
export const MuteUserByUidService = async (muteUserByUidRequest: MuteUserByUidRequestDto, uuid: string, token: string): Promise<MuteUserByUidResponseDto> => {
	try {
		if (!checkMuteUserByUidRequest(muteUserByUidRequest)) {
			console.error('ERROR', '隐藏用户请求载荷不合法')
			return { success: false, message: '隐藏用户请求载荷不合法' }
		}

		const { muteUid } = muteUserByUidRequest
		const mutedUuid = await getUserUuid(muteUid) as string
		const now = new Date().getTime()

		if (mutedUuid === uuid) {
			console.error('ERROR', '隐藏用户失败，不能隐藏自己')
			return { success: false, message: '隐藏用户失败，不能隐藏自己' }
		}

		if (!(await checkUserTokenByUuidService(uuid, token)).success) {
			console.error('ERROR', '隐藏用户失败，非法用户')
			return { success: false, message: '隐藏用户失败，非法用户' }
		}
		const checkMuteUuidResult = await checkUserExistsByUuidService({ uuid: mutedUuid })
		if (!checkMuteUuidResult.success || (checkMuteUuidResult.success && !checkMuteUuidResult.exists)) {
			console.error('ERROR', '隐藏用户失败，被隐藏用户不存在')
			return { success: false, message: '隐藏用户失败，被隐藏用户不存在' }
		}

		const { collectionName: hidingUserCollectionName, schemaInstance: hidingUserSchemaInstance } = BlockingSchema
		type HidingUser = InferSchemaType<typeof hidingUserSchemaInstance>
		const blockingUserWhere: QueryType<HidingUser> = {
			UUID: uuid,
		}
		const blockingUserSelect: SelectType<HidingUser> = {
			UUID: 1,
			muteUuid: 1
		}

		const blockingUserResult = await selectDataFromMongoDB<HidingUser>(blockingUserWhere, blockingUserSelect, hidingUserSchemaInstance, hidingUserCollectionName)
		const blockingUserData = blockingUserResult.result?.[0] ?? {
			UUID: [],
			muteUuid: [],
		}

		if (!blockingUserResult.success) {
			console.error('ERROR', '隐藏用户失败，查询数据库失败')
			return { success: false, message: '隐藏用户失败，查询数据库失败' }
		}
		if (blockingUserData.muteUuid.includes(mutedUuid)) {
			console.error('ERROR', '隐藏用户失败，已经隐藏过了')
			return { success: false, message: '隐藏用户失败，已经隐藏过了' }
		}

		const muteUuid = [...new Set([...blockingUserData.muteUuid, mutedUuid])]
		const hidingUserUpdateData: UpdateType<HidingUser> = {
			muteUuid,
			editDateTime: now,
		}

		const blockingUserUpdateResult = await findOneAndUpdateData4MongoDB(blockingUserWhere, hidingUserUpdateData, hidingUserSchemaInstance, hidingUserCollectionName)

		if (!blockingUserUpdateResult.success) {
			console.error('ERROR', '隐藏用户失败，更新数据库失败')
			return { success: false, message: '隐藏用户失败，更新数据库失败' }
		}
		return { success: true, message: '隐藏用户成功', result: { muteUuid: muteUuid ?? [] } }

	} catch (error) {
		console.error('ERROR', '隐藏用户错误，未知错误', error)
		return { success: false, message: '隐藏用户失败，未知错误' }
	}
}

/**
 * 屏蔽关键词
 */
export const BlockKeywordService = async (blockKeywordRequest: BlockKeywordRequestDto, uuid: string, token: string): Promise<BlockKeywordResponseDto> => {
	try {
		if (!checkBlockKeywordRequest(blockKeywordRequest)) {
			console.error('ERROR', '屏蔽关键词请求载荷不合法')
			return { success: false, message: '屏蔽关键词请求载荷不合法' }
		}

		const { blockKeyword } = blockKeywordRequest
		const now = new Date().getTime()

		if (!(await checkUserTokenByUuidService(uuid, token)).success) {
			console.error('ERROR', '屏蔽关键词失败，非法用户')
			return { success: false, message: '屏蔽关键词失败，非法用户' }
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
			console.error('ERROR', '屏蔽关键词失败，查询数据库失败')
			return { success: false, message: '屏蔽关键词失败，查询数据库失败' }
		}

		if (blockingKeywordData.blockKeyword.includes(blockKeyword)) {
			console.error('ERROR', '屏蔽关键词失败，已经屏蔽过了')
			return { success: false, message: '屏蔽关键词失败，已经屏蔽过了' }
		}

		const keyword = [...new Set([...blockingKeywordData.blockKeyword, blockKeyword])]

		const blockingUserUpdateData: UpdateType<BlockingKeyword> = {
			blockKeyword: keyword,
			editDateTime: now,
		}

		const blockingUserUpdateResult = await findOneAndUpdateData4MongoDB(blockingKeywordWhere, blockingUserUpdateData, blockingKeywordSchemaInstance, blockingKeywordCollectionName)

		if (!blockingUserUpdateResult.success) {
			console.error('ERROR', '屏蔽关键词失败，更新数据库失败')
			return { success: false, message: '屏蔽关键词失败，更新数据库失败' }
		}
		return { success: true, message: '屏蔽关键词成功', result: { blockKeyword: keyword ?? [] } }

	} catch (error) {
		console.error('ERROR', '屏蔽关键词错误，未知错误', error)
		return { success: false, message: '屏蔽关键词失败，未知错误' }
	}
}

/**
 * 屏蔽标签
 * @param blockTagRequest 屏蔽标签的请求载荷
 * @param uuid 用户的 UUID
 * @param token 用户的 token
 * @returns 屏蔽标签的请求响应
 */
export const BlockTagService = async (blockTagRequest: BlockTagRequestDto, uuid: string, token: string): Promise<BlockTagResponseDto> => {
	try {
		if (!checkBlockTagRequest(blockTagRequest)) {
			console.error('ERROR', '屏蔽标签请求载荷不合法')
			return { success: false, message: '屏蔽标签请求载荷不合法' }
		}

		const { tagId } = blockTagRequest
		const now = new Date().getTime()

		if (!(await checkUserTokenByUuidService(uuid, token)).success) {
			console.error('ERROR', '屏蔽标签失败，非法用户')
			return { success: false, message: '屏蔽标签失败，非法用户' }
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
			console.error('ERROR', '屏蔽标签失败，查询数据库失败')
			return { success: false, message: '屏蔽标签失败，查询数据库失败' }
		}

		if (blockingTagData.tagId.includes(tagId)) {
			console.error('ERROR', '屏蔽标签失败，已经屏蔽过了')
			return { success: false, message: '屏蔽标签失败，已经屏蔽过了' }
		}

		const blockTag = [...new Set([...blockingTagData.tagId, tagId])]
		const blockingUserUpdateData: UpdateType<BlockingTag> = {
			UUID: uuid,
			tagId: blockTag,
			editDateTime: now,
		}

		const blockingUserUpdateResult = await findOneAndUpdateData4MongoDB(blockingTagWhere, blockingUserUpdateData, blockingTagSchemaInstance, blockingTagCollectionName)

		if (!blockingUserUpdateResult.success) {
			console.error('ERROR', '屏蔽标签失败，更新数据库失败')
			return { success: false, message: '屏蔽标签失败，更新数据库失败' }
		}
		return { success: true, message: '屏蔽标签成功', result: { tagId: blockTag ?? [] } }

	} catch (error) {
		console.error('ERROR', '屏蔽标签错误，未知错误', error)
		return { success: false, message: '屏蔽标签失败，未知错误' }
	}
}

/**
 * 添加正则表达式
 * @param addRegexRequest 屏蔽正则表达式的请求载荷
 * @param uuid 用户的 UUID
 * @param token 用户的 token
 * @returns 屏蔽正则表达式的请求响应
 */
export const AddRegexService = async (addRegexRequest: AddRegexRequestDto, uuid: string, token: string): Promise<AddRegexResponseDto> => {
	try {
		if (!checkAddRegexRequest(addRegexRequest)) {
			console.error('ERROR', '屏蔽正则表达式请求载荷不合法')
			return { success: false, message: '屏蔽正则表达式请求载荷不合法' }
		}

		const { blockRegex } = addRegexRequest
		const now = new Date().getTime()

		if (!(await checkUserTokenByUuidService(uuid, token)).success) {
			console.error('ERROR', '屏蔽正则表达式失败，非法用户')
			return { success: false, message: '屏蔽正则表达式失败，非法用户' }
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
			console.error('ERROR', '屏蔽正则表达式失败，查询数据库失败')
			return { success: false, message: '屏蔽正则表达式失败，查询数据库失败' }
		}

		if (blockingRegexData.blockRegex.includes(blockRegex)) {
			console.error('ERROR', '屏蔽正则表达式失败，已经屏蔽过了')
			return { success: false, message: '屏蔽正则表达式失败，已经屏蔽过了' }
		}

		const regex = [...new Set([...blockingRegexData.blockRegex, blockRegex])]

		const blockingUserUpdateData: UpdateType<BlockingRegex> = {
			blockRegex: regex,
			editDateTime: now,
		}

		const blockingUserUpdateResult = await findOneAndUpdateData4MongoDB(blockingRegexWhere, blockingUserUpdateData, blockingRegexSchemaInstance, blockingRegexCollectionName)

		if (!blockingUserUpdateResult.success) {
			console.error('ERROR', '屏蔽正则表达式失败，更新数据库失败')
			return { success: false, message: '屏蔽正则表达式失败，更新数据库失败' }
		}
		return { success: true, message: '屏蔽正则表达式成功', result: { blockRegex: regex ?? [] } }

	} catch (error) {
		console.error('ERROR', '屏蔽正则表达式错误，未知错误', error)
		return { success: false, message: '屏蔽正则表达式失败，未知错误' }
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

		if (unBlockedUuid === uuid) {
			console.error('ERROR', '解封用户失败，不能解封自己')
			return { success: false, message: '解封用户失败，不能解封自己' }
		}

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

		const { muteUid } = showUserByUidRequest
		const showUuid = await getUserUuid(muteUid) as string

		if (showUuid === uuid) {
			console.error('ERROR', '显示用户失败，不能显示自己')
			return { success: false, message: '显示用户失败，不能显示自己' }
		}

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

		const { collectionName: hidingUserCollectionName, schemaInstance: hidingUserSchemaInstance } = BlockingSchema
		type HidingUser = InferSchemaType<typeof hidingUserSchemaInstance>

		const blockingUserWhere: QueryType<HidingUser> = {
			UUID: uuid,
		}
		const blockingUserSelect: SelectType<HidingUser> = {
			UUID: 1,
			muteUuid: 1
		}

		const blockingUserResult = await selectDataFromMongoDB<HidingUser>(blockingUserWhere, blockingUserSelect, hidingUserSchemaInstance, hidingUserCollectionName)
		const blockingUserData = blockingUserResult.result?.[0]

		if (!blockingUserResult.success) {
			console.error('ERROR', '显示用户失败，查询数据库失败')
			return { success: false, message: '显示用户失败，查询数据库失败' }
		}
		if (!blockingUserData.muteUuid.includes(showUuid)) {
			console.error('ERROR', '显示用户失败，已经显示过了')
			return { success: false, message: '显示用户失败，已经显示过了' }
		}

		const muteUuid = blockingUserData.muteUuid.filter((uuid) => uuid !== showUuid)
		const blockingUserUpdateData: UpdateType<HidingUser> = {
			muteUuid,
			editDateTime: now,
		}

		const blockingUserUpdateResult = await updateData4MongoDB(blockingUserWhere, blockingUserUpdateData, hidingUserSchemaInstance, hidingUserCollectionName)

		if (!blockingUserUpdateResult.success) {
			console.error('ERROR', '显示用户失败，更新数据库失败')
			return { success: false, message: '显示用户失败，更新数据库失败' }
		}
		return { success: true, message: '显示用户成功', result: { muteUuid: muteUuid ?? [] } }

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
 * @returns 用户的屏蔽列表
 */
export const GetBlockListService = async (uuid: string, token: string): Promise<GetBlockListResponseDto> => {
	try {
		if (!(await checkUserTokenByUuidService(uuid, token)).success) {
			console.error('ERROR', '获取屏蔽列表失败，非法用户')
			return { success: false, message: '获取屏蔽列表失败，非法用户' }
		}

		const { collectionName: blockingUserCollectionName, schemaInstance: blockingUserSchemaInstance } = BlockingSchema
		type BlockingUser = InferSchemaType<typeof blockingUserSchemaInstance>
		const blockingUserWhere: QueryType<BlockingUser> = {
			UUID: uuid,
		}
		const blockingUserSelect: SelectType<BlockingUser> = {
			blockUuid: 1,
			muteUuid: 1,
			tagId: 1,
			blockKeyword: 1,
			blockRegex: 1,
		}

		const blockingUserResult = await selectDataFromMongoDB<BlockingUser>(blockingUserWhere, blockingUserSelect, blockingUserSchemaInstance, blockingUserCollectionName)
		const blockingUserData = blockingUserResult.result?.[0] ?? {
			blockUuid: [],
			muteUuid: [],
			tagId: [],
			blockKeyword: [],
			blockRegex: [],
		}

		const result = {
			blockUuid: blockingUserData.blockUuid ?? [],
			muteUuid: blockingUserData.muteUuid ?? [],
			tagId: blockingUserData.tagId ?? [],
			blockKeyword: blockingUserData.blockKeyword ?? [],
			blockRegex: blockingUserData.blockRegex ?? [],
		}

		if (!blockingUserResult.success) {
			console.error('ERROR', '获取屏蔽列表失败，查询数据库失败')
			return { success: false, message: '获取屏蔽列表失败，查询数据库失败' }
		}
		return { success: true, message: '获取屏蔽列表成功', result }

	} catch (error) {
		console.error('ERROR', '获取屏蔽列表错误，未知错误', error)
		return { success: false, message: '获取屏蔽列表失败，未知错误' }
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
