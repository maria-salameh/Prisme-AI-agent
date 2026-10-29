import { after, before, describe, it } from "node:test";
import assert from "node:assert/strict";
import { demarrer } from "../../server/serveur.mjs";

const REPONSE_PAUSE =
  "Prisme : une pause de 10 minutes est prévue au milieu de chaque demi-journée.";

describe("le serveur et l'API", () => {
  let serveur;
  before(async () => {
    serveur = await demarrer({ port: 0 });
  });
  after(async () => {
    await serveur.fermer();
  });

  const poster = (corps) =>
    fetch(`${serveur.url}/api/chat`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: corps,
    });

  it("POST /api/chat répond la règle de mon mot-clé", async () => {
    const r = await poster(JSON.stringify({ message: "dis-moi pause svp" }));
    assert.equal(r.status, 200);
    assert.deepEqual(await r.json(), { reply: REPONSE_PAUSE });
  });

  it("POST /api/chat répond une phrase avec le nom de l'assistant sans règle", async () => {
    const r = await poster(JSON.stringify({ message: "zzz inconnu" }));
    assert.equal(r.status, 200);
    const { reply } = await r.json();
    assert.ok(reply.includes("Prisme"));
  });

  it("POST /api/chat refuse un message vide avec 400", async () => {
    const r = await poster(JSON.stringify({ message: "   " }));
    assert.equal(r.status, 400);
  });

  it("POST /api/chat refuse un message trop long et accepte la limite exacte", async () => {
    const limite = await poster(JSON.stringify({ message: "a".repeat(235) }));
    assert.equal(limite.status, 200);
    const trop = await poster(JSON.stringify({ message: "a".repeat(236) }));
    assert.equal(trop.status, 400);
  });

  it("POST /api/chat répond 400 sur un corps qui n'est pas du JSON, et le serveur continue", async () => {
    const r = await poster("pas du json");
    assert.equal(r.status, 400);
    const suite = await poster(JSON.stringify({ message: "pause" }));
    assert.equal(suite.status, 200);
  });

  it("GET /api/chat répond 405", async () => {
    const r = await fetch(`${serveur.url}/api/chat`);
    assert.equal(r.status, 405);
  });

  it("GET /version.json renvoie un SHA", async () => {
    const r = await fetch(`${serveur.url}/version.json`);
    assert.equal(r.status, 200);
    const { sha } = await r.json();
    assert.match(sha, /^[0-9a-f]{40}$/);
  });

  it("GET /api/health répond status ok", async () => {
    const r = await fetch(`${serveur.url}/api/health`);
    assert.equal(r.status, 200);
    assert.deepEqual(await r.json(), { status: "ok" });
  });
});
