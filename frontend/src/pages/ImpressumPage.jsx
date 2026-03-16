import React from 'react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { SEOHead } from '../components/SEOHead';
import { useLanguage } from '../lib/LanguageContext';

export default function ImpressumPage() {
  const { language } = useLanguage();

  return (
    <div data-testid="impressum-page" className="min-h-screen bg-obsidian">
      <SEOHead page="impressum" customTitle="Impressum - Headlock Headquarter" customDescription="Impressum des Catch- und Wrestlingverein Hannover e.V." />
      <Navbar />
      <main className="pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <h1 className="font-teko text-4xl sm:text-5xl text-gold uppercase mb-12">Impressum</h1>

        <div className="space-y-10 font-rajdhani text-gray-300 leading-relaxed">
          {/* Angaben */}
          <section>
            <h2 className="font-teko text-2xl text-white uppercase mb-4">
              {language === 'de' ? 'Angaben gemäß § 5 TMG' : 'Information according to § 5 TMG'}
            </h2>
            <p>Catch- und Wrestlingverein Hannover e.V.</p>
            <p>Steinförder Str. 57</p>
            <p>29323 Wietze</p>
            <p className="mt-3">Telefon: 0152 / 29295990</p>
          </section>

          {/* Vertreten durch */}
          <section>
            <h2 className="font-teko text-2xl text-white uppercase mb-4">
              {language === 'de' ? 'Vertreten durch' : 'Represented by'}
            </h2>
            <p>Vorsitzender 1: Jörg Vespermann</p>
            <p>Vorsitzender 2: Mario Barfigo</p>
            <p>Kassenwart: Andrea Raschke</p>
          </section>

          {/* Kontakt */}
          <section>
            <h2 className="font-teko text-2xl text-white uppercase mb-4">
              {language === 'de' ? 'Kontakt' : 'Contact'}
            </h2>
            <p>E-Mail: <a href="mailto:info@wrestlingschule.de" className="text-gold hover:text-gold-glow transition-colors">info@wrestlingschule.de</a></p>
          </section>

          {/* Registereintrag */}
          <section>
            <h2 className="font-teko text-2xl text-white uppercase mb-4">
              {language === 'de' ? 'Registereintrag' : 'Registration'}
            </h2>
            <p>{language === 'de' ? 'Eintragung im Vereinsregister.' : 'Registered in the association register.'}</p>
            <p>Registergericht: Amtsgericht Hannover</p>
            <p>Registernummer: VR 203485</p>
          </section>

          {/* Finanzamt */}
          <section>
            <h2 className="font-teko text-2xl text-white uppercase mb-4">
              {language === 'de' ? 'Finanzamt' : 'Tax Authority'}
            </h2>
            <p>{language === 'de' ? 'Zuständige Finanzbehörde' : 'Responsible tax authority'}: Hannover</p>
            <p>Amtsgericht Hannover</p>
            <p>Vereinsregister-Nr.: VR 203485</p>
          </section>

          {/* Bildernachweis */}
          <section>
            <h2 className="font-teko text-2xl text-white uppercase mb-4">
              {language === 'de' ? 'Bildernachweis' : 'Image Credits'}
            </h2>
            <p>Torsten Thiele-Hirte (TTH) / Dat Alex / Andreas Barthel</p>
          </section>

          {/* Inhalt nach § 55 */}
          <section>
            <h2 className="font-teko text-2xl text-white uppercase mb-4">
              {language === 'de' ? 'Inhalt nach § 55 Abs. 2 RStV' : 'Content according to § 55 Abs. 2 RStV'}
            </h2>
            <p>Catch- und Wrestlingverein Hannover e.V. (i.G.)</p>
            <p>Steinförder Str. 57</p>
            <p>29323 Wietze</p>
          </section>

          {/* Haftung für Inhalte */}
          <section>
            <h2 className="font-teko text-2xl text-white uppercase mb-4">
              {language === 'de' ? 'Haftung für Inhalte' : 'Liability for Content'}
            </h2>
            <p>
              {language === 'de'
                ? 'Als Diensteanbieter sind wir gemäß § 7 Abs.1 TMG für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 TMG sind wir als Diensteanbieter jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde Informationen zu überwachen oder nach Umständen zu forschen, die auf eine rechtswidrige Tätigkeit hinweisen.'
                : 'As a service provider, we are responsible for our own content on these pages in accordance with general legislation pursuant to § 7 (1) TMG. However, according to §§ 8-10 TMG, we are not obligated to monitor transmitted or stored third-party information or to investigate circumstances indicating illegal activity.'}
            </p>
            <p className="mt-3">
              {language === 'de'
                ? 'Verpflichtungen zur Entfernung oder Sperrung der Nutzung von Informationen nach den allgemeinen Gesetzen bleiben hiervon unberührt. Eine diesbezügliche Haftung ist jedoch erst ab dem Zeitpunkt der Kenntnis einer konkreten Rechtsverletzung möglich. Bei Bekanntwerden von entsprechenden Rechtsverletzungen werden wir diese Inhalte umgehend entfernen.'
                : 'Obligations to remove or block the use of information under general law remain unaffected. However, liability in this regard is only possible from the time of knowledge of a specific legal violation. Upon becoming aware of such violations, we will remove this content immediately.'}
            </p>
          </section>

          {/* Haftung für Links */}
          <section>
            <h2 className="font-teko text-2xl text-white uppercase mb-4">
              {language === 'de' ? 'Haftung für Links' : 'Liability for Links'}
            </h2>
            <p>
              {language === 'de'
                ? 'Unser Angebot enthält Links zu externen Webseiten Dritter, auf deren Inhalte wir keinen Einfluss haben. Deshalb können wir für diese fremden Inhalte auch keine Gewähr übernehmen. Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber der Seiten verantwortlich. Die verlinkten Seiten wurden zum Zeitpunkt der Verlinkung auf mögliche Rechtsverstöße überprüft.'
                : 'Our website contains links to external third-party websites over whose content we have no influence. Therefore, we cannot assume any liability for this external content. The respective provider or operator of the pages is always responsible for the content of the linked pages. The linked pages were checked for possible legal violations at the time of linking.'}
            </p>
            <p className="mt-3">
              {language === 'de'
                ? 'Rechtswidrige Inhalte waren zum Zeitpunkt der Verlinkung nicht erkennbar. Eine permanente inhaltliche Kontrolle der verlinkten Seiten ist jedoch ohne konkrete Anhaltspunkte einer Rechtsverletzung nicht zumutbar. Bei Bekanntwerden von Rechtsverletzungen werden wir derartige Links umgehend entfernen.'
                : 'Illegal content was not apparent at the time of linking. However, permanent content monitoring of linked pages is not reasonable without concrete evidence of a legal violation. Upon becoming aware of legal violations, we will remove such links immediately.'}
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
