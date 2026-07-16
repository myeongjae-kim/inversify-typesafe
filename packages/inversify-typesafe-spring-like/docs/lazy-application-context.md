# Lazy ApplicationContext initialization

Create the container on first use when eager initialization would add unnecessary startup work, such as in serverless handlers. The lazy function caches the first container instance.

```ts
import "reflect-metadata";
import {
  ApplicationContext,
  BeanConfig,
} from "inversify-typesafe-spring-like";

const lazy = <T>(factory: () => T) => {
  let value: T | undefined;
  return (): T => value ?? (value = factory());
};

interface HealthCheckUseCase {
  execute(): { status: "ok" };
}

class HealthCheckService implements HealthCheckUseCase {
  execute() {
    return { status: "ok" } as const;
  }
}

type Beans = {
  HealthCheckUseCase: HealthCheckUseCase;
};

const beanConfig: BeanConfig<Beans> = {
  HealthCheckUseCase: (bind) => bind().to(HealthCheckService),
};

export const applicationContext = lazy(() => ApplicationContext(beanConfig));

export function handleHealthCheck() {
  return applicationContext().get("HealthCheckUseCase").execute();
}
```

Use this pattern at the composition root. Call `applicationContext()` only when a request or job needs a bean; subsequent calls reuse the same `ApplicationContext` and its singleton bindings.
