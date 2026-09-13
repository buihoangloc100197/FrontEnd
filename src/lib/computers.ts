export type ComputerRecord = {
  id: number;
  name: string;
  room: string;
  specs: string | null;
  status: string;
  created_at: string | null;
};

export function normalizeComputerRecord(raw: Partial<ComputerRecord> | null | undefined): ComputerRecord {
  return {
    id: Number(raw?.id ?? 0),
    name: String(raw?.name ?? "").trim(),
    room: String(raw?.room ?? "").trim(),
    specs: raw?.specs ?? null,
    status: String(raw?.status ?? "available").trim() || "available",
    created_at: raw?.created_at ?? null,
  };
}

export function normalizeComputerList(rawList: Array<Partial<ComputerRecord> | null | undefined> = []): ComputerRecord[] {
  return rawList.map((item) => normalizeComputerRecord(item)).filter((item) => item.id > 0 && item.name && item.room);
}
