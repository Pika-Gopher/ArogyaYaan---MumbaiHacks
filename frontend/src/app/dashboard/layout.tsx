import type { Metadata } from "next";
import "@/src/app/globals.css";
import "leaflet/dist/leaflet.css";
import Sidebar from "@/src/components/Sidebar/Sidebar";
import { I18nProvider } from "@/src/context/I18nContext";

export const metadata: Metadata = {
  title: "ArogyaYaan Dashboard",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
        <I18nProvider>
          <div className="flex h-screen w-screen overflow-hidden">

            {/* Sidebar */}
            <div className="hidden md:flex">
              <Sidebar />
            </div>

            {/* Main Panel */}
            <div className="flex flex-col flex-1 h-full overflow-y-auto">
              
              {/* Page Content */}
              <main className="p-6 md:p-8 max-w-[1500px] mx-auto w-full">
                {children}
              </main>

            </div>
          </div>
        </I18nProvider>
  );
}