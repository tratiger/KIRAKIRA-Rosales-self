import { BlockUserByUidService, HideUserByUidService } from '../service/BlockService.js'
import { koaCtx, koaNext } from '../type/koaTypes.js'
import { BlockUserByUidRequestDto, HideUserByUidRequestDto } from './BlockControllerDto.js'

/**
 * 封禁用户
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

/**
 * 隐藏用户
 * @param ctx context
 * @param next context
 */
export const HideUserByUidController = async (ctx: koaCtx, next: koaNext) => {
	const data = ctx.request.body as Partial<HideUserByUidRequestDto>
	const uuid = ctx.cookies.get('uuid')
	const token = ctx.cookies.get('token')
	const HideUserByUidData = {
		hideUid: data.hideUid ?? -1,
	}
	ctx.body = await HideUserByUidService(HideUserByUidData, uuid, token)
	await next()
}
