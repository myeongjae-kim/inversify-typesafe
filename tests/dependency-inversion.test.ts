import { describe, expect, expectTypeOf, it } from "vitest";
import { createTypesafeContainer, returnTypesafeInject, TypesafeServiceConfig } from "../src";

// https://inversify.io/docs/introduction/dependency-inversion/
interface Weapon {
  damage: number;
}

class Katana implements Weapon {
  public readonly damage: number = 10;
}

export const injectTypesafe = returnTypesafeInject<Services>()

class Ninja {
  constructor(
    @injectTypesafe("weaponServiceId") // compile error if a parameter value is not a key of Services
    public readonly weapon: Weapon,
  ) { }
}

export type Services = {
  "ninjaServiceId": Ninja; // class
  "weaponServiceId": Weapon; // interface
};

export const serviceConfig: TypesafeServiceConfig<Services> = {
  // compile error if not compatible with Ninja
  "ninjaServiceId": (bind) => bind.to(Ninja),
  // compile error if not compatible with Katana. Use the second parameter if you need to access the container
  "weaponServiceId": (bind, _container) => bind.to(Katana),
};

describe("Dependency Inversion Test", () => {
  it("should return type-safe service", () => {
    const typesafeContainer = createTypesafeContainer(serviceConfig);

    expect(typesafeContainer.get("ninjaServiceId").weapon.damage).toBe(10);

    // inferred type test
    expectTypeOf(typesafeContainer.get("ninjaServiceId")).toEqualTypeOf<Ninja>();
    expectTypeOf(typesafeContainer.get("weaponServiceId")).toEqualTypeOf<Weapon>();

    // test first parameter type of get method
    expectTypeOf({} as "ninjaServiceId" | "weaponServiceId").toExtend<Parameters<typeof typesafeContainer.get>[0]>();
    expectTypeOf({} as string).not.toExtend<Parameters<typeof typesafeContainer.get>[0]>();

    // test first parameter type of injectTypesafe decorator
    expectTypeOf({} as "ninjaServiceId" | "weaponServiceId").toEqualTypeOf<Parameters<typeof injectTypesafe>[0]>();
  })
})