import Seeder from "Illuminate/Database/Seeder.ts";
import User from "App/Models/User.ts";

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
      },
      Assassin: {
        Chaser: ["Raven", "Ripper"],
        Bringer: ["Light Fury", "Abyss Walker"],
      },
      Lancea: {
        Lancer: ["Flurry", "Sting Breezer"],
        Gladiator: ["Highlander", "Knightess"],
      },
      Academic: {
        Engineer: ["Shooting Star", "Gear Master"],
        Alchemist: ["Adept", "Physician"],
      },
      Machina: {
        Patrona: ["Ruina", "Defensio"],
        Gearmaster: ["Artillery", "Liberator"],
      },
      Vandar: {
        Barbarian: ["Destroyer", "Rage Knight"],
        Avenger: ["Dark Avenger", "Nightmare"],
      },
      Arta: {},
    };

    // Output class tree structure
    console.log("Dragon Nest SEA Class Tree:");
    for (const [baseClass, secondClasses] of Object.entries(classes)) {
      console.log(`\n${baseClass}:`);
      for (const [secondClass, thirdClasses] of Object.entries(secondClasses)) {
        console.log(`  └─ ${secondClass}`);
        if (Array.isArray(thirdClasses) && thirdClasses.length > 0) {
          thirdClasses.forEach((thirdClass: string, index: number) => {
            const prefix = index === thirdClasses.length - 1 ? "└─" : "├─";
            console.log(`      ${prefix} ${thirdClass}`);
          });
        }
      }
    }
  }
}
