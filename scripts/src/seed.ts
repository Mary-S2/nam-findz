import {
  db,
  reportsTable,
  documentTypesTable,
  activityTable,
  messagesTable,
} from "@workspace/db";

async function seed() {
  console.log("Seeding namFindz...");

  await db.delete(messagesTable);
  await db.delete(activityTable);
  await db.delete(reportsTable);
  await db.delete(documentTypesTable);

  await db.insert(documentTypesTable).values([
    { slug: "national_id", label: "National ID Card" },
    { slug: "drivers_license", label: "Driver's License" },
    { slug: "passport", label: "Passport" },
    { slug: "birth_certificate", label: "Birth Certificate" },
    { slug: "academic_certificate", label: "Academic Certificate" },
    { slug: "work_permit", label: "Work Permit" },
    { slug: "wallet", label: "Wallet" },
    { slug: "phone", label: "Mobile Phone" },
    { slug: "keys", label: "Keys" },
    { slug: "bag", label: "Bag / Backpack" },
    { slug: "bank_card", label: "Bank Card" },
    { slug: "other", label: "Other" },
  ]);

  const reports = await db
    .insert(reportsTable)
    .values([
      {
        kind: "lost",
        status: "active",
        documentType: "national_id",
        title: "Namibian National ID lost in Windhoek CBD",
        nameOnDocument: "Tangeni Shilongo",
        description:
          "Lost my green national ID card in a brown wallet between Independence Avenue and Wernhil Park. Reward offered for safe return.",
        location: "Windhoek CBD, Independence Avenue",
        eventDate: "2026-04-22",
        contactName: "Tangeni S.",
        contactPhone: "+264 81 555 0142",
        contactEmail: "tangeni.s@example.na",
        photoUrl: null,
        reward: "N$300",
      },
      {
        kind: "found",
        status: "active",
        documentType: "drivers_license",
        title: "Driver's licence found near Maerua Mall taxi rank",
        nameOnDocument: "P. Nakale",
        description:
          "Picked up a Namibian driver's licence card on the pavement outside the Maerua Mall taxi rank on Saturday afternoon. Holding it safely.",
        location: "Maerua Mall, Windhoek",
        eventDate: "2026-04-20",
        contactName: "Helena",
        contactPhone: "+264 85 555 0199",
        contactEmail: null,
        photoUrl: null,
        reward: null,
      },
      {
        kind: "lost",
        status: "active",
        documentType: "passport",
        title: "South African passport missing after Eros flight",
        nameOnDocument: "Lerato Mokoena",
        description:
          "Travelled SA Airlink from Johannesburg to Eros on 18 April. Passport missing from carry-on by the time I reached the hotel. Urgently needed.",
        location: "Eros Airport, Windhoek",
        eventDate: "2026-04-18",
        contactName: "Lerato M.",
        contactPhone: null,
        contactEmail: "lerato.mokoena@example.com",
        photoUrl: null,
        reward: "N$1500",
      },
      {
        kind: "found",
        status: "active",
        documentType: "passport",
        title: "Passport handed in at Eros Airport information desk",
        nameOnDocument: "L. Mokoena",
        description:
          "A passport was handed in to the Eros information desk on Saturday evening. Owner can collect with proof of identity.",
        location: "Eros Airport information desk, Windhoek",
        eventDate: "2026-04-19",
        contactName: "Eros Info Desk",
        contactPhone: "+264 61 555 0188",
        contactEmail: "info@erosairport.example.na",
        photoUrl: null,
        reward: null,
      },
      {
        kind: "lost",
        status: "active",
        documentType: "phone",
        title: "Black Samsung phone lost in Katutura combi",
        nameOnDocument: null,
        description:
          "Black Samsung Galaxy A54, cracked top-left corner, in a clear silicone case. Slipped out in a combi from Katutura to town.",
        location: "Katutura to Windhoek CBD, combi route",
        eventDate: "2026-04-21",
        contactName: "Selma",
        contactPhone: "+264 81 555 0107",
        contactEmail: null,
        photoUrl: null,
        reward: "N$500",
      },
      {
        kind: "found",
        status: "matched",
        documentType: "wallet",
        title: "Brown leather wallet found at Wernhil Park",
        nameOnDocument: null,
        description:
          "Brown leather wallet containing cards and a small amount of cash, found near the food court entrance.",
        location: "Wernhil Park, Windhoek",
        eventDate: "2026-04-15",
        contactName: "Centre Management",
        contactPhone: "+264 61 555 0123",
        contactEmail: "lostandfound@wernhil.example.na",
        photoUrl: null,
        reward: null,
      },
      {
        kind: "lost",
        status: "claimed",
        documentType: "academic_certificate",
        title: "UNAM matric certificate copy lost in printing shop",
        nameOnDocument: "Johannes Amupolo",
        description:
          "Certified copy of grade 12 certificate left at a printing shop in town. Recovered with help from a kind shop assistant.",
        location: "Independence Avenue, Windhoek",
        eventDate: "2026-04-08",
        contactName: "Johannes A.",
        contactPhone: "+264 81 555 0166",
        contactEmail: null,
        photoUrl: null,
        reward: null,
      },
      {
        kind: "found",
        status: "active",
        documentType: "keys",
        title: "Bunch of car and house keys, Toyota fob",
        nameOnDocument: null,
        description:
          "Set of keys with a Toyota remote and a small leather tag with the initials 'KS'. Found in the parking lot.",
        location: "Grove Mall, Windhoek",
        eventDate: "2026-04-23",
        contactName: "Grove Mall Security",
        contactPhone: "+264 61 555 0144",
        contactEmail: null,
        photoUrl: null,
        reward: null,
      },
      {
        kind: "lost",
        status: "active",
        documentType: "bank_card",
        title: "FNB bank card lost at petrol station",
        nameOnDocument: "M. Nghipandulwa",
        description:
          "Blue FNB debit card. Last used at a petrol station in Pioneers Park. Card has already been blocked, just want it back to destroy.",
        location: "Pioneers Park, Windhoek",
        eventDate: "2026-04-24",
        contactName: "Maria",
        contactPhone: "+264 81 555 0133",
        contactEmail: null,
        photoUrl: null,
        reward: null,
      },
      {
        kind: "lost",
        status: "active",
        documentType: "bag",
        title: "Black laptop bag forgotten at Swakopmund taxi",
        nameOnDocument: null,
        description:
          "Black laptop sleeve with a Lenovo ThinkPad inside, plus a notebook with handwritten engineering notes. Forgotten in a taxi in Swakopmund.",
        location: "Swakopmund taxi rank",
        eventDate: "2026-04-19",
        contactName: "David",
        contactPhone: "+264 81 555 0151",
        contactEmail: "david.k@example.na",
        photoUrl: null,
        reward: "N$1000",
      },
      {
        kind: "found",
        status: "active",
        documentType: "national_id",
        title: "Green ID card found at Wernhil parking",
        nameOnDocument: "T. Shilongo",
        description:
          "Green Namibian ID card picked up in the lower parking deck. Looks recent. Holding for the owner.",
        location: "Wernhil Park parking, Windhoek",
        eventDate: "2026-04-23",
        contactName: "Wernhil Lost & Found",
        contactPhone: "+264 61 555 0188",
        contactEmail: null,
        photoUrl: null,
        reward: null,
      },
      {
        kind: "found",
        status: "active",
        documentType: "academic_certificate",
        title: "Folder of certified copies left at copy shop",
        nameOnDocument: null,
        description:
          "Plastic folder containing certified copies of school certificates and an ID. Left on the counter at the copy shop.",
        location: "Klein Windhoek copy shop",
        eventDate: "2026-04-22",
        contactName: "CopyZone Klein Windhoek",
        contactPhone: "+264 61 555 0177",
        contactEmail: null,
        photoUrl: null,
        reward: null,
      },
    ])
    .returning();

  const lerato = reports.find((r) => r.title.startsWith("South African passport"));
  const erosFound = reports.find((r) => r.title.startsWith("Passport handed in"));
  if (lerato && erosFound) {
    await db.insert(messagesTable).values([
      {
        reportId: lerato.id,
        authorName: "Eros Info Desk",
        body: "Hello, we have a passport handed in matching the name. Please come with another form of ID to collect.",
      },
      {
        reportId: lerato.id,
        authorName: "Lerato M.",
        body: "Thank you so much. I can be there tomorrow morning at 9am with my driver's licence.",
      },
    ]);
  }

  await db.insert(activityTable).values([
    {
      kind: "match",
      title: "Match found: Brown leather wallet at Wernhil Park",
      documentType: "wallet",
      location: "Wernhil Park, Windhoek",
    },
    {
      kind: "recovery",
      title: "Recovered: UNAM matric certificate copy",
      documentType: "academic_certificate",
      location: "Independence Avenue, Windhoek",
    },
    {
      kind: "new_report",
      title: "New found report: Folder of certified copies",
      documentType: "academic_certificate",
      location: "Klein Windhoek copy shop",
    },
    {
      kind: "new_report",
      title: "New lost report: FNB bank card",
      documentType: "bank_card",
      location: "Pioneers Park, Windhoek",
    },
    {
      kind: "new_report",
      title: "New found report: Bunch of car and house keys",
      documentType: "keys",
      location: "Grove Mall, Windhoek",
    },
  ]);

  console.log(`Seeded ${reports.length} reports.`);
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
