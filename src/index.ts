import { BindToFluentSyntax, Container, ContainerOptions, inject } from "inversify";

type AbstractServiceMap = Record<string, unknown>;

export type TypesafeContainer<S extends AbstractServiceMap> =
  Omit<Container, "get"> & { get<T extends keyof S>(serviceName: T): S[T]; };

export type TypesafeServiceConfig<S extends AbstractServiceMap> = {
  [K in keyof S]: ((bind: BindToFluentSyntax<S[K]>, container: TypesafeContainer<S>) => void);
};

export const returnTypesafeInject = <S extends AbstractServiceMap>() => (name: Extract<keyof S, string>) => inject(name);

export const createTypesafeContainer = <S extends AbstractServiceMap>(
  serviceConfig: TypesafeServiceConfig<S>,
  options?: ContainerOptions,
): TypesafeContainer<S> => {
  const container = new Container(options);

  Object.entries(serviceConfig).forEach(([name, bindingFunction]) => {
    bindingFunction(container.bind(name), container);
  });

  return container;
};