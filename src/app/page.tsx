import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Projects from "@/components/Projects";
import Process from "@/components/Process";
import About from "@/components/About";
import Skills from "@/components/Skills";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col selection:bg-indigo-500 selection:text-white">
      <Header />
      <main className="flex-1 space-y-4 md:space-y-12">
        <Hero />
        <Projects />
        <Process />
        <About />
        <Skills />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}
