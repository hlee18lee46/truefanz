import { ethers } from "ethers";

export type TicketPayload = {
  type: "TICKET_QR_V1";
  ticketId: string;
  owner: string;
  exp: number;        // unix seconds
  iat: number;        // unix seconds
  nonce: string;
};

export type TicketEnvelope = {
  payload: TicketPayload;
  signature: string;
};

// Recover signer from signed message (the payload string)
export function recoverSigner(envelope: TicketEnvelope) {
  const payloadStr = JSON.stringify(envelope.payload);
  return ethers.utils.verifyMessage(payloadStr, envelope.signature);
}

export function isExpired(envelope: TicketEnvelope) {
  const now = Math.floor(Date.now() / 1000);
  return envelope.payload.exp <= now;
}