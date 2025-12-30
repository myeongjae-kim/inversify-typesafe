import { BindToFluentSyntax, Container, ContainerOptions, inject } from "inversify";

export type TypesafeServiceConfig<S> = {
  [K in keyof S]: ((
    bind: BindToFluentSyntax<S[K]>,
    container: Omit<Container, "get"> & { get<T extends keyof S>(serviceName: T): S[T] }
  ) => void);
};

export const returnTypesafeInject = <Name extends string>() => (name: Name) => inject(name);

export class TypesafeContainer<S extends Record<string, unknown>> {
  private container: Container;
  constructor(
    serviceConfig: TypesafeServiceConfig<S>,
    options?: ContainerOptions,
  ) {
    this.container = new Container(options);

    Object.entries(serviceConfig).forEach(([name, bindingFunction]) => {
      bindingFunction(this.container.bind(name), this.container);
    });
  }

  public get<T extends keyof S>(serviceName: T): S[T] {
    return this.container.get(serviceName as string);
  }

  // only if you need to use inversify features.
  public getContainer() {
    return this.container;
  }
}