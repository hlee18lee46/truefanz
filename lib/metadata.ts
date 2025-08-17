// Simple IPFS → HTTP
export function ipfsToHttp(uri: string) {
    if (!uri) return uri;
    if (uri.startsWith("ipfs://")) {
      const gateway = process.env.NEXT_PUBLIC_IPFS_GATEWAY || "https://ipfs.io/ipfs/";
      return uri.replace("ipfs://", gateway);
    }
    return uri;
  }
  
  export type TicketMeta = {
    name?: string;
    image?: string;
    description?: string;
    // optional well-known fields
    date?: string;
    time?: string;
    venue?: string;
    location?: string;
    section?: string;
    row?: string;
    seats?: string;
    eventDate?: string; // ISO date you want for isEventSoon
  };
  
  // Works with common ERC721 JSON and "attributes" schema
  export function parsePSGMetadata(j: any): TicketMeta {
    if (!j || typeof j !== "object") return {};
  
    const out: TicketMeta = {
      name: j.name,
      image: j.image,
      description: j.description,
      date: j.date ?? j.attributes?.find((a: any)=>/date/i.test(a?.trait_type))?.value,
      time: j.time ?? j.attributes?.find((a: any)=>/time/i.test(a?.trait_type))?.value,
      venue: j.venue ?? j.attributes?.find((a: any)=>/venue/i.test(a?.trait_type))?.value,
      location: j.location ?? j.attributes?.find((a: any)=>/location|city/i.test(a?.trait_type))?.value,
      section: j.section ?? j.attributes?.find((a: any)=>/section/i.test(a?.trait_type))?.value,
      row: j.row ?? j.attributes?.find((a: any)=>/^row$/i.test(a?.trait_type))?.value,
      seats: j.seats ?? j.attributes?.find((a: any)=>/seat/i.test(a?.trait_type))?.value,
    };
  
    // derive eventDate if a YYYY-MM-DD is present in date
    const isoDate = (out.date && /^\d{4}-\d{2}-\d{2}/.test(out.date)) ? out.date : undefined;
    if (isoDate) out.eventDate = isoDate;
  
    // normalize ipfs image
    if (out.image) out.image = ipfsToHttp(out.image);
  
    return out;
  }
  
  export async function fetchTokenMetadata(tokenURI: string): Promise<TicketMeta> {
    const url = ipfsToHttp(tokenURI);
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) throw new Error(`fetch meta ${res.status}`);
    const json = await res.json();
    return parsePSGMetadata(json);
  }