import { useDispatch, useSelector } from "react-redux";
import {
  CategoryData,
  getCatCurrentPage,
  getCatLastPage,
  getIsCatLoading,
  getIsCatLoadMore,
  setCatCurrentPage,
  setCateData,
  setCatLastPage,
  setIsCatLoading,
  setIsCatLoadMore,
} from "@/redux/reducer/categorySlice";
import { categoryApi } from "@/utils/api"; // assume you have this
import { useCallback, useEffect, useRef } from "react";
import {
  getHasFetchedCategories,
  setHasFetchedCategories,
} from "@/utils/getFetcherStatus";

const useGetCategories = (categoryType = null) => {
  const dispatch = useDispatch();
  const cateData = useSelector(CategoryData);
  const isCatLoading = useSelector(getIsCatLoading);
  const isCatLoadMore = useSelector(getIsCatLoadMore);
  const catLastPage = useSelector(getCatLastPage);
  const catCurrentPage = useSelector(getCatCurrentPage);
  const previousCategoryType = useRef(categoryType);

  // Clear categories and cache when categoryType changes
  useEffect(() => {
    if (previousCategoryType.current !== categoryType) {
      dispatch(setCateData([]));
      setHasFetchedCategories(false);
      previousCategoryType.current = categoryType;
    }
  }, [categoryType, dispatch]);

  const getCategories = useCallback(
    async (page = 1, force = false) => {
      // Skip cache check if forcing refresh or if categoryType changed
      if (page === 1 && !force && getHasFetchedCategories() && previousCategoryType.current === categoryType) {
        return;
      }
      if (page === 1) {
        dispatch(setIsCatLoading(true));
      } else {
        dispatch(setIsCatLoadMore(true));
      }
      try {
        // Map categoryType to API type parameter
        // 'products' -> 'products', 'patents' -> 'patents', null -> undefined (all categories)
        const typeParam = categoryType === 'products' || categoryType === 'patents' 
          ? categoryType 
          : undefined;
        
        const res = await categoryApi.getCategory({ page, type: typeParam });
        if (res?.data?.error === false) {
          const data = res?.data?.data?.data;
          if (page === 1) {
            dispatch(setCateData(data));
          } else {
            dispatch(setCateData([...cateData, ...data]));
          }
          dispatch(setCatCurrentPage(res?.data?.data?.current_page));
          dispatch(setCatLastPage(res?.data?.data?.last_page));
          setHasFetchedCategories(true);
        }
      } catch (error) {
        console.log(error);
      } finally {
        dispatch(setIsCatLoading(false));
        dispatch(setIsCatLoadMore(false));
      }
    },
    [cateData, dispatch, categoryType]
  );

  return {
    getCategories,
    isCatLoading,
    cateData,
    isCatLoadMore,
    catLastPage,
    catCurrentPage,
  };
};

export default useGetCategories;
