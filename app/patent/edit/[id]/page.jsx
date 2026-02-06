import EditPatent from "@/components/PagesComponent/EditPatent/EditPatent";

const Page = async ({ params }) => {
    const { id } = await params;
    return <EditPatent id={id} />;
};

export default Page;
