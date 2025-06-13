/**
 * 验证名字是否符合规范
 * @param fieldValue 验证内容
 * @returns 是否符合规范，符合规范返回true，否则返回false
 */
export const validateNameField = (fieldValue) => {
	const pattern = /^(?![\s-_])(?!.*[\s-_]{2})[a-zA-Z0-9-\uAC00-\uD7AF\u3040-\u30FF\u4E00-\u9FAF\u00C0-\u1EF9_\s]+(?<![\s-_])$/
  const trimmedValue = fieldValue.trim()
  if (
    trimmedValue.length === 0 ||
    trimmedValue.length > 20 ||
    fieldValue !== trimmedValue ||
    trimmedValue.includes("  ") ||
    pattern.test(trimmedValue)
  ) {
		return true
  }
	return false
}
