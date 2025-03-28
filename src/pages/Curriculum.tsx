
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CurriculumHero from "@/components/CurriculumHero";
import ChaptersList from "@/components/ChaptersList";

const Curriculum = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        <CurriculumHero />
        <ChaptersList />
      </main>
      <Footer />
    </div>
  );
};

export default Curriculum;
