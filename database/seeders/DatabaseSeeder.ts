import Seeder from "Illuminate/Database/Seeder.ts";
import User from "App/Models/User.ts";
import FirstClass from "App/Models/FirstClass.ts";
import SecondClass from "App/Models/SecondClass.ts";
import ThirdClass from "App/Models/ThirdClass.ts";

// Dragon Nest SEA
export default class DatabaseSeeder extends Seeder {
  public async run() {
    // const userFactory = await User.factory();
    // userFactory.count(10);
    // await userFactory.create();

    const classes = {
      Warrior: {
        Swordsmaster: ["Gladiator", "Moonlord"],
        Mercenary: ["Barbarian", "Destroyer"],
        Knight: ["Grandmaster", "Mystic Knight"],
        Avenger: ["Dark Avenger"],
      },
      Sorceress: {
        "Elemental Lord": ["Saleana", "Elestra"],
        "Force User": ["Majesty", "Smasher"],
        Mara: ["Black Mara"],
      },
      Archer: {
        Acrobat: ["Tempest", "Windwalker"],
        "Bow Master": ["Sniper", "Artillery"],
        Hunter: ["Silver Hunter"],
      },
      Cleric: {
        Paladin: ["Guardian", "Crusader"],
        Priest: ["Saint", "Inquisitor"],
        Heretic: ["Arch Heretic"],
      },
      Kali: {
        Screamer: ["Soul Eater", "Dark Summoner"],
        Dancer: ["Blade Dancer", "Spirit Dancer"],
        Oracle: ["Oracle Elder"],
      },
      Assassin: {
        Chaser: ["Raven", "Ripper"],
        Bringer: ["Light Fury", "Abyss Walker"],
        Phantom: ["Bleed Phantom"],
      },
      Academic: {
        Engineer: ["Shooting Star", "Gear Master"],
        Alchemist: ["Adept", "Physician"],
        Mechanic: ["Ray Mechanic"],
      },
      Machina: {
        Patrona: ["Ruina", "Defensio"],
        Launcher: ["Impactor", "Buster"],
        Beastia: ["Beastia Reina"],
      },
      Lancea: {
        Piercier: ["Flurry", "Sting Breezer"],
        Knightess: ["Avalanche", "Randgrid"],
        Plaga: ["Vena Plaga"],
      },
      Vandar: {
        "Treasure Hunter": ["Duelist", "Trickster"],
        Wanderer: ["Revenant", "Maverick"],
      },
      Arta: {
        Artist: ["Ringmaster"],
      },
    };

    for (const [mainClass, secondaryClasses] of Object.entries(classes)) {
      const firstClassData = await FirstClass.create({
        name: mainClass,
      });
      const id = firstClassData.getKey();
      for (const [secondaryClass, thirdClasses] of Object.entries(
        secondaryClasses,
      )) {
        const secondClassData = await SecondClass.create({
          first_class_id: id,
          name: secondaryClass,
        });
        const secondClassId = secondClassData.getKey();
        for (const thirdClass of thirdClasses) {
          await ThirdClass.create({
            second_class_id: secondClassId,
            name: thirdClass,
          });
        }
      }
    }
  }
}
