import useSeo from "@/hooks/useSeo";
import { HUB_CONTENT } from "@/lib/specialtyDesks";
import HouseDesksIndex from "@/components/public/HouseDesksIndex";

export default function SpecialtyDesks() {
  useSeo({ title: HUB_CONTENT.seoTitle, description: HUB_CONTENT.meta, path: "/specialty-desks" });

  return (
    <div className="bg-white w-full">
      <HouseDesksIndex headingLevel="h1" />
      <div className="pb-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-sm leading-relaxed text-gray-500">{HUB_CONTENT.footnote}</p>
        </div>
      </div>
    </div>
  );
}