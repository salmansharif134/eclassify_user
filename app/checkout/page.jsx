"use client";
import Checkout from "@/components/PagesComponent/Checkout/Checkout";
import Checkauth from "@/HOC/Checkauth";

const CheckoutPage = Checkauth(Checkout);

export default CheckoutPage;
