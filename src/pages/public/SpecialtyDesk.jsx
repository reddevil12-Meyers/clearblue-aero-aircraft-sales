import { getDesk } from "@/lib/specialtyDesks";
import DeskPage from "@/components/specialty/DeskPage";

export default function SpecialtyDesk({ slug }) {
  const desk = getDesk(slug);
  if (!desk) return null;
  return <DeskPage desk={desk} />;
}