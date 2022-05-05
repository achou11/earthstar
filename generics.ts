interface Thinger<
  NameType extends string,
  InputType extends InputBase<NameType>,
  OutputType extends OutputBase<NameType>,
> {
  name: NameType;
  create(input: InputType): OutputType;
}

interface InputBase<NameType> {
  name: NameType;
}

interface OutputBase<NameType> {
  name: NameType;
}

type NumberInput = {
  name: "Double number";
  number: number;
};

type NumberOutput = {
  name: "Double number";
  number: number;
};

const NumberThinger: Thinger<"Double number", NumberInput, NumberOutput> = {
  name: "Double number",
  create(input: NumberInput) {
    return {
      name: "Double number",
      number: input.number * 2,
    };
  },
};

type StringInput = {
  name: "Double string";
  string: string;
};

type StringOutput = {
  name: "Double string";
  string: string;
};

const StringThinger: Thinger<"Double string", StringInput, StringOutput> = {
  name: "Double string",
  create(input: StringInput) {
    return {
      name: "Double string",
      string: input.string + input.string,
    };
  },
};

//==================================================

const myThingers = [NumberThinger, StringThinger];

type NamesType<ThingerType> = [ThingerType] extends
  [Thinger<infer _NameType, infer _InputType, infer _OutputType>[]]
  ? ThingerType[number]["name"]
  : never;

type MyNames = NamesType<typeof myThingers>;

type InputsType<ThingerType> = [ThingerType] extends
  [Thinger<infer _NameType, infer InputType, infer _OutputType>[]] ? InputType
  : never;

type MyInputs = InputsType<typeof myThingers>;

type OutputsType<ThingerType> = [ThingerType] extends
  [Thinger<infer _NameType, infer _InputType, infer OutputType>[]] ? OutputType
  : never;

type MyOutputs = OutputsType<typeof myThingers>;

type LookupType<ThingerType> = [ThingerType] extends
  [Thinger<infer _NameType, infer _InputType, infer _OutputType>] ? {
  [NameType in ThingerType["name"]]: Extract<ThingerType, { name: NameType }>;
}
  : never;

type ExtractThingerFromInput<ThingerType, InputType extends { name: string }> =
  [ThingerType] extends
    [Thinger<infer _NameType, infer _InputType, infer _OutputType>]
    ? Extract<ThingerType, { name: InputType["name"] }>
    : never;

type ExtractWithFormat<ThingerType, FormatType extends string> =
  [ThingerType] extends
    [Thinger<infer _NameType, infer _InputType, infer _OutputType>]
    ? Extract<ThingerType, { name: FormatType }>
    : never;

type ExtractOutputType<ThingerType> = ThingerType extends
  Thinger<infer _NameType, infer _InputType, infer OutputType> ? OutputType
  : never;

type ExtractNameType<ThingerType> = ThingerType extends
  Thinger<infer NameType, infer _InputType, infer _OutputType> ? NameType
  : never;

type ExtractInputType<ThingerType> = ThingerType extends
  Thinger<infer _NameType, infer InputType, infer _OutputType> ? InputType
  : never;

type ExtractOutputFromInput<ThingerType, InputType extends { name: string }> =
  [ThingerType] extends
    [Thinger<infer _NameType, infer _InputType, infer _OutputType>]
    ? ExtractOutputType<Extract<ThingerType, { name: InputType["name"] }>>
    : never;

//=================================================
function makeLookup<
  NameType extends string,
  InputType extends InputBase<NameType>,
  OutputType extends OutputBase<NameType>,
  ThingerType extends Thinger<NameType, InputType, OutputType>,
>(
  thingers: ThingerType[],
): LookupType<ThingerType> {
  return thingers.reduce((acc, thinger) => {
    return { ...acc, [thinger.name]: thinger };
  }, {} as LookupType<ThingerType>);
}

const lookup = makeLookup(myThingers);

lookup["Double number"].create({ name: "Double number", number: 2 });

console.log(lookup);

// I need an object where the keys and the type of box are fixed to one another.

class User<
  NameType extends string,
  InputType extends InputBase<NameType>,
  OutputType extends OutputBase<NameType>,
  ThingerType extends Thinger<NameType, InputType, OutputType>,
> {
  private thingers: LookupType<ThingerType>;

  constructor(thingers: ThingerType[]) {
    this.thingers = makeLookup(thingers);
  }

  set<InputType extends ExtractInputType<ThingerType>>(
    input: InputType,
  ): ExtractOutputFromInput<ThingerType, InputType> {
    const name = input.name;

    const result = this.thingers[name].create(input);

    return result as ExtractOutputFromInput<ThingerType, InputType>;
  }
}

const myUser = new User(myThingers);

const res = myUser.set({ name: "Double number", number: 4 });
const res2 = myUser.set({ name: "Double string", string: "hi" });

console.log(res, res2);
