import { GetStgEnvBackEndSecretResponse } from "../controller/ConsoleSecretControllerDto.js";
import { SecretsManagerClient, GetSecretValueCommand } from "@aws-sdk/client-secrets-manager";
import { checkUserTokenByUuidService } from "./UserService.js";


let client: SecretsManagerClient

try {
  if (!process.env.AWS_SECRET_REGION || !process.env.AWS_SECRET_ACCESS_KEY || !process.env.AWS_SECRET_ACCESS_SECRET) {
    console.error("ERROR", "缺少 AWS 认证信息，请检查环境变量 AWS_SECRET_REGION、AWS_SECRET_ACCESS_KEY 和 AWS_SECRET_ACCESS_SECRET")
		process.exit()
  }

	// 创建 AWS Secrets Manager 客户端
	client = new SecretsManagerClient({
		region: process.env.AWS_SECRET_REGION, // 自定义 AWS 区域
		credentials: {
			accessKeyId: process.env.AWS_SECRET_ACCESS_KEY, // 自定义 Access Key
			secretAccessKey: process.env.AWS_SECRET_ACCESS_SECRET, // 自定义 Secret Key
		},
	})

	console.info()
	console.info('AWS Sercret Manager Connect Successfuly!')
} catch(error) {
	console.error('ERROR', '创建 AWS Secrets Manager 客户端失败：', error)
	process.exit()
}

/**
 * 获取预生产环境后端环境变量机密
 * @param uuid 用户 UUID
 * @param token 用户 Token
 * @returns 获取预生产环境后端环境变量机密的请求响应
 */
export async function getStgEnvBackEndSecretService(uuid: string, token: string): Promise<GetStgEnvBackEndSecretResponse> {
	try {
		if (!(await checkUserTokenByUuidService(uuid, token)).success) {
			console.error('ERROR', '获取预生产环境后端环境变量机密失败，用户 Token 校验未通过')
			return { success: false, message: '获取预生产环境后端环境变量机密失败，用户 Token 校验未通过', result: {} }
		}

		const AWS_SECRET_NAME = process.env.AWS_SECRET_NAME
		if (!AWS_SECRET_NAME) {
			console.error('ERROR', '获取预生产环境后端环境变量机密失败，环境变量中未提供机密名，请设置 AWS_SECRET_REGION 环境变量。')
			return { success: false, message: '获取预生产环境后端环境变量机密失败，环境变量中未提供机密名', result: {} }
		}
		
		try {
			const command = new GetSecretValueCommand({ SecretId: AWS_SECRET_NAME });
			const response = await client.send(command);

			try {
				const secerts: Record<string, string> = JSON.parse(response.SecretString);
				return { success: true, message: '获取预生产环境后端环境变量机密成功', result: { envs: secerts } }
			} catch(error) {
				console.error('ERROR', '获取预生产环境后端环境变量机密时出错，解析 JSON 失败：', error)
				return { success: false, message: '获取预生产环境后端环境变量机密时出错，解析 JSON 失败', result: {} }
			}
		} catch(error) {
			console.error('ERROR', '获取预生产环境后端环境变量机密时出错，获取数据失败：', error)
			return { success: false, message: '获取预生产环境后端环境变量机密时出错，获取数据失败', result: {} }
		}
	} catch (error) {
		console.error('ERROR', '获取预生产环境后端环境变量机密时出错，未知错误：', error)
		return { success: false, message: '获取预生产环境后端环境变量机密时出错，未知错误', result: {} }
	}
}
