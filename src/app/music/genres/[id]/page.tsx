import GenreDetailPage from "@/components/music/GenreDetailPage";

const Page = ({ params }: { params: any }) => {
    return <GenreDetailPage genreId={params.id} />;
};

export default Page;
