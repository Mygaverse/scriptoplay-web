import Navbar from '../shared/header/NavbarLanding';
import Footer from '../shared/footer/FooterLanding';

export default function Layout({ children }) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
      <Footer />
    </>
  );
}
