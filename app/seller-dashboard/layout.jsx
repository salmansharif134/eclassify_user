"use client";

import Checkauth from "@/HOC/Checkauth";
import SellerHubLayout from "@/components/SellerHub/SellerHubLayout";

const ProtectedSellerHubLayout = Checkauth(({ children }) => (
  <SellerHubLayout>{children}</SellerHubLayout>
));

export default ProtectedSellerHubLayout;
