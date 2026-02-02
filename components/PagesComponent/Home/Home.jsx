"use client";
import { useEffect, useState } from "react";
import AllItems from "./AllItems";
import FeaturedSections from "./FeaturedSections";
import { FeaturedSectionApi, sliderApi, patentsApi } from "@/utils/api";
import PatentCard from "@/components/Common/PatentCard";
import NoData from "@/components/EmptyStates/NoData";
import { getCurrentLangCode } from "@/redux/reducer/languageSlice";
import { useSelector } from "react-redux";
import { getCityData, getKilometerRange } from "@/redux/reducer/locationSlice";
import { getIsLoggedIn } from "@/redux/reducer/authSlice";
import OfferSliderSkeleton from "@/components/PagesComponent/Home/OfferSliderSkeleton";
import FeaturedSectionsSkeleton from "./FeaturedSectionsSkeleton";
import PopularCategories from "./PopularCategories";
import dynamic from "next/dynamic";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Package, FileText } from "lucide-react";

const OfferSlider = dynamic(() => import("./OfferSlider"), {
  ssr: false,
  loading: OfferSliderSkeleton,
});

const Home = () => {
  const KmRange = useSelector(getKilometerRange);
  const cityData = useSelector(getCityData);
  const currentLanguageCode = useSelector(getCurrentLangCode);
  const IsLoggedin = useSelector(getIsLoggedIn);
  const [IsFeaturedLoading, setIsFeaturedLoading] = useState(false);
  const [featuredData, setFeaturedData] = useState([]);
  const [Slider, setSlider] = useState([]);
  const [IsSliderLoading, setIsSliderLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("products"); // 'products' or 'patents'
  const [patentsData, setPatentsData] = useState([]);
  const [isPatentsLoading, setIsPatentsLoading] = useState(false);
  const allEmpty = featuredData?.every((ele) => ele?.section_data.length === 0);

  // Static slider images - MustangIP banners
  const staticSliderImages = [
    {
      id: 1,
      image: "/assets/SlidingImage-1a.jpg",
      href: "/",
      model_type: null,
    },
    {
      id: 2,
      image: "/assets/SlidingImage-1b.jpg",
      href: "/",
      model_type: null,
    },
    {
      id: 3,
      image: "/assets/SlidingImage-1c.png",
      href: "/free-evaluation",
      model_type: null,
    },
    {
      id: 4,
      image: "/assets/SlidingImage-1d.jpg",
      href: "/",
      model_type: null,
    },
  ];

  useEffect(() => {
    // Use static slider images directly
    setSlider(staticSliderImages);
    setIsSliderLoading(false);

    // Optional: Uncomment below if you want to fetch from API first, then fallback to static
    /*
    const fetchSliderData = async () => {
      try {
        const response = await sliderApi.getSlider();
        const data = response.data;
        // Use static images if API returns empty or use API data if available
        if (data?.data && data.data.length > 0) {
          setSlider(data.data);
        } else {
          // Fallback to static images
          setSlider(staticSliderImages);
        }
      } catch (error) {
        console.error("Error:", error);
        // On error, use static images
        setSlider(staticSliderImages);
      } finally {
        setIsSliderLoading(false);
      }
    };
    fetchSliderData();
    */
  }, []);

  useEffect(() => {
    const fetchFeaturedSectionData = async () => {
      setIsFeaturedLoading(true);
      try {
        const params = {};
        if (Number(KmRange) > 0 && (cityData?.areaId || cityData?.city)) {
          params.radius = KmRange;
          params.latitude = cityData.lat;
          params.longitude = cityData.long;
        } else {
          if (cityData?.areaId) {
            params.area_id = cityData.areaId;
          } else if (cityData?.city) {
            params.city = cityData.city;
          } else if (cityData?.state) {
            params.state = cityData.state;
          } else if (cityData?.country) {
            params.country = cityData.country;
          }
        }
        const response = await FeaturedSectionApi.getFeaturedSections(params);
        const { data } = response.data;
        setFeaturedData(data);
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setIsFeaturedLoading(false);
      }
    };
    fetchFeaturedSectionData();
  }, [cityData.lat, cityData.long, KmRange, currentLanguageCode]);

  useEffect(() => {
    const fetchPatents = async () => {
      if (activeTab === "patents") {
        setIsPatentsLoading(true);
        try {
          const response = await patentsApi.getPatents({ page: 1 });
          if (!response?.data?.error) {
            setPatentsData(response.data.data || []);
          }
        } catch (error) {
          console.error("Error fetching patents:", error);
        } finally {
          setIsPatentsLoading(false);
        }
      }
    };
    fetchPatents();
  }, [activeTab]);
  return (
    <>
      {/* Hide slider for logged-in users; show categories directly for clearer UI */}
      {!IsLoggedin && (IsSliderLoading ? (
        <OfferSliderSkeleton />
      ) : (
        Slider &&
        Slider.length > 0 && (
          <OfferSlider Slider={Slider} IsLoading={IsSliderLoading} />
        )
      ))}
      {/* Categories and Items Tabs - Products and Patents */}
      <div className="container mt-12">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2 mb-6">
            <TabsTrigger value="products" className="flex items-center gap-2">
              <Package size={18} />
              Products
            </TabsTrigger>
            <TabsTrigger value="patents" className="flex items-center gap-2">
              <FileText size={18} />
              Patents
            </TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="mt-0">
            <PopularCategories categoryType="products" />
            <div className="mt-12">
              <AllItems
                cityData={cityData}
                KmRange={KmRange}
                itemType="products"
              />
            </div>
          </TabsContent>

          <TabsContent value="patents" className="mt-0">
            <PopularCategories categoryType="patents" />
            <div className="mt-12">
              {isPatentsLoading ? (
                <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
                  {/* Simple skeleton loading state */}
                  {[...Array(8)].map((_, index) => (
                    <div key={index} className="h-64 bg-gray-100 rounded-2xl animate-pulse"></div>
                  ))}
                </div>
              ) : patentsData.length > 0 ? (
                <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
                  {patentsData.map((item) => (
                    <PatentCard key={item.id} item={item} />
                  ))}
                </div>
              ) : (
                <NoData name="patents" />
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {IsFeaturedLoading ? (
        <FeaturedSectionsSkeleton />
      ) : (
        <FeaturedSections
          featuredData={featuredData}
          setFeaturedData={setFeaturedData}
          allEmpty={allEmpty}
        />
      )}
    </>
  );
};

export default Home;
