import { BlockUserByUidService } from '../service/BlockService.js'
import { koaCtx, koaNext } from '../type/koaTypes.js'
import { BlockUserByUidRequestDto } from './BlockControllerDto.js'

/**
 * 更新或创建用户浏览历史
 * @param ctx context
 * @param next context
 */
export const BlockUserByUidController = async (ctx: koaCtx, next: koaNext) => {
	const data = ctx.request.body as Partial<BlockUserByUidRequestDto>
	const uuid = ctx.cookies.get('uuid')
	const token = ctx.cookies.get('token')
	const BlockUserByUidData = {
		blockUid: data.blockUid ?? -1,
	}
	ctx.body = await BlockUserByUidService(BlockUserByUidData, uuid, token)
	await next()
}
