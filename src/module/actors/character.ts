import { calculateStats } from "../utils";
import { SWNRBaseItem } from "../base-item";
import { SWNRBaseActor } from "../base-actor";

export class SWNRCharacterActor extends SWNRBaseActor<"character"> {
  getRollData(): this["data"]["data"] {
    this.data._source.data;
    const data = super.getRollData();
    // data.itemTypes = <SWNRCharacterData["itemTypes"]>this.itemTypes;
    return data;
  }

  prepareBaseData(): void {
    const data = this.data.data;
    calculateStats(data.stats);
    data.systemStrain.max =
      data.stats.con.base + data.stats.con.boost - data.systemStrain.permanent;
    if (!data.save) data.save = {};
    const save = data.save;
    const base = 16 - data.level.value;
    save.physical = Math.max(
      1,
      base - Math.max(data.stats.str.mod, data.stats.con.mod)
    );
    save.evasion = Math.max(
      1,
      base - Math.max(data.stats.dex.mod, data.stats.int.mod)
    );
    save.mental = Math.max(
      1,
      base - Math.max(data.stats.wis.mod, data.stats.cha.mod)
    );
    save.luck = Math.max(1, base);
  }
  prepareDerivedData(): void {
    const data = this.data.data;
    // AC
    const armor = <SWNRBaseItem<"armor">[]>(
      this.items.filter((i) => i.data.type === "armor" && i.data.data.use)
    );
    const shields = armor.filter((i) => i.data.data.shield);
    const baseAc = Math.max(
      data.baseAc,
      ...armor.map(
        (i) =>
          i.data.data.ac +
          (shields.filter((s) => s.id !== i.id).length !== 0 ? 1 : 0)
      )
    );
    data.ac = baseAc + data.stats.dex.mod;
    // effort
    const psychicSkills = <SWNRBaseItem<"skill">[]>(
      this.items.filter(
        (i) =>
          i.data.type === "skill" &&
          i.data.data.source.toLocaleLowerCase() ===
            game.i18n.localize("swnr.skills.labels.psionic").toLocaleLowerCase()
      )
    );
    const effort = data.effort;
    effort.max =
      Math.max(
        1,
        1 +
          Math.max(data.stats.con.mod, data.stats.wis.mod) +
          Math.max(0, ...psychicSkills.map((i) => i.data.data.rank))
      ) + effort.bonus;
    effort.value = effort.max - effort.current - effort.scene - effort.day;
    //encumbrance
    if (!data.encumbrance)
      data.encumbrance = {
        ready: { max: 0, value: 0 },
        stowed: { max: 0, value: 0 },
      };
    const encumbrance = data.encumbrance;
    encumbrance.ready.max = Math.floor(data.stats.str.total / 2);
    encumbrance.stowed.max = data.stats.str.total;
    const inventory = <SWNRBaseItem<"item" | "armor" | "weapon">[]>(
      this.items.filter(
        (i) => i.type === "item" || i.type === "weapon" || i.type === "armor"
      )
    );
    const itemInvCost = function (
      i: SWNRBaseItem<"item" | "armor" | "weapon">
    ): number {
      let itemSize = 1;
      if (i.data.type === "item") {
        const itemData = i.data.data;
        const bundle = itemData.bundle;
        itemSize = Math.ceil(
          itemData.quantity / (bundle.bundled ? bundle.amount : 1)
        );
      }
      return itemSize * i.data.data.encumbrance;
    };
    encumbrance.ready.value = inventory
      .filter((i) => i.data.data.location === "readied")
      .map(itemInvCost)
      .reduce((i, n) => i + n, 0);
    encumbrance.stowed.value = inventory
      .filter((i) => i.data.data.location === "stowed")
      .map(itemInvCost)
      .reduce((i, n) => i + n, 0);
  }
}

// canvas.tokens.controlled[0].actor.update({ data: { effort: { bonus: 0, value: 0, scene: 0, day: 0 } } })
export const document = SWNRCharacterActor;
export const name = "character";
