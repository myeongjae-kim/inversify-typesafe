import { beforeEach, describe, expect, expectTypeOf, it } from "vitest";
import { TypesafeServiceConfig } from "../../../src";
import { injectTypesafe } from "../../../tests/dependency-inversion.test";
import { ApplicationContext, returnAutowired } from "../src";

// https://inversify.io/docs/introduction/dependency-inversion/
interface Weapon {
  damage: number;
}

class Katana implements Weapon {
  public static creationCount = 0;

  constructor() {
    Katana.creationCount++;
  }

  public readonly damage: number = 10;
}

export const { Autowired } = returnAutowired<keyof Services>()

class Ninja {
  public static creationCount = 0;

  constructor(
    @Autowired("weaponServiceId") // compile error if a parameter value is not a key of Services
    public readonly weapon: Weapon,
  ) {
    Ninja.creationCount++;
  }
}

export type Services = {
  "ninjaServiceId": Ninja; // class
  "weaponServiceId": Weapon; // interface
};

export const serviceConfig: TypesafeServiceConfig<Services> = {
  "ninjaServiceId": Ninja,
  "weaponServiceId": Katana, // compile error if not compatible with Weapon
};

describe("Dependency Inversion Test", () => {
  beforeEach(() => {
    Ninja.creationCount = 0;
    Katana.creationCount = 0;
  })


  it("should return type-safe service", () => {
    const applicationContext = new ApplicationContext(serviceConfig);

    expect(applicationContext.get("ninjaServiceId").weapon.damage).toBe(10);

    // inferred type test
    expectTypeOf(applicationContext.get("ninjaServiceId")).toEqualTypeOf<Ninja>();
    expectTypeOf(applicationContext.get("weaponServiceId")).toEqualTypeOf<Weapon>();

    // inferred parameter type test
    expectTypeOf({} as Parameters<typeof applicationContext.get>[0]).toEqualTypeOf<"ninjaServiceId" | "weaponServiceId">();
    expectTypeOf({} as Parameters<typeof injectTypesafe>[0]).toEqualTypeOf<"ninjaServiceId" | "weaponServiceId">();
  })

  it("should use Singleton scope as default", () => {
    const applicationContext = new ApplicationContext(serviceConfig);

    const times = 2;
    for (let i = 0; i < times; i++) {
      applicationContext.get("ninjaServiceId");
    }

    expect(Ninja.creationCount).toBe(1);
    expect(Katana.creationCount).toBe(1);
  })

  it("can override default scope", () => {
    const applicationContext = new ApplicationContext(serviceConfig, { defaultScope: "Request" });

    const times = 2;
    for (let i = 0; i < times; i++) {
      applicationContext.get("ninjaServiceId");
    }

    expect(Ninja.creationCount).toBe(times);
    expect(Katana.creationCount).toBe(times);
  })
})