# Domain-specific BeanConfig

Let a domain extend common bean definitions when it owns its application services but shares cross-cutting infrastructure such as logging.

```ts
import {
  BeanConfig,
  returnAutowired,
} from "inversify-typesafe-spring-like";

interface LoggingPort {
  log(message: string): void;
}

class ConsoleLogger implements LoggingPort {
  log(message: string): void {
    console.log(message);
  }
}

type CommonBeans = {
  LoggingPort: LoggingPort;
};

const commonBeanConfig: BeanConfig<CommonBeans> = {
  LoggingPort: (bind) => bind().to(ConsoleLogger),
};

interface GetArticleUseCase {
  execute(id: number): string;
}

type ArticleBeans = CommonBeans & {
  GetArticleUseCase: GetArticleUseCase;
};

const { Autowired: ArticleAutowired } = returnAutowired<ArticleBeans>();

class ArticleQueryService implements GetArticleUseCase {
  constructor(
    @ArticleAutowired("LoggingPort")
    private readonly loggingPort: LoggingPort,
  ) {}

  execute(id: number): string {
    this.loggingPort.log(`Loading article ${id}`);
    return `Article #${id}`;
  }
}

export const articleBeanConfig: BeanConfig<ArticleBeans> = {
  ...commonBeanConfig,
  GetArticleUseCase: (bind) => bind().to(ArticleQueryService),
};
```

The domain map must include every common key that its services inject. Keep the domain's own bean names and bindings near the domain; compose the resulting config at the application composition root.
