// lib/psgMeta.ts
export const ipfsToHttp = (uri: string | undefined) =>
    !uri ? uri : uri.startsWith("ipfs://")
      ? (process.env.NEXT_PUBLIC_IPFS_GATEWAY || "https://ipfs.io/ipfs/") + uri.slice("ipfs://".length)
      : uri;
  
  type AnyObj = Record<string, any>;
  const getAttr = (meta: AnyObj, key: string) => {
    // 1) top-level field (case-insensitive)
    const direct = Object.keys(meta || {}).find(k => k.toLowerCase() === key.toLowerCase());
    if (direct) return meta[direct];
  
    // 2) attributes array: {trait_type, value} OR {type, value}
    const attrs: AnyObj[] = Array.isArray(meta?.attributes) ? meta.attributes : [];
    const found = attrs.find(a =>
      String(a?.trait_type ?? a?.type ?? "").toLowerCase() === key.toLowerCase()
    );
    return found?.value;
  };
  
  export function parseTicketMeta(meta: AnyObj, fallbackId: number) {
    const name = meta?.name || `PSG Ticket #${fallbackId}`;
    const image = ipfsToHttp(meta?.image);
    const date = getAttr(meta, "date");
    const time = getAttr(meta, "time");
    const venue = getAttr(meta, "venue");
    const location = getAttr(meta, "location");
    const section = getAttr(meta, "section");
    const row = getAttr(meta, "row");
    const seats = getAttr(meta, "seats") ?? getAttr(meta, "seat") ?? getAttr(meta, "seatLabel");
  
    // derive eventDate if an ISO-ish date exists
    const eventDate = getAttr(meta, "eventDate") ?? (/^\d{4}-\d{2}-\d{2}/.test(String(date)) ? date : undefined);
  
    return { name, image, date, time, venue, location, section, row, seats, eventDate, price: meta?.price };
  }