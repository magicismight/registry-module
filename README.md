# registry-module

Module dependency injection is commonly used for injecting dependencies of external script modules into a project. If some business logic in a project needs customization, module dependency injection can be used to handle this customization logic.


```ts
import { Registry, createRegistry } from 'registry-module';

// The abstraction layer describes the required module names and module definitions, and creates a registry for the business layer and injection layer to call
export const registry: Registry<{
  DateFormatter: DateFormatter,

}> = createRegistry<{
  DateFormatter: DateFormatter
}>();

```

``` ts
import { registry } from '抽象层 package';

// Components that are not defined cannot be used
if (!registry.isDefined('DateFormatter')) {
  throw new Error('Module is not defined in registry.')
}

// The logic layer uses the registry,
// Necessary dependencies in the current environment need to be passed in.
const DateFormatter = registry.require('DateFormatter', {
  // Dependencies required for initializing DateFormatter are passed in
});

const formatted = (new DateFormatter(new Date())).toString();

```
