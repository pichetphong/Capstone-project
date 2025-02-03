import Image from 'next/image';
import Header from '../components/navBar/Header';
import Footer from '../components/navBar/Footer';
import { Button } from '../components/ui/button';
import Link from 'next/link';

export default function Home() {
  return (
    <>
      {/* <Header /> */}
      {/* Hero Section */}
      <section className="container mx-auto px-6 text-center pt-20 pb-5 my-5 bg-maroon rounded-2xl">
        <h1 className="text-4xl md:text-6xl font-bold mb-6 text-white">
          One Tools For Doing it
          <br />
          <span className="text-white">All Together</span>
        </h1>

        <p className="text-xl font-thin text-white mb-8 max-w-3xl mx-auto">
          We enables you to achieve clarity and significant results on a large
          scale by linking tasks and workflows to the overarching objectives of
          the company
        </p>

        {/* <button
          className="inline-block px-8 py-3 bg-white text-blacky rounded-lg text-lg
          hover:bg-gray-300 transition-colors shadow-lg"
        >
          Get Started
        </button> */}
        <Button size="lg">
          <Link href="/signin">Get Started</Link>
        </Button>

        {/* Image Section */}
        <div className="mt-10">
          <Image
            src="/images/bluebox.png" // Path ไปยังรูปภาพในโฟลเดอร์ public
            alt="Healthy food items"
            width={800} // กำหนดความกว้าง
            height={300} // กำหนดความสูง
            className="rounded-lg mx-auto"
          />
        </div>
      </section>

      {/* Additional Sections */}
      {/* สามารถเพิ่มส่วนอื่นๆ ตามต้องการ */}
      {/* <Footer /> */}
    </>
  );
}
