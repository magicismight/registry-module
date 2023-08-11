# registry-module

模块依赖注入，通常用作项目外部脚本模块的依赖注入。如果部分项目中的业务逻辑需要定制化，可以用模块依赖注入来处理这部分定制化逻辑。


```ts
import { Registry, createRegistry } from 'registry-module';

// 抽象层描述所需模块名和模块定义，并创建 Registry 供业务层和注入层调用
export const registry: Registry<{
  DateFormatter: DateFormatter,

}> = createRegistry<{
  DateFormatter: DateFormatter
}>();

```

``` ts
import { registry } from '抽象层 package';

// 没有定义的组件不能使用
if (!registry.isDefined('DateFormatter')) {
  throw new Error('Module is not defined in registry.')
}

// 逻辑层使用 Registry
// 需要传入当前环境中的必要依赖
const DateFormatter = registry.require('DateFormatter', {
  // 这里传入初始化 DateFormatter 需要的依赖
});

const formatted = (new DateFormatter(new Date())).toString();

```
