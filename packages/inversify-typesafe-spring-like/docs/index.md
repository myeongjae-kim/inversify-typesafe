# `inversify-typesafe-spring-like` guides

Use these guides when configuring dependency injection in an application. They are shipped with the package, so installed copies are available at `node_modules/inversify-typesafe-spring-like/docs/`.

| Need | Guide |
| --- | --- |
| Define application and infrastructure boundaries | [Use-case beans](./use-case-beans.md) |
| Defer container initialization | [Lazy ApplicationContext](./lazy-application-context.md) |
| Compose common and domain-specific beans | [Domain-specific BeanConfig](./domain-specific-bean-config.md) |
| Expose one instance through multiple bean keys | [`toResolvedValue`](./to-resolved-value.md) |

Start with [Use-case beans](./use-case-beans.md) unless the application already has an established dependency-injection structure.
