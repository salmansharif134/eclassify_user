"use client";
import SellerDashboard from "@/components/PagesComponent/SellerDashboard/SellerDashboard";
import Checkauth from "@/HOC/Checkauth";

const SellerDashboardPage = Checkauth(SellerDashboard);

export default SellerDashboardPage;
