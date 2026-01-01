import { injectable, named, ServiceIdentifier } from "inversify";
import { describe, expect, expectTypeOf, it } from "vitest";
import { createTypesafeContainer, returnTypesafeInject, TypesafeServiceConfig } from "../src";

// https://inversify.io/docs/introduction/dependency-inversion/
interface Weapon {
  damage: number;
}

class Katana implements Weapon {
  public readonly damage: number = 10;
}

export const typesafeInject = returnTypesafeInject<Services>()

class Ninja {
  constructor(
    @typesafeInject("weaponServiceId") // compile error if a parameter value is not a key of Services
    public readonly weapon: Weapon,
  ) { }
}

export type Services = {
  "ninjaServiceId": Ninja; // class
  "weaponServiceId": Weapon; // interface
};

export const serviceConfig: TypesafeServiceConfig<Services> = {
  // compile error if not compatible with Ninja
  "ninjaServiceId": (bind) => bind().to(Ninja),
  // compile error if not compatible with Katana. Use the second parameter if you need to access the container
  "weaponServiceId": (bind, _container) => bind().to(Katana),
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
    expectTypeOf({} as "ninjaServiceId" | "weaponServiceId").toEqualTypeOf<Parameters<typeof typesafeInject>[0]>();
  })

  it("should return type-safe service with _get method", () => {
    const typesafeContainer = createTypesafeContainer(serviceConfig);
    const ninjaServiceId = "ninjaServiceId" as ServiceIdentifier<Ninja>;

    expect(typesafeContainer._get(ninjaServiceId).weapon.damage).toBe(10);
  })

  it("should handle named services", () => {
    class Shuriken implements Weapon {
      public readonly damage = 20;
    }

    @injectable()
    class AnotherNinja {
      constructor(
        @typesafeInject("weaponServiceId")
        @named("Shuriken")
        public readonly weapon: Weapon,
      ) { }
    }

    const anotherServiceConfig: TypesafeServiceConfig<Services> = {
      "ninjaServiceId": (bind) => bind().to(AnotherNinja),
      "weaponServiceId": (bind, _container) => {
        bind().to(Katana).whenNamed("Katana");
        bind().to(Shuriken).whenNamed("Shuriken");
      },
    }

    const typesafeContainer = createTypesafeContainer(anotherServiceConfig);

    expect(typesafeContainer.get("ninjaServiceId").weapon.damage).toBe(20);
    expect(typesafeContainer.get("weaponServiceId", { name: "Katana" }).damage).toBe(10);
    expect(typesafeContainer.get("weaponServiceId", { name: "Shuriken" }).damage).toBe(20);

    expect(() => typesafeContainer.get("weaponServiceId")).toThrow('No bindings found for service: "weaponServiceId".');
    expect(typesafeContainer.get("weaponServiceId", { optional: true, name: undefined })).toBeUndefined();
  })
})