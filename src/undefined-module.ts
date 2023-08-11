/**
 * 用于处理 registry 中模块未定义的错误
 */
class UndefinedModuleError extends Error {}

/**
 * 该方法需要暴露到 package 外部，
 * 用于判断错误原因
 *
 * @param error
 * @returns
 */
export function isUndefinedModuleError(error: any): error is UndefinedModuleError {
  return error instanceof UndefinedModuleError;
}

export function throwUndefinedModule(name: string): never {
  throw new UndefinedModuleError(`Module: ${name} is not defined on registry.`);
}
