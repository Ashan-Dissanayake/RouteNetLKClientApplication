
export interface ApiResponse<T, IsArray extends boolean = true> {
  data: IsArray extends true ? T[] : T;
  meta: Record<string, any>;
  links: Record<string, string>;
}
