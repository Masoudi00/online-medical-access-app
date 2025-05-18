import { CarouselDemo } from "./components/CarouselDemo";
import Hero  from "./components/Hero";
import Footer from "./components/Footer";
export default function Home() {
  return (
    <> 
      <Hero/>
      <CarouselDemo/>
      <Footer
        mainMessage="Get fast medical access to medical attention "
        secondaryMessage="one click away"   
        button="Contact us"
        href="/Contact"
      />

    </>
  );
}
