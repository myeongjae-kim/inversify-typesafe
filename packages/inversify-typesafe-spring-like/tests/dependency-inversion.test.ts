import { describe, expect, expectTypeOf, it } from "vitest";
import { ApplicationContext, BeanConfig, returnAutowired } from "../src";

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

const { Autowired } = returnAutowired<keyof Beans>();

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
  GetArticleUseCase: (bind) => bind.to(ArticleQueryService), // compile error if ArticleQueryService is not compatible with GetArticleUseCase.
  ArticleOutgoingPort: (bind) => bind.to(ArticleRepository), // compile error if ArticleRepository is not compatible with ArticleOutgoingPort.
}

describe("Dependency Inversion Test", () => {
  it("should return type-safe service", async () => {
    const applicationContext = ApplicationContext(beanConfig);

    const getArticleUseCase = applicationContext.get("GetArticleUseCase")

    // magically inferred type of getArticleUseCase
    expectTypeOf(getArticleUseCase).toEqualTypeOf<GetArticleUseCase>()

    const article = await getArticleUseCase.execute(1)
    expect(article).toEqual({
      id: 1,
      title: "title #1",
      content: "content #1",
    })
  })

  it("should use Singleton scope as default", () => {
    const applicationContext = ApplicationContext(beanConfig);

    const getArticleUseCase1 = applicationContext.get("GetArticleUseCase")
    const getArticleUseCase2 = applicationContext.get("GetArticleUseCase")

    // same object because the default scope of ApplicationContext is "Singleton"
    expect(getArticleUseCase1).toBe(getArticleUseCase2)
  })

  it("can override default scope of ApplicationContext", () => {
    const applicationContext = ApplicationContext(beanConfig, { defaultScope: "Request" });

    const getArticleUseCase1 = applicationContext.get("GetArticleUseCase")
    const getArticleUseCase2 = applicationContext.get("GetArticleUseCase")

    // different object because the scope option of applicationContext is "Request"
    expect(getArticleUseCase1).not.toBe(getArticleUseCase2)
  })
})