export interface Dvhc {
  id: number;
  code: string;
  parentCode: string;
  name: string;
  slug: string;
  type: string;
  nameWithType: string;
  path: string;
  pathWithType: string;
}

export interface DvhcQueryParams {
  parentCode: string;
}
