import { SWNRBaseActor } from "../base-actor";

export class SWNRNPCActor extends SWNRBaseActor<"npc"> {
  prepareBaseData(): void {
    const e = this.data.data.effort;
    e.value = e.max - e.current - e.scene - e.day;
  }

  _onCreate(
    data: Parameters<SWNRBaseActor["_onCreate"]>[0],
    options: Parameters<SWNRBaseActor["_onCreate"]>[1],
    userId: string
  ): void {
    super._onCreate(data, options, userId);
    if (this.data["items"]["length"] || game.userId !== userId) return;

    this.createEmbeddedDocuments("Item", [
      {
        name: game.i18n.localize("swnr.npc.unarmed"),
        type: "weapon",
        data: {
          ammo: {
            type: "none",
          },
          damage: "d2",
        },
        img: "icons/equipment/hand/gauntlet-armored-leather-grey.webp",
      },
    ]);
  }
}

export const document = SWNRNPCActor;
export const name = "npc";
