import { ContainerOptions } from "inversify";
import { ContainerTypesafe, returnInjectTypesafe, TypesafeServiceConfig } from "inversify-typesafe";

export const returnAutowired = <Name extends string>() => ({ Autowired: returnInjectTypesafe<Name>() });

export class ApplicationContext<S extends Record<string, unknown>> extends ContainerTypesafe<S> {
  constructor(serviceConfig: TypesafeServiceConfig<S>, options?: ContainerOptions) {
    super(serviceConfig, { defaultScope: "Singleton", ...options });
  }
}