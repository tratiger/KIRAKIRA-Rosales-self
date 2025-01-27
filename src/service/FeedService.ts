import { InferSchemaType } from "mongoose";
import { AddNewUid2FeedGroupRequestDto, AddNewUid2FeedGroupResponseDto, CreateFeedGroupRequestDto, CreateFeedGroupResponseDto, FOLLOWING_TYPE, FollowingUploaderRequestDto, FollowingUploaderResponseDto, RemoveUidFromFeedGroupRequestDto, RemoveUidFromFeedGroupResponseDto, UnfollowingUploaderRequestDto, UnfollowingUploaderResponseDto} from "../controller/FeedControllerDto.js";
import { FeedGroupSchema, FollowingSchema, UnfollowingSchema } from "../dbPool/schema/FeedSchema.js";
import { checkUserExistsByUuidService, checkUserRoleByUUIDService, checkUserTokenByUuidService, getUserUuid } from "./UserService.js";
import { QueryType, SelectType, UpdateType } from "../dbPool/DbClusterPoolTypes.js";
import { deleteDataFromMongoDB, findOneAndUpdateData4MongoDB, insertData2MongoDB, selectDataFromMongoDB } from "../dbPool/DbClusterPool.js";
import { abortAndEndSession, commitAndEndSession, createAndStartSession } from "../common/MongoDBSessionTool.js";
import { CheckUserExistsByUuidRequestDto } from "../controller/UserControllerDto.js";
import { v4 as uuidV4 } from 'uuid'

/**
 * 用户关注一个创作者
 * @param followingUploaderRequest 用户关注一个创作者的请求载荷
 * @param uuid 用户的 UUID
 * @param token 用户的 token
 * @returns 用户关注一个创作者的请求响应
 */
export const followingUploaderService = async (followingUploaderRequest: FollowingUploaderRequestDto, uuid: string, token: string): Promise<FollowingUploaderResponseDto> => {
	try {
		if (!checkFollowingUploaderRequest(followingUploaderRequest)) {
			console.error('ERROR', '关注用户失败：参数不合法。')
			return { success: false, message: '关注用户失败：参数不合法。' }
		}

		const now = new Date().getTime()
		const followerUuid = uuid
		const { followingUid } = followingUploaderRequest

		const followingUuid = await getUserUuid(followingUid) as string

		if (followerUuid === followingUuid) {
			console.error('ERROR', '关注用户失败，不能自己关注自己。')
			return { success: false, message: '关注用户失败：不能自己关注自己。' }
		}

		if (!(await checkUserTokenByUuidService(followerUuid, token)).success) {
			console.error('ERROR', '关注用户失败，非法用户。')
			return { success: false, message: '关注用户失败，非法用户' }
		}

		const checkFollowingUuidResult = await checkUserExistsByUuidService({ uuid: followingUuid })
		if (!checkFollowingUuidResult.success || (checkFollowingUuidResult.success && !checkFollowingUuidResult.exists)) {
			console.error('ERROR', '关注用户失败，被关注用户不存在。')
			return { success: false, message: '关注用户失败，被关注用户不存在。' }
		}

		if (await checkUserRoleByUUIDService(followerUuid, 'blocked')) {
			console.error('ERROR', '关注用户失败，发起关注用户已封禁')
			return { success: false, message: '关注用户失败，发起关注的用户已封禁' }
		}

		if (await checkUserRoleByUUIDService(followingUuid, 'blocked')) {
			console.error('ERROR', '关注用户失败，被关注用户已封禁')
			return { success: false, message: '关注用户失败，被关注用户已封禁' }
		}

		const { collectionName: followingCollectionName, schemaInstance: followingSchemaInstance } = FollowingSchema
		type Following = InferSchemaType<typeof followingSchemaInstance>

		const getFollowingDataWhere: QueryType<Following> = {
			followerUuid,
			followingUuid,
		}

		const getFollowingDataSelect: SelectType<Following> = {
			followerUuid: 1,
			followingUuid: 1,
		}

		const session = await createAndStartSession()

		const getFollowingData = await selectDataFromMongoDB<Following>(getFollowingDataWhere, getFollowingDataSelect, followingSchemaInstance, followingCollectionName, { session })
		const getFollowingDataResult = getFollowingData.result
		if (getFollowingDataResult.length > 0) {
			await abortAndEndSession(session)
			console.error('ERROR', '关注用户失败，用户已被关注。')
			return { success: false, message: '关注用户失败，用户已被关注。' }
		}

		const followingData: Following = {
			followerUuid,
			followingUuid,
			followingType: FOLLOWING_TYPE.normal,
			isFavourity: false,
			followingEditDateTime: now,
			followingCreateTime: now,
		}

		const insertFollowingDataResult = await insertData2MongoDB<Following>(followingData, followingSchemaInstance, followingCollectionName, { session })

		if (!insertFollowingDataResult.success) {
			await abortAndEndSession(session)
			console.error('ERROR', '关注用户失败，插入数据失败。')
			return { success: false, message: '关注用户失败，插入数据失败。' }
		}

		await commitAndEndSession(session)
		return { success: true, message: '关注用户成功！' }
	} catch (error) {
		console.error('ERROR', '关注用户时出错：未知原因。', error)
		return { success: false, message: '关注用户时出错：未知原因。' }
	}
}

/**
 * 用户取消关注一个创作者
 * @param followingUploaderRequest 用户取消关注一个创作者的请求载荷
 * @param uuid 用户的 UUID
 * @param token 用户的 token
 * @returns 用户取消关注一个创作者的请求响应
 */
export const unfollowingUploaderService = async (unfollowingUploaderRequest: UnfollowingUploaderRequestDto, uuid: string, token: string): Promise<UnfollowingUploaderResponseDto> => {
	try {
		if (!checkUnfollowingUploaderRequest(unfollowingUploaderRequest)) {
			console.error('ERROR', '取消关注用户失败，参数不合法。')
			return { success: false, message: '取消关注用户失败：参数不合法。' }
		}

		const now = new Date().getTime()
		const followerUuid = uuid
		const { unfollowingUid } = unfollowingUploaderRequest

		const unfollowingUuid = await getUserUuid(unfollowingUid) as string

		if (followerUuid === unfollowingUuid) {
			console.error('ERROR', '取消关注用户失败，不能取消关注自己。')
			return { success: false, message: '取消关注用户失败：不能取消关注自己。' }
		}

		if (!(await checkUserTokenByUuidService(followerUuid, token)).success) {
			console.error('ERROR', '取消关注用户失败，非法用户。')
			return { success: false, message: '取消关注用户失败，非法用户' }
		}

		const checkFollowingUuidResult = await checkUserExistsByUuidService({ uuid: unfollowingUuid })
		if (!checkFollowingUuidResult.success || (checkFollowingUuidResult.success && !checkFollowingUuidResult.exists)) {
			console.error('ERROR', '取消关注用户失败，被关注用户不存在。')
			return { success: false, message: '取消关注用户失败，被关注用户不存在。' }
		}

		if (await checkUserRoleByUUIDService(followerUuid, 'blocked')) {
			console.error('ERROR', '取消关注用户失败，发起取消关注的用户已封禁')
			return { success: false, message: '取消关注用户失败，发起取消关注的用户已封禁' }
		}

		const { collectionName: followingCollectionName, schemaInstance: followingSchemaInstance } = FollowingSchema
		const { collectionName: unfollowingCollectionName, schemaInstance: unfollowingSchemaInstance } = UnfollowingSchema
		type Following = InferSchemaType<typeof followingSchemaInstance>
		type Unfollowing = InferSchemaType<typeof unfollowingSchemaInstance>

		const followingWhere: QueryType<Following> = {
			followerUuid,
			followingUuid: unfollowingUuid,
		}
		const followingSelect: SelectType<Following> = {
			followerUuid: 1,
			followingUuid: 1,
			followingType: 1,
			isFavourity: 1,
			followingEditDateTime: 1,
			followingCreateTime: 1,
		}

		const session = await createAndStartSession()

		const selectUnfollowingDataResult = await selectDataFromMongoDB<Following>(followingWhere, followingSelect, followingSchemaInstance, followingCollectionName, { session })
		const selectUnfollowingData = selectUnfollowingDataResult.result?.[0]

		if (!selectUnfollowingDataResult.success && selectUnfollowingDataResult.result.length !== 1 && selectUnfollowingData) {
			await abortAndEndSession(session)
			console.error('ERROR', '取消关注用户失败，读取关注数据失败。')
			return { success: false, message: '取消关注用户失败，读取关注数据失败。' }
		}

		const unfollowingData: Unfollowing = {
			...selectUnfollowingData,
			unfollowingReasonType: 'normal',
			unfollowingDateTime: now,
			unfollowingEditDateTime: now,
			unfollowingCreateTime: now,
		}

		const insertUnfollowingDataResult = await insertData2MongoDB<Unfollowing>(unfollowingData, unfollowingSchemaInstance, unfollowingCollectionName, { session })

		if (!insertUnfollowingDataResult.success) {
			await abortAndEndSession(session)
			console.error('ERROR', '取消关注用户失败，记录处理失败。')
			return { success: false, message: '取消关注用户失败，记录处理失败。' }
		}

		const deleteFollowingDataResult = await deleteDataFromMongoDB<Following>(followingWhere, followingSchemaInstance, followingCollectionName, { session })

		if (!deleteFollowingDataResult.success) {
			await abortAndEndSession(session)
			console.error('ERROR', '取消关注用户失败，删除关注记录失败。')
			return { success: false, message: '取消关注用户失败，删除关注记录失败。' }
		}

		await commitAndEndSession(session)
		return { success: true, message: '取消关注用户成功！' }
	} catch (error) {
		console.error('ERROR', '取消关注用户时出错：未知原因。', error)
		return { success: false, message: '取消关注用户时出错：未知原因。' }
	}
}

/**
 * 创建动态分组
 * @param createFeedGroupRequest 创建动态分组的请求载荷
 * @param uuid 用户的 UUID
 * @param token 用户的 token
 * @returns 创建动态分组的请求响应
 */
export const createFeedGroupService = async (createFeedGroupRequest: CreateFeedGroupRequestDto, uuid: string, token: string): Promise<CreateFeedGroupResponseDto> => {
	try {
		if (!checkCreateFeedGroupRequest(createFeedGroupRequest)) {
			console.error('ERROR', '创建动态分组失败，参数不合法。')
			return { success: false, tooManyUidInOnce: false, message: '创建动态分组失败，参数不合法。' }
		}

		if (!(await checkUserTokenByUuidService(uuid, token)).success) {
			console.error('ERROR', '创建动态分组失败，非法用户。')
			return { success: false, tooManyUidInOnce: false, message: '创建动态分组失败，非法用户' }
		}

		if (await checkUserRoleByUUIDService(uuid, 'blocked')) {
			console.error('ERROR', '创建动态分组失败，用户已封禁。')
			return { success: false, tooManyUidInOnce: false, message: '创建动态分组失败，用户已封禁' }
		}

		const { feedGroupName, withUidList: uidList, withCustomCoverUrl } = createFeedGroupRequest
		const uuidList = []
		if (uidList && Array.isArray(uidList) && uidList.length > 0) {
			if (uidList.length > 50) {
				console.error('ERROR', '创建动态分组失败，一次性添加的 UID 太多了')
				return { success: false, tooManyUidInOnce: true, message: '创建动态分组失败，一次性添加的 UID 太多了' }
			}

			let isCorrectUuidList = true
			uidList.forEach(async uid => {
				const uuid = await getUserUuid(uid) as string
				const checkUserExistsByUuidRequest: CheckUserExistsByUuidRequestDto = {
					uuid,
				}
				const uuidExistsResult = await checkUserExistsByUuidService(checkUserExistsByUuidRequest)
				if (!uuidExistsResult.success || !uuidExistsResult.exists) {
					isCorrectUuidList = false
				}

				uuidList.push(uuid)
			})

			if (!isCorrectUuidList) {
				console.error('ERROR', '创建动态分组失败，UUID 列表不合法。')
				return { success: false, tooManyUidInOnce: false, message: '创建动态分组失败，UUID 列表不合法' }
			}
		}

		const now = new Date().getTime()
		const feedGroupUuid = uuidV4();

		const { collectionName: feedGroupCollectionName, schemaInstance: feedGroupSchemaInstance } = FeedGroupSchema
		type FeedGroup = InferSchemaType<typeof feedGroupSchemaInstance>

		const feedGroupData: FeedGroup = {
			feedGroupUuid,
			feedGroupName,
			feedGroupCreatorUuid: uuid,
			uuidList: [...new Set<string>(uuidList)],
			customCover: withCustomCoverUrl,
			createDateTime: now,
			editDateTime: now,
		}

		const insertFeedGroupDataResult = await insertData2MongoDB<FeedGroup>(feedGroupData, feedGroupSchemaInstance, feedGroupCollectionName)

		if (!insertFeedGroupDataResult.success) {
			console.error('ERROR', '创建动态分组失败，插入数据失败。')
			return { success: false, tooManyUidInOnce: false, message: '创建动态分组失败，插入数据失败' }
		}

		return { success: true, tooManyUidInOnce: false, message: '创建动态分组成功。' }
	} catch (error) {
		console.error('ERROR', '创建动态分组时出错：未知原因。', error)
		return { success: false, tooManyUidInOnce: false, message: '创建动态分组时出错：未知原因。' }
	}
}

/**
 * 向一个动态分组中添加新的 UID
 * @param addNewUser2FeedGroupRequest 向一个动态分组中添加新的 UID 的请求载荷
 * @param uuid 用户的 UUID
 * @param token 用户的 token
 * @returns 向一个动态分组中添加新的 UID 的请求响应
 */
export const addNewUid2FeedGroupService = async (addNewUser2FeedGroupRequest: AddNewUid2FeedGroupRequestDto, uuid: string, token: string): Promise<AddNewUid2FeedGroupResponseDto> => {
	try {
		if (!checkAddNewUser2FeedGroupRequest(addNewUser2FeedGroupRequest)) {
			console.error('ERROR', '向一个动态分组中添加新的 UID 失败，参数不合法。')
			return { success: false, tooManyUidInOnce: false, isOverload: false, message: '向一个动态分组中添加新的 UID 失败，参数不合法。' }
		}

		if (!(await checkUserTokenByUuidService(uuid, token)).success) {
			console.error('ERROR', '向一个动态分组中添加新的 UID 失败，非法用户。')
			return { success: false, tooManyUidInOnce: false, isOverload: false, message: '向一个动态分组中添加新的 UID 失败，非法用户' }
		}

		if (await checkUserRoleByUUIDService(uuid, 'blocked')) {
			console.error('ERROR', '向一个动态分组中添加新的 UID 失败，用户已封禁。')
			return { success: false, tooManyUidInOnce: false, isOverload: false, message: '向一个动态分组中添加新的 UID 失败，用户已封禁' }
		}

		const { feedGroupUuid, uidList } = addNewUser2FeedGroupRequest

		const uuidList = []
		if (uidList && Array.isArray(uidList) && uidList.length > 0) {
			if (uidList.length > 50) {
				console.error('ERROR', '向一个动态分组中添加新的 UID 失败，一次性添加的 UID 太多了')
				return { success: false, tooManyUidInOnce: true, isOverload: false, message: '向一个动态分组中添加新的 UID 失败，一次性添加的 UID 太多了' }
			}

			let isCorrectUuidList = true
			uidList.forEach(async uid => {
				const uuid = await getUserUuid(uid) as string
				const checkUserExistsByUuidRequest: CheckUserExistsByUuidRequestDto = {
					uuid,
				}
				const uuidExistsResult = await checkUserExistsByUuidService(checkUserExistsByUuidRequest)
				if (!uuidExistsResult.success || !uuidExistsResult.exists) {
					isCorrectUuidList = false
				}

				uuidList.push(uuid)
			})

			if (!isCorrectUuidList) {
				console.error('ERROR', '向一个动态分组中添加新的 UID 失败，UUID 列表不合法。')
				return { success: false, tooManyUidInOnce: false, isOverload: false, message: '向一个动态分组中添加新的 UID 失败，UUID 列表不合法' }
			}
		}

		const { collectionName: feedGroupCollectionName, schemaInstance: feedGroupSchemaInstance } = FeedGroupSchema
		type FeedGroup = InferSchemaType<typeof feedGroupSchemaInstance>

		const getFeedGroupSelect: SelectType<FeedGroup> = {
			feedGroupUuid: 1,
			uuidList: 1,
		}
		const feedGroupWhere: QueryType<FeedGroup> = {
			feedGroupUuid,
			feedGroupCreatorUuid: uuid,
		}

		const session = await createAndStartSession()

		const getFeedGroupDataResult = await selectDataFromMongoDB<FeedGroup>(feedGroupWhere, getFeedGroupSelect, feedGroupSchemaInstance, feedGroupCollectionName, { session })
		const getFeedGroupData = getFeedGroupDataResult.result?.[0]

		if (!getFeedGroupDataResult.success || !getFeedGroupData.feedGroupUuid) {
			await abortAndEndSession(session)
			console.error('ERROR', '向一个动态分组中添加新的 UID 失败，更新的动态列表不存在或者不是由当前用户创建')
			return { success: false, tooManyUidInOnce: false, isOverload: false, message: '向一个动态分组中添加新的 UID 失败，更新的动态列表不存在或者不是由当前用户创建' }
		}

		const newUuidList = [...new Set<string>(uuidList.concat(getFeedGroupData.uuidList ?? []))]

		if (newUuidList.length > 10000) {
			await abortAndEndSession(session)
			console.error('ERROR', '向一个动态分组中添加新的 UID 失败，动态分组中用户太多了')
			return { success: false, tooManyUidInOnce: false, isOverload: true, message: '向一个动态分组中添加新的 UID 失败，动态分组中用户太多了' }
		}

		const updateFeedGroupData: UpdateType<FeedGroup> = {
			uuidList: newUuidList,
		}

		const findOneAndUpdateFeedGroupDataResult = await findOneAndUpdateData4MongoDB<FeedGroup>(feedGroupWhere, updateFeedGroupData, feedGroupSchemaInstance, feedGroupCollectionName, { session })
		const findOneAndUpdateFeedGroupData = findOneAndUpdateFeedGroupDataResult.result?.[0]

		if (!findOneAndUpdateFeedGroupDataResult.success || !findOneAndUpdateFeedGroupData) {
			await abortAndEndSession(session)
			console.error('ERROR', '向一个动态分组中添加新的 UID 失败，更新失败')
			return { success: false, tooManyUidInOnce: false, isOverload: false, message: '向一个动态分组中添加新的 UID 失败，更新失败' }
		}

		await commitAndEndSession(session)
		return { success: true, tooManyUidInOnce: false, isOverload: false, message: '向一个动态分组中添加新的 UID 成功', feedGroupResult: findOneAndUpdateFeedGroupData }
	} catch (error) {
		console.error('ERROR', '向一个动态分组中添加新的 UID 时出错：未知原因。', error)
		return { success: false, tooManyUidInOnce: false, isOverload: false, message: '向一个动态分组中添加新的 UID 时出错：未知原因。' }
	}
}

/**
 * 从一个动态分组中移除 UID
 * @param removeUidFromFeedGroupRequest 从一个动态分组中移除 UID 的请求载荷
 * @param uuid 用户的 UUID
 * @param token 用户的 token
 * @returns 从一个动态分组中移除 UID 的请求响应
 */
export const addNewUidFeedGroupService = async (removeUidFromFeedGroupRequest: RemoveUidFromFeedGroupRequestDto, uuid: string, token: string): Promise<RemoveUidFromFeedGroupResponseDto> => {
	try {
		if (!checkRemoveUidFromFeedGroupRequest(removeUidFromFeedGroupRequest)) {
			console.error('ERROR', '从一个动态分组中移除 UID 失败，参数不合法。')
			return { success: false, tooManyUidInOnce: false, message: '从一个动态分组中移除 UID 失败，参数不合法。' }
		}

		if (!(await checkUserTokenByUuidService(uuid, token)).success) {
			console.error('ERROR', '从一个动态分组中移除 UID 失败，非法用户。')
			return { success: false, tooManyUidInOnce: false, message: '从一个动态分组中移除 UID 失败，非法用户' }
		}

		if (await checkUserRoleByUUIDService(uuid, 'blocked')) {
			console.error('ERROR', '从一个动态分组中移除 UID 失败，用户已封禁。')
			return { success: false, tooManyUidInOnce: false, message: '从一个动态分组中移除 UID 失败，用户已封禁' }
		}

		const { feedGroupUuid, uidList } = removeUidFromFeedGroupRequest

		const uuidList = []
		if (uidList && Array.isArray(uidList) && uidList.length > 0) {
			if (uidList.length > 50) {
				console.error('ERROR', '从一个动态分组中移除 UID 失败，一次性移除的 UID 太多了')
				return { success: false, tooManyUidInOnce: true, message: '从一个动态分组中移除 UID 失败，一次性移除的 UID 太多了' }
			}

			let isCorrectUuidList = true
			uidList.forEach(async uid => {
				const uuid = await getUserUuid(uid) as string
				const checkUserExistsByUuidRequest: CheckUserExistsByUuidRequestDto = {
					uuid,
				}
				const uuidExistsResult = await checkUserExistsByUuidService(checkUserExistsByUuidRequest)
				if (!uuidExistsResult.success || !uuidExistsResult.exists) {
					isCorrectUuidList = false
				}

				uuidList.push(uuid)
			})

			if (!isCorrectUuidList) {
				console.error('ERROR', '从一个动态分组中移除 UID 失败，UUID 列表不合法。')
				return { success: false, tooManyUidInOnce: false, message: '从一个动态分组中移除 UID 失败，UUID 列表不合法' }
			}
		}

		const { collectionName: feedGroupCollectionName, schemaInstance: feedGroupSchemaInstance } = FeedGroupSchema
		type FeedGroup = InferSchemaType<typeof feedGroupSchemaInstance>

		const getFeedGroupSelect: SelectType<FeedGroup> = {
			feedGroupUuid: 1,
			uuidList: 1,
		}
		const feedGroupWhere: QueryType<FeedGroup> = {
			feedGroupUuid,
			feedGroupCreatorUuid: uuid,
		}

		const session = await createAndStartSession()

		const getFeedGroupDataResult = await selectDataFromMongoDB<FeedGroup>(feedGroupWhere, getFeedGroupSelect, feedGroupSchemaInstance, feedGroupCollectionName, { session })
		const getFeedGroupData = getFeedGroupDataResult.result?.[0]

		if (!getFeedGroupDataResult.success || !getFeedGroupData.feedGroupUuid) {
			await abortAndEndSession(session)
			console.error('ERROR', '从一个动态分组中移除 UID 失败，更新的动态列表不存在或者不是由当前用户创建')
			return { success: false, tooManyUidInOnce: false, message: '从一个动态分组中移除 UID 失败，更新的动态列表不存在或者不是由当前用户创建' }
		}

		const oldUuidList = [...new Set<string>(getFeedGroupData.uuidList ?? [])]
		const shouldRemoveUuidList = [...new Set<string>(uuidList)]
		const differenceUuidList = oldUuidList.filter(uuid => !shouldRemoveUuidList.includes(uuid))
		const updateFeedGroupData: UpdateType<FeedGroup> = {
			uuidList: differenceUuidList,
		}

		const findOneAndUpdateFeedGroupDataResult = await findOneAndUpdateData4MongoDB<FeedGroup>(feedGroupWhere, updateFeedGroupData, feedGroupSchemaInstance, feedGroupCollectionName, { session })
		const findOneAndUpdateFeedGroupData = findOneAndUpdateFeedGroupDataResult.result?.[0]

		if (!findOneAndUpdateFeedGroupDataResult.success || !findOneAndUpdateFeedGroupData) {
			await abortAndEndSession(session)
			console.error('ERROR', '从一个动态分组中移除 UID 失败，更新失败')
			return { success: false, tooManyUidInOnce: false, message: '从一个动态分组中移除 UID 失败，更新失败' }
		}

		await commitAndEndSession(session)
		return { success: true, tooManyUidInOnce: false, message: '从一个动态分组中移除 UID 成功', feedGroupResult: findOneAndUpdateFeedGroupData }
	} catch (error) {
		console.error('ERROR', '从一个动态分组中移除 UID 时出错：未知原因。', error)
		return { success: false, tooManyUidInOnce: false, message: '从一个动态分组中移除 UID 时出错：未知原因。' }
	}
}

/**
 * 校验用户关注一个创作者的请求载荷
 * @param followingUploaderRequest 用户关注一个创作者的请求载荷
 * @returns 合法返回 true, 不合法返回 false
 */
const checkFollowingUploaderRequest = (followingUploaderRequest: FollowingUploaderRequestDto): boolean => {
	return ( followingUploaderRequest.followingUid !== undefined && followingUploaderRequest.followingUid !== null && followingUploaderRequest.followingUid > 0 )
}

/**
 * 校验用户取消关注一个创作者的请求载荷
 * @param followingUploaderRequest 用户取消关注一个创作者的请求载荷
 * @returns 合法返回 true, 不合法返回 false
 */
const checkUnfollowingUploaderRequest = (unfollowingUploaderRequest: UnfollowingUploaderRequestDto): boolean => {
	return ( unfollowingUploaderRequest.unfollowingUid !== undefined && unfollowingUploaderRequest.unfollowingUid !== null && unfollowingUploaderRequest.unfollowingUid > 0 )
}

/**
 * 校验创建动态分组的请求载荷
 * @param createFeedGroupRequest 创建动态分组的请求载荷
 * @returns 合法返回 true, 不合法返回 false
 */
const checkCreateFeedGroupRequest = (createFeedGroupRequest: CreateFeedGroupRequestDto): boolean => {
	return ( !!createFeedGroupRequest.feedGroupName )
}

/**
 * 校验向一个动态分组中添加新的 UID 的请求载荷
 * @param addNewUser2FeedGroupRequest 向一个动态分组中添加新的 UID 的请求载荷
 * @returns 合法返回 true, 不合法返回 false
 */
const checkAddNewUser2FeedGroupRequest = (addNewUser2FeedGroupRequest: AddNewUid2FeedGroupRequestDto): boolean => {
	return (
		!!addNewUser2FeedGroupRequest.feedGroupUuid
		&& !!addNewUser2FeedGroupRequest.uidList && addNewUser2FeedGroupRequest.uidList.every(uid => uid !== undefined && uid !== null && uid > 0)
	)
}

/**
 * 校验从一个动态分组中移除 UID 的请求载荷
 * @param removeUidFromFeedGroupRequest 从一个动态分组中移除 UID 的请求载荷
 * @returns 合法返回 true, 不合法返回 false
 */
const checkRemoveUidFromFeedGroupRequest = (removeUidFromFeedGroupRequest: RemoveUidFromFeedGroupRequestDto): boolean => {
	return (
		!!removeUidFromFeedGroupRequest.feedGroupUuid
		&& !!removeUidFromFeedGroupRequest.uidList && removeUidFromFeedGroupRequest.uidList.every(uid => uid !== undefined && uid !== null && uid > 0)
	)
}
