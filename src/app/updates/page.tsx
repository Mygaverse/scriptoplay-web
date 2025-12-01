
import { Fragment } from 'react/jsx-runtime';

import NavbarLanding from '@/components/shared/header/NavbarLanding';
import FooterLanding from '@/components/shared/footer/FooterLanding';
import ChangeLogs from '@/components/updates/ChangeLogs';


export default function Home() {
  return (
    <Fragment>
      <NavbarLanding />
      <main className="relative min-h-screen bg-black py-50 m-0">
        <ChangeLogs />
      </main>
      <FooterLanding />
    </Fragment>
    
  );
}