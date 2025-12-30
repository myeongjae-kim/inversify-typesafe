import { ContainerOptions } from "inversify";
import { returnTypesafeInject, TypesafeContainer, TypesafeServiceConfig } from "inversify-typesafe";

export const returnAutowired = <Name extends string>() => ({ Autowired: returnTypesafeInject<Name>() });

export class ApplicationContext<S extends Record<string, unknown>> extends TypesafeContainer<S> {
  constructor(serviceConfig: TypesafeServiceConfig<S>, options?: ContainerOptions) {
    super(serviceConfig, { defaultScope: "Singleton", ...options });
  }
}