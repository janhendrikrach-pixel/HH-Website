import React from 'react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { SEOHead } from '../components/SEOHead';

export default function PrivacyPage() {
  return (
    <div data-testid="privacy-page" className="min-h-screen bg-obsidian">
      <SEOHead page="datenschutz" customTitle="Datenschutz - Headlock Headquarter" customDescription="Datenschutzerklärung des Catch- und Wrestlingverein Hannover e.V." />
      <Navbar />
      <main className="pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <h1 className="font-teko text-4xl sm:text-5xl text-gold uppercase mb-12">Datenschutz</h1>

        <div className="space-y-10 font-rajdhani text-gray-300 leading-relaxed">
          {/* Einleitung */}
          <section>
            <h2 className="font-teko text-2xl text-white uppercase mb-4">Einleitung</h2>
            <p>
              Wir nehmen den Schutz der Daten der Nutzer unserer Website sehr ernst und verpflichten uns, die Informationen, die Nutzer uns in Verbindung mit der Nutzung unserer Website zur Verfügung stellen, zu schützen. Des Weiteren verpflichten wir uns, Ihre Daten gemäß anwendbarem Recht zu schützen und zu verwenden.
            </p>
            <p className="mt-3">
              Diese Datenschutzrichtlinie erläutert unsere Praktiken in Bezug auf die Erfassung, Verwendung und Offenlegung Ihrer Daten durch die Nutzung unserer digitalen Assets (die „Dienste"), wenn Sie über Ihre Geräte auf die Dienste zugreifen.
            </p>
            <p className="mt-3">
              Lesen Sie die Datenschutzrichtlinie bitte sorgfältig durch und stellen Sie sicher, dass Sie unsere Praktiken in Bezug auf Ihre Daten vollumfänglich verstehen, bevor Sie unsere Dienste verwenden. Wenn Sie diese Richtlinie gelesen, vollumfänglich verstanden haben und nicht mit unserer Vorgehensweise einverstanden sind, müssen Sie die Nutzung unserer digitalen Assets und Dienste einstellen. Mit der Nutzung unserer Dienste erkennen Sie die Bedingungen dieser Datenschutzrichtlinie an.
            </p>
            <p className="mt-3">In dieser Datenschutzrichtlinie erfahren Sie:</p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-gray-400">
              <li>Wie wir Daten sammeln</li>
              <li>Welche Daten wir erfassen</li>
              <li>Warum wir diese Daten erfassen</li>
              <li>An wen wir die Daten weitergeben</li>
              <li>Wo die Daten gespeichert werden</li>
              <li>Wie lange die Daten vorgehalten werden</li>
              <li>Wie wir die Daten schützen</li>
              <li>Wie wir mit Minderjährigen umgehen</li>
              <li>Aktualisierungen oder Änderungen der Datenschutzrichtlinie</li>
            </ul>
          </section>

          {/* Datenerhebung */}
          <section>
            <h2 className="font-teko text-2xl text-white uppercase mb-4">Datenerhebung, -nutzung und Weitergabe</h2>
            <p>Nachstehend erhalten Sie einen Überblick über die Daten, die wir erfassen können:</p>
            <ul className="list-disc list-inside mt-3 space-y-3 text-gray-400">
              <li>
                <span className="text-gray-300">Nicht personenbezogene Daten:</span> Nicht identifizierte und nicht identifizierbare Informationen, die Sie während des Registrierungsprozesses bereitstellen oder die über die Nutzung unserer Dienste gesammelt werden. Diese bestehen hauptsächlich aus technischen und zusammengefassten Nutzungsinformationen.
              </li>
              <li>
                <span className="text-gray-300">Personenbezogene Daten:</span> Individuell identifizierbare Informationen, über die man Sie identifizieren kann oder mit vertretbarem Aufwand identifizieren könnte. Dazu können Namen, E-Mail-Adressen, Adressen, Telefonnummern, IP-Adressen und mehr gehören.
              </li>
            </ul>

            <p className="mt-6">Wir können Ihre Daten für folgende Zwecke verwenden:</p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-gray-400">
              <li>Um unsere Dienste zur Verfügung zu stellen und zu betreiben</li>
              <li>Um unsere Dienste zu entwickeln, anzupassen und zu verbessern</li>
              <li>Um auf Ihr Feedback, Ihre Anfragen und Wünsche zu reagieren und Hilfe anzubieten</li>
              <li>Um Anforderungs- und Nutzungsmuster zu analysieren</li>
              <li>Für sonstige interne, statistische und Recherchezwecke</li>
              <li>Um unsere Möglichkeiten zur Datensicherheit und Betrugsprävention zu verbessern</li>
              <li>Um Verstöße zu untersuchen und unsere Bedingungen und Richtlinien durchzusetzen</li>
              <li>Um Ihnen Aktualisierungen, Nachrichten, Werbematerial und sonstige Informationen zu übermitteln</li>
            </ul>

            <p className="mt-6">
              Wir können Ihre Daten an unsere Dienstleister weitergeben, um unsere Dienste zu betreiben (z. B. Speicherung von Daten über Hosting-Dienste Dritter, Bereitstellung technischer Unterstützung usw.).
            </p>
            <p className="mt-3">
              Wir können Ihre Daten auch unter folgenden Umständen offenlegen: (i) um rechtswidrige Aktivitäten zu untersuchen, aufzudecken oder zu verhindern; (ii) um unsere Rechte auf Verteidigung zu begründen oder auszuüben; (iii) um unsere Rechte, unser Eigentum oder unsere persönliche Sicherheit sowie die Sicherheit unserer Nutzer oder der Öffentlichkeit zu schützen; (iv) im Falle eines Kontrollwechsels bei uns oder bei einem unserer verbundenen Unternehmen; (v) um Ihre Daten mittels befugter Drittanbieter zu erfassen, vorzuhalten und/oder zu verwalten; (vi) um mit Drittanbietern gemeinsam an der Verbesserung Ihres Nutzererlebnisses zu arbeiten.
            </p>
            <p className="mt-3">
              Ohne Ihre Zustimmung werden wir Ihre E-Mail-Adresse oder andere personenbezogenen Daten nicht an Werbeunternehmen oder Werbenetzwerke weitergeben.
            </p>
          </section>

          {/* Werbung und Cookies */}
          <section>
            <h2 className="font-teko text-2xl text-white uppercase mb-4">Werbung und Cookies</h2>
            <p>
              Wir können über unsere Dienste und unsere digitalen Assets Werbung bereitstellen, die auch auf Sie zugeschnitten sein kann, z. B. Anzeigen, die auf Ihrem jüngsten Surfverhalten auf Websites, Geräten oder Browsern basieren.
            </p>
            <p className="mt-3">
              Um diese Werbeanzeigen bereitzustellen, können wir Cookies und/oder JavaScript und/oder Webbeacons (einschließlich durchsichtiger GIFs) und/oder HTML5 Local Storage und/oder andere Technologien einsetzen. Wir können auch Dritte einsetzen, um gezielte Anzeigen zu schalten. Diese Drittanbieter-Cookies und andere Technologien unterliegen der spezifischen Datenschutzrichtlinie des jeweiligen Drittanbieters.
            </p>
          </section>

          {/* Datenspeicherung */}
          <section>
            <h2 className="font-teko text-2xl text-white uppercase mb-4">Datenspeicherung</h2>
            <p className="font-teko text-lg text-white mb-2">Nicht personenbezogene Daten</p>
            <p>
              Unsere Unternehmen sowie unsere vertrauenswürdigen Partner und Dienstanbieter sind auf der ganzen Welt ansässig. Zu den in dieser Datenschutzrichtlinie erläuterten Zwecken speichern und verarbeiten wir alle nicht personenbezogenen Daten in unterschiedlichen Rechtsordnungen.
            </p>
            <p className="font-teko text-lg text-white mt-4 mb-2">Personenbezogene Daten</p>
            <p>
              Personenbezogene Daten können in den Vereinigten Staaten, in Irland, Südkorea, Taiwan, Israel und soweit für die ordnungsgemäße Bereitstellung unserer Dienste und/oder gesetzlich vorgeschrieben in anderen Rechtsordnungen gepflegt, verarbeitet und gespeichert werden.
            </p>
          </section>

          {/* Kontrolle über Daten */}
          <section>
            <h2 className="font-teko text-2xl text-white uppercase mb-4">Kontrolle über Daten</h2>
            <p>
              Ohne Ihre Zustimmung werden wir Ihre E-Mail-Adresse oder andere personenbezogenen Daten nicht an Werbeunternehmen oder Werbenetzwerke weitergeben.
            </p>
          </section>

          {/* Datensicherheit */}
          <section>
            <h2 className="font-teko text-2xl text-white uppercase mb-4">Datensicherheit</h2>
            <p>
              Der Hosting-Dienst für unsere digitalen Assets stellt uns die Online-Plattform zur Verfügung, über die wir Ihnen unsere Dienste anbieten können. Ihre Daten können über die Datenspeicherung, Datenbanken und allgemeine Anwendungen unseres Hosting-Anbieters gespeichert werden. Er speichert Ihre Daten auf sicheren Servern hinter einer Firewall und bietet sicheren HTTPS-Zugriff auf die meisten Bereiche seiner Dienste.
            </p>
            <p className="mt-3">
              Alle von uns und unserem Hosting-Anbieter angebotenen Zahlungsmöglichkeiten halten die Vorschriften des PCI-DSS (Datensicherheitsstandard der Kreditkartenindustrie) ein.
            </p>
            <p className="mt-3">
              Ungeachtet der von uns und unserem Hosting-Anbieter ergriffenen Maßnahmen und Bemühungen können und werden wir keinen absoluten Schutz und keine absolute Sicherheit der Daten garantieren. Aus diesem Grund möchten wir Sie bitten, sichere Passwörter festzulegen und uns oder anderen nach Möglichkeit keine vertraulichen Informationen zu übermitteln.
            </p>
          </section>

          {/* Verwendung personenbezogener Daten */}
          <section>
            <h2 className="font-teko text-2xl text-white uppercase mb-4">Verwendung personenbezogener Daten</h2>
            <p>Wir verwenden Ihre personenbezogenen Daten nur für die in der Datenschutzrichtlinie festgelegten Zwecke und nur, wenn wir davon überzeugt sind, dass:</p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-gray-400">
              <li>die Verwendung erforderlich ist, um einen Vertrag zu erfüllen oder zu schließen</li>
              <li>die Verwendung notwendig ist, um entsprechenden rechtlichen oder behördlichen Verpflichtungen nachzukommen</li>
              <li>die Verwendung notwendig ist, um unsere berechtigten geschäftlichen Interessen zu unterstützen</li>
            </ul>
          </section>

          {/* EU-Rechte */}
          <section>
            <h2 className="font-teko text-2xl text-white uppercase mb-4">Rechte für EU-Ansässige</h2>
            <p>Als EU-Ansässiger können Sie:</p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-gray-400">
              <li>eine Bestätigung darüber verlangen, ob personenbezogene Daten verarbeitet werden, und Zugriff auf Ihre gespeicherten Daten anfordern</li>
              <li>den Erhalt personenbezogener Daten in einem strukturierten, gängigen und maschinenlesbaren Format verlangen</li>
              <li>die Berichtigung Ihrer personenbezogenen Daten verlangen</li>
              <li>die Löschung Ihrer personenbezogenen Daten verlangen</li>
              <li>der Verarbeitung Ihrer personenbezogenen Daten widersprechen</li>
              <li>die Einschränkung der Verarbeitung verlangen</li>
              <li>eine Beschwerde bei einer Aufsichtsbehörde einreichen</li>
            </ul>
            <p className="mt-3">
              Bitte beachten Sie, dass diese Rechte nicht uneingeschränkt gültig sind und unseren eigenen berechtigten Interessen und regulatorischen Anforderungen unterliegen können.
            </p>
            <p className="mt-3">
              Im Zuge der Bereitstellung der Dienste können wir Daten grenzüberschreitend übertragen. Durch die Nutzung der Dienste stimmen Sie der Übertragung Ihrer Daten außerhalb des EWR zu. Wenn Sie im EWR ansässig sind, werden Ihre personenbezogenen Daten nur dann an Standorte außerhalb des EWR übertragen, wenn wir davon überzeugt sind, dass ein angemessenes Schutzniveau besteht.
            </p>
          </section>

          {/* CCPA */}
          <section>
            <h2 className="font-teko text-2xl text-white uppercase mb-4">Rechte gemäß kalifornischem Verbraucherschutzgesetz</h2>
            <p>
              Wenn Sie die Dienste als Einwohner Kaliforniens nutzen, sind Sie möglicherweise nach dem kalifornischen Verbraucherschutzgesetz (CCPA) berechtigt, Zugriff auf und Löschung Ihrer Daten zu verlangen.
            </p>
            <p className="mt-3">
              Wir verkaufen keine personenbezogenen Daten der Nutzer für die Absichten und Zwecke des CCPA.
            </p>
          </section>

          {/* Änderungen */}
          <section>
            <h2 className="font-teko text-2xl text-white uppercase mb-4">Änderungen der Datenschutzrichtlinie</h2>
            <p>
              Wir können diese Datenschutzrichtlinie nach eigenem Ermessen von Zeit zu Zeit überarbeiten, die auf der Website veröffentlichte Version ist immer aktuell. Wir bitten Sie, diese Datenschutzrichtlinie regelmäßig auf Änderungen zu überprüfen. Bei wesentlichen Änderungen werden wir einen Hinweis auf unserer Website veröffentlichen.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
