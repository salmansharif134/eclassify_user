"use client";
import Cart from "@/components/PagesComponent/Cart/Cart";
import Checkauth from "@/HOC/Checkauth";

const CartPage = Checkauth(Cart);

export default CartPage;
