import React from 'react';

const AboutUs = () => {
  return (
    <div className="min-h-screen p-6">
      <header className="text-center mb-12">
        <h1 className="text-3xl text-center mt-0 font-bold mb-3">About Us</h1>
        <p className="text-xl text-gray-600 mt-2">Your one-stop solution to find and drive your dream vehicle</p>
      </header>

      <section className="max-w-5xl mx-auto bg-white shadow-lg rounded-lg p-6 mb-12">
        <h2 className="text-3xl font-semibold text-gray-800 mb-4">Our Story</h2>
        <p className="text-lg text-gray-700 leading-relaxed mb-4">
          At AutoVista, we believe in making your vehicle search as easy and enjoyable as possible. With a rich history in the automotive industry, we have built a reputation for excellence by providing a user-friendly platform where you can find the perfect car or bike to suit your needs.
        </p>
        <p className="text-lg text-gray-700 leading-relaxed">
          Our team is dedicated to delivering a seamless experience from search to drive. We offer a comprehensive selection of vehicles, detailed listings, and intuitive search tools to ensure that you find exactly what you're looking for. Our commitment to quality and customer satisfaction drives everything we do.
        </p>
      </section>

      <section className="max-w-5xl mx-auto bg-white shadow-lg rounded-lg p-6 mb-12">
        <h2 className="text-3xl font-semibold text-gray-800 mb-4">Our Mission</h2>
        <p className="text-lg text-gray-700 leading-relaxed mb-4">
          Our mission is to simplify the car buying and selling process through innovation and exceptional service. We strive to connect buyers and sellers in a way that enhances their experience and builds lasting relationships.
        </p>
        <p className="text-lg text-gray-700 leading-relaxed">
          We are driven by our core values of integrity, transparency, and excellence. Our goal is to be the go-to platform for anyone looking to find and drive their dream vehicle with confidence and ease.
        </p>
      </section>

      {/* <section className="text-center">
        <h2 className="text-3xl font-semibold text-gray-800 mb-4">Meet the Team</h2>
        <div className="flex flex-wrap justify-center gap-6">
          <div className="bg-white shadow-lg rounded-lg p-6 max-w-xs">
            <img src="src/assets/team-member1.jpg" alt="Team Member 1" className="h-32 w-32 rounded-full mx-auto mb-4"/>
            <h3 className="text-xl font-semibold text-gray-800">John Doe</h3>
            <p className="text-gray-600">Founder & CEO</p>
          </div>
          <div className="bg-white shadow-lg rounded-lg p-6 max-w-xs">
            <img src="src/assets/team-member2.jpg" alt="Team Member 2" className="h-32 w-32 rounded-full mx-auto mb-4"/>
            <h3 className="text-xl font-semibold text-gray-800">Jane Smith</h3>
            <p className="text-gray-600">Head of Marketing</p>
          </div>
          <div className="bg-white shadow-lg rounded-lg p-6 max-w-xs">
            <img src="src/assets/team-member3.jpg" alt="Team Member 3" className="h-32 w-32 rounded-full mx-auto mb-4"/>
            <h3 className="text-xl font-semibold text-gray-800">Alice Johnson</h3>
            <p className="text-gray-600">Customer Support Lead</p>
          </div>
        </div>
      </section> */}
    </div>
  );
};

export default AboutUs;
