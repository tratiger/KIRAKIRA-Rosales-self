import { isPassRbacCheck, createRbacApiPathService, createRbacRoleService, updateApiPathPermissionsForRoleService } from '../service/RbacService.js'
import { koaCtx, koaNext } from '../type/koaTypes.js'
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

	// RBAC 权限验证
	if (!await isPassRbacCheck({ uuid, apiPath: ctx.path }, ctx)) {
		return
	}

	const createRbacApiPathRequest: CreateRbacApiPathRequestDto = {
		apiPath: data.apiPath ?? '',
		apiPathType: data.apiPathType,
		apiPathColor: data.apiPathColor,
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

	// RBAC 权限验证
	if (!await isPassRbacCheck({ uuid, apiPath: ctx.path }, ctx)) {
		return
	}

	const createRbacRoleRequest: CreateRbacRoleRequestDto = {
		roleName: data.roleName ?? '',
		roleType: data.roleType,
		roleColor: data.roleColor,
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

	// RBAC 权限验证
	if (!await isPassRbacCheck({ uuid, apiPath: ctx.path }, ctx)) {
		return
	}

	const updateApiPathPermissionsForRoleRequest: UpdateApiPathPermissionsForRoleRequestDto = {
		roleName: data.roleName ?? '',
    apiPathPermissions: data.apiPathPermissions ?? []
	}
	const updateApiPathPermissionsForRoleResponse = await updateApiPathPermissionsForRoleService(updateApiPathPermissionsForRoleRequest, uuid, token)
	ctx.body = updateApiPathPermissionsForRoleResponse
	await next()
}
