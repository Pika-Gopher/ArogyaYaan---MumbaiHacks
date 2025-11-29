"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { AlertTriangle, CheckCircle, ArrowRight, Settings } from "lucide-react";

export interface SolutionCardProps {
  id: string;
  title: string;                  
  urgency: "critical" | "warning" | "info" | "success";
  summary: string;                
  recommendation: string;        
  automation: string;             
  problemSection?: React.ReactNode;
  solutionSection?: React.ReactNode;
}

const urgencyColors: Record<SolutionCardProps["urgency"], string> = {
  critical: "bg-red-600 text-white",
  warning: "bg-amber-500 text-white",
  info: "bg-blue-500 text-white",
  success: "bg-green-600 text-white",
};

const urgencyIcon: Record<SolutionCardProps["urgency"], React.ReactNode> = {
  critical: <AlertTriangle className="h-5 w-5" />,
  warning: <AlertTriangle className="h-5 w-5" />,
  info: <Settings className="h-5 w-5" />,
  success: <CheckCircle className="h-5 w-5" />,
};

export default function SolutionCard({
  id,
  title,
  urgency,
  summary,
  recommendation,
  automation,
  problemSection,
  solutionSection,
}: SolutionCardProps) {
  return (
    <Card className="w-full border border-gray-300 rounded-xl shadow-sm hover:shadow-md transition">
      
      {/* HEADER */}
      <CardHeader className="space-y-3">
        <div className="flex items-center gap-3">
          <Badge className={`${urgencyColors[urgency]} flex items-center gap-2 px-3 py-1`}>
            {urgencyIcon[urgency]}
            {urgency.toUpperCase()}
          </Badge>
          <h2 className="text-lg font-semibold">{title}</h2>
        </div>
      </CardHeader>

      {/* BODY */}
      <CardContent className="space-y-6">

        {problemSection}

        {solutionSection}

        {!problemSection && !solutionSection && (
          <>
            <section>
              <h3 className="font-medium text-gray-700 mb-1">
                Prediction
              </h3>
              <p className="text-sm text-gray-600">{summary}</p>
            </section>

            <section>
              <h3 className="font-medium text-gray-700 mb-1">
                Recommendation
              </h3>
              <p className="text-sm text-gray-600">
                {recommendation}
              </p>
            </section>

            <section>
              <h3 className="font-medium text-gray-700 mb-1">
                Automation Action
              </h3>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <ArrowRight className="h-4 w-4" />
                <span>{automation}</span>
              </div>
            </section>
          </>
        )}
      </CardContent>
    </Card>
  );
}