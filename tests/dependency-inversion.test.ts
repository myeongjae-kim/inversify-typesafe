import { Container } from "inversify";
import { describe, expect, expectTypeOf, it } from "vitest";
import { bindToClass, returnTypesafeInject, TypesafeContainer, TypesafeServiceConfig } from "../src";

// https://inversify.io/docs/introduction/dependency-inversion/
interface Weapon {
  damage: number;
}

class Katana implements Weapon {
  public readonly damage: number = 10;
}

export const injectTypesafe = returnTypesafeInject<keyof Services>()

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
  // use `bindToClass()` helper function to simply bind a class.
  "ninjaServiceId": bindToClass(Ninja), // compile error if not compatible with Ninja

  // use lambda to bind a class for detailed binding.
  "weaponServiceId": (bind) => bind.to(Katana), // compile error if not compatible with Katana
};

describe("Dependency Inversion Test", () => {
  it("should return type-safe service", () => {
    const typesafeContainer = new TypesafeContainer(serviceConfig);

    expect(typesafeContainer.get("ninjaServiceId").weapon.damage).toBe(10);

    // inferred type test
    expectTypeOf(typesafeContainer.get("ninjaServiceId")).toEqualTypeOf<Ninja>();
    expectTypeOf(typesafeContainer.get("weaponServiceId")).toEqualTypeOf<Weapon>();

    // inferred parameter type test
    expectTypeOf({} as Parameters<typeof typesafeContainer.get>[0]).toEqualTypeOf<"ninjaServiceId" | "weaponServiceId">();
    expectTypeOf({} as Parameters<typeof injectTypesafe>[0]).toEqualTypeOf<"ninjaServiceId" | "weaponServiceId">();
  })

  it("should return inversify container", () => {
    const container = new TypesafeContainer(serviceConfig);
    expect(container.getContainer()).toBeDefined();
    expectTypeOf(container.getContainer()).toEqualTypeOf<Container>();
  })
})