import Image from 'next/image';
import Header from '../components/navBar/Header';
import Footer from '../components/navBar/Footer';
import { Button } from '../components/ui/button';
import Link from 'next/link';

export default function Home() {
  return (
    <>
      <section className="container mx-auto px-6 text-center pt-20 pb-5 my-5  rounded-2xl">
        <h1 className="text-4xl md:text-6xl font-bold mb-6 ">
          One Tools For Doing it
          <br />
          <span className="">All Together</span>
        </h1>

        <p className="text-xl font-thin  mb-8 max-w-3xl mx-auto">
          We enables you to achieve clarity and significant results on a large
          scale by linking tasks and workflows to the overarching objectives of
          the company
        </p>

        <Button variant="" size="lg">
          <Link href="/planmeals">Get Started</Link>
        </Button>

        <div className="mt-10">
          <Image
            src="/images/bluebox.png"
            alt="Healthy food items"
            width={800}
            height={300}
            className="rounded-lg mx-auto"
          />
        </div>
      </section>
    </>
  );
}
