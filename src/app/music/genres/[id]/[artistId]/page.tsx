import ArtistDetailPage from "@/components/music/ArtistDetailPage";
import NavBar from "@/components/navigation/NavBar";

const Page = ({ params }: { params: any }) => {
    return (
        <div>
            <NavBar />
            <ArtistDetailPage artistId={params.artistId} />
        </div>
    );
};

export default Page;
