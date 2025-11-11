import { Outlet } from "react-router-dom";
import { AppHeader } from "@/components/client/AppHeader";
import { useState } from "react";

function Layout() {
  const [searchTerm, setSearchTerm] = useState<string>("");
  return (
    <div>
      <AppHeader />
      <Outlet context={[searchTerm, setSearchTerm]} />
    </div>
  );
}

export default Layout;
