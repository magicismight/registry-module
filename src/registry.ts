import { throwUndefinedModule } from './undefined-module';
// 模块工厂定义，传入初始化需要的依赖上下文，返回模块，
// 模块可以为任意类型，可以是一个 object 也可以是一个函数
export type ModuleFactory<Module, Context> = (context: Context) => Module;

// 模块工厂 map 类型定义
export type ModuleFactoryMap<
  T extends Record<string, ModuleFactory<any, any>>
> = {
  [Key in keyof T]: T[Key];
};

declare type ContextType<T> = T extends (context: infer U) => any ? U : never;
declare type ModuleType<T> = T extends (...args: any[]) => infer R ? R : never;

export interface Registry<Map extends ModuleFactoryMap<any>> {
  // 判断传入的 key 对应的组件是否被定义
  isDefined: (key: keyof Map) => boolean;
  // 模块使用方调用 .require(key, Context) 可以获取到 key 对应的模块，没有被实现的模块在 require 时会报错，该报错信息可以通过 isUndefinedComponentError 进行判断。
  // 如果定义的模块初始化时需要参数 .require 需要传入对应参数。
  // 需要注意每次调用 .require 都会重新初始化模块，如果模块初始化时有副作用，并且需要注意每次返回的模块可能是不同的实例（需要看实现的细节）。
  require: <Key extends keyof Map>(
    key: Key,
    // eslint-disable-next-line @typescript-eslint/no-invalid-void-type
    Context: ContextType<Map[Key]> extends void ? void : ContextType<Map[Key]>
  ) => ModuleType<Map[Key]>;
  // 定义所有模块实现，
  // 返回一个函数，调用该函数可以清除所有模块的实现
  define: (map: Map) => () => void;
  // 单独注入某个模块的实现
  // 返回一个函数，调用该函数可以清除该模块的实现
  inject: <Key extends keyof Map>(key: Key, factory: Map[Key]) => () => void;
}

export function createRegistry<Map extends ModuleFactoryMap<any>>(
  defaults: Partial<Map>
): Registry<Map> {
  const factoryMap: Partial<Map> = {
    ...defaults
  };

  const inject = <Key extends keyof Map>(
    key: Key,
    factory: Map[Key]
  ): (() => void) => {
    factoryMap[key] = factory;

    return (): void => {
      delete factoryMap[key];
    };
  };

  return {
    isDefined: (key: keyof Map): boolean => {
      return factoryMap[key] !== undefined;
    },
    require: <Key extends keyof Map>(
      key: Key,
      // eslint-disable-next-line @typescript-eslint/no-invalid-void-type
      context: ContextType<Map[Key]> extends void ? void : ContextType<Map[Key]>
    ): ModuleType<Map[Key]> => {
      const factory = factoryMap[key];

      // 需要判断 factory 是否为函数，因为 factoryMap[key] 可能为 undefined
      if (typeof factory === 'function') {
        return factory(context);
      } else {
        // 没有被实现的模块在 require 时会报错，该报错信息可以通过 isUndefinedComponentError 进行判断
        throwUndefinedModule(key as string);
      }
    },
    define: (map: Map): (() => void) => {
      const resets: Array<() => void> = [];
      // 获取当前 registry 中的模块名称列表
      const registryKeys = Object.keys(map) as Array<keyof Map>;
      for (const key of registryKeys) {
        resets.push(inject(key, map[key]));
      }

      return (): void => {
        for (const reset of resets) {
          reset();
        }
      };
    },
    inject
  };
}
