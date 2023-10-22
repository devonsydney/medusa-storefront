import { GetStaticPaths, GetStaticProps } from "next";
import { ParsedUrlQuery } from "querystring";
import { useRouter } from "next/router";
import { dehydrate, QueryClient } from "@tanstack/react-query"
import { getCategoryHandles } from "@lib/util/get-category-handles"
import { fetchCollectionData, fetchRegionsData, fetchCategoryData } from "@lib/hooks/use-layout-data"

interface Params extends ParsedUrlQuery {
  handle: string[];
}

const CategoryPage = ({ categoryData }: { categoryData: LayoutCategory }) => {
  const router = useRouter();
  const { handle } = router.query;

  const isParentCategory = handle.length === 1;

  return (
    <div>
      {isParentCategory ? (
        // Render parent category page
        <div>
          This is the category page for {categoryData.name}. Here are the children categories:
          {categoryData?.category_children?.map((child) => (
            <div key={child.title}>
              <a href={`/${handle[0]}/${child.handle}`}>{child.name}</a>
            </div>
          ))}
          <div>
            Here is the category data:
            { JSON.stringify(categoryData) }
          </div>
        </div>
      ) : (
        // Render subcategory page
        <div>
          This is the subcategory page for `{handle.join("/")}`.
          <div>
            Here is the category data:
            { JSON.stringify(categoryData) }
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryPage

export const getStaticPaths: GetStaticPaths<Params> = async () => {
  const handles = await getCategoryHandles()
  const paths = handles.map((handle) => ({ params: { handle } }))

  return {
    paths,
    fallback: false,
  };
};

export const getStaticProps: GetStaticProps = async (context) => {
  const handle = context.params?.handle as string[];
  const queryClient = new QueryClient()
  
  // prefetch common params
  await queryClient.prefetchQuery(["regions"], () => fetchRegionsData())
  await queryClient.prefetchQuery(["navigation_collections"], () => fetchCollectionData())
  await queryClient.prefetchQuery(["navigation_categories"], () => fetchCategoryData(2))

  // grab the navigation_categories data
  const navigationCategories = queryClient.getQueryData<any>(["navigation_categories"])
  // filter the navigation_categories data by handle
  const categoryData = handle.length === 1
  ? navigationCategories.find((category) => category.handle === handle[0])
  : navigationCategories
      .find((category) => category.handle === handle[0])
      ?.category_children.find((child) => child.handle === handle[1]);

  if (!categoryData) {
    return {
      props: {
        notFound: true,
      },
    }
  }

  return {
    props: {
      categoryData,
      dehydratedState: JSON.parse(JSON.stringify(dehydrate(queryClient))),
      notFound: false,
    },
  }
}
