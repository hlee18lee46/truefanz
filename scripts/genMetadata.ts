import fs from "fs";
import path from "path";

const OUT_DIR = "metadata/psg-ny-2025-01";

function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });

  // Example: 10 rows x 100 seats = 1,000 tickets
  const rows = 10;
  const seatsPerRow = 100;

  let count = 0;
  for (let r = 1; r <= rows; r++) {
    for (let s = 1; s <= seatsPerRow; s++) {
      const seatLabel = `A-${r}-${s}`;
      const obj = {
        name: `PSG vs ETH New Yorkers — ${seatLabel}`,
        description: `Game ticket for PSG vs ETH New Yorkers — Section A, Row ${r}, Seat ${s}`,
        image: "walrus://replace_with_seat_image_if_any",
        attributes: [
          { trait_type: "Section", value: "A" },
          { trait_type: "Row", value: r },
          { trait_type: "Seat", value: s },
          { trait_type: "Event", value: "PSG vs ETH New Yorkers" },
          { trait_type: "Venue", value: "NYC Arena" },
          { trait_type: "Date", value: "2025-01-15" }
        ],
      };

      const file = path.join(OUT_DIR, `${seatLabel}.json`);
      fs.writeFileSync(file, JSON.stringify(obj, null, 2));
      count++;
    }
  }

  console.log(`Wrote ${count} metadata files under ${OUT_DIR}`);
}

main();