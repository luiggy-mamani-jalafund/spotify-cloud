import GenreDetailPage from "@/components/music/GenreDetailPage";
import NavBar from "@/components/navigation/NavBar";

const Page = ({ params }: { params: any }) => {
    return (
        <div>
            <NavBar />
            <GenreDetailPage genreId={params.id} />
        </div>
    );
};

export default Page;
