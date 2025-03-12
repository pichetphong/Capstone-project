'use client';

import Image from 'next/image';
import { Button } from '../components/ui/button';
import Link from 'next/link';
import { useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';

export default function Home() {
  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
    });
  }, []);

  return (
    <section className="relative py-20 px-6 text-center rounded-2xl">
      <div className="container mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold mb-6" data-aos="fade-up">
          เริ่มต้นการวางแผนมื้ออาหารของคุณ
        </h1>
        <p
          className="text-xl font-light mb-8 max-w-3xl mx-auto"
          data-aos="fade-up"
          data-aos-delay="200"
        >
          วางแผนมื้ออาหารของคุณได้ง่ายๆ กับเครื่องมือที่ใช้เทคโนโลยี AI
          ในการช่วยจัดการแผนมื้ออาหาร
          ช่วยให้คุณจัดการมื้ออาหารได้อย่างมีประสิทธิภาพที่เหมาะสมกับไลฟ์สไตล์ของคุณ
          ทั้งเพื่อสุขภาพและเวลาของคุณ
        </p>

        <Button variant="" size="lg" className="mb-8" data-aos="zoom-in">
          <Link href="/planmeals">เริ่มใช้งาน</Link>
        </Button>

        <div className="mt-10" data-aos="fade-up" data-aos-delay="400">
          <Image
            src="/images/l2.jpg"
            alt="Healthy food items"
            width={900}
            height={500}
            className="rounded-xl shadow-lg mx-auto"
          />
        </div>

        <div className="mt-16" data-aos="fade-up">
          <h2 className="text-3xl font-semibold mb-4">ทำไมถึงต้องเลือกเรา?</h2>
          <p className="text-lg mb-6 max-w-2xl mx-auto">
            เครื่องมือวางแผนมื้ออาหารของเราช่วยให้การทานอาหารที่ดีต่อสุขภาพเป็นเรื่องง่าย
            ไม่ว่าคุณจะต้องการลดน้ำหนัก, เพิ่มกล้ามเนื้อ
            หรือแค่ทานอาหารให้มีประโยชน์มากขึ้น
            เครื่องมือของเราจะช่วยให้คุณจัดการทุกอย่างได้ง่ายขึ้น
          </p>
        </div>
      </div>
    </section>
  );
}
