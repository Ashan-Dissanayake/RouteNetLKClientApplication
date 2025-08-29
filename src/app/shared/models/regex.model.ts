interface RegexModel {
  regex: RegExp;
  message: string;
}

export type Regex = Record<string, RegexModel>;
