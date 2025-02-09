import { createOrUpdateBrowsingHistoryService, getUserBrowsingHistoryWithFilterService } from '../service/BrowsingHistoryService.js'
import { createRbacApiPathService, createRbacRoleService, updateApiPathPermissionsForRoleService } from '../service/RbacService.js'
import { koaCtx, koaNext } from '../type/koaTypes.js'
import { CreateOrUpdateBrowsingHistoryRequestDto, GetUserBrowsingHistoryWithFilterRequestDto } from './BrowsingHistoryControllerDto.js'
import { CreateRbacApiPathRequestDto, CreateRbacRoleRequestDto, UpdateApiPathPermissionsForRoleRequestDto } from './RbacControllerDto.js'

/**
 * 创建 RBAC API 路径
 * @param ctx context
 * @param next context
 */
export const createRbacApiPathController = async (ctx: koaCtx, next: koaNext) => {
	const data = ctx.request.body as Partial<CreateRbacApiPathRequestDto>
	const uuid = ctx.cookies.get('uuid') ?? ''
	const token = ctx.cookies.get('token') ?? ''
	const createRbacApiPathRequest: CreateRbacApiPathRequestDto = {
		apiPath: data.apiPath ?? '',
    apiPathType: data.apiPathType ?? 'normal',
    apiPathColor: data.apiPathColor ?? '#f3f8feff',
    apiPathDescription: data.apiPathDescription,
	}
	const createRbacApiPathResponse = await createRbacApiPathService(createRbacApiPathRequest, uuid, token)
	ctx.body = createRbacApiPathResponse
	await next()
}

/**
 * 创建 RBAC 角色
 * @param ctx context
 * @param next context
 */
export const createRbacRoleController = async (ctx: koaCtx, next: koaNext) => {
	const data = ctx.request.body as Partial<CreateRbacRoleRequestDto>
	const uuid = ctx.cookies.get('uuid') ?? ''
	const token = ctx.cookies.get('token') ?? ''
	const createRbacRoleRequest: CreateRbacRoleRequestDto = {
		roleName: data.roleName ?? '',
    roleType: data.roleType ?? 'normal',
    roleColor: data.roleColor ?? '#f3f8feff',
    roleDescription: data.roleDescription,
	}
	const createRbacRoleResponse = await createRbacRoleService(createRbacRoleRequest, uuid, token)
	ctx.body = createRbacRoleResponse
	await next()
}

/**
 * 为角色更新 API 路径权限
 * @param ctx context
 * @param next context
 */
export const updateApiPathPermissionsForRoleController = async (ctx: koaCtx, next: koaNext) => {
	const data = ctx.request.body as Partial<UpdateApiPathPermissionsForRoleRequestDto>
	const uuid = ctx.cookies.get('uuid') ?? ''
	const token = ctx.cookies.get('token') ?? ''
	const updateApiPathPermissionsForRoleRequest: UpdateApiPathPermissionsForRoleRequestDto = {
		roleName: data.roleName ?? '',
    apiPathPermissions: data.apiPathPermissions ?? []
	}
	const updateApiPathPermissionsForRoleResponse = await updateApiPathPermissionsForRoleService(updateApiPathPermissionsForRoleRequest, uuid, token)
	ctx.body = updateApiPathPermissionsForRoleResponse
	await next()
}
