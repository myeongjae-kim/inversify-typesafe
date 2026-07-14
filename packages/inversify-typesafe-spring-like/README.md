<h1 align="center">inversify-typesafe-spring-like</h1>

<p align="center">
  Add-On Library for inversify-typesafe to make it more like <a href="https://spring.io/" target="_blank">Spring</a>.
  <br/>
  <a href="https://stackblitz.com/edit/inversify-typesafe-spring-like?file=test%2Fmain.test.ts" target="_blank">
    <strong>See Demo</strong>
  </a>
</p>

<p align="center">
  <a href="https://github.com/myeongjae-kim/inversify-typesafe/actions?query=workflow%3ACI">
    <img src="https://github.com/myeongjae-kim/inversify-typesafe/workflows/CI/badge.svg" alt="CI" height="18">
  </a>
  <a href="https://codecov.io/gh/myeongjae-kim/inversify-typesafe">
    <img src="https://img.shields.io/codecov/c/github/myeongjae-kim/inversify-typesafe.svg" alt="Test Coverage" height="18">
  </a>
  <a href="https://www.npmjs.com/package/inversify-typesafe-spring-like">
    <img src="https://img.shields.io/npm/v/inversify-typesafe-spring-like.svg" alt="npm version" height="18">
  </a>
  <a href="https://bundlephobia.com/package/inversify-typesafe-spring-like">
    <img src="https://img.shields.io/bundlephobia/minzip/inversify-typesafe-spring-like" alt="Bundle Size" height="18">
  </a>
  <a href="https://raw.githubusercontent.com/myeongjae-kim/inversify-typesafe/refs/heads/main/packages/inversify-typesafe-spring-like/LICENSE">
    <img src="https://img.shields.io/npm/l/inversify-typesafe-spring-like.svg" alt="MIT license" height="18">
  </a>
</p>

```ts
import { ApplicationContext, BeanConfig, returnAutowired } from "inversify-typesafe-spring-like";

interface Article {
  id: number;
  title: string;
  content: string;
}

interface ArticleOutgoingPort {
  getById(id: number): Promise<Article>
}

class ArticleRepository implements ArticleOutgoingPort {
  getById(id: number): Promise<Article> {
    return Promise.resolve({
      id: id,
      title: `title #${id}`,
      content: `content #${id}`,
    })
  }
}

interface GetArticleUseCase {
  execute(id: number): Promise<Article>
}

const { Autowired } = returnAutowired<Beans>();

class ArticleQueryService implements GetArticleUseCase {
  constructor(
    @Autowired("ArticleOutgoingPort") // compile error if a parameter of @Autowired is not a key of Beans.
    private readonly articleOutgoingPort: ArticleOutgoingPort,
  ) { }
  execute(id: number): Promise<Article> {
    return this.articleOutgoingPort.getById(id);
  }
}

type Beans = {
  GetArticleUseCase: GetArticleUseCase; // interface (class is also possible)
  ArticleOutgoingPort: ArticleOutgoingPort; // interface (class is also possible)
}

const beanConfig: BeanConfig<Beans> = {
  // compile error if ArticleQueryService is not compatible with GetArticleUseCase.
  GetArticleUseCase: (bind) => bind().to(ArticleQueryService),
  // compile error if ArticleRepository is not compatible with ArticleOutgoingPort.
  ArticleOutgoingPort: (bind) => bind().to(ArticleRepository), 
}

const applicationContext = ApplicationContext(beanConfig);

const getArticleUseCase = applicationContext.get("GetArticleUseCase")

getArticleUseCase.execute(1).then(console.log)
```

## TL;DR

`inversify-typesafe-spring-like` is a Spring-flavored add-on for `inversify-typesafe`. Define a `Beans` map, register every bean with `BeanConfig`, create an `Autowired` decorator with `returnAutowired`, and initialize the container with `ApplicationContext`. Bean names are checked and return types are inferred at compile time, while beans use singleton scope by default.

<details>
<summary><strong>For AI Agents Using This Library</strong></summary>

- Define one `Beans` map whose string keys are bean names and whose values are the types returned for those names.
- Declare a `BeanConfig<Beans>` containing every key in `Beans`, and bind each key to a compatible implementation with the provided `bind()` function.
- Create a project-local decorator by destructuring `const { Autowired } = returnAutowired<Beans>()`, then use `@Autowired("BeanName")` for constructor injection.
- Pass the bean config to `ApplicationContext`; let TypeScript infer the context type instead of adding a generic argument manually.
- Resolve beans with `applicationContext.get("BeanName")`. Do not cast bean names or result types, because doing so bypasses compile-time checks.
- Assume singleton scope unless an explicit `ContainerOptions` argument passed to `ApplicationContext` overrides `defaultScope`.
- Use the underlying `inversify-typesafe` capabilities for advanced bindings and the original InversifyJS API. `BeanConfig`, `ApplicationContext`, and `returnAutowired` correspond to `TypesafeServiceConfig`, `createTypesafeContainer`, and `returnTypesafeInject` respectively.
- Keep the `Beans` map, bean config, `get` calls, and `Autowired` decorators synchronized whenever a bean is added, removed, or renamed.

</details>

## Introduction

This library extends [inversify-typesafe](https://github.com/myeongjae-kim/inversify-typesafe) to provide a development experience similar to [Spring Framework](https://spring.io/).

It sets the default container scope to `Singleton` and exports standard `inversify-typesafe` utilities with Spring-like naming conventions, making it easier for developers familiar with Spring to adopt Inversify in TypeScript projects.

## Installation

Via npm

```bash
npm install inversify-typesafe-spring-like
```

Via yarn

```bash
yarn add inversify-typesafe-spring-like
```

Via pnpm

```bash
pnpm add inversify-typesafe-spring-like
```

## Demo

Try it out on <a href="https://stackblitz.com/edit/inversify-typesafe-spring-like?file=test%2Fmain.test.ts" target="_blank">StackBlitz</a>.

## Types

https://inversify-typesafe-spring-like.myeongjae.kim/modules.html

## Usage

The API is designed to mirror Spring's terminology:
1. `createTypesafeContext()` $\rightarrow$ `ApplicationContext()`
   - Note: `defaultScope` is set to `Singleton` by default.
2. `returnTypesafeInject()` $\rightarrow$ `returnAutowired()`
3. `TypesafeServiceConfig<T>` $\rightarrow$ `BeanConfig<T>`

For complete usage documentation and advanced features, please refer to the [inversify-typesafe documentation](https://github.com/myeongjae-kim/inversify-typesafe/tree/main?tab=readme-ov-file#usage).

## Advanced Patterns

### Lazy ApplicationContext Initialization

In production applications, you may want to defer the initialization of the ApplicationContext until it's actually needed. This is especially useful in serverless environments or when you want to avoid initialization overhead during module loading.

**The `lazy` utility function:**

```ts
// core/common/util/lazy.ts
export const lazy = <T>(fn: () => T) => {
  let value: T | undefined;
  return () => value ?? (value = fn());
};
```

**Usage with ApplicationContext:**

```ts
// core/config/applicationContext.ts
import 'reflect-metadata';
import { ApplicationContext } from 'inversify-typesafe-spring-like';
import { beanConfig } from './beanConfig';
import { lazy } from '../common/util/lazy';

// Lazy initialization - ApplicationContext is created only when first accessed
export const applicationContext = lazy(() => ApplicationContext(beanConfig));
```

**Using in controllers or services:**

```ts
// app/api/articles/GetArticleController.ts
import { applicationContext } from '@/core/config/applicationContext';

export default async function handler(req: Request) {
  // ApplicationContext is initialized on first call, then reused
  const useCase = applicationContext().get("GetArticleUseCase");
  const article = await useCase.execute(req.params.id);
  return Response.json(article);
}
```

**Why use lazy initialization?**

| Benefit | Description |
|---------|-------------|
| Faster cold starts | Module loading doesn't trigger DI container initialization |
| On-demand creation | Container is only created when actually needed |
| Singleton guarantee | Multiple calls return the same instance |
| Testability | Easy to mock or replace in tests |

**Without lazy (eager initialization):**

```ts
// ❌ Container is created immediately when module is imported
export const applicationContext = ApplicationContext(beanConfig);

// Every import of this module triggers initialization
import { applicationContext } from './applicationContext';
```

**With lazy (deferred initialization):**

```ts
// ✅ Container is created only when applicationContext() is called
export const applicationContext = lazy(() => ApplicationContext(beanConfig));

// Import doesn't trigger initialization
import { applicationContext } from './applicationContext';

// Initialization happens here, on first use
const useCase = applicationContext().get("GetArticleUseCase");
```

**Note:** The `lazy` function ensures the initialization function is called exactly once, and subsequent calls return the cached value.

### Domain-Specific BeanConfig

As your application grows, you may want to organize beans by domain. This pattern allows each domain module to define its own beans while extending a common configuration.

```ts
// core/config/CommonBeanConfig.ts
import { BeanConfig } from "inversify-typesafe-spring-like";

interface LoggingPort {
  log(message: string): void;
}

class ConsoleLogger implements LoggingPort {
  log(message: string): void {
    console.log(`[LOG] ${message}`);
  }
}

export type CommonBeans = {
  LoggingPort: LoggingPort;
};

export const commonBeanConfig: BeanConfig<CommonBeans> = {
  LoggingPort: (bind) => bind().to(ConsoleLogger),
};
```

```ts
// core/article/config/ArticleBeanConfig.ts
import { BeanConfig, returnAutowired } from "inversify-typesafe-spring-like";
import { CommonBeans, commonBeanConfig } from "../config/CommonBeanConfig";

interface ArticleQueryPort { /* ... */ }
interface ArticleCommandPort { /* ... */ }
interface GetArticleUseCase { /* ... */ }

// Extend CommonBeans with domain-specific beans
export type ArticleBeans = CommonBeans & {
  ArticleQueryPort: ArticleQueryPort;
  ArticleCommandPort: ArticleCommandPort;
  GetArticleUseCase: GetArticleUseCase;
};

// Domain-specific Autowired decorator
export const { Autowired: ArticleAutowired } = returnAutowired<ArticleBeans>();

export const articleBeanConfig: BeanConfig<ArticleBeans> = {
  ...commonBeanConfig,  // Include common beans
  ArticleQueryPort: (bind) => bind().to(ArticlePersistenceAdapter),
  ArticleCommandPort: (bind) => bind().to(ArticlePersistenceAdapter),
  GetArticleUseCase: (bind) => bind().to(ArticleQueryService),
};
```

```ts
// Usage in domain service
class ArticleQueryService implements GetArticleUseCase {
  constructor(
    @ArticleAutowired("ArticleQueryPort")  // Type-safe within ArticleBeans
    private readonly articleQueryPort: ArticleQueryPort,
    @ArticleAutowired("LoggingPort")  // Common beans are also available
    private readonly loggingPort: LoggingPort,
  ) { }
}
```

**Benefits:**
- Each domain owns its bean configuration
- Common beans (logging, transactions, etc.) are shared across domains
- Type safety is maintained within each domain's scope
- Easy to identify which beans belong to which domain

### Reusing a Single Class for Multiple Interfaces with `toResolvedValue`

When a single class implements multiple interfaces (e.g., both `QueryPort` and `CommandPort`), you can use `toResolvedValue` to register the same instance under different bean names. This avoids creating separate instances and ensures consistency.

```ts
import { ApplicationContext, BeanConfig, returnAutowired } from "inversify-typesafe-spring-like";

// Interfaces
interface StayQueryPort {
  findById(id: number): Promise<Stay | null>;
  findAll(): Promise<Stay[]>;
}

interface StayCommandPort {
  save(stay: Stay): Promise<Stay>;
  delete(id: number): Promise<void>;
}

// Single class implementing both interfaces
class StayPersistenceAdapter implements StayQueryPort, StayCommandPort {
  async findById(id: number): Promise<Stay | null> { /* ... */ }
  async findAll(): Promise<Stay[]> { /* ... */ }
  async save(stay: Stay): Promise<Stay> { /* ... */ }
  async delete(id: number): Promise<void> { /* ... */ }
}

type Beans = {
  StayQueryPort: StayQueryPort;
  StayCommandPort: StayCommandPort;
};

const { Autowired } = returnAutowired<Beans>();

const beanConfig: BeanConfig<Beans> = {
  // Register the class for the first interface
  StayQueryPort: (bind) => bind().to(StayPersistenceAdapter),

  // Reuse the same instance for the second interface
  StayCommandPort: (bind) =>
    bind().toResolvedValue(
      (queryPort) => queryPort as StayCommandPort,  // Transform function
      ['StayQueryPort']  // Dependencies to resolve first
    ),
};

const applicationContext = ApplicationContext(beanConfig);

// Both return the same instance
const queryPort = applicationContext.get("StayQueryPort");
const commandPort = applicationContext.get("StayCommandPort");

console.log(queryPort === commandPort);  // true (same instance)
```

**How `toResolvedValue` works:**

```ts
bind().toResolvedValue(transformFn, dependencies)
```

- `transformFn`: A function that receives the resolved dependencies and returns the value to bind
- `dependencies`: An array of bean names to resolve before calling the transform function

**Use cases:**
- Single class implementing multiple interfaces (CQRS pattern)
- Creating derived beans from existing beans
- Aliasing beans under different names
- Lazy transformation of resolved dependencies

**Benefits:**
- Avoids duplicate instances when the same class serves multiple roles
- Maintains singleton behavior across interface boundaries
- Clear dependency declaration for complex wiring scenarios

## License

MIT © [Myeongjae Kim](https://myeongjae.kim)
