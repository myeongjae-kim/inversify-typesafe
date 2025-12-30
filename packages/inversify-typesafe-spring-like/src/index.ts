import { ContainerOptions } from "inversify";
import { TypesafeServiceConfig as BeanConfig, createTypesafeContainer, returnTypesafeInject } from "inversify-typesafe";

export const returnAutowired = <S extends Record<string, unknown>>() => ({ Autowired: returnTypesafeInject<S>() });

export type { BeanConfig };

export const ApplicationContext = <S extends Record<string, unknown>>(beanConfig: BeanConfig<S>, options?: ContainerOptions) =>
  createTypesafeContainer(beanConfig, { defaultScope: "Singleton", ...options });