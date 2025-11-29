"use client";
import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function TransportRulesForm() {
  const [bikeCapacity, setBikeCapacity] = useState(10);
  const [vanCapacity, setVanCapacity] = useState(500);
  const [bikeCost, setBikeCost] = useState(5);
  const [vanCost, setVanCost] = useState(18);

  return (
    <Card className="p-6 rounded-2xl shadow-md bg-white border border-gray-200 mt-6">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Logistics & Transport Rules — Mumbai Region</CardTitle>
      </CardHeader>

      <CardContent className="space-y-10">
        {/* Bike Capacity */}
        <div>
          <Label className="text-base font-medium">Max Bike Capacity (kg)</Label>
          <p className="text-sm text-gray-500">
            Used for short-distance deliveries between Mumbai PHCs (e.g., Dadar → Wadala, Sion → Kurla).
          </p>
          <Input
            type="number"
            min={1}
            className="mt-3 w-40"
            value={bikeCapacity}
            onChange={(e) => setBikeCapacity(Number(e.target.value))}
          />
        </div>

        {/* Van Capacity */}
        <div className="pt-6 border-t border-gray-200">
          <Label className="text-base font-medium">Max Van Capacity (kg)</Label>
          <p className="text-sm text-gray-500">
            Suitable for bulk movement of medicines across larger zones (e.g., Chembur ↔ Mulund, Andheri ↔ Kurla).
          </p>
          <Input
            type="number"
            min={10}
            className="mt-3 w-40"
            value={vanCapacity}
            onChange={(e) => setVanCapacity(Number(e.target.value))}
          />
        </div>

        {/* Cost Configuration */}
        <div className="pt-6 border-t border-gray-200">
          <Label className="text-base font-medium">Cost per km Configuration</Label>
          <p className="text-sm text-gray-500">
            Helps AI choose optimal mode based on operational cost.
          </p>

          <div className="mt-4 space-y-4">
            <div>
              <Label className="text-sm font-medium">Bike Cost per km (₹)</Label>
              <Input
                type="number"
                min={1}
                value={bikeCost}
                onChange={(e) => setBikeCost(Number(e.target.value))}
                className="mt-2 w-40"
              />
            </div>

            <div>
              <Label className="text-sm font-medium">Van Cost per km (₹)</Label>
              <Input
                type="number"
                min={1}
                value={vanCost}
                onChange={(e) => setVanCost(Number(e.target.value))}
                className="mt-2 w-40"
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}