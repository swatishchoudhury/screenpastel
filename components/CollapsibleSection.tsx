import type React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const CollapsibleSection = ({
  title,
  children,
  value,
}: {
  title: string;
  children: React.ReactNode;
  value: string;
}) => {
  return (
    <AccordionItem value={value}>
      <AccordionTrigger className="px-4 text-sm font-medium">
        {title}
      </AccordionTrigger>
      <AccordionContent className="px-4 pb-4">{children}</AccordionContent>
    </AccordionItem>
  );
};

export default CollapsibleSection;
