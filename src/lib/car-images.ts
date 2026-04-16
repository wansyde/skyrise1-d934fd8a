import audiA1Featured from "@/assets/cars/featured/audi-a1.webp";
import audiA2Featured from "@/assets/cars/featured/audi-a2.webp";
import astonMartinGreenFeatured from "@/assets/cars/featured/aston-martin-green.webp";
import astonMartinYellowFeatured from "@/assets/cars/featured/aston-martin-yellow.webp";
import maybachFeatured from "@/assets/cars/featured/maybach.webp";
import mercedesRedFeatured from "@/assets/cars/featured/mercedes-red.webp";
import bmwBlueFeatured from "@/assets/cars/featured/bmw-blue.webp";
import bmwPurpleFeatured from "@/assets/cars/featured/bmw-purple.webp";
import ferrariYellowFeatured from "@/assets/cars/featured/ferrari-yellow.webp";
import bentleyWhiteFeatured from "@/assets/cars/featured/bentley-white.webp";
import bentleyBlueFeatured from "@/assets/cars/featured/bentley-blue.webp";
import fordMustangFeatured from "@/assets/cars/featured/ford-mustang.webp";
import ferrariRomaFeatured from "@/assets/cars/featured/ferrari-roma.webp";
import cadillacCt5Featured from "@/assets/cars/featured/cadillac-ct5.webp";
import rangeRoverFeatured from "@/assets/cars/featured/range-rover.webp";
import lexusLcFeatured from "@/assets/cars/featured/lexus-lc.webp";
import mclarenArturaFeatured from "@/assets/cars/featured/mclaren-artura.webp";
import mclarenGtFeatured from "@/assets/cars/featured/mclaren-gt.webp";
import lexusEsFeatured from "@/assets/cars/featured/lexus-es.webp";
import teslaModelSFeatured from "@/assets/cars/featured/tesla-model-s.webp";

// Map car names to their correct featured images
const CAR_IMAGE_MAP: Record<string, string> = {
  "Audi A1 2025 Sportback Premium Edition": audiA1Featured,
  "Audi RS e-tron GT 2025 Performance": audiA2Featured,
  "Aston Martin DB12 Volante 2025": astonMartinGreenFeatured,
  "Aston Martin Vantage 2025 AMR": astonMartinYellowFeatured,
  "Mercedes-Maybach S680 2025 Edition": maybachFeatured,
  "Mercedes-AMG GT 63 S E Performance": mercedesRedFeatured,
  "BMW M4 Competition 2025 xDrive": bmwBlueFeatured,
  "BMW iX M60 2025 Electric SUV": bmwPurpleFeatured,
  "Ferrari 296 GTB 2025 Assetto Fiorano": ferrariYellowFeatured,
  "Bentley Continental GT 2025 Speed": bentleyWhiteFeatured,
  "Bentley Continental GT 2025 Azure": bentleyBlueFeatured,
  "Ford Mustang GT 2025 Premium": fordMustangFeatured,
  "Ferrari Roma 2025 Spider": ferrariRomaFeatured,
  "Cadillac CT5-V 2025 Blackwing": cadillacCt5Featured,
  "Range Rover Autobiography 2025 LWB": rangeRoverFeatured,
  "Lexus LC 500 2025 Inspiration Series": lexusLcFeatured,
  "McLaren Artura 2025 Spider": mclarenArturaFeatured,
  "McLaren GT 2025 Luxe": mclarenGtFeatured,
  "Lexus ES 350 2025 Ultra Luxury": lexusEsFeatured,
  "Tesla Model S 2025 Plaid": teslaModelSFeatured,
};

/**
 * Get the correct car image by car name.
 * Falls back to the first available image if no match found.
 */
export function getCarImage(carName: string): string {
  return CAR_IMAGE_MAP[carName] || audiA1Featured;
}
