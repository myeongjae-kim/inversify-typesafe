import { BindToFluentSyntax, Container, ContainerOptions, inject } from "inversify";

export type TypesafeContainer<S extends Record<string, unknown>> =
  Omit<Container, "get"> & {
    get<T extends keyof S>(serviceName: T): S[T];
  };

export type TypesafeServiceConfig<S extends Record<string, unknown>> = {
  [K in keyof S]: ((
    bind: BindToFluentSyntax<S[K]>,
    container: TypesafeContainer<S>
  ) => void);
};

export const returnTypesafeInject = <Name extends string>() => (name: Name) => inject(name);

export const createTypesafeContainer = <S extends Record<string, unknown>>(
  serviceConfig: TypesafeServiceConfig<S>,
  options?: ContainerOptions,
): TypesafeContainer<S> => {
  const container = new Container(options);

  Object.entries(serviceConfig).forEach(([name, bindingFunction]) => {
    bindingFunction(container.bind(name), container);
  });

  return container;
};