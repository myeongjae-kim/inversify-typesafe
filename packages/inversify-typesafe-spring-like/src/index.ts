import { ContainerOptions } from "inversify";
import { TypesafeServiceConfig as BeanConfig, createTypesafeContainer, returnTypesafeInject } from "inversify-typesafe";

export const returnAutowired = <Name extends string>() => ({ Autowired: returnTypesafeInject<Name>() });

export type { BeanConfig };

export const ApplicationContext = <S extends Record<string, unknown>>(beanConfig: BeanConfig<S>, options?: ContainerOptions) =>
  createTypesafeContainer(beanConfig, { defaultScope: "Singleton", ...options });