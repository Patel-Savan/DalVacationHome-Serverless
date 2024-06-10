import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-gray-100 py-8">
      <div className="container mx-auto flex justify-around">
        <div className="w-1/3">
          <h3 className="text-lg font-semibold mb-4">Support</h3>
          <ul>
            <li className="mb-2"><a href="#" className="text-gray-600 hover:underline">FAQs</a></li>
            <li className="mb-2"><a href="#" className="text-gray-600 hover:underline">Contact Us</a></li>
            <li className="mb-2"><a href="#" className="text-gray-600 hover:underline">Accessibility Support</a></li>
            <li className="mb-2"><a href="#" className="text-gray-600 hover:underline">Report an Issue</a></li>
            <li className="mb-2"><a href="#" className="text-gray-600 hover:underline">Team Members</a></li>
          </ul>
        </div>
        <div className="w-1/3">
          <h3 className="text-lg font-semibold mb-4">Policies</h3>
          <ul>
            <li className="mb-2"><a href="#" className="text-gray-600 hover:underline">Booking Policy</a></li>
            <li className="mb-2"><a href="#" className="text-gray-600 hover:underline">Privacy Policy</a></li>
            <li className="mb-2"><a href="#" className="text-gray-600 hover:underline">Terms of Service</a></li>
            <li className="mb-2"><a href="#" className="text-gray-600 hover:underline">Code of Conduct</a></li>
          </ul>
        </div>
        <div className="w-1/3">
          <h3 className="text-lg font-semibold mb-4">Social Media</h3>
          <ul>
            <li className="mb-2"><a href="#" className="text-gray-600 hover:underline">Facebook</a></li>
            <li className="mb-2"><a href="#" className="text-gray-600 hover:underline">Twitter</a></li>
            <li className="mb-2"><a href="#" className="text-gray-600 hover:underline">Instagram</a></li>
            <li className="mb-2"><a href="#" className="text-gray-600 hover:underline">LinkedIn</a></li>
          </ul>
        </div>
      </div>
      <div className="container mx-auto text-center mt-8">
        <p className="text-gray-600">&copy; {new Date().getFullYear()} DalVacation Home</p>
      </div>
    </footer>
  );
}

export default Footer;
