import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

/**
 * 生成一个预签名 URL，该 URL 可以用于向 MinIO 存储上传数据 (PUT)
 * @param bucketName 目标存储桶名字
 * @param fileName 文件名字，注意：是文件上传到 MinIO 之后的名字，不是要上传的文件名字
 * @param expiresIn 预签名 URL 的有效期限，单位：秒。默认 3600 秒
 * @returns MinIO 预签名 URL
 */
export const createMinioPutSignedUrl = async (bucketName: string, fileName:string, expiresIn: number = 3600): Promise<string | undefined> => {
	const minioEndPoint = process.env.MINIO_END_POINT
	const minioPort = process.env.MINIO_PORT ? parseInt(process.env.MINIO_PORT, 10) : 9000
	const accessKeyId = process.env.MINIO_ACCESS_KEY_ID
	const secretAccessKey = process.env.MINIO_SECRET_ACCESS_KEY
	const useSSL = process.env.MINIO_USE_SSL === 'true'

	if (expiresIn <= 0) {
		console.error('ERROR', '无法创建 MinIO 预签名 URL, 过期时间必须大于等于 0 秒 ', { bucketName, fileName, expiresIn })
		return undefined
	}

	if (!minioEndPoint || !accessKeyId || !secretAccessKey) {
		console.error('ERROR', '无法创建 S3(MinIO) 存储桶实例，必要的参数： minioEndPoint, accessKeyId 和 secretAccessKey 可能为空。', { bucketName, fileName, expiresIn })
		return undefined
	}

	try {
		const S3 = new S3Client({
			endpoint: `${useSSL ? 'https' : 'http'}://${minioEndPoint}:${minioPort}`,
			credentials: {
				accessKeyId,
				secretAccessKey,
			},
			region: 'us-east-1',
			forcePathStyle: true, // MinIO requires this
		})

		if (!S3) {
			console.error('ERROR', '创建的 S3 客户端为空', { bucketName, fileName, expiresIn })
			return undefined
		}

		try {
			const url = await getSignedUrl(
				S3,
				new PutObjectCommand({
					Bucket: bucketName,
					Key: fileName,
				}),
				{ expiresIn },
			)

			if (!url) {
				console.error('ERROR', '创建的预签名 URL 为空', { bucketName, fileName, expiresIn })
				S3.destroy()
				return undefined
			}

			S3.destroy()
			return url
		} catch (error) {
			console.error('ERROR', '创建预签名 URL 失败，错误信息：', error, { bucketName, fileName, expiresIn })
			S3.destroy()
			return undefined
		}
	} catch (error) {
		console.error('ERROR', '连接 S3(MinIO) 存储桶或创建预签名 URL 失败，错误信息：', error, { bucketName, fileName, expiresIn })
		return undefined
	}
}

/**
 * 获取 MinIO TUS 上传端点
 * @returns MinIO TUS 上传端点 URL
 */
export const getMinioTusEndpoint = (): string | undefined => {
    const minioEndPoint = process.env.MINIO_END_POINT
    const minioPort = process.env.MINIO_PORT ? parseInt(process.env.MINIO_PORT, 10) : 9000
    const bucketName = process.env.MINIO_TUS_BUCKET
    const useSSL = process.env.MINIO_USE_SSL === 'true'

    if (!minioEndPoint || !bucketName) {
        console.error('ERROR', '无法获取 MinIO TUS 端点, minioEndPoint 或 bucketName 可能为空。')
        return undefined
    }

    return `${useSSL ? 'https' : 'http'}://${minioEndPoint}:${minioPort}/${bucketName}`
}
