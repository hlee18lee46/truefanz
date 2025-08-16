"use client";

import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { PSG_NFT_ADDRESS, psgNftAbi, getProvider, ipfsToHttp } from "@/lib/psgNft";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type Ticket = {
  id: number;
  owner: string;
  name?: string;
  description?: string;
  image?: string;
  seat?: string;
  loading: boolean;
  error?: string;
};

export default function TicketsGrid() {
  const [tickets, setTickets] = useState<Ticket[]>(
    Array.from({ length: 20 }, (_, i) => ({ id: i, owner: "", loading: true }))
  );

  useEffect(() => {
    (async () => {
      try {
        const provider = getProvider();
        const contract = new ethers.Contract(PSG_NFT_ADDRESS, psgNftAbi, provider);

        const results = await Promise.all(
          tickets.map(async (t) => {
            try {
              const [uri, owner] = await Promise.all([
                contract.tokenURI(t.id),
                contract.ownerOf(t.id),
              ]);
              const metaUrl = ipfsToHttp(uri);
              const meta = await fetch(metaUrl).then((r) => r.json()).catch(() => ({} as any));

              // try to infer seat from metadata or filename
              const seatFromAttrs =
                Array.isArray(meta?.attributes)
                  ? (meta.attributes.find((a: any) => a.trait_type === "Seat")?.value ??
                     meta.attributes.find((a: any) => a.trait_type === "seatLabel")?.value)
                  : undefined;
              const seatFromName = typeof meta?.name === "string" ? meta.name.split("#")[1]?.trim() : undefined;

              return {
                ...t,
                owner,
                name: meta?.name ?? `PSG Ticket #${t.id}`,
                description: meta?.description ?? "",
                image: meta?.image ? ipfsToHttp(meta.image) : undefined,
                seat: seatFromAttrs || seatFromName,
                loading: false,
              } as Ticket;
            } catch (e: any) {
              return { ...t, error: e?.message ?? "load error", loading: false } as Ticket;
            }
          })
        );

        setTickets(results);
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);

  return (
    <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
      {tickets.map((t) => (
        <Card key={t.id} className="overflow-hidden">
          {t.image ? (
            <img src={t.image} alt={t.name ?? `Ticket #${t.id}`} className="w-full aspect-video object-cover" />
          ) : (
            <div className="w-full aspect-video bg-muted flex items-center justify-center text-muted-foreground">
              No image
            </div>
          )}
          <CardHeader>
            <CardTitle>{t.name ?? `Ticket #${t.id}`}</CardTitle>
            <CardDescription>
              {t.seat ? `Seat: ${t.seat}` : `Token ID: ${t.id}`}
              <br />
              Owner: {t.owner ? `${t.owner.slice(0,6)}…${t.owner.slice(-4)}` : "—"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {t.loading ? (
              <div className="text-sm text-muted-foreground">Loading…</div>
            ) : t.error ? (
              <div className="text-sm text-red-500">Error: {t.error}</div>
            ) : (
              <div className="flex gap-2">
                <Button asChild size="sm" variant="outline">
                  <a
                    href={`https://testnet.chiliscan.com/token/${PSG_NFT_ADDRESS}?a=${t.id}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    View on Explorer
                  </a>
                </Button>
                {t.image && (
                  <Button asChild size="sm" variant="secondary">
                    <a href={t.image} target="_blank" rel="noreferrer">
                      View Image
                    </a>
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}