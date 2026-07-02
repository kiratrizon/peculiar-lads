import Seeder from "Illuminate/Database/Seeder.ts";
import User, { UserSchema } from "App/Models/User.ts";
import FirstClass from "App/Models/FirstClass.ts";
import SecondClass from "App/Models/SecondClass.ts";
import ThirdClass from "App/Models/ThirdClass.ts";
import NSTGLevel from "App/Models/NSTGLevel.ts";
import Admin from "App/Models/Admin.ts";
import Character, { CharacterSchema } from "App/Models/Character.ts";
import { Hash } from "Illuminate/Support/Facades/index.ts";
import { Str } from "Illuminate/Support/index.ts";

// Dragon Nest SEA
export default class DatabaseSeeder extends Seeder {
  public async run() {
    const newClasses = [
      {
        icon: "⚔️",
        character_data: {
          Warrior: {
            Swordsmaster: ["Gladiator", "Moonlord"],
            Mercenary: ["Barbarian", "Destroyer"],
            Knight: ["Grandmaster", "Mystic Knight"],
            Avenger: ["Dark Avenger"],
          },
        },
      },
      {
        icon: "🏹",
        character_data: {
          Archer: {
            Acrobat: ["Tempest", "Windwalker"],
            "Bow Master": ["Sniper", "Artillery"],
            Hunter: ["Silver Hunter"],
          },
        },
      },
      {
        icon: "🔮",
        character_data: {
          Sorceress: {
            "Elemental Lord": ["Saleana", "Elestra"],
            "Force User": ["Majesty", "Smasher"],
            Mara: ["Black Mara"],
          },
        },
      },
      {
        icon: "✨",
        character_data: {
          Cleric: {
            Paladin: ["Guardian", "Crusader"],
            Priest: ["Saint", "Inquisitor"],
            Heretic: ["Arch Heretic"],
          },
        },
      },
      {
        icon: "🔧",
        character_data: {
          Academic: {
            Engineer: ["Shooting Star", "Gear Master"],
            Alchemist: ["Adept", "Physician"],
            Mechanic: ["Ray Mechanic"],
          },
        },
      },
      {
        icon: "🎪",
        character_data: {
          Kali: {
            Screamer: ["Soul Eater", "Dark Summoner"],
            Dancer: ["Blade Dancer", "Spirit Dancer"],
            Oracle: ["Oracle Elder"],
          },
        },
      },
      {
        icon: "🗡️",
        character_data: {
          Assassin: {
            Chaser: ["Raven", "Ripper"],
            Bringer: ["Light Fury", "Abyss Walker"],
            Phantom: ["Bleed Phantom"],
          },
        },
      },
      {
        icon: "🌸",
        character_data: {
          Lancea: {
            Piercier: ["Flurry", "Sting Breezer"],
            Knightess: ["Avalanche", "Randgrid"],
            Plaga: ["Vena Plaga"],
          },
        },
      },
      {
        icon: "🤖",
        character_data: {
          Machina: {
            Patrona: ["Ruina", "Defensio"],
            Launcher: ["Impactor", "Buster"],
            Beastia: ["Beastia Reina"],
          },
        },
      },
      {
        icon: "🛡️",
        character_data: {
          Vandar: {
            "Treasure Hunter": ["Duelist", "Trickster"],
            Wanderer: ["Revenant", "Maverick"],
          },
        },
      },
      {
        icon: "🌀",
        character_data: {
          Arta: {
            Artist: ["Ringmaster"],
          },
        },
      },
    ];

    let created3rdClass = 0;
    for (const newClass of newClasses) {
      const characterData = newClass.character_data;
      const icon = newClass.icon;
      for (const [mainClass, secondaryClasses] of Object.entries(
        characterData,
      )) {
        const firstClassData = await FirstClass.create({
          name: mainClass,
          icon,
        });

        const id = firstClassData.getKey();
        for (const [secondaryClass, thirdClasses] of Object.entries(
          secondaryClasses,
        )) {
          const secondClassData = await SecondClass.create({
            first_class_id: id,
            name: secondaryClass,
          });
          for (const thirdClass of thirdClasses as string[]) {
            await ThirdClass.create({
              second_class_id: secondClassData.getKey(),
              name: thirdClass,
            });
            created3rdClass++;
          }
        }
      }
    }
    const nstgLevelData = [
      { name: "Ascension", code: "ASC", limit: 6 },
      { name: "Dimension", code: "DM", limit: 14 },
    ];

    for (const { name, code, limit } of nstgLevelData) {
      for (let i = 1; i <= limit; i++) {
        await NSTGLevel.create({
          name: `${name} ${i}`,
          code: `${code}-${i}`,
        });
      }
    }

    const adminFactory = await Admin.factory();
    adminFactory.count(1);
    await adminFactory.create();

    if ((config("app.env", "development") as string) !== "production") {
      const userFactory = await User.factory();
      userFactory.count(10);
      const createdUser = await userFactory.create();

      // check if createdUser is iterable
      if (isArray(createdUser)) {
        const characterFactory = await Character.factory();
        for (const user of createdUser) {
          const userId = user.getKey();
          characterFactory.count(1);
          await characterFactory.create({
            user_id: userId,
            main: true,
          });
        }
      }
    } else {
      const myData: UserSchema = {
        name: "Throy",
        discord: "kiratriz",
        email: "tgenesistroy@gmail.com",
        password: Hash.make(env("MY_PASS", "")),
        deactivated: false,
        api_token: "1-" + Str.random(32),
      };
      const userQuery = await User.create(myData);
      const myCharacter = await Character.create({
        ign: "Eirazyn",
        main: true,
        user_id: userQuery.getKey(),
        third_class_id: 4,
        nstg_level_id: 12,
      } as CharacterSchema);
    }
  }
}
