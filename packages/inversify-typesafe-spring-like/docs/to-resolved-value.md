# Reusing one instance with `toResolvedValue`

Use `toResolvedValue` when one implementation must be exposed through multiple bean keys without creating multiple instances. Bind the concrete implementation once, then derive each additional bean from the resolved dependency.

```ts
import {
  ApplicationContext,
  BeanConfig,
} from "inversify-typesafe-spring-like";

interface Stay {
  id: number;
  name: string;
}

interface StayQueryPort {
  findById(id: number): Promise<Stay | undefined>;
}

interface StayCommandPort {
  save(stay: Stay): Promise<Stay>;
}

class StayPersistenceAdapter implements StayQueryPort, StayCommandPort {
  private readonly stays = new Map<number, Stay>();

  async findById(id: number): Promise<Stay | undefined> {
    return this.stays.get(id);
  }

  async save(stay: Stay): Promise<Stay> {
    this.stays.set(stay.id, stay);
    return stay;
  }
}

type Beans = {
  StayQueryPort: StayQueryPort;
  StayCommandPort: StayCommandPort;
};

const beanConfig: BeanConfig<Beans> = {
  StayQueryPort: (bind) => bind().to(StayPersistenceAdapter),
  StayCommandPort: (bind) =>
    bind().toResolvedValue(
      (queryPort) => queryPort as StayCommandPort,
      ["StayQueryPort"],
    ),
};

const applicationContext = ApplicationContext(beanConfig);
const queryPort = applicationContext.get("StayQueryPort");
const commandPort = applicationContext.get("StayCommandPort");

console.log(queryPort === commandPort); // true
```

The dependency array is resolved before the transform function runs. The transform function receives those resolved values and returns the value for the new bean key. Use this for aliases, derived values, or a single adapter that fulfills multiple interfaces. Keep the cast localized to the transform only when TypeScript cannot infer that the resolved implementation satisfies the second interface.
