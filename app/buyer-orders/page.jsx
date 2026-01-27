"use client";
import BuyerOrders from "@/components/PagesComponent/BuyerOrders/BuyerOrders";
import Checkauth from "@/HOC/Checkauth";

const BuyerOrdersPage = Checkauth(BuyerOrders);

export default BuyerOrdersPage;
