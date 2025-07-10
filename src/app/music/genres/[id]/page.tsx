import GenreDetailPage from "@/components/music/GenreDetailPage";
import NavBar from "@/components/navigation/NavBar";

const Page = async (props: { params: Promise<any> }) => {
    const params = await props.params;
    return (
        <div>
            <NavBar />
            <GenreDetailPage genreId={params.id} />
        </div>
    );
};

export default Page;
