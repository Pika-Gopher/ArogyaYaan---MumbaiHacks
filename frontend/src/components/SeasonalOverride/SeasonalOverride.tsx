"use client";
import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function SeasonalOverrideConfig() {
  const [monsoonMode, setMonsoonMode] = useState(false);
  const [watchlist, setWatchlist] = useState(["Dengue"]);
  const [newCondition, setNewCondition] = useState("");

  const addCondition = () => {
    if (!newCondition.trim()) return;
    setWatchlist([...watchlist, newCondition.trim()]);
    setNewCondition("");
  };

  const saveConfig = () => {
    // Trigger secured API call
    console.log({ monsoonMode, watchlist });
  };

  return (
    <Card className="p-6 rounded-2xl shadow-md bg-white border border-gray-200 mt-6">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Seasonal & Override Configuration — Mumbai Region</CardTitle>
      </CardHeader>

      <CardContent className="space-y-10">
        {/* Monsoon Mode */}
        <div className="flex items-center justify-between py-2">
          <div>
            <Label className="text-base font-medium">Monsoon Mode</Label>
            <p className="text-sm text-gray-500 w-80">
              When enabled, expected travel times across Mumbai (especially Kurla, Sion, Chembur) increase by ~50%.
            </p>
          </div>
          <Switch checked={monsoonMode} onCheckedChange={setMonsoonMode} />
        </div>

        {/* Epidemic Watchlist */}
        <div className="pt-6 border-t border-gray-200">
          <Label className="text-base font-medium">Epidemic Watchlist</Label>
          <p className="text-sm text-gray-500">
            Add high-alert conditions affecting Mumbai PHCs (e.g., Malaria, Dengue, H1N1).
          </p>

          <div className="mt-4 space-y-4">
            {watchlist.map((item, idx) => (
              <div key={idx} className="text-sm font-medium bg-gray-100 p-2 rounded-lg w-64">
                {item}
              </div>
            ))}

            <div className="flex gap-3 items-center mt-4">
              <Input
                value={newCondition}
                onChange={(e) => setNewCondition(e.target.value)}
                placeholder="Add new condition"
                className="w-64"
              />
              <Button onClick={addCondition}>Add</Button>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="pt-6 border-t border-gray-200 flex justify-end">
          <Button className="px-6 py-2 font-medium" onClick={saveConfig}>
            Save Configuration
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}