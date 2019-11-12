import knex from "knexClient";
import getAvailabilities from "./getAvailabilities";

describe("getAvailabilities", () => {
  beforeEach(() => knex("events").truncate());

  describe("case 1", () => {
    it("test 1", async () => {
      const availabilities = await getAvailabilities(new Date("2014-08-10"));
      expect(availabilities.length).toBe(7);
      for (let i = 0; i < 7; ++i) {
        expect(availabilities[i].slots).toEqual([]);
      }
    });
  });

  describe("case 2", () => {
    beforeEach(async () => {
      await knex("events").insert([
        {
          kind: "appointment",
          starts_at: new Date("2014-08-11 10:30"),
          ends_at: new Date("2014-08-11 11:30")
        },
        {
          kind: "opening",
          starts_at: new Date("2014-08-04 09:30"),
          ends_at: new Date("2014-08-04 12:30"),
          weekly_recurring: true
        }
      ]);
    });

    it("test 1", async () => {
      const availabilities = await getAvailabilities(new Date("2014-08-10"));
      expect(availabilities.length).toBe(7);

      expect(String(availabilities[0].date)).toBe(
        String(new Date("2014-08-10"))
      );
      expect(availabilities[0].slots).toEqual([]);

      expect(String(availabilities[1].date)).toBe(
        String(new Date("2014-08-11"))
      );
      expect(availabilities[1].slots).toEqual([
        "9:30",
        "10:00",
        "11:30",
        "12:00"
      ]);

      expect(String(availabilities[6].date)).toBe(
        String(new Date("2014-08-16"))
      );
    });

    afterEach(async () => {
      await knex("events").del()
    });

  });

  describe("case 3", () => {
    beforeEach(async () => {
      await knex("events").insert([
        {
          kind: "appointment",
          starts_at: new Date("2014-08-11 10:30"),
          ends_at: new Date("2014-08-11 11:30")
        },
        {
          kind: "opening",
          starts_at: new Date("2018-08-04 09:30"),
          ends_at: new Date("2018-08-04 12:30"),
          weekly_recurring: true
        }
      ]);
    });

    it("test 1", async () => {
      const availabilities = await getAvailabilities(new Date("2014-08-10"));
      expect(availabilities.length).toBe(7);

      expect(String(availabilities[0].date)).toBe(
        String(new Date("2014-08-10"))
      );
      expect(availabilities[0].slots).toEqual([]);

      expect(String(availabilities[1].date)).toBe(
        String(new Date("2014-08-11"))
      );
      expect(availabilities[6].slots).toEqual([]);
    });

    afterEach(async () => {
      await knex("events").del()
    });
  });

  describe("case 4", () => {
    beforeEach(async () => {
      await knex("events").insert([
        {
          kind: "appointment",
          starts_at: new Date("2018-08-16 10:00"),
          ends_at: new Date("2018-08-16 11:30")
        },
        {
          kind: "appointment",
          starts_at: new Date("2018-08-15 10:00"),
          ends_at: new Date("2018-08-15 11:30")
        },
        {
          kind: "appointment",
          starts_at: new Date("2018-08-09 10:00"),
          ends_at: new Date("2018-08-09 11:00")
        },
        {
          kind: "appointment",
          starts_at: new Date("2018-08-17 10:30"),
          ends_at: new Date("2018-08-17 11:30")
        },
        {
          kind: "appointment",
          starts_at: new Date("2018-08-26 10:30"),
          ends_at: new Date("2018-08-26 11:30"),
          weekly_recurring: true
        },
        {
          kind: "opening",
          starts_at: new Date("2018-08-16 10:00"),
          ends_at: new Date("2018-08-16 12:30")
        },
        {
          kind: "opening",
          starts_at: new Date("2018-08-04 09:30"),
          ends_at: new Date("2018-08-04 12:30"),
          weekly_recurring: true
        },
        {
          kind: "opening",
          starts_at: new Date("2018-08-09 09:30"),
          ends_at: new Date("2018-08-09 12:30")
        },
        {
          kind: "opening",
          starts_at: new Date("2018-08-19 09:30"),
          ends_at: new Date("2018-08-19 12:30"),
          weekly_recurring: true
        },
        {
          kind: "opening",
          starts_at: new Date("2018-08-26 09:30"),
          ends_at: new Date("2018-08-26 12:30"),
          weekly_recurring: true
        }
      ]);
    
    });

    it("test 1", async () => {
      const availabilities = await getAvailabilities(new Date("2018-08-01"), 30);
      expect(availabilities.length).toBe(30);
      expect(availabilities[0].slots).toEqual([]);
      expect(String(availabilities[1].date)).toBe(
        String(new Date("2018-08-02"))
      );
      expect(String(availabilities[15].date)).toBe(
        String(new Date("2018-08-16"))
      );
      expect(availabilities[15].slots).toEqual([
        "11:30",
        "12:00"
      ]);
      expect(availabilities[25].slots).toEqual([
        "9:30",
        "10:00",
        "11:30",
        "12:00"
      ]);
    });

    it("test 2", async () => {
      const availabilities = await getAvailabilities(new Date("2018-07-15"), 15);
      expect(availabilities.length).toBe(15);
      availabilities.forEach(x => expect(x.slots).toEqual([]));
    });

    it("test 3", async () => {
      const availabilities = await getAvailabilities(new Date("2018-07-29"), 20);
      expect(availabilities.length).toBe(20);
      expect(availabilities[18].slots).toEqual([        
        "11:30",
        "12:00"
      ]);
    });

    afterEach(async () => {
      await knex("events").del()
    });
  });


});
