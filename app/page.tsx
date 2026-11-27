import Contact from "@/components/Contact";
import EnrollmentForm from "@/components/EnrollmentForm";
import Hero from "@/components/Hero";
import Plans from "@/components/Plans";
import UniformStore from "@/components/UniformStore";

export default function HomePage() {
  return (
    <>
      <Hero />
      <Plans />
      <UniformStore />
      <EnrollmentForm />
      <Contact />
    </>
  );
}
