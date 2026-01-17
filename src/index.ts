import { BindToFluentSyntax, Container, ContainerOptions, GetOptions, inject, OptionalGetOptions } from "inversify";

type AbstractServiceMap = Record<string, unknown>;

export type TypesafeContainer<S extends AbstractServiceMap> = Omit<Container, "get"> & {
  get<T extends keyof S>(serviceIdentifier: T, options: OptionalGetOptions): S[T] | undefined;
  get<T extends keyof S>(serviceIdentifier: T, options?: GetOptions): S[T];
  _get: Container["get"];
};

export type TypesafeServiceConfig<S extends AbstractServiceMap> = {
  [K in keyof S]: ((bind: () => BindToFluentSyntax<S[K]>, container: TypesafeContainer<S>) => void);
};

export const returnTypesafeInject = <S extends AbstractServiceMap>() => (name: Extract<keyof S, string>): ReturnType<typeof inject> => inject(name);

export const createTypesafeContainer = <S extends AbstractServiceMap>(
  serviceConfig: TypesafeServiceConfig<S>,
  options?: ContainerOptions,
): TypesafeContainer<S> => {
  const container = new Container(options) as unknown as TypesafeContainer<S>;
  container._get = container.get;

  Object.entries(serviceConfig).forEach(([name, bindingFunction]) => {
    bindingFunction(() => container.bind(name), container);
  });

  return container;
};