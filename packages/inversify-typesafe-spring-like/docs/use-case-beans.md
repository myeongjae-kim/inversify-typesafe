# Use-case and infrastructure beans

Use separate maps for application entry points and infrastructure dependencies. Combine them only when configuring the container, and expose a `getUseCase` helper so controllers and handlers cannot resolve infrastructure beans directly.

```ts
import "reflect-metadata";
import {
  ApplicationContext,
  BeanConfig,
  returnAutowired,
} from "inversify-typesafe-spring-like";

interface Article {
  id: number;
  title: string;
}

interface ArticleOutgoingPort {
  getById(id: number): Promise<Article>;
}

interface GetArticleUseCase {
  execute(id: number): Promise<Article>;
}

class ArticleRepository implements ArticleOutgoingPort {
  async getById(id: number): Promise<Article> {
    return { id, title: `Article #${id}` };
  }
}

type UseCaseBeans = {
  GetArticleUseCase: GetArticleUseCase;
};

type InfraBeans = {
  ArticleOutgoingPort: ArticleOutgoingPort;
};

type Beans = UseCaseBeans & InfraBeans;

const { Autowired } = returnAutowired<Beans>();

class ArticleQueryService implements GetArticleUseCase {
  constructor(
    @Autowired("ArticleOutgoingPort")
    private readonly articleOutgoingPort: ArticleOutgoingPort,
  ) {}

  execute(id: number): Promise<Article> {
    return this.articleOutgoingPort.getById(id);
  }
}

const beanConfig: BeanConfig<Beans> = {
  GetArticleUseCase: (bind) => bind().to(ArticleQueryService),
  ArticleOutgoingPort: (bind) => bind().to(ArticleRepository),
};

const applicationContext = ApplicationContext(beanConfig);

export function getUseCase<TUseCaseName extends keyof UseCaseBeans>(
  useCaseName: TUseCaseName,
): UseCaseBeans[TUseCaseName] {
  return applicationContext.get(useCaseName);
}

const useCase = getUseCase("GetArticleUseCase");
useCase.execute(1).then(console.log);
```

`Beans` is the complete container contract, so application services can inject infrastructure ports. `getUseCase` accepts only `keyof UseCaseBeans`, which keeps infrastructure resolution inside composition code instead of application entry points.

Do not call `applicationContext.get` from controllers or cast bean keys to bypass this boundary.
