export type MakeNullish<TObject extends Record<any, any>> = {
  [TKey in keyof TObject]?: TObject[TKey] | null | undefined;
};

export type CommonResponse<T = unknown> = MakeNullish<{
  status: number;
  message: string;
  data: T;
}>;
