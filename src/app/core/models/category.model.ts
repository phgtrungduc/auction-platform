export interface AssetCategory {
  id: number;
  parentId: number | null;
  refId: string;
  name: string;
  code: string;
  displayOrder: number;
  isActive: boolean;
  children: AssetCategory[];
}

export interface LegalCategory {
  id: number;
  refId: string;
  name: string;
  code: string;
  displayOrder: number;
  isActive: boolean;
}

