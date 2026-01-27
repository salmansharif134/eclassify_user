"use client";
import BuyerOrderDetail from "@/components/PagesComponent/BuyerOrders/BuyerOrderDetail";
import Checkauth from "@/HOC/Checkauth";

const BuyerOrderDetailPage = Checkauth(BuyerOrderDetail);

export default BuyerOrderDetailPage;
