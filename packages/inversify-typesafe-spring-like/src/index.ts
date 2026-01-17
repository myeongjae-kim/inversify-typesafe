import { ContainerOptions } from "inversify";
import { TypesafeServiceConfig as BeanConfig, createTypesafeContainer, returnTypesafeInject, TypesafeContainer } from "inversify-typesafe";

export const returnAutowired = <S extends Record<string, unknown>>(): { Autowired: ReturnType<typeof returnTypesafeInject<S>> } =>
  ({ Autowired: returnTypesafeInject<S>() });

export type { BeanConfig };

export const ApplicationContext = <S extends Record<string, unknown>>(beanConfig: BeanConfig<S>, options?: ContainerOptions): TypesafeContainer<S> =>
  createTypesafeContainer(beanConfig, { defaultScope: "Singleton", ...options });