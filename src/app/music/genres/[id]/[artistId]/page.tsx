import ArtistDetailPage from "@/components/music/ArtistDetailPage";
import NavBar from "@/components/navigation/NavBar";

const Page = async (props: { params: Promise<any> }) => {
    const params = await props.params;
    return (
        <div>
            <NavBar />
            <ArtistDetailPage artistId={params.artistId} />
        </div>
    );
};

export default Page;
