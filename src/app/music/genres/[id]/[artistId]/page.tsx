import ArtistDetailPage from "@/components/music/ArtistDetailPage";

const Page = ({ params }: { params: any }) => {
    return <ArtistDetailPage artistId={params.artistId} />;
};

export default Page;
