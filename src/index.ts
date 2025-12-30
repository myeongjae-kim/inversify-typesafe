import { Container, ContainerOptions, inject, Newable } from "inversify";

export type TypesafeServiceConfig<S> = {
  [K in keyof S]: Newable<S[K]>;
};

export const returnTypesafeInject = <Name extends string>() => (name: Name) => inject(name);

export class TypesafeContainer<S extends Record<string, unknown>> {
  private container: Container;
  constructor(
    serviceConfig: TypesafeServiceConfig<S>,
    options?: ContainerOptions
  ) {
    this.container = new Container(options);

    Object.entries(serviceConfig).forEach(([name, service]) => {
      this.container.bind(name).to(service);
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