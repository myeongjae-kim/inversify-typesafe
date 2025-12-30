import { ContainerOptions } from "inversify";
import { TypesafeServiceConfig as BeanConfig, returnTypesafeInject, TypesafeContainer } from "inversify-typesafe";

export const returnAutowired = <Name extends string>() => ({ Autowired: returnTypesafeInject<Name>() });

export type { BeanConfig };

export class ApplicationContext<S extends Record<string, unknown>> extends TypesafeContainer<S> {
  constructor(beanConfig: BeanConfig<S>, options?: ContainerOptions) {
    super(beanConfig, { defaultScope: "Singleton", ...options });
  }
}